"use client"

import { useEffect, useState } from "react"
import { trpc } from "@/trpc/client"
import { Spinner } from "@/components/ui/spinner"
import { AlertTriangleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface RedirectContentProps {
    code: string
}

export const RedirectContent = ({ code }: RedirectContentProps) => {
    const [error, setError] = useState<string | null>(null)

    const redirectMutation = trpc.shortUrl.redirect.useMutation({
        onSuccess: (data) => {
            // Redirect to the original URL
            window.location.href = data.originalUrl
        },
        onError: (err) => {
            setError(err.message)
        },
    })

    useEffect(() => {
        if (code) {
            redirectMutation.mutate({ code })
        }
    }, [code])

    if (error) {
        return <RedirectError message={error} />
    }

    return <RedirectLoading />
}

export const RedirectLoading = () => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <Spinner className="h-8 w-8 mx-auto" />
                <p className="text-muted-foreground">Redirecting...</p>
            </div>
        </div>
    )
}

export const RedirectError = ({ message }: { message?: string }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                        <AlertTriangleIcon className="h-8 w-8 text-red-600" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold">Link Not Available</h1>
                <p className="text-muted-foreground max-w-md">
                    {message || "The requested short URL could not be found."}
                </p>
                <Link href="/">
                    <Button>Go to Homepage</Button>
                </Link>
            </div>
        </div>
    )
}
