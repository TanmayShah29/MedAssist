"use client"

import { motion } from "framer-motion"
import { Brain, Link as LinkIcon, Activity, Thermometer } from "lucide-react"

interface ClinicalEntity {
    name: string
    type: string
    status?: string
}

interface AnalysisPanelProps {
    biomarkers: any[]
    symptoms: string[]
}

export function AnalysisPanel({ biomarkers, symptoms }: AnalysisPanelProps) {
    // Transform biomarkers and symptoms into clinical entities
    const entities: ClinicalEntity[] = [
        ...symptoms.map(s => ({ name: s, type: 'Symptom' })),
        ...biomarkers.filter(b => b.status === 'critical' || b.status === 'warning').map(b => ({
            name: `${b.name} ${b.value}`,
            type: 'Lab Value',
            status: b.status
        }))
    ].slice(0, 8); // Limit for UI space

    return (
        <div className="h-full overflow-y-auto p-6 space-y-8 bg-[#0F172A]">
            {/* Detected Entities */}
            <div>
                <h3 className="text-[11px] uppercase tracking-widest text-[#6B7280] font-semibold mb-3">Entities Detected</h3>
                {entities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {entities.map((e, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center h-8 px-3 bg-[#111113] border border-[#1F1F23] rounded-md text-[13px] text-[#D1D5DB] transition-colors"
                            >
                                <span className={`w-2 h-2 rounded-full mr-2 ${e.type === 'Symptom' ? 'bg-blue-500' :
                                    e.status === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                                    }`} />
                                {e.name}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-slate-500 italic">No symptoms or flagged labs found.</p>
                )}
            </div>

            {/* Evidence Trail */}
            <div className="pt-4 border-t border-[#1F1F23]">
                <h3 className="text-[11px] uppercase tracking-widest text-[#6B7280] font-semibold mb-3">Extraction Pipeline</h3>
                <div className="space-y-3">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#111113] border border-[#1F1F23] flex items-center justify-center shrink-0">
                            <Brain className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[13px] text-[#D1D5DB] leading-tight mb-1">Pattern recognition active</p>
                            <p className="text-[11px] text-[#4B5563]">Groq AI (Llama 3.3) processing...</p>
                        </div>
                    </div>
                    {biomarkers.length > 0 && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#111113] border border-[#1F1F23] flex items-center justify-center shrink-0">
                                <Activity className="w-4 h-4 text-sky-500" />
                            </div>
                            <div>
                                <p className="text-[13px] text-[#D1D5DB] leading-tight mb-1">Mapping biomarker trends</p>
                                <p className="text-[11px] text-[#4B5563]">{biomarkers.length} values indexed</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
