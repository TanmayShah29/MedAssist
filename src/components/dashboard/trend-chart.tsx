"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { time: "08:00", value: 45 },
    { time: "09:00", value: 52 },
    { time: "10:00", value: 49 },
    { time: "11:00", value: 62 },
    { time: "12:00", value: 58 },
    { time: "13:00", value: 71 },
    { time: "14:00", value: 66 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-bg-secondary border border-border-subtle p-3 rounded-lg shadow-xl text-sm">
                <p className="text-text-muted mb-1">{label}</p>
                <p className="text-accent-teal font-semibold">
                    Risk Score: <span className="text-text-primary">{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};

export function TrendChart() {
    return (
        <Card className="p-6 h-[400px]">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-text-primary">Patient Risk Trends</h3>
                    <p className="text-sm text-text-muted">Real-time aggregate risk analysis</p>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="var(--color-text-muted)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="var(--color-text-muted)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }} />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="var(--color-accent-primary)"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "var(--bg-primary)", strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: "var(--color-accent-teal)" }}
                            animationDuration={800}
                            animationEasing="ease-out"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
