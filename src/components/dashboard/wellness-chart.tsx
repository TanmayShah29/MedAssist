"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface HealthTrendChartProps {
    data: { date: string; score: number; ideal: number }[];
    className?: string;
}

export function WellnessChart({ data, className }: { data: any[], className?: string }) {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className={className || "h-[300px] w-full"} aria-hidden="true" />; // Placeholder to prevent layout shift
    }

    return (
        <div className={className || "h-[300px] w-full"} role="img" aria-label="Line chart showing wellness trend over the last 6 months. Trajectory is improving.">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-surface)',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border)',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}
                        itemStyle={{ color: 'var(--color-success)', fontWeight: 'bold' }}
                        labelStyle={{ color: 'var(--color-text-muted)' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-success)"
                        strokeWidth={3}
                        fill="var(--color-success)"
                        fillOpacity={0.1}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
