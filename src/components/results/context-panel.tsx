"use client"

import { motion } from "framer-motion"
import { LabResult } from "@/types/dashboard"
import { Info, ThumbsUp, ArrowRight, BookOpen } from "lucide-react"

export function ContextPanel({ result }: { result: LabResult }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden sticky top-6"
        >
            <div className="p-6 bg-slate-50 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{result.name}</h3>
                <p className="text-sm text-slate-500">Also known as: {result.name === 'Hemoglobin' ? 'Hb, Hgb' : 'Clinical Term'}</p>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        What is it?
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {result.name} is a key biomarker in your {result.category} panel.
                        It helps evaluate overall health and detect disorders such as anemia,
                        infection, and other systemic issues.
                    </p>
                </div>

                <div>
                    <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-2">
                        <Info className="w-4 h-4 text-blue-600" />
                        Why does it matter?
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4 marker:text-slate-400">
                        <li>Essential for oxygen transport</li>
                        <li>Indicator of dietary balance</li>
                        <li>Key for energy levels</li>
                    </ul>
                </div>

                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <h4 className="flex items-center gap-2 font-semibold text-emerald-900 mb-2">
                        <ThumbsUp className="w-4 h-4 text-emerald-600" />
                        Recommended Actions
                    </h4>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-emerald-800">
                            <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                            <span>Maintain current iron-rich diet</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-emerald-800">
                            <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                            <span>Hydrate adequately before next test</span>
                        </li>
                    </ul>
                </div>
            </div>
        </motion.div>
    )
}
