"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Scroll, Stethoscope, Beaker, FileText } from "lucide-react";

const ACTIVITIES = [
    {
        icon: Stethoscope,
        title: "New Vitals Recorded",
        desc: "Patient #4092 - BP 120/80, HR 72",
        time: "2m ago",
        active: true,
    },
    {
        icon: Beaker,
        title: "Lab Results Available",
        desc: "CBC and Electrolyte Panel ready",
        time: "15m ago",
        active: false,
    },
    {
        icon: FileText,
        title: "Discharge Summary Drafted",
        desc: "Dr. Chen started a new draft",
        time: "1h ago",
        active: false,
    },
    {
        icon: Scroll,
        title: "Protocol Updated",
        desc: "Sepsis Early Detection v2.1",
        time: "3h ago",
        active: false,
    },
];

export function ActivityFeed() {
    return (
        <Card className="p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-text-primary">Recent Activity</h3>
                <button className="text-xs font-medium text-accent-primary hover:text-accent-teal transition-colors">View All</button>
            </div>

            <div className="space-y-6 relative">
                {/* Connector Line */}
                <div className="absolute left-5 top-2 bottom-2 w-px bg-border-subtle" />

                {ACTIVITIES.map((item, idx) => (
                    <div key={idx} className="relative flex gap-4 items-start group">
                        {/* Timeline Dot */}
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-300 ${item.active
                                ? "bg-bg-secondary border-accent-primary text-accent-primary shadow-[0_0_0_4px_rgba(62,108,143,0.15)]"
                                : "bg-bg-secondary border-border-subtle text-text-muted group-hover:border-border-strong group-hover:text-text-secondary"
                            }`}>
                            <item.icon size={18} />
                        </div>

                        <div className="pt-1 flex-1">
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{item.title}</p>
                                <span className="text-xs text-text-muted whitespace-nowrap">{item.time}</span>
                            </div>
                            <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
