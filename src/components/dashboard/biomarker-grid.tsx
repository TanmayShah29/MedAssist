"use client";

import React from "react";
import { MetricCard } from "./metric-card";
import { useStore } from "@/store/useStore";

export function BiomarkerGrid() {
    const { biomarkers } = useStore();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {biomarkers.map((b) => (
                <MetricCard
                    key={b.id}
                    title={b.name}
                    value={b.value.toString()}
                    unit={b.unit}
                    status={b.status}
                    trend={b.trend}
                    className="h-full"
                />
            ))}
        </div>
    );
}
