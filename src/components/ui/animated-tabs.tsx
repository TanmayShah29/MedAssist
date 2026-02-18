"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = {
    id: string;
    label: string;
    count?: number;
};

type AnimatedTabsProps = {
    tabs: Tab[];
    defaultTab?: string;
    onChange?: (id: string) => void;
    className?: string;
    variant?: "default" | "boxed" | "pill";
    size?: "sm" | "md";
};

export function AnimatedTabs({
    tabs,
    defaultTab,
    onChange,
    className,
    variant = "default",
    size = "md",
}: AnimatedTabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);

    return (
        <div
            className={cn(
                "flex items-center gap-1",
                variant === "boxed" && "bg-slate-100/50 p-1 rounded-lg border border-slate-200/50",
                variant === "pill" && "gap-2",
                className
            )}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => {
                        setActiveTab(tab.id);
                        onChange?.(tab.id);
                    }}
                    className={cn(
                        "relative px-3 py-1.5 text-sm font-medium transition-colors outline-none",
                        size === "sm" && "text-xs px-2.5 py-1",
                        activeTab === tab.id ? "text-slate-900" : "text-slate-500 hover:text-slate-700",
                        variant === "pill" && "rounded-full border border-transparent",
                        variant === "pill" && activeTab === tab.id && "bg-white border-slate-200 shadow-sm",
                        variant === "pill" && activeTab !== tab.id && "hover:bg-slate-100"
                    )}
                >
                    {activeTab === tab.id && variant !== "pill" && (
                        <motion.div
                            layoutId="active-tab"
                            className={cn(
                                "absolute inset-0 bg-white rounded-md shadow-sm border border-slate-200",
                                variant === "default" && "bg-transparent shadow-none border-b-2 border-slate-900 rounded-none mb-[-1px] border-t-0 border-x-0"
                            )}
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100",
                                activeTab === tab.id && "bg-slate-100"
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </span>
                </button>
            ))}
        </div>
    );
}
