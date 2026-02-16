"use client";

import React from "react";
import { Upload, FileText, Zap, ChevronRight } from "lucide-react";

export function QuickActions() {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>

            <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group transition-colors border border-transparent hover:border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Upload className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Upload New Labs</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group transition-colors border border-transparent hover:border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Zap className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Run Comparison</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group transition-colors border border-transparent hover:border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Export Summary</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                </button>
            </div>
        </div>
    );
}
