"use client";

import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const data = [
    { subject: "Metabolic", A: 120, fullMark: 150 },
    { subject: "Inflammation", A: 98, fullMark: 150 },
    { subject: "Hormonal", A: 86, fullMark: 150 },
    { subject: "Cardiovascular", A: 99, fullMark: 150 },
    { subject: "Liver Function", A: 85, fullMark: 150 },
    { subject: "Renal", A: 65, fullMark: 150 },
];

export function HealthRadarChart() {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="w-full h-full min-h-[300px]" />;

    return (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center relative">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider absolute top-0 left-0">System Balance</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar
                        name="Mike"
                        dataKey="A"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        fill="var(--color-primary)"
                        fillOpacity={0.2}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
