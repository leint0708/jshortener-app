"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { PlusIcon, ChevronDownIcon, CalendarIcon } from "lucide-react"
import { useCreateShortUrl, useUpdateShortUrl } from "../hooks/use-short-url"
import { createInput, type CreateInput } from "../schemas"

// Infer type from server schema (single source of truth)
type FormData = CreateInput

type ShortUrlData = {
    id: string
    originalUrl: string
    shortCode: string
    title: string | null
    customAlias: string | null
    expiresAt: Date | null
    isActive: boolean
}

type UpsertUrlDialogProps = {
    mode: "create" | "edit"
    data?: ShortUrlData
    children: React.ReactNode
    onSuccess?: () => void
}

export const UpsertUrlDialog = ({
    mode,
    data,
    children,
    onSuccess,
}: UpsertUrlDialogProps) => {
    const [open, setOpen] = useState(false)
    const createMutation = useCreateShortUrl()
    const updateMutation = useUpdateShortUrl()

    const form = useForm<FormData>({
        resolver: zodResolver(createInput),
        defaultValues: {
            originalUrl: data?.originalUrl ?? "",
            title: data?.title ?? "",
            customAlias: data?.customAlias ?? "",
            expiresAt: data?.expiresAt?.toISOString().split("T")[0] ?? "",
        },
    })

    const isLoading = createMutation.isPending || updateMutation.isPending
    const isEdit = mode === "edit"

    const onSubmit = (values: FormData) => {
        if (isEdit && data) {
            updateMutation.mutate(
                {
                    id: data.id,
                    ...values,
                },
                {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                        onSuccess?.()
                    },
                }
            )
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    setOpen(false)
                    form.reset()
                    onSuccess?.()
                },
            })
        }
    }

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            form.reset()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Short URL" : "Create Short URL"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the details of your short URL."
                            : "Create a new short URL. The alias is optional."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="originalUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Original URL *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://example.com/very-long-url"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="My awesome link"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        A friendly name for this URL (optional)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customAlias"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custom Alias</FormLabel>
                                    <FormControl>
                                        <InputGroup>
                                            <InputGroupAddon className="bg-muted/50 px-3 border-r">
                                                <InputGroupText className="text-xs text-muted-foreground">
                                                    {typeof window !== "undefined" ? window.location.origin : ""}/
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                placeholder="my-link"
                                                {...field}
                                            />
                                        </InputGroup>
                                    </FormControl>
                                    <FormDescription>
                                        Custom path for your short URL (3-20 chars, letters, numbers, hyphens, underscores)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="expiresAt"
                            render={({ field }) => {
                                const dateValue = field.value ? new Date(field.value) : undefined
                                return (
                                    <FormItem>
                                        <FormLabel>Expiration Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-between font-normal"
                                                    >
                                                        {dateValue ? (
                                                            dateValue.toLocaleDateString()
                                                        ) : (
                                                            <span className="text-muted-foreground">Select expiration date</span>
                                                        )}
                                                        <CalendarIcon className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateValue}
                                                    onSelect={(date) => {
                                                        field.onChange(date ? date.toISOString().split("T")[0] : "")
                                                    }}
                                                    captionLayout="dropdown"
                                                    disabled={(date) => date < new Date()}
                                                    autoFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            Leave empty for no expiration
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? "Saving..."
                                    : isEdit
                                        ? "Update"
                                        : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
