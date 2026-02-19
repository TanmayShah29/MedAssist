"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none",
    {
        variants: {
            variant: {
                // Clinical status variants
                optimal:
                    "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
                warning:
                    "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
                critical:
                    "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
                info: "bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100",
                // Entity type variants (for Groq AI entities)
                symptom:
                    "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100",
                condition:
                    "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100",
                medication:
                    "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
                labValue:
                    "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
                // General UI variants
                default:
                    "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200",
                outline:
                    "bg-transparent text-slate-600 border border-slate-200 hover:bg-slate-50",
                brand:
                    "bg-sky-500 text-white border border-sky-600 hover:bg-sky-600",
            },
            size: {
                sm: "px-2 py-0.5 text-[10px]",
                md: "px-2.5 py-1 text-xs",
                lg: "px-3 py-1.5 text-sm",
            },
            pulse: {
                true: "",
                false: "",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
            pulse: false,
        },
    }
);

const dotColors: Record<string, string> = {
    optimal: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-red-500",
    info: "bg-sky-500",
    symptom: "bg-blue-500",
    condition: "bg-purple-500",
    medication: "bg-emerald-500",
    labValue: "bg-amber-500",
    default: "bg-slate-400",
    outline: "bg-slate-400",
    brand: "bg-white",
};

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
    dot?: boolean;
    icon?: React.ReactNode;
    onDismiss?: () => void;
    animate?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    (
        {
            className,
            variant = "default",
            size,
            pulse,
            dot,
            icon,
            onDismiss,
            animate = true,
            children,
            ...props
        },
        ref
    ) => {
        const dotColor = dotColors[variant as string] || "bg-slate-400";

        const content = (
            <span
                ref={ref}
                className={cn(badgeVariants({ variant, size, pulse }), className)}
                {...props}
            >
                {dot && (
                    <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                        {pulse && (
                            <span
                                className={cn(
                                    "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                                    dotColor
                                )}
                            />
                        )}
                        <span
                            className={cn(
                                "relative inline-flex h-1.5 w-1.5 rounded-full",
                                dotColor
                            )}
                        />
                    </span>
                )}
                {icon && <span className="flex-shrink-0">{icon}</span>}
                {children}
                {onDismiss && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismiss();
                        }}
                        className="ml-0.5 flex-shrink-0 rounded-full p-0.5 opacity-60 
                       hover:opacity-100 transition-opacity"
                        aria-label="Remove"
                    >
                        <svg
                            className="h-2.5 w-2.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </span>
        );

        if (animate) {
            return (
                <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    style={{ display: "inline-flex" }}
                >
                    {content}
                </motion.span>
            );
        }

        return content;
    }
);

Badge.displayName = "Badge";

// Badge group for entity tags (used in assistant page)
export function BadgeGroup({
    badges,
    max = 5,
    className,
}: {
    badges: Array<{ label: string; variant: BadgeProps["variant"]; id: string }>;
    max?: number;
    className?: string;
}) {
    const [showAll, setShowAll] = React.useState(false);
    const visible = showAll ? badges : badges.slice(0, max);
    const hidden = badges.length - max;

    return (
        <div className={cn("flex flex-wrap gap-1.5", className)}>
            <AnimatePresence>
                {visible.map((badge) => (
                    <Badge key={badge.id} variant={badge.variant} dot animate>
                        {badge.label}
                    </Badge>
                ))}
            </AnimatePresence>
            {!showAll && hidden > 0 && (
                <button
                    onClick={() => setShowAll(true)}
                    className="inline-flex items-center px-2.5 py-1 rounded-full 
                     text-xs font-medium bg-slate-100 text-slate-500 
                     border border-slate-200 hover:bg-slate-200 
                     transition-colors"
                >
                    +{hidden} more
                </button>
            )}
        </div>
    );
}

export { Badge, badgeVariants };
