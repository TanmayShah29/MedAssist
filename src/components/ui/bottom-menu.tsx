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
    { id: "results", label: "Results", href: "/results", icon: FlaskConical, badge: 2 },
    { id: "assistant", label: "AI", href: "/assistant", icon: MessageSquare },
    { id: "profile", label: "Profile", href: "/profile", icon: User },
    { id: "settings", label: "Settings", href: "/settings", icon: Settings },
];

export interface BottomMenuProps {
    items?: MenuItem[];
    activeId?: string;
    onChange?: (id: string) => void;
    className?: string;
}

// ── Component ──────────────────────────────────────────────────────────────
export function BottomMenu({
    items = DEFAULT_ITEMS,
    className,
}: BottomMenuProps) {
    const pathname = usePathname();

    return (
        <nav
            className={cn(
                "fixed bottom-0 left-0 right-0 z-[100] lg:hidden",
                "bg-[#FAFAF7]/95 backdrop-blur-2xl border-t border-[#E8E6DF]",
                "pb-[env(safe-area-inset-bottom)]",
                "gpu-accelerate shadow-[0_-8px_30px_rgb(0,0,0,0.04)]",
                className
            )}
        >
            <div className="flex justify-between items-center px-6 pt-3 pb-3 relative px-safe">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 group relative py-1 transition-all duration-200 active:scale-90 flex-1 min-h-[44px] justify-center",
                                isActive ? "text-sky-500" : "text-[#A8A29E]"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-2xl transition-all duration-300",
                                isActive ? "bg-sky-50 shadow-inner" : "group-hover:bg-[#F5F4EF]"
                            )}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={cn(
                                "text-[11px] md:text-[9px] font-bold uppercase tracking-[0.1em] transition-colors",
                                isActive ? "text-sky-600" : "text-[#A8A29E]"
                            )}>
                                {item.label}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="bottom-menu-active-dot"
                                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-500 rounded-full"
                                />
                            )}

                            {item.badge && item.badge > 0 && (
                                <span className="absolute top-0 right-1 sm:right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center z-10">
                                    {item.badge > 9 ? "9+" : item.badge}
                                </span>
                            )}
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

export function FloatingActionButton({
    onClick,
    label = "Ask AI",
    className,
}: FABProps) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
