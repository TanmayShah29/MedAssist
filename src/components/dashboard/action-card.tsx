"use client";

import React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { MotionDiv } from "@/components/ui/motion";

export function ActionCard() {
    return (
        <MotionDiv className="bg-warning/10 border border-warning/20 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0 text-warning">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-warning-foreground uppercase tracking-wide mb-1">Action Required</h3>
                    <p className="text-base font-semibold text-foreground leading-snug mb-3">
                        Vitamin D levels are sub-optimal (24 ng/mL).
                    </p>
                    <button className="text-sm font-bold text-warning flex items-center gap-2 hover:gap-3 transition-all">
                        View Supplement Plan <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </MotionDiv>
    );
}
