import { z } from 'zod';
import { eq, desc, and, like, or, count, sum, sql } from 'drizzle-orm';
import { createTRPCRouter, protectedProcedure, baseProcedure } from '@/trpc/init';
import { getDb } from '@/lib/db';
import { shortUrl } from '@/lib/schema';
import { TRPCError } from '@trpc/server';
import { searchParamsSchema } from '../params';
import { createInput, updateInput } from '../schemas';
import { RESERVED_PATHS } from '@/config/constants';

// Simple short code generator
function generateShortCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export const shortUrlRouter = createTRPCRouter({
    getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
        const db = await getDb();
        const userId = ctx.auth.user.id;

        const [[urlsResult], [clicksResult]] = await Promise.all([
            db
                .select({ count: count() })
                .from(shortUrl)
                .where(eq(shortUrl.userId, userId)),
            db
                .select({ totalClicks: sum(shortUrl.totalClicks) })
                .from(shortUrl)
                .where(eq(shortUrl.userId, userId))
        ]);

        return {
            totalUrls: urlsResult?.count ?? 0,
            totalClicks: Number(clicksResult?.totalClicks ?? 0),
        };
    }),

    list: protectedProcedure
        .input(searchParamsSchema)
        .query(async ({ ctx, input }) => {
            const db = await getDb();
            const { page, pageSize, search } = input;
            const offset = (page - 1) * pageSize;
            const userId = ctx.auth.user.id;

            const whereClause = and(
                eq(shortUrl.userId, userId),
                search ? or(
                    like(shortUrl.originalUrl, `%${search}%`),
                    like(shortUrl.shortCode, `%${search}%`),
                    like(shortUrl.title, `%${search}%`)
                ) : undefined
            );

            // Get total count and data in parallel
            const [[totalResult], data] = await Promise.all([
                db
                    .select({ count: count() })
                    .from(shortUrl)
                    .where(whereClause),
                db
                    .select()
                    .from(shortUrl)
                    .where(whereClause)
                    .limit(pageSize)
                    .offset(offset)
                    .orderBy(desc(shortUrl.createdAt))
            ]);

            const total = totalResult?.count ?? 0;

            return {
                data,
                metadata: {
                    total,
                    page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize),
                },
            };
        }),

    create: protectedProcedure
        .input(createInput)
        .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            const userId = ctx.auth.user.id;

            let code = input.customAlias;

            // If no custom alias, generate a unique random code
            if (!code) {
                let isUnique = false;
                let attempts = 0;
                while (!isUnique && attempts < 10) {
                    code = generateShortCode();
                    const existing = await db
                        .select()
                        .from(shortUrl)
                        .where(eq(shortUrl.shortCode, code))
                        .limit(1);

                    if (existing.length === 0) {
                        isUnique = true;
                    }
                    attempts++;
                }

                if (!isUnique) {
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to generate a unique short code. Please try again.',
                    });
                }
            } else {
                // Check if custom alias is reserved
                if (RESERVED_PATHS.includes(code)) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'This alias is reserved for system use.',
                    });
                }

                // Check if custom alias is already taken
                const existing = await db
                    .select()
                    .from(shortUrl)
                    .where(eq(shortUrl.shortCode, code))
                    .limit(1);

                if (existing.length > 0) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Custom alias is already in use.',
                    });
                }
            }

            // Create the record
            const [created] = await db.insert(shortUrl).values({
                id: crypto.randomUUID(),
                originalUrl: input.originalUrl,
                shortCode: code!,
                customAlias: input.customAlias || null,
                title: input.title,
                userId: userId,
                expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
            }).returning();

            return created;
        }),

    update: protectedProcedure
        .input(updateInput)
        .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            const { id, ...data } = input;
            const userId = ctx.auth.user.id;

            // 1. Check if record exists and belongs to user
            const existing = await db
                .select()
                .from(shortUrl)
                .where(and(
                    eq(shortUrl.id, id),
                    eq(shortUrl.userId, userId)
                ))
                .limit(1);

            if (existing.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Short URL not found or you do not have permission to update it.',
                });
            }

            // 2. If updating custom alias, check for uniqueness and reserved paths
            if (data.customAlias && data.customAlias !== existing[0].shortCode) {
                // Check if reserved
                if (RESERVED_PATHS.includes(data.customAlias)) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'This alias is reserved for system use.',
                    });
                }

                const aliasExists = await db
                    .select()
                    .from(shortUrl)
                    .where(and(
                        eq(shortUrl.shortCode, data.customAlias),
                        // ensuring we don't count the current record if for some reason check above failed, 
                        // essentially making sure we check against OTHER records
                    ))
                    .limit(1);

                // If it's the SAME record's code, it's fine. But we filtered by id above?
                // Actually, we just need to check if ANY record has this code.
                // If the code is same as current one, 'aliasExists' will find it.
                // So we strictly need to check if `aliasExists` finds a record that is NOT this one.

                const aliasTaken = await db.query.shortUrl.findFirst({
                    where: (table, { eq, and, ne }) => and(
                        eq(table.shortCode, data.customAlias!),
                        ne(table.id, id)
                    )
                });

                if (aliasTaken) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Custom alias is already in use.',
                    });
                }
            }

            // 3. Prepare update data
            // If customAlias is provided, update shortCode. 
            // If customAlias is empty string (user cleared it), should we regenerate random?
            // Usually, if a user switches from custom to random, we might want to keep the old one or generate new.
            // For now, let's assume if they provide a customAlias, we use it. 
            // If they pass undefined, we don't touch it.
            // If they pass null/empty to "remove" custom alias, we rely on validations. 
            // My createInput allows empty string or valid alias.

            const updateData: any = {
                updatedAt: new Date(),
            };

            if (data.originalUrl) updateData.originalUrl = data.originalUrl;
            if (data.title !== undefined) updateData.title = data.title;
            if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
            if (data.isActive !== undefined) updateData.isActive = data.isActive;

            if (data.customAlias) {
                updateData.shortCode = data.customAlias;
                updateData.customAlias = data.customAlias;
            } else if (data.customAlias === '') {
                // User wants to remove custom alias? 
                // We shouldn't leave shortCode empty. 
                // For safety, let's just ignore empty string updates to alias for now unless we have a specific "regenerate" logic.
                // Or better, if they explicitly send empty string, maybe they want to revert to a random code? 
                // Let's stick to: Update only if valid string provided.
            }

            const [updated] = await db
                .update(shortUrl)
                .set(updateData)
                .where(eq(shortUrl.id, id))
                .returning();

            return updated;
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const db = await getDb();
            const userId = ctx.auth.user.id;

            const existing = await db
                .select()
                .from(shortUrl)
                .where(and(
                    eq(shortUrl.id, input.id),
                    eq(shortUrl.userId, userId)
                ))
                .limit(1);

            if (existing.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Short URL not found or you do not have permission to delete it.',
                });
            }

            await db.delete(shortUrl).where(eq(shortUrl.id, input.id));

            return { success: true };
        }),

    // Public procedure to get original URL and increment click count
    redirect: baseProcedure
        .input(z.object({ code: z.string() }))
        .mutation(async ({ input }) => {
            const db = await getDb();

            // Find the short URL by code
            const [result] = await db
                .select()
                .from(shortUrl)
                .where(eq(shortUrl.shortCode, input.code))
                .limit(1);

            if (!result) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Short URL not found.',
                });
            }

            // Check if URL is active
            if (!result.isActive) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'This short URL is currently inactive.',
                });
            }

            // Check if URL has expired
            if (result.expiresAt && new Date(result.expiresAt) < new Date()) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'This short URL has expired.',
                });
            }

            // Increment click count atomically
            await db
                .update(shortUrl)
                .set({
                    totalClicks: sql`${shortUrl.totalClicks} + 1`,
                    updatedAt: new Date()
                })
                .where(eq(shortUrl.id, result.id));

            return { originalUrl: result.originalUrl };
        }),
});
