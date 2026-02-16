"use client";

import React, { useMemo } from "react";
import { AreaChart, AreaSeries, Area, LinearXAxis, LinearXAxisTickSeries, LinearYAxis, LinearYAxisTickSeries, Line, GridlineSeries, Gridline } from "reaviz";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface RiskTrendCardProps {
    className?: string;
}

const RiskTrendCard = ({ className }: RiskTrendCardProps) => {
    // Mock Data
    const data = useMemo(() => {
        const points = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            let baseVal = 20;
            if (i < 7) baseVal = 40 + (7 - i) * 5;
            points.push({
                key: d,
                data: Math.min(100, Math.max(0, baseVal + (Math.random() * 5 - 2.5)))
            });
        }
        return points;
    }, []);

    return (
        <div className={cn("medical-card p-6 flex flex-col h-[360px]", className)}>
            {/* Header - Compact Hierarchy */}
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Risk Progression (30d)</h3>

                    {/* Primary Metric - Massive Visual Hierarchy */}
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-foreground tracking-tight">68</span>
                        <span className="text-sm font-medium text-text-muted">/ 100</span>

                        <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-bold border border-red-100 ml-2">
                            <ArrowUpRight className="w-3 h-3" />
                            +12%
                        </div>
                    </div>
                </div>

                {/* Status Badge - Anchored */}
                <div className="px-3 py-1 bg-slate-50 border border-border-subtle rounded-md text-xs font-semibold text-text-secondary">
                    Prediction: <span className="text-text-primary">Rising</span>
                </div>
            </div>

            {/* Chart Container - De-emphasized Grid */}
            <div className="flex-1 min-h-0 w-full relative -ml-2">
                <AreaChart
                    data={data}
                    series={
                        <AreaSeries
                            colorScheme={["#2563EB"]}
                            area={
                                <Area
                                    mask={null}
                                    gradient={null}
                                    style={{ fill: "rgba(37, 99, 235, 0.08)" }}
                                />
                            }
                            line={
                                <Line
                                    strokeWidth={2}
                                    style={{ stroke: "#2563EB" }}
                                />
                            }
                        />
                    }
                    xAxis={
                        <LinearXAxis
                            type="time"
                            tickSeries={<LinearXAxisTickSeries label={null} />}
                            axisLine={null}
                        />
                    }
                    yAxis={
                        <LinearYAxis
                            domain={[0, 100]}
                            tickSeries={<LinearYAxisTickSeries tickSize={20} label={null} />}
                            axisLine={null}
                        />
                    }
                    gridlines={
                        <GridlineSeries
                            line={<Gridline direction="y" />}
                        />
                    }
                />
            </div>
        </div>
    );
};

export { RiskTrendCard };
