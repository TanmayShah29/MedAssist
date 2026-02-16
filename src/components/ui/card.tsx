"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hover = true, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "bg-surface-glass border border-border-subtle backdrop-blur-md rounded-xl",
                    "shadow-lg shadow-black/10",
                    hover && [
                        "transition-all duration-200",
                        "hover:-translate-y-1 hover:border-border-strong",
                        "hover:shadow-xl hover:shadow-black/20",
                    ],
                    className
                )}
                style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Card.displayName = "Card";

export { Card };
