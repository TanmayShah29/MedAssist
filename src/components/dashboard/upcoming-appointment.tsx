"use client";

import React from "react";
import { Calendar, Clock, Video } from "lucide-react";

export function UpcomingAppointment() {
    return (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Upcoming Consultation</h3>

            <div className="flex gap-4 items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center border border-primary/20">
                    <span className="text-[10px] font-bold uppercase">Feb</span>
                    <span className="text-lg font-bold leading-none">24</span>
                </div>
                <div>
                    <div className="font-bold text-foreground">Hematology Review</div>
                    <div className="text-sm text-muted-foreground font-medium">Dr. Sarah Chen • 10:00 AM</div>
                </div>
            </div>

            <div className="flex gap-2">
                <button className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <Video className="w-4 h-4" /> Join
                </button>
                <button className="px-4 py-2 bg-muted text-muted-foreground border border-border rounded-lg text-sm font-bold hover:bg-muted/80 transition-colors">
                    Reschedule
                </button>
            </div>
        </div>
    );
}
