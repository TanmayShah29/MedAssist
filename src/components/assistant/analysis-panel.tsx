"use client"

import { motion } from "framer-motion"
import { Brain, Activity, ClipboardList } from "lucide-react"
import { needsClinicianDiscussion } from "@/lib/patient-status"

interface ClinicalEntity {
    name: string
    type: string
    status?: string
}

interface AnalysisPanelProps {
    biomarkers: import('@/types/medical').Biomarker[]
    symptoms: string[]
    doctorQuestions?: { question: string, context: string }[]
}

export function AnalysisPanel({ biomarkers, symptoms, doctorQuestions = [] }: AnalysisPanelProps) {
    // Transform biomarkers and symptoms into clinical entities
    const entities: ClinicalEntity[] = [
        ...symptoms.map(s => ({ name: s, type: 'Symptom' })),
        ...biomarkers.filter(needsClinicianDiscussion).map(b => ({
            name: `${b.name} ${b.value}`,
            type: 'Lab Value',
            status: b.status
        }))
    ].slice(0, 8); // Limit for UI space

    return (
        <div className="h-full overflow-y-auto p-5 lg:p-6 space-y-8 bg-[#F5F4EF] min-w-0">
            {/* Detected Entities */}
            <div>
                <h3 className="text-[11px] uppercase tracking-widest text-[#78716C] font-semibold mb-3">Context Detected</h3>
                {entities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {entities.map((e, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
                                whileHover={{ scale: 1.04, y: -1 }}
                                className="flex min-w-0 max-w-full items-center px-3 py-2 bg-white border border-[#E8E6DF] rounded-md text-[13px] text-[#1C1917] transition-colors duration-200 hover:border-sky-200 hover:shadow-sm"
                            >
                                <span className={`w-2 h-2 rounded-full mr-2 ${e.type === 'Symptom' ? 'bg-blue-500' :
                                    e.status === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                                    }`} />
                                <span className="min-w-0 break-words">{e.name}</span>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-[#78716C] italic">No symptoms or discussion-focused labs found.</p>
                )}
            </div>

            {/* Evidence Trail */}
            <div className="pt-4 border-t border-[#E8E6DF]">
                <h3 className="text-[11px] uppercase tracking-widest text-[#78716C] font-semibold mb-3">Preparation Progress</h3>
                <div className="space-y-3">
                    <div className="group flex gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E6DF] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                            <Brain className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13px] text-[#1C1917] leading-tight mb-1">Visit-prep context active</p>
                            <p className="text-[11px] text-[#57534E] text-wrap-safe">Reviewing values, symptoms, and appointment questions...</p>
                        </div>
                    </div>
                    {biomarkers.length > 0 && (
                        <div className="group flex gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E6DF] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                                <Activity className="w-4 h-4 text-sky-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] text-[#1C1917] leading-tight mb-1">Mapping biomarker evidence</p>
                                <p className="text-[11px] text-[#57534E]">{biomarkers.length} values indexed</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Feature 8: Doctor Ready Questions */}
            {doctorQuestions.length > 0 && (
                <div className="pt-4 border-t border-[#E8E6DF]">
                    <h3 className="text-[11px] uppercase tracking-widest text-[#78716C] font-semibold mb-3 flex items-center gap-2">
                        <ClipboardList size={14} className="text-sky-500" />
                        Questions for your doctor
                    </h3>
                    <div className="space-y-3">
                        {doctorQuestions.map((q, i) => (
                            <div
                                key={i}
                                className="p-3 bg-white border border-sky-100 rounded-xl shadow-sm min-w-0 transition-all duration-200 hover:border-sky-200 hover:shadow-md hover:-translate-y-0.5 stagger-fade-sm"
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                <p className="text-[13px] font-bold text-slate-800 leading-tight mb-1 break-words">
                                    {q.question}
                                </p>
                                <p className="text-[11px] text-[#57534E] break-words">
                                    {q.context}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
