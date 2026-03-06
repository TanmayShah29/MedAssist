"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
    icon: React.ReactNode;
    href: string;
    badge?: number;
}

const DEFAULT_ITEMS: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "results", label: "Results", href: "/results", icon: <FlaskConical className="w-5 h-5" />, badge: 2 },
    { id: "assistant", label: "AI", href: "/assistant", icon: <MessageSquare className="w-5 h-5" /> },
    { id: "profile", label: "Profile", href: "/profile", icon: <User className="w-5 h-5" /> },
    { id: "settings", label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
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
    activeId,
    onChange,
    className,
}: BottomMenuProps) {
    const router = useRouter();
    const [active, setActive] = React.useState(activeId || items[0]?.id);

    // Keep active in sync when activeId prop changes (e.g. on route change)
    React.useEffect(() => {
        if (activeId) setActive(activeId);
    }, [activeId]);

    const handleSelect = (item: MenuItem) => {
        setActive(item.id);
        onChange?.(item.id);
        router.push(item.href);
    };

    return (
        <nav
            className={cn(
                // Only visible on mobile — hidden on lg+ where sidebar takes over
                "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
                "bg-white/80 backdrop-blur-xl border-t border-slate-200",
                "px-2 pb-[env(safe-area-inset-bottom)]",
                "gpu-accelerate",
                className
            )}
        >
            <div className="flex items-center justify-around">
                {items.map((item) => {
                    const isActive = active === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="relative flex flex-col items-center gap-1 px-3 py-3 
                         min-w-[56px] rounded-lg transition-colors"
                            aria-label={item.label}
                        >
                            {/* Active Dot Indicator - NEW DESIGN */}
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-menu-indicator"
                                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-sky-500"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}

                            {/* Badge */}
                            {item.badge && item.badge > 0 && (
                                <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 
                                 rounded-full bg-red-500 text-white text-[9px] 
                                 font-bold flex items-center justify-center z-10">
                                    {item.badge > 9 ? "9+" : item.badge}
                                </span>
                            )}

                            {/* Icon */}
                            <motion.span
                                animate={{
                                    color: isActive ? "#0EA5E9" : "#94A3B8",
                                    scale: isActive ? 1.0 : 1,
                                }}
                                transition={{ duration: 0.15 }}
                                className="relative z-10"
                            >
                                {item.icon}
                            </motion.span>

                            {/* Label */}
                            <motion.span
                                animate={{ color: isActive ? "#0EA5E9" : "#94A3B8" }}
                                className="relative z-10 text-[10px] font-medium leading-none"
                            >
                                {item.label}
                            </motion.span>
                        </button>
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
