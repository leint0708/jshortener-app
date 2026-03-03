import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { SearchParams } from "../params"

export const useSuspenseShortUrls = (params: SearchParams) => {
    return trpc.shortUrl.list.useSuspenseQuery(params)
}

export const useSuspenseDashboardStats = () => {
    return trpc.shortUrl.getDashboardStats.useSuspenseQuery()
}

export const useCreateShortUrl = () => {
    const utils = trpc.useUtils()

    return trpc.shortUrl.create.useMutation({
        onSuccess: () => {
            utils.shortUrl.list.invalidate()
            utils.shortUrl.getDashboardStats.invalidate()
            toast.success("Short URL created successfully")
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })
}

export const useUpdateShortUrl = () => {
    const utils = trpc.useUtils()

    return trpc.shortUrl.update.useMutation({
        onSuccess: () => {
            utils.shortUrl.list.invalidate()
            toast.success("Short URL updated successfully")
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })
}

export const useDeleteShortUrl = () => {
    const utils = trpc.useUtils()

    return trpc.shortUrl.delete.useMutation({
        onSuccess: () => {
            utils.shortUrl.list.invalidate()
            utils.shortUrl.getDashboardStats.invalidate()
            toast.success("URL deleted successfully")
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })
}
