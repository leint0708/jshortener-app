"use client"

import { useRef, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { useShortUrlParams } from "../hooks/use-short-url-params"
import { useSuspenseShortUrls, useDeleteShortUrl } from "../hooks/use-short-url"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    AlertTriangleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CopyIcon,
    DownloadIcon,
    ExternalLinkIcon,
    PencilIcon,
    QrCodeIcon,
    Trash2Icon,
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { UpsertUrlDialog } from "./upsert-url-dialog"
import { QRCode } from "@/components/ui/shadcn-io/qr-code"

const QRCodeDialog = ({ shortCode }: { shortCode: string }) => {
    const qrRef = useRef<HTMLDivElement>(null)
    const shortUrl = typeof window !== "undefined"
        ? `${window.location.origin}/${shortCode}`
        : `/${shortCode}`

    const handleDownload = async () => {
        if (!qrRef.current) return

        const svgElement = qrRef.current.querySelector("svg")
        if (!svgElement) return

        const svgData = new XMLSerializer().serializeToString(svgElement)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
            canvas.width = 400
            canvas.height = 400
            ctx?.drawImage(img, 0, 0, 400, 400)

            const link = document.createElement("a")
            link.download = `qr-${shortCode}.png`
            link.href = canvas.toDataURL("image/png")
            link.click()
        }

        img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <QrCodeIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle>QR Code</DialogTitle>
                    <DialogDescription>
                        Scan this QR code to access the short URL
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4">
                    <div
                        ref={qrRef}
                        className="w-48 h-48 p-3 bg-white rounded-lg"
                    >
                        <QRCode data={shortUrl} />
                    </div>
                    <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                        {shortUrl}
                    </code>
                    <Button onClick={handleDownload} className="w-full">
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Download QR Code
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

type ShortUrlItem = {
    id: string
    originalUrl: string
    shortCode: string
    customAlias: string | null
    title: string | null
    totalClicks: number
    isActive: boolean
    expiresAt: Date | null
}

const useColumns = (): ColumnDef<ShortUrlItem>[] => {
    const deleteUrl = useDeleteShortUrl()

    const handleCopy = (shortCode: string) => {
        const url = `${window.location.origin}/${shortCode}`
        navigator.clipboard.writeText(url)
        toast.success("Copied to clipboard!")
    }

    const handleDelete = (id: string) => {
        deleteUrl.mutate({ id })
    }

    return [
        {
            accessorKey: "shortCode",
            header: "Short Code",
            cell: ({ row }) => (
                <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
                    /{row.original.shortCode}
                </code>
            ),
        },
        {
            accessorKey: "originalUrl",
            header: "Original URL",
            cell: ({ row }) => (
                <a
                    href={row.original.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 max-w-[200px] truncate"
                >
                    {row.original.originalUrl}
                    <ExternalLinkIcon className="h-3 w-3 shrink-0" />
                </a>
            ),
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => row.original.title || "-",
        },
        {
            accessorKey: "totalClicks",
            header: () => <div className="text-center">Clicks</div>,
            cell: ({ row }) => (
                <div className="text-center">{row.original.totalClicks}</div>
            ),
        },
        {
            accessorKey: "isActive",
            header: () => <div className="text-center">Status</div>,
            cell: ({ row }) => (
                <div className="text-center">
                    <Badge variant={row.original.isActive ? "default" : "secondary"}>
                        {row.original.isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(row.original.shortCode)}
                    >
                        <CopyIcon className="h-4 w-4" />
                    </Button>
                    <QRCodeDialog shortCode={row.original.shortCode} />
                    <UpsertUrlDialog mode="edit" data={row.original}>
                        <Button variant="ghost" size="icon">
                            <PencilIcon className="h-4 w-4" />
                        </Button>
                    </UpsertUrlDialog>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={deleteUrl.isPending}
                            >
                                <Trash2Icon className="h-4 w-4 text-red-600" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete URL</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this URL? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDelete(row.original.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ),
        },
    ]
}

export const ShortUrlTableContent = () => {
    const [params, setParams] = useShortUrlParams()
    const [data] = useSuspenseShortUrls(params)
    const columns = useColumns()

    return (
        <div className="space-y-4">
            <DataTable columns={columns} data={data.data} />

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {data.data.length} of {data.metadata.total} results
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setParams({ page: params.page - 1 })}
                        disabled={params.page <= 1}
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                        Previous
                    </Button>
                    <span className="text-sm">
                        Page {params.page} of {data.metadata.totalPages || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setParams({ page: params.page + 1 })}
                        disabled={params.page >= data.metadata.totalPages}
                    >
                        Next
                        <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export const ShortUrlLoading = () => {
    return (
        <div className="flex items-center justify-center p-12 border rounded-lg">
            <div className="flex items-center gap-2">
                <Spinner className="h-6 w-6" />
                <span>Loading URLs...</span>
            </div>
        </div>
    )
}

export const ShortUrlError = () => {
    return (
        <div className="flex items-center justify-center p-12 border rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center gap-2 text-red-600">
                <AlertTriangleIcon className="h-5 w-5" />
                <span>Failed to load URLs</span>
            </div>
        </div>
    )
}
