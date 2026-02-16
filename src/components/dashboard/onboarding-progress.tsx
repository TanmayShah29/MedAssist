"use client";

import React from "react";
import { Upload } from "lucide-react";
import { MotionButton } from "@/components/ui/motion";
import { useStore } from "@/store/useStore";

export function OnboardingProgress() {
    const { setHasData } = useStore();

    return (
        <div className="bg-white rounded-xl border border-blue-100 shadow-lg shadow-blue-500/5 p-6 h-full flex flex-col justify-center">

            <div className="mb-6">
                <h2 className="text-lg font-bold text-foreground mb-2">Initialize Analysis</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Upload your latest clinical data to activate the intelligence engine.
                </p>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-primary border border-blue-100 flex items-center justify-center shadow-sm shrink-0">
                        <span className="text-[10px] font-bold">1</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">Upload Lab Report (PDF)</span>
                </div>
                <div className="flex items-center gap-3 opacity-50">
                    <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground border border-border flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold">2</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">AI Risk Assessment</span>
                </div>
                <div className="flex items-center gap-3 opacity-50">
                    <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground border border-border flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold">3</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">View Health Strategy</span>
                </div>
            </div>

            <MotionButton
                onClick={() => setHasData(true)}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md"
            >
                <Upload className="w-4 h-4" />
                Upload Data
            </MotionButton>
        </div>
    );
}
