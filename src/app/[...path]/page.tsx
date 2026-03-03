import { Suspense } from "react";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { RedirectContent, RedirectError, RedirectLoading } from "@/features/short-url/components/redirect";

type Props = {
    params: Promise<{ path: string[] }>
}

export default async function Page({ params }: Props) {
    const { path } = await params
    const code = path[0] || ""

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<RedirectError />}>
                <Suspense fallback={<RedirectLoading />}>
                    <RedirectContent code={code} />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    )
}
