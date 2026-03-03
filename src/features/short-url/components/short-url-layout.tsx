"use client"

import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon, PlusIcon } from "lucide-react"
import { useShortUrlParams } from "../hooks/use-short-url-params"
import { useEntitySearch } from "@/hooks/use-entity-search"
import { ShortUrlTableContent, ShortUrlLoading, ShortUrlError } from "./short-url"
import { UpsertUrlDialog } from "./upsert-url-dialog"

export const ShortUrlLayout = () => {
    const [params, setParams] = useShortUrlParams()
    const { searchValue, onSearchChange } = useEntitySearch({ params, setParams })

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search URLs..."
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="ml-auto">
                    <UpsertUrlDialog mode="create">
                        <Button>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create URL
                        </Button>
                    </UpsertUrlDialog>
                </div>
            </div>

            <ErrorBoundary fallback={<ShortUrlError />}>
                <Suspense fallback={<ShortUrlLoading />}>
                    <ShortUrlTableContent />
                </Suspense>
            </ErrorBoundary>
        </div>
    )
}
