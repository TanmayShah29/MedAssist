"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    XCircle,
    X,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
export type AlertVariant = "info" | "success" | "warning" | "critical";

export interface AlertProps {
    variant?: AlertVariant;
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
    dismissible?: boolean;
    onDismiss?: () => void;
    icon?: React.ReactNode;
    className?: string;
    compact?: boolean;
}

// ── Config ─────────────────────────────────────────────────────────────────
const variantConfig = {
    info: {
        bg: "bg-sky-50",
        border: "border-sky-200",
        iconBg: "bg-sky-100",
        iconColor: "text-sky-600",
        titleColor: "text-sky-900",
        descColor: "text-sky-700",
        actionColor: "text-sky-700 hover:text-sky-900",
        icon: <Info className="w-4 h-4" />,
        leftBar: "bg-sky-500",
    },
    success: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        titleColor: "text-emerald-900",
        descColor: "text-emerald-700",
        actionColor: "text-emerald-700 hover:text-emerald-900",
        icon: <CheckCircle2 className="w-4 h-4" />,
        leftBar: "bg-emerald-500",
    },
    warning: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        titleColor: "text-amber-900",
        descColor: "text-amber-700",
        actionColor: "text-amber-700 hover:text-amber-900",
        icon: <AlertTriangle className="w-4 h-4" />,
        leftBar: "bg-amber-500",
    },
    critical: {
        bg: "bg-red-50",
        border: "border-red-200",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        titleColor: "text-red-900",
        descColor: "text-red-700",
        actionColor: "text-red-700 hover:text-red-900",
        icon: <XCircle className="w-4 h-4" />,
        leftBar: "bg-red-500",
    },
};

// ── Alert Component ────────────────────────────────────────────────────────
export function Alert({
    variant = "info",
    title,
    description,
    action,
    dismissible = false,
    onDismiss,
    icon,
    className,
    compact = false,
}: AlertProps) {
    const [visible, setVisible] = React.useState(true);
    const cfg = variantConfig[variant];

    const handleDismiss = () => {
        setVisible(false);
        onDismiss?.();
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                        "relative flex gap-3 rounded-xl border overflow-hidden",
                        compact ? "px-3 py-2.5" : "px-4 py-4",
                        cfg.bg,
                        cfg.border,
                        className
                    )}
                >
                    {/* Left accent bar */}
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1", cfg.leftBar)} />

                    {/* Icon */}
                    <div className={cn(
                        "flex-shrink-0 rounded-lg flex items-center justify-center",
                        compact ? "w-6 h-6" : "w-8 h-8",
                        cfg.iconBg,
                        cfg.iconColor
                    )}>
                        {icon || cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className={cn(
                            "font-semibold leading-tight",
                            compact ? "text-xs" : "text-sm",
                            cfg.titleColor
                        )}>
                            {title}
                        </p>
                        {description && (
                            <p className={cn(
                                "mt-0.5 leading-snug",
                                compact ? "text-xs" : "text-sm",
                                cfg.descColor
                            )}>
                                {description}
                            </p>
                        )}
                        {action && (
                            <button
                                onClick={action.onClick}
                                className={cn(
                                    "mt-2 flex items-center gap-0.5 text-xs font-semibold transition-colors",
                                    cfg.actionColor
                                )}
                            >
                                {action.label}
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Dismiss */}
                    {dismissible && (
                        <button
                            onClick={handleDismiss}
                            className={cn(
                                "flex-shrink-0 rounded-md p-0.5 opacity-50 hover:opacity-100 transition-opacity",
                                cfg.iconColor
                            )}
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── Clinical Alert (pulsing for urgent) ───────────────────────────────────
export function ClinicalAlert({
    title,
    description,
    action,
    urgent = false,
    onDismiss,
}: {
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
    urgent?: boolean;
    onDismiss?: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "relative flex gap-3 rounded-xl border p-4 overflow-hidden",
                urgent
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
            )}
        >
            {/* Urgent pulse ring */}
            {urgent && (
                <span className="absolute top-3 left-3 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
            )}

            <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                urgent ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
            )}>
                {urgent ? <XCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-sm font-semibold",
                    urgent ? "text-red-900" : "text-amber-900"
                )}>
                    {title}
                </p>
                {description && (
                    <p className={cn(
                        "text-xs mt-0.5",
                        urgent ? "text-red-700" : "text-amber-700"
                    )}>
                        {description}
                    </p>
                )}
                {action && (
                    <button
                        onClick={action.onClick}
                        className={cn(
                            "mt-2 text-xs font-semibold flex items-center gap-0.5 transition-colors",
                            urgent
                                ? "text-red-700 hover:text-red-900"
                                : "text-amber-700 hover:text-amber-900"
                        )}
                    >
                        {action.label} <ChevronRight className="w-3 h-3" />
                    </button>
                )}
            </div>

            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                >
                    <X className={cn("w-4 h-4", urgent ? "text-red-500" : "text-amber-500")} />
                </button>
            )}
        </motion.div>
    );
}

// ── Toast Notification (appears at top of screen) ─────────────────────────
export function ToastNotification({
    variant = "success",
    message,
    visible,
    onDismiss,
}: {
    variant?: AlertVariant;
    message: string;
    visible: boolean;
    onDismiss?: () => void;
}) {
    const cfg = variantConfig[variant];

    React.useEffect(() => {
        if (visible && onDismiss) {
            const t = setTimeout(onDismiss, 4000);
            return () => clearTimeout(t);
        }
    }, [visible, onDismiss]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -60, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -60, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={cn(
                        "fixed top-4 left-1/2 -translate-x-1/2 z-[100]",
                        "flex items-center gap-3 px-4 py-3 rounded-2xl border",
                        "shadow-lg shadow-black/10 min-w-[280px] max-w-[420px]",
                        cfg.bg, cfg.border
                    )}
                >
                    <span className={cn("flex-shrink-0", cfg.iconColor)}>
                        {cfg.icon}
                    </span>
                    <p className={cn("text-sm font-medium flex-1", cfg.titleColor)}>
                        {message}
                    </p>
                    <button
                        onClick={onDismiss}
                        className={cn("flex-shrink-0 opacity-50 hover:opacity-100", cfg.iconColor)}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
