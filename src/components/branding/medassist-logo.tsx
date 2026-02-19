"use client";

import React from "react";

export function MedAssistLogo({ className = "", collapsed = false, monochrome = false }: { className?: string; collapsed?: boolean; monochrome?: boolean }) {
    // Colors for "Teal Data Shield"
    const colorPrimary = monochrome ? "currentColor" : "#14B8A6"; // Teal-500
    const colorSecondary = monochrome ? "currentColor" : "#A2E9E2"; // Teal-200 (Light Accent)

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* LOGO MARK: The "Teal Data Shield" */}
            <div className="relative w-8 h-8 flex-shrink-0">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    {/* Shield Outline (Data Paths) */}
                    <path
                        d="M16 2L4 7V15C4 22 9.5 28.5 16 30C22.5 28.5 28 22 28 15V7L16 2Z"
                        stroke={colorPrimary}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />

                    {/* Inner Network Nodes */}
                    <circle cx="16" cy="11" r="2" fill={colorSecondary} />
                    <circle cx="11" cy="18" r="1.5" fill={colorPrimary} />
                    <circle cx="21" cy="18" r="1.5" fill={colorPrimary} />

                    {/* Data Connections */}
                    <path d="M16 13V22" stroke={colorPrimary} strokeWidth="1.5" />
                    <path d="M11 18L16 13L21 18" stroke={colorPrimary} strokeWidth="1.5" strokeLinecap="round" />

                    {/* Bottom Anchor */}
                    <path d="M16 22L12 25" stroke={colorPrimary} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
                    <path d="M16 22L20 25" stroke={colorPrimary} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
                </svg>
            </div>

            {/* WORDMARK */}
            {!collapsed && (
                <div className="flex flex-col justify-center">
                    <span className={`text-lg font-bold tracking-tight leading-none ${monochrome ? "currentColor" : "text-slate-100"}`}>
                        MedAssist
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] leading-none mt-1 ${monochrome ? "opacity-70" : "text-teal-400"}`}>
                        Intelligence
                    </span>
                </div>
            )}
        </div>
    );
}
