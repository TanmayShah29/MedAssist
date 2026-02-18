"use client"
import React from "react"
import { cva } from "class-variance-authority"
import { HTMLMotionProps, motion } from "motion/react"
import { cn } from "@/lib/utils"

const bouncingDotsVariant = cva(
    "flex gap-2 items-center justify-center",
    {
        variants: {
            messagePlacement: {
                bottom: "flex-col",
                right: "flex-row",
                left: "flex-row-reverse",
            },
        },
        defaultVariants: {
            messagePlacement: "bottom",
        },
    }
)

export interface BouncingDotsProps {
    dots?: number        // default 3
    message?: string     // e.g. "Groq AI analyzing..."
    messagePlacement?: "bottom" | "left" | "right"
}

export function BouncingDots({
    dots = 3,
    message,
    messagePlacement = "bottom",
    className,
    ...props
}: HTMLMotionProps<"div"> & BouncingDotsProps) {
    return (
        <div className={cn(bouncingDotsVariant({ messagePlacement }))}>
            <div className={cn("flex gap-2 items-center justify-center")}>
                {Array(dots)
                    .fill(undefined)
                    .map((_, index) => (
                        <motion.div
                            key={index}
                            className={cn(
                                "w-2.5 h-2.5 bg-sky-500 rounded-full",
                                // Changed bg-foreground to bg-sky-500 for brand consistency
                                className
                            )}
                            animate={{ y: [0, -12, 0] }}
                            transition={{
                                duration: 0.6,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: index * 0.2,
                                ease: "easeInOut",
                            }}
                            {...props}
                        />
                    ))}
            </div>
            {message && (
                <div className="text-xs text-slate-400 font-mono">
                    {message}
                </div>
            )}
        </div>
    )
}
