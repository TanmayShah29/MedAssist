"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    MessageSquare,
    FlaskConical,
    User,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
export interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType;
    href: string;
    badge?: number;
}

const DEFAULT_ITEMS: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { id: "results",   label: "Results",   href: "/results",   icon: FlaskConical },
    { id: "assistant", label: "AI",        href: "/assistant", icon: MessageSquare },
    { id: "profile",   label: "Profile",   href: "/profile",   icon: User },
    { id: "settings",  label: "Settings",  href: "/settings",  icon: Settings },
];

export interface BottomMenuProps {
    items?: MenuItem[];
    className?: string;
}

// ── Component ──────────────────────────────────────────────────────────────
export function BottomMenu({ items = DEFAULT_ITEMS, className }: BottomMenuProps) {
    const pathname = usePathname();

    return (
        <nav
            className={cn(
                "fixed bottom-0 left-0 right-0 z-[100] lg:hidden",
                "bg-[#FAFAF7]/95 backdrop-blur-2xl border-t border-[#E8E6DF]",
                "pb-[env(safe-area-inset-bottom)]",
                "gpu-accelerate shadow-[0_-4px_24px_rgba(28,25,23,0.06)]",
                className
            )}
            aria-label="Main navigation"
        >
            <div className="flex justify-between items-center px-2 pt-2 pb-2 relative px-safe">
                {items.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-label={item.label}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "flex flex-col items-center gap-1 group relative flex-1 min-h-[52px] justify-center",
                                "transition-all duration-150 active:scale-90",
                                isActive ? "text-sky-500" : "text-[#A8A29E]"
                            )}
                        >
                            {/* Active background pill */}
                            <div className="relative">
                                {isActive && (
                                    <motion.div
                                        layoutId="bottom-nav-active"
                                        className="absolute inset-0 -inset-x-3 rounded-[10px] bg-sky-50 border border-sky-100"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <div className={cn("relative p-2 rounded-[10px] transition-colors", !isActive && "group-hover:bg-[#F5F4EF]")}>
                                    <Icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className="transition-colors"
                                    />
                                    {/* Badge */}
                                    {!!item.badge && item.badge > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-1 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                                            {item.badge > 9 ? "9+" : item.badge}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <span className={cn(
                                "text-[9px] font-bold uppercase tracking-[0.1em] transition-colors leading-none",
                                isActive ? "text-sky-600" : "text-[#C5C2B8] group-hover:text-[#A8A29E]"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

// ── Floating Action Button variant (for quick AI access) ──────────────────
export interface FABProps {
    onClick?: () => void;
    label?: string;
    className?: string;
}

export function FloatingActionButton({ onClick, label = "Ask AI", className }: FABProps) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={label}
            className={cn(
                "fixed bottom-24 right-4 z-50 lg:bottom-8",
                "flex items-center gap-2 px-4 py-3 rounded-2xl",
                "bg-sky-500 text-white font-semibold text-sm",
                "shadow-lg shadow-sky-500/30",
                "hover:bg-sky-600 transition-colors",
                className
            )}
        >
            <MessageSquare className="w-4 h-4" />
            {label}
        </motion.button>
    );
}
