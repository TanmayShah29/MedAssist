"use client";

import React from "react";

// Simplified skeletal version of the dashboard
export function DashboardPreview() {
    return (
        <div className="opacity-50 pointer-events-none select-none grayscale transition-all duration-700 space-y-6 scale-[0.98]">
            <div className="bg-card p-6 rounded-xl border border-dashed border-border text-center text-muted-foreground text-sm">
                Dashboard Preview Placeholder
            </div>
        </div>
    );
}
