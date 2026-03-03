"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AnimatedThemeTogglerProps
    extends React.ComponentPropsWithoutRef<"button"> { }

export const AnimatedThemeToggler = ({
    className,
    ...props
}: AnimatedThemeTogglerProps) => {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className={cn(className)}
            {...props}
        >
            {theme === "dark" ? <Sun /> : <Moon />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
