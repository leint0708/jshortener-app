import { baseProcedure } from '@/trpc/init';
import { createTRPCRouter } from '../init';
import { z } from 'zod';
import { shortUrlRouter } from '@/features/short-url/server/routers';

export const appRouter = createTRPCRouter({
    shortUrl: shortUrlRouter,
    hello: baseProcedure
        .input(
            z.object({
                text: z.string(),
            }),
        )
        .query((opts) => {
            return {
                greeting: `hello ${opts.input.text}`,
            };
        }),
});

// Export type definition of API
export type AppRouter = typeof appRouter;

