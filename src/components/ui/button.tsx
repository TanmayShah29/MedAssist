"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MotionButton } from "./motion";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: [
        "bg-accent-primary text-white",
        "hover:bg-accent-primary-hover",
        "shadow-[0_0_20px_rgba(62,108,143,0.2)]",
        "hover:shadow-[0_0_25px_rgba(62,108,143,0.3)]",
    ].join(" "),
    secondary: [
        "bg-transparent text-text-primary",
        "border border-border-subtle",
        "hover:bg-surface-elevated",
    ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
        return (
            <MotionButton
                className={cn(
                    "inline-flex items-center justify-center gap-2",
                    "rounded-lg font-medium",
                    "transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    variantClasses[variant],
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {children}
            </MotionButton>
        );
    }
);
Button.displayName = "Button";

export { Button };
