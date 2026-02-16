"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { MotionButton } from "@/components/ui/motion";

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: {
        regular: string;
        gradient: string;
    };
    description?: string;
    ctaText?: string;
    ctaHref?: string;
    bottomImage?: {
        light: string;
        dark: string;
    };
    gridOptions?: {
        angle?: number;
        cellSize?: number;
        opacity?: number;
        lightLineColor?: string;
        darkLineColor?: string;
    };
}

const RetroGrid = ({
    angle = 65,
    cellSize = 60,
    opacity = 0.5,
    lightLineColor = "#2A3443",
    darkLineColor = "#1E293B",
}: {
    angle?: number;
    cellSize?: number;
    opacity?: number;
    lightLineColor?: string;
    darkLineColor?: string;
}) => {
    const gridStyles = {
        "--grid-angle": `${angle}deg`,
        "--cell-size": `${cellSize}px`,
        "--opacity": opacity,
        "--light-line": lightLineColor,
        "--dark-line": darkLineColor,
    } as React.CSSProperties;

    return (
        <div
            className={cn(
                "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
                `opacity-[var(--opacity)]`
            )}
            style={gridStyles}
        >
            <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
                <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent to-90%" />
        </div>
    );
};

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
    (
        {
            className,
            title = "System Status: Normal",
            subtitle = {
                regular: "AI-powered clinical intelligence for ",
                gradient: "modern healthcare teams",
            },
            description = "Transform patient data into actionable insights with our comprehensive AI analysis platform. Real-time risk assessment, intelligent alerts, and clinical decision support.",
            ctaText = "Get Started",
            ctaHref = "#",
            bottomImage,
            gridOptions,
            ...props
        },
        ref
    ) => {
        return (
            <div className={cn("relative", className)} ref={ref} {...props}>
                {/* ── Gradient Background ── */}
                <div className="absolute top-0 z-[0] h-screen w-screen bg-bg-primary bg-[radial-gradient(ellipse_40%_50%_at_50%_-20%,rgba(62,108,143,0.15),rgba(15,23,34,0))]" />

                <section className="relative max-w-full mx-auto z-1 pt-20 pb-0">
                    <RetroGrid {...gridOptions} />

                    <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-8">
                        {/* ── Pill Badge ── */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border-subtle bg-surface-glass backdrop-blur-md text-sm font-medium text-text-secondary group hover:border-border-strong hover:bg-surface-elevated transition-colors cursor-default">
                            <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse-subtle" />
                            {title}
                            <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                        </div>

                        {/* ── Main Heading ── */}
                        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-text-primary leading-[1.1]">
                            {subtitle.regular}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-teal">
                                {subtitle.gradient}
                            </span>
                        </h1>

                        {/* ── Description ── */}
                        <p className="max-w-2xl mx-auto text-lg text-text-secondary leading-relaxed">
                            {description}
                        </p>

                        {/* ── CTA Button ── */}
                        <div className="flex justify-center pt-4">
                            <div className="relative p-[1px] rounded-full overflow-hidden group">
                                {/* Conic Gradient Border Animation */}
                                <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0F1722_0%,#3E6C8F_50%,#4C8C7A_100%)] opacity-80" />

                                <MotionButton
                                    className="relative px-8 py-3.5 rounded-full bg-bg-secondary hover:bg-surface-elevated text-text-primary font-medium transition-colors backdrop-blur-xl flex items-center gap-2"
                                >
                                    {ctaText}
                                    <ChevronRight size={18} className="text-accent-teal group-hover:translate-x-1 transition-transform" />
                                </MotionButton>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
);
HeroSection.displayName = "HeroSection";

export { HeroSection };
