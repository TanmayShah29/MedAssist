"use client";

import React from "react";
import { RiskForecastChart } from "./risk-forecast-chart";
import { InsightPanel } from "./insight-panel";

export function RiskAssessment() {
    return (
        <div className="space-y-8">
            <section className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <RiskForecastChart />
            </section>
            <section>
                <InsightPanel />
            </section>
        </div>
    );
}
