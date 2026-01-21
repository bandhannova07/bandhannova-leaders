"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
    variant?: "compact" | "full";
}

export function ThemeToggle({ variant = "compact" }: ThemeToggleProps) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    // Use resolvedTheme to get actual theme (handles system theme)
    const currentTheme = resolvedTheme || theme;
    const isDark = currentTheme === "dark";

    // Compact variant for homepage (circular button)
    if (variant === "compact") {
        return (
            <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center hover:bg-accent transition-colors hover:scale-110"
                style={{
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
                aria-label="Toggle theme"
            >
                {isDark ? (
                    <Sun className="h-6 w-6 md:h-7 md:w-7 text-yellow-400" />
                ) : (
                    <Moon className="h-6 w-6 md:h-7 md:w-7 text-purple-500" />
                )}
            </button>
        );
    }

    // Full variant for dashboard sidebar
    return (
        <Button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            variant="ghost"
            className="flex items-center gap-3 rounded-xl transition-all hover:scale-105 justify-start text-white"
            style={{
                padding: '14px 16px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)'
            }}
        >
            {isDark ? (
                <>
                    <Sun className="w-5 h-5" />
                    <span className="body font-medium">Light Mode</span>
                </>
            ) : (
                <>
                    <Moon className="w-5 h-5" />
                    <span className="body font-medium">Dark Mode</span>
                </>
            )}
        </Button>
    );
}
