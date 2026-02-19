"use client";

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn } from "@/lib/utils";

// Mock Data
const uploadedReports = [
    { id: 1, name: "Complete Blood Count", date: "Feb 14, 2024", biomarkers: 14 },
    { id: 2, name: "Metabolic Panel", date: "Jan 10, 2024", biomarkers: 8 },
];

const savedConversations = [
    { id: 1, title: "Discussing low hemoglobin causes", date: "Feb 14 · 4 messages" },
    { id: 2, title: "Vitamin D supplement options", date: "Feb 10 · 2 messages" },
];

export default function ProfilePage() {
    const router = useRouter();

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">

            <div>
                <h1 className="font-display text-3xl text-[#1C1917]">Clinical Profile</h1>
                <p className="text-sm text-[#A8A29E] mt-1">John Doe · Patient #8492</p>
            </div>

            {/* Completion card — sky accent */}
            <div className="bg-[#E0F2FE] rounded-[18px] border border-[#BAE6FD] p-6">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                          text-sky-400">
                            Profile Completeness
                        </p>
                        <p className="text-sm text-sky-700 mt-0.5">
                            Adding missing info improves AI analysis accuracy by ~23%
                        </p>
                    </div>
                    <span className="font-display text-3xl text-sky-700">68%</span>
                </div>
                <div className="h-2 bg-sky-200 rounded-full mb-4">
                    <div className="h-full w-[68%] bg-sky-500 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                        { label: "Family history", cta: "Complete now" },
                        { label: "Current medications", cta: "Add now" },
                        { label: "Allergies", cta: "Add now" },
                    ].map(item => (
                        <div key={item.label}
                            className="flex items-center justify-between bg-sky-100/50 
                            rounded-[10px] px-3 py-2.5">
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                <span className="text-xs text-sky-800">{item.label}</span>
                            </div>
                            <button className="text-xs font-semibold text-sky-600 
                                 hover:text-sky-800 transition-colors">
                                {item.cta} →
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Two column — equal height */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch equal-height-grid">

                <div className="flex flex-col gap-5">
                    {/* Personal Information */}
                    <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] 
                          p-5 flex flex-col flex-1">
                        <p className="text-base font-semibold text-[#1C1917] mb-4">
                            Personal Information
                        </p>
                        <div className="flex-1 grid grid-cols-2 gap-4 card-content-fill">
                            {[
                                { label: "Full Name", value: "John Doe" },
                                { label: "Date of Birth", value: "March 15, 1990" },
                                { label: "Blood Type", value: "O+" },
                                { label: "Height", value: "5'11\" / 180cm" },
                                { label: "Weight", value: "175 lbs / 79kg" },
                                { label: "Member Since", value: "January 2024" },
                            ].map(field => (
                                <div key={field.label}>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                                text-[#A8A29E]">
                                        {field.label}
                                    </p>
                                    <p className="text-sm font-medium text-[#1C1917] mt-0.5">
                                        {field.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <button className="mt-4 text-xs font-semibold text-sky-500 
                               hover:text-sky-600 transition-colors self-start">
                            Edit information →
                        </button>
                    </div>

                    {/* Uploaded Reports */}
                    <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] 
                          p-5 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-base font-semibold text-[#1C1917]">
                                Uploaded Reports
                            </p>
                            <button className="text-xs text-sky-500 font-medium 
                                 hover:text-sky-600 transition-colors">
                                + Upload new
                            </button>
                        </div>
                        <div className="flex-1 space-y-2.5 card-content-fill">
                            {uploadedReports.map(report => (
                                <div key={report.id}
                                    className="flex items-center gap-3 p-3 bg-[#FAFAF7] 
                                rounded-[10px] border border-[#E8E6DF]">
                                    <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center 
                                  justify-center flex-shrink-0">
                                        <FileText className="w-4 h-4 text-sky-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#1C1917] truncate">
                                            {report.name}
                                        </p>
                                        <p className="text-xs text-[#A8A29E]">
                                            {report.date} · {report.biomarkers} biomarkers
                                        </p>
                                    </div>
                                    <button className="text-xs text-sky-500 hover:text-sky-600 
                                     font-medium flex-shrink-0">
                                        View →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    {/* Health Summary */}
                    <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] 
                          p-5 flex flex-col flex-1">
                        <p className="text-base font-semibold text-[#1C1917] mb-4">
                            Health Summary
                        </p>
                        <div className="flex-1 space-y-4 card-content-fill">
                            {[
                                { label: "Known Conditions", items: ["None reported"], cta: "Add conditions" },
                                { label: "Current Medications", items: ["Ferrous Sulfate 325mg"], cta: "Add medication" },
                                { label: "Allergies", items: ["None reported"], cta: "Add allergy" },
                            ].map(section => (
                                <div key={section.label}>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                                text-[#A8A29E] mb-1.5">
                                        {section.label}
                                    </p>
                                    {section.items.map(item => (
                                        <p key={item} className="text-sm text-[#57534E]">{item}</p>
                                    ))}
                                    <button className="text-xs text-sky-500 hover:text-sky-600 
                                     transition-colors mt-1">
                                        + {section.cta}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Saved AI Conversations */}
                    <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] 
                          p-5 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-base font-semibold text-[#1C1917]">
                                Saved Conversations
                            </p>
                            <button
                                onClick={() => router.push('/assistant')}
                                className="text-xs text-sky-500 font-medium 
                           hover:text-sky-600 transition-colors"
                            >
                                Open AI →
                            </button>
                        </div>
                        <div className="flex-1 space-y-2.5 card-content-fill">
                            {savedConversations.map(conv => (
                                <div key={conv.id}
                                    onClick={() => router.push(`/assistant?session=${conv.id}`)}
                                    className="p-3 bg-[#FAFAF7] rounded-[10px] border 
                                border-[#E8E6DF] cursor-pointer 
                                hover:border-[#D9D6CD] transition-colors">
                                    <p className="text-sm font-medium text-[#1C1917] truncate">
                                        {conv.title}
                                    </p>
                                    <p className="text-xs text-[#A8A29E] mt-0.5">{conv.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
