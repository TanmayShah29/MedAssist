"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Settings Data
const initialAlertSettings = [
    { id: 1, label: "Detailed Biomarker Changes", description: "Notify when any marker shifts >5%", enabled: true },
    { id: 2, label: "Weekly Summary", description: "Email digest every Monday morning", enabled: false },
];

const initialAISettings = [
    { id: 1, label: "Proactive Suggestions", description: "AI can suggest questions based on new results", enabled: true },
    { id: 2, label: "Context Sharing", description: "Allow AI to reference past conversations", enabled: true },
];

const initialPrivacySettings = [
    { id: 1, label: "De-identified Research Contribution", description: "Contribute anonymous data to medical research", enabled: false },
    { id: 2, label: "Local-Only Result Processing", description: "Keep sensitive raw data on device where possible", enabled: true },
];

export default function SettingsPage() {
    const router = useRouter();
    const [alertSettings, setAlertSettings] = useState(initialAlertSettings);
    const [aiSettings, setAiSettings] = useState(initialAISettings);
    const [privacySettings, setPrivacySettings] = useState(initialPrivacySettings);
    const [analysisDepth, setAnalysisDepth] = useState("Standard");

    const toggleSetting = (id: number) => {
        setAlertSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    };
    const toggleAISetting = (id: number) => {
        setAiSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    };
    const togglePrivacy = (id: number) => {
        setPrivacySettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    };

    return (
        <div className="max-w-[800px] mx-auto px-6 py-8 space-y-6">

            <div>
                <h1 className="font-display text-3xl text-[#1C1917]">Settings</h1>
                <p className="text-sm text-[#A8A29E] mt-1">
                    Control how MedAssist works for you
                </p>
            </div>

            {/* Unreviewed alerts banner */}
            <div className="bg-[#FFFBEB] rounded-[14px] border border-[#FDE68A] p-4 
                      flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <p className="text-sm font-medium text-amber-800">
                        You have 2 unreviewed alerts
                    </p>
                </div>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-900 
                     transition-colors flex items-center gap-1"
                >
                    Go to Dashboard <ChevronRight className="w-3 h-3" />
                </button>
            </div>

            {/* Alert Thresholds */}
            <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] p-5">
                <p className="text-base font-semibold text-[#1C1917] mb-1">
                    Alert Thresholds
                </p>
                <p className="text-xs text-[#A8A29E] mb-5">
                    Control when MedAssist notifies you
                </p>
                <div className="space-y-4">
                    {alertSettings.map(setting => (
                        <div key={setting.id}
                            className="flex items-center justify-between py-3 
                            border-b border-[#E8E6DF] last:border-0">
                            <div>
                                <p className="text-sm font-medium text-[#1C1917]">
                                    {setting.label}
                                </p>
                                <p className="text-xs text-[#A8A29E] mt-0.5">
                                    {setting.description}
                                </p>
                            </div>
                            {/* Toggle switch */}
                            <button
                                onClick={() => toggleSetting(setting.id)}
                                className={cn(
                                    "relative w-10 h-6 rounded-full transition-colors",
                                    setting.enabled ? "bg-sky-500" : "bg-[#E8E6DF]"
                                )}
                            >
                                <span className={cn(
                                    "absolute left-0 top-1 w-4 h-4 bg-white rounded-full shadow-sm",
                                    "transition-transform",
                                    setting.enabled ? "translate-x-5" : "translate-x-1"
                                )} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] p-5">
                <p className="text-base font-semibold text-[#1C1917] mb-1">
                    AI Analysis
                </p>
                <p className="text-xs text-[#A8A29E] mb-5">
                    Configure how Groq AI analyzes your data
                </p>
                <div className="space-y-4">
                    {aiSettings.map(setting => (
                        <div key={setting.id}
                            className="flex items-center justify-between py-3 
                            border-b border-[#E8E6DF] last:border-0">
                            <div>
                                <p className="text-sm font-medium text-[#1C1917]">
                                    {setting.label}
                                </p>
                                <p className="text-xs text-[#A8A29E] mt-0.5">
                                    {setting.description}
                                </p>
                            </div>
                            <button
                                onClick={() => toggleAISetting(setting.id)}
                                className={cn(
                                    "relative w-10 h-6 rounded-full transition-colors",
                                    setting.enabled ? "bg-sky-500" : "bg-[#E8E6DF]"
                                )}
                            >
                                <span className={cn(
                                    "absolute left-0 top-1 w-4 h-4 bg-white rounded-full shadow-sm",
                                    "transition-transform",
                                    setting.enabled ? "translate-x-5" : "translate-x-1"
                                )} />
                            </button>
                        </div>
                    ))}
                </div>
                {/* Analysis depth */}
                <div className="mt-4 pt-4 border-t border-[#E8E6DF]">
                    <p className="text-sm font-medium text-[#1C1917] mb-3">
                        Analysis Depth
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {["Standard", "Deep — thorough but slower"].map(option => (
                            <button
                                key={option}
                                onClick={() => setAnalysisDepth(option)}
                                className={cn(
                                    "px-4 py-3 rounded-[10px] border text-sm font-medium",
                                    "transition-all text-left",
                                    analysisDepth === option
                                        ? "bg-sky-500 text-white border-sky-500"
                                        : "bg-[#FAFAF7] text-[#57534E] border-[#E8E6DF] hover:border-[#D9D6CD]"
                                )}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Privacy */}
            <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] p-5">
                <p className="text-base font-semibold text-[#1C1917] mb-1">Privacy</p>
                <p className="text-xs text-[#A8A29E] mb-5">
                    Your health data stays private by default
                </p>
                <div className="space-y-4">
                    {privacySettings.map(setting => (
                        <div key={setting.id}
                            className="flex items-center justify-between py-3 
                            border-b border-[#E8E6DF] last:border-0">
                            <div>
                                <p className="text-sm font-medium text-[#1C1917]">
                                    {setting.label}
                                </p>
                                <p className="text-xs text-[#A8A29E] mt-0.5">
                                    {setting.description}
                                </p>
                            </div>
                            <button
                                onClick={() => togglePrivacy(setting.id)}
                                className={cn(
                                    "relative w-10 h-6 rounded-full transition-colors",
                                    setting.enabled ? "bg-sky-500" : "bg-[#E8E6DF]"
                                )}
                            >
                                <span className={cn(
                                    "absolute left-0 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                                    setting.enabled ? "translate-x-5" : "translate-x-1"
                                )} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
