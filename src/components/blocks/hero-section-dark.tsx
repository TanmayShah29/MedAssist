"use client";

import { HeroSection } from "@/components/ui/hero-section-dark";

export function HeroBlock() {
    return (
        <HeroSection
            title="System Operational • v2.4.0"
            subtitle={{
                regular: "Clinical intelligence for ",
                gradient: "modern care teams",
            }}
            description="Leverage AI-driven insights to predict patient risks, optimize workflows, and enhance decision-making with precision and clarity."
            ctaText="Access Dashboard"
            gridOptions={{
                angle: 65,
                opacity: 0.4,
                lightLineColor: "#2A3443", // Warm slate line
                darkLineColor: "#1E293B",
            }}
        />
    );
}
