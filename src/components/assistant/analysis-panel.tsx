"use client"

import { motion } from "framer-motion"
import { Brain, Link as LinkIcon } from "lucide-react"

interface ClinicalEntity {
    name: string
    type: string
    confidence: number
}

// interface Diagnosis {
//     condition: string
//     probability: number
//     evidence: string[]
// }

export function AnalysisPanel() {
    // Mock data for the Abridge-style panel
    // In a real app, this would come from the context or props based on the active conversation
    const entities: ClinicalEntity[] = [
        { name: 'Fatigue', type: 'Symptom', confidence: 0.98 },
        { name: 'Hemoglobin 12.8', type: 'Lab Value', confidence: 0.99 },
        { name: 'Iron Supplementation', type: 'Medication', confidence: 0.95 },
        { name: 'Shortness of breath', type: 'Symptom', confidence: 0.88 },
    ]

    // const differential: Diagnosis[] = [
    //     { condition: 'Iron Deficiency Anemia', probability: 78, evidence: ['Low Hgb', 'Fatigue response'] },
    //     { condition: 'Vitamin B12 Deficiency', probability: 34, evidence: [] },
    //     { condition: 'Hypothyroidism', probability: 21, evidence: [] },
    // ]

    return (
        <div className="h-full overflow-y-auto p-6 space-y-8">

            {/* Header / Context - REMOVED DUPLICATE */}

            {/* Detected Entities */}
            <div>
                <h3 className="text-[11px] uppercase tracking-widest text-[#6B7280] font-semibold mb-3">Entities Detected</h3>
                <div className="flex flex-wrap gap-2">
                    {entities.map((e, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center h-8 px-3 bg-[#111113] border border-[#1F1F23] rounded-md text-[13px] text-[#D1D5DB] hover:border-[#2D2D30] hover:bg-[#1C1C1F] transition-colors"
                        >
                            <span className={`w-2 h-2 rounded-full mr-2 ${e.type === 'Symptom' ? 'bg-blue-500' :
                                e.type === 'Lab Value' ? 'bg-amber-500' :
                                    e.type === 'Medication' ? 'bg-emerald-500' : 'bg-purple-500'
                                }`} />
                            {e.name}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Differential Diagnosis - REMOVED DUPLICATE */}

            {/* Evidence Trail */}
            <div className="pt-4 border-t border-[#1F1F23]">
                <h3 className="text-[11px] uppercase tracking-widest text-[#6B7280] font-semibold mb-3">Evidence Trail</h3>
                <div className="space-y-3">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#111113] border border-[#1F1F23] flex items-center justify-center shrink-0">
                            <Brain className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[13px] text-[#D1D5DB] leading-tight mb-1">Processing clinical context</p>
                            <p className="text-[11px] text-[#4B5563]">Groq AI (Llama 3.3) • 120ms</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#111113] border border-[#1F1F23] flex items-center justify-center shrink-0">
                            <LinkIcon className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-[13px] text-[#D1D5DB] leading-tight mb-1">Cross-referencing guidelines</p>
                            <p className="text-[11px] text-[#4B5563]">ABIM 2024 Reference • ASH Guidelines</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
