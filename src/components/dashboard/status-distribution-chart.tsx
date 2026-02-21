"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { motion } from "framer-motion"

interface StatusDistributionChartProps {
    optimal: number
    warning: number
    critical: number
}

export function StatusDistributionChart({ optimal, warning, critical }: StatusDistributionChartProps) {
    const data = [
        { name: "Optimal", value: optimal, color: "#10B981" },
        { name: "Monitor", value: warning, color: "#F59E0B" },
        { name: "Critical", value: critical, color: "#EF4444" },
    ].filter(d => d.value > 0);

    const total = optimal + warning + critical;

    if (total === 0) return null;

    return (
        <div className="bg-white rounded-[14px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
            <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-4 tracking-wider">Health Distribution</h3>
            
            <div className="flex-1 min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-[#1C1917]">{total}</span>
                    <span className="text-[10px] text-[#A8A29E] uppercase font-bold">Total</span>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
                {data.map((item) => (
                    <div key={item.name} className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] font-bold text-[#57534E] uppercase">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-[#1C1917]">{Math.round((item.value / total) * 100)}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
