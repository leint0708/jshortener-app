"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { useSession, signOut } from "@/lib/auth/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Path } from "@/config/constants"
import { AnimatedThemeToggler } from "./animated-theme-toggler"

export const AppHeader = () => {
    const { data: session } = useSession()
    const router = useRouter()

    const handleSignOut = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push(Path.LOGIN) // Redirect to login after sign out
                },
            },
        })
    }

    // Get initials for avatar fallback
    const initials = session?.user?.name
        ? session.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U"

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container m-auto flex h-14 items-center justify-between px-4 md:px-0">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <Link href={Path.ADMIN_DASHBOARD} className="flex items-center gap-2">
                        <span>JShortener</span>
                    </Link>
                </div>

                <div className="flex items-center gap-2">

                    <AnimatedThemeToggler />
                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={session.user.image || ""} alt={session.user.name} />
                                        <AvatarFallback>{initials}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {session.user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href={Path.LOGIN}>
                            <Button size="sm">Sign In</Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}

export const AppFooter = () => {
    return (
        <footer className="border-t py-6 md:px-8 md:py-0">
            <div className="m-auto container flex flex-col items-center justify-center gap-4 md:h-14 md:flex-row px-4 md:px-0">
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                    From JS Club with ❤️
                </p>
            </div>
        </footer>
    )
}

export const AppLayout = (
    { header, footer, children }: { header: React.ReactNode, footer: React.ReactNode, children: React.ReactNode }
) => {
    return (
        <div className="flex min-h-screen flex-col">
            {header}
            <main className="flex-1 container py-6 m-auto px-4 md:px-0">
                {children}
            </main>
            {footer}
        </div>
    )
}
