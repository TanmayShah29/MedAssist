import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border",
    {
        variants: {
            status: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                optimal:
                    "border-transparent bg-teal-100 text-teal-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
                warning:
                    "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
                critical:
                    "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
                monitor:
                    "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
                outline: "text-foreground",
            },
        },
        defaultVariants: {
            status: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    dot?: boolean;
}

function StatusBadge({ className, status, dot = true, children, ...props }: BadgeProps) {
    const dotColor = {
        default: "bg-primary-foreground",
        optimal: "bg-teal-500",
        warning: "bg-amber-500",
        critical: "bg-red-500",
        monitor: "bg-blue-500",
        outline: "bg-foreground",
    }

    return (
        <div className={cn(badgeVariants({ status }), className)} {...props}>
            {dot && status && (
                <span className={cn("mr-1.5 h-2 w-2 rounded-full", dotColor[status])} />
            )}
            {children}
        </div>
    )
}

export { StatusBadge, badgeVariants }
