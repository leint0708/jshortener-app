import { Suspense } from "react";
import { shortUrlParamsLoader } from "@/features/short-url/server/params-loader";
import { requireAuth } from "@/lib/auth/utils";
import { HydrateClient, trpc } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import type { SearchParams } from "nuqs/server";
import { Dashboard, DashboardError, DashboardLoading } from "@/features/short-url/components/dashboard";
import { ShortUrlLayout } from "@/features/short-url/components/short-url-layout";

type Props = {
    searchParams: Promise<SearchParams>
}

export default async function Page({ searchParams }: Props) {
    await requireAuth();
    const searchParamsResolved = await shortUrlParamsLoader(searchParams)

    void trpc.shortUrl.getDashboardStats.prefetch()
    void trpc.shortUrl.list.prefetch(searchParamsResolved)
    return (
        <HydrateClient>
            <ErrorBoundary fallback={<DashboardError />}>
                <Suspense fallback={<DashboardLoading />}>
                    <Dashboard />
                </Suspense>
            </ErrorBoundary>
            <ShortUrlLayout />
        </HydrateClient>
    )
}