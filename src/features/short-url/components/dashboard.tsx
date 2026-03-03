"use client"

import { useSuspenseDashboardStats } from "../hooks/use-short-url"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkIcon, MousePointerClickIcon, AlertTriangleIcon } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export const Dashboard = () => {
    const [stats] = useSuspenseDashboardStats()

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUrls}</div>
                    <p className="text-xs text-muted-foreground">Short links created</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    <MousePointerClickIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalClicks}</div>
                    <p className="text-xs text-muted-foreground">All-time clicks</p>
                </CardContent>
            </Card>
        </div>
    )
}

export const DashboardLoading = () => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Spinner className="h-6 w-6" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    <MousePointerClickIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Spinner className="h-6 w-6" />
                </CardContent>
            </Card>
        </div>
    )
}

export const DashboardError = () => {
    return (
        <div className="flex items-center justify-center p-8 mb-8 border rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center gap-2 text-red-600">
                <AlertTriangleIcon className="h-5 w-5" />
                <span>Failed to load dashboard stats</span>
            </div>
        </div>
    )
}