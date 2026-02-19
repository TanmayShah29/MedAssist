"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Activity,
    MessageSquare,
    User,
    Settings,
    Menu,
    X
} from "lucide-react"
import { useState } from "react"
import { useStore } from "@/store/useStore"

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Results", href: "/results", icon: Activity },
    { name: "Assistant", href: "/assistant", icon: MessageSquare },
    { name: "Profile", href: "/profile", icon: User },
]

export function Navbar() {
    const pathname = usePathname()
    const { user } = useStore()
    const [isOpen, setIsOpen] = useState(false)

    // Close mobile menu on route change
    if (isOpen && typeof window !== 'undefined') {
        // Basic effect to close menu could go here, 
        // but simpler to just let the link click handle it via local logic or a wrapper
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                        MedAssist
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                                pathname === item.href
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* User / Actions */}
                <div className="hidden md:flex items-center space-x-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Basic Tier
                    </div>
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                    </Button>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.name?.[0] || "U"}
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t p-4 space-y-4 bg-background">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                pathname === item.href
                                    ? "bg-secondary text-foreground"
                                    : "text-muted-foreground hover:bg-secondary/50"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    ))}
                    <div className="pt-4 border-t border-border">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {user.name?.[0] || "U"}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{user.name}</span>
                                <span className="text-xs text-muted-foreground">Manage Plan</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
