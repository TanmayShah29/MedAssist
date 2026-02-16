"use client";

import React from "react";
import { cn } from "@/lib/utils";

type RiskLevel = "low" | "moderate" | "high";

interface RiskIndicatorProps {
    level: RiskLevel;
    label?: string;
    pulse?: boolean;
    className?: string;
}

const riskConfig: Record<RiskLevel, { color: string; bg: string; glow: string }> = {
    low: {
        color: "text-risk-low",
        bg: "bg-risk-low/15",
        glow: "shadow-[0_0_8px_rgba(76,140,122,0.15)]",
    },
    moderate: {
        color: "text-risk-moderate",
        bg: "bg-risk-moderate/15",
        glow: "shadow-[0_0_8px_rgba(182,138,60,0.15)]",
    },
    high: {
        color: "text-risk-high",
        bg: "bg-risk-high/15",
        glow: "shadow-[0_0_8px_rgba(169,78,59,0.15)]",
    },
};

const RiskIndicator: React.FC<RiskIndicatorProps> = ({
    level,
    label,
    pulse = false,
    className,
}) => {
    const config = riskConfig[level];
    const displayLabel = label || level.charAt(0).toUpperCase() + level.slice(1);

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                config.color,
                config.bg,
                config.glow,
                pulse && level === "high" && "animate-pulse-subtle",
                className
            )}
        >
            <span
                className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    level === "low" && "bg-risk-low",
                    level === "moderate" && "bg-risk-moderate",
                    level === "high" && "bg-risk-high"
                )}
            />
            {displayLabel}
        </span>
    );
};

export { RiskIndicator };
export type { RiskLevel };
