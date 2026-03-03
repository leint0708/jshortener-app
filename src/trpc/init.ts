import { createAuth } from '@/lib/auth';
import { initTRPC, TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import { cache } from 'react';
import superjson from 'superjson';

/**
 * Create tRPC context
 * This is where you can add things like database connections, user sessions, etc.
 * The context is available in all procedures
 */
export const createTRPCContext = cache(async () => {
    /**
     * @see https://trpc.io/docs/server/context
     */
    return {
        // Add context properties here
        // For example, you can access Cloudflare bindings via headers or AsyncLocalStorage
    };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
    const auth = await createAuth()
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is not authenticated",
        })
    }
    return next({ ctx: { ...ctx, auth: session } })
})
