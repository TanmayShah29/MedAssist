"use client";

import React from "react";
import { ArrowRight, Shield } from "lucide-react";
import { MotionButton } from "@/components/ui/motion";
import { useStore } from "@/store/useStore";


export function DashboardHero() {
    const { user } = useStore();
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Health Intelligence Overview</h1>
                <p className="text-slate-500 font-medium">
                    Last updated: <span className="text-slate-700">{date}</span>
                </p>
            </div>

            <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    Export Report
                </button>
            </div>
        </div>
    );
}
