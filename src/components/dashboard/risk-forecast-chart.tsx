"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const data = [
    { month: "Jan", risk: 65 },
    { month: "Feb", risk: 58 },
    { month: "Mar", risk: 50 },
    { month: "Apr", risk: 45 }, // Current
    { month: "May", risk: 40, projected: true },
    { month: "Jun", risk: 35, projected: true },
];

export function RiskForecastChart() {
    return (
        <div className="w-full h-full min-h-[250px] relative">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">6-Month Risk Forecast</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-surface)',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border)',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)'
                        }}
                        labelStyle={{ color: 'var(--color-text-muted)' }}
                        itemStyle={{ color: 'var(--color-text-primary)' }}
                    />
                    {/* Historical Line */}
                    <Line
                        type="monotone"
                        dataKey="risk"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--color-primary)', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    {/* Projection Divider */}
                    <ReferenceLine x="Apr" stroke="var(--color-text-muted)" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: 'var(--color-text-muted)', fontSize: 10 }} />
                </LineChart>
            </ResponsiveContainer>
            <div className="absolute top-4 right-0 flex gap-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="text-xs text-muted-foreground">Historical</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary/50"></span>
                    <span className="text-xs text-muted-foreground">Projected</span>
                </div>
            </div>
        </div>
    );
}
