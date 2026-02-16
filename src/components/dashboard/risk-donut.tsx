"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { UserCheck } from "lucide-react";

const data = [
    { name: "Low Risk", value: 65, color: "var(--color-risk-low)" },
    { name: "Moderate", value: 25, color: "var(--color-risk-moderate)" },
    { name: "High Risk", value: 10, color: "var(--color-risk-high)" },
];

export function RiskDonut() {
    return (
        <Card className="p-6 h-[400px] flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-medium text-text-primary">Risk Distribution</h3>
                <p className="text-sm text-text-muted">Patient population stratification</p>
            </div>

            <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                            animationBegin={200}
                            animationDuration={1000}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--bg-secondary)",
                                borderColor: "var(--border-subtle)",
                                borderRadius: "8px",
                                color: "var(--text-primary)",
                            }}
                            itemStyle={{ color: "var(--text-primary)" }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center text-center">
                        <UserCheck size={28} className="text-text-muted mb-1" />
                        <span className="text-3xl font-bold text-text-primary">2,405</span>
                        <span className="text-xs text-text-muted uppercase tracking-wider font-medium">Total</span>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-center gap-6">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-text-secondary">{item.name}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
