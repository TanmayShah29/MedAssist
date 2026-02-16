"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export type DayPoint = {
    day: string;
    value: number; // Risk Score 0-100
};

interface WeeklyKPIChartProps {
    data: DayPoint[];
    width?: number;
    height?: number;
    className?: string;
    color?: string; // Metric Color e.g. #2563EB
}

const WeeklyKPIChart: React.FC<WeeklyKPIChartProps> = ({
    data,
    width = 600,
    height = 200,
    className = "",
    color = "#2563EB",
}) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(data.length - 1);

    // Layout constants
    const padding = 24;
    const bottomPadding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding - bottomPadding;
    const barSpacing = chartWidth / data.length;
    const baseline = height - bottomPadding;

    // Use fixed scale 0-100 for medical consistency
    const MAX_VALUE = 100;

    const getBarHeight = (value: number) => (value / MAX_VALUE) * chartHeight;

    // Clinical Animation: subdued, ease-out
    const barVariants = {
        initial: { height: 0, opacity: 0 },
        animate: { height: "auto", opacity: 1 },
    };

    return (
        <div className={`relative bg-card rounded-xl border border-border-subtle p-6 ${className}`}>
            {/* Header / Legend */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-tight">
                    7-Day Risk Vitals
                </h3>
                <span className="text-xs font-medium text-text-muted bg-background px-2 py-1 rounded border border-border-subtle">
                    Scale: 0-100
                </span>
            </div>

            <div className="relative" style={{ height: height, width: "100%" }}>
                {/* Background Grid Lines (0, 50, 100) */}
                {[0, 0.5, 1].map((tick) => (
                    <div
                        key={tick}
                        className="absolute left-0 right-0 border-t border-dashed border-border-subtle z-0"
                        style={{
                            top: tick === 0 ? baseline : tick === 0.5 ? baseline - (chartHeight / 2) : padding,
                            opacity: 0.5
                        }}
                    />
                ))}

                <svg
                    width="100%"
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    className="overflow-visible relative z-10"
                >
                    {data.map((point, index) => {
                        const x = padding + index * barSpacing + barSpacing / 2;
                        const barH = getBarHeight(point.value);
                        const isSelected = index === selectedIndex;

                        // Color logic: High risk > 80 is critical
                        const barColor = point.value > 80 ? "#EF4444" : color;

                        return (
                            <g
                                key={`${point.day}-${index}`}
                                onClick={() => setSelectedIndex(index)}
                                style={{ cursor: "pointer" }}
                            >
                                {/* Hover/Click Area */}
                                <rect
                                    x={x - barSpacing / 2 + 4}
                                    y={0}
                                    width={barSpacing - 8}
                                    height={height}
                                    fill={isSelected ? "rgba(37, 99, 235, 0.05)" : "transparent"}
                                    rx="4"
                                />

                                {/* The Bar Line */}
                                <motion.line
                                    x1={x}
                                    y1={baseline}
                                    x2={x}
                                    y2={baseline - barH}
                                    stroke={barColor}
                                    strokeWidth={6}
                                    strokeLinecap="round"
                                    initial={{ y2: baseline }}
                                    animate={{ y2: baseline - barH }}
                                    transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
                                />

                                {/* Selected Indicator Circle */}
                                {isSelected && (
                                    <motion.circle
                                        cx={x}
                                        cy={baseline - barH}
                                        r={5}
                                        fill="white"
                                        stroke={barColor}
                                        strokeWidth={2}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    />
                                )}

                                {/* Tooltip Value (Only Selected) */}
                                {isSelected && (
                                    <foreignObject x={x - 24} y={baseline - barH - 36} width={48} height={30}>
                                        <div className="flex justify-center">
                                            <div className="bg-white border border-border-subtle shadow-sm rounded px-2 py-0.5 text-xs font-bold text-text-primary">
                                                {point.value}
                                            </div>
                                        </div>
                                    </foreignObject>
                                )}

                                {/* X-Axis Label */}
                                <text
                                    x={x}
                                    y={height - 5}
                                    textAnchor="middle"
                                    fontSize="12"
                                    fill={isSelected ? "#0F172A" : "#94a3b8"}
                                    fontWeight={isSelected ? "600" : "400"}
                                >
                                    {point.day}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

export { WeeklyKPIChart };
