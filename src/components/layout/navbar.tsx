"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, MessageSquare, Calendar, User, LogOut, Settings } from "lucide-react";
import { useStore } from "@/store/useStore";

import { MedAssistLogo } from "@/components/branding/medassist-logo";

export function Navbar() {
    const pathname = usePathname();

    const NAV_ITEMS = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "My Results", href: "/my-results", icon: FileText },
        { label: "AI Assistant", href: "/assistant", icon: MessageSquare },
        { label: "Appointments", href: "/appointments", icon: Calendar },
        { label: "Profile", href: "/profile", icon: User },
        { label: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-[#0F172A] border-b border-white/5 mb-8">
            <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
                {/* Logo */}
                <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
                    <MedAssistLogo />
                </Link>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                                )}
                            >
                                <item.icon className={cn("w-4 h-4", isActive && "text-teal-400")} />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>

                {/* User Profile / Logout */}
                <div className="flex items-center gap-4">
                    <UserMenu />
                </div>
            </div>
        </nav>
    );
}

function UserMenu() {
    const { user } = useStore();
    const [hydrated, setHydrated] = React.useState(false);

    React.useEffect(() => {
        setHydrated(true);
    }, []);

    if (!hydrated) return null;

    return (
        <>
            <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-foreground">{user.name}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Member #{user.id}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
            </div>
        </>
    )
}
