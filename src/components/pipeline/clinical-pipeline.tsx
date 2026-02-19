"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PipelineStep {
    id: string
    label: string
    status: 'pending' | 'running' | 'complete' | 'error'
    duration?: string
}

export function ClinicalPipelineStatus() {
    const [steps, setSteps] = useState<PipelineStep[]>([
        { id: 'ner', label: 'Groq Medical NLP', status: 'complete', duration: '320ms' },
        { id: 'entity', label: 'Entity Extraction', status: 'complete', duration: '145ms' },
        { id: 'risk', label: 'Risk Scoring', status: 'running' },
        { id: 'groq', label: 'Groq AI Layer', status: 'pending' },
        { id: 'confidence', label: 'Confidence', status: 'pending' },
    ])

    // Simulate pipeline progress
    useEffect(() => {
        const timer = setTimeout(() => {
            setSteps(prev => prev.map(s => {
                if (s.id === 'risk') return { ...s, status: 'complete', duration: '890ms' }
                if (s.id === 'groq') return { ...s, status: 'running' }
                return s
            }))
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (steps.find(s => s.id === 'risk')?.status === 'complete') {
            const timer = setTimeout(() => {
                setSteps(prev => prev.map(s => {
                    if (s.id === 'groq') return { ...s, status: 'complete', duration: '1.2s' }
                    if (s.id === 'confidence') return { ...s, status: 'running' }
                    return s
                }))
            }, 3500) // Groq AI processing
            return () => clearTimeout(timer)
        }
    }, [steps])

    useEffect(() => {
        if (steps.find(s => s.id === 'groq')?.status === 'complete') {
            const timer = setTimeout(() => {
                setSteps(prev => prev.map(s => {
                    if (s.id === 'confidence') return { ...s, status: 'complete', duration: '45ms' }
                    return s
                }))
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [steps])

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mr-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">Live Analysis Pipeline</h3>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-mono text-slate-400">Processing</span>
                </div>
            </div>

            <div className="flex-1 space-y-0 relative">
                {/* Vertical Line */}
                <div className="absolute left-[9px] top-3 bottom-3 w-[1px] bg-slate-700" />

                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-center py-2 group border-b border-slate-700/50 last:border-0"
                    >
                        {/* Status Dot */}
                        <div className={cn(
                            "z-10 w-5 h-5 rounded-full border-4 border-slate-800 flex items-center justify-center transition-colors duration-300",
                            step.status === 'complete' ? "bg-emerald-500 text-slate-900" :
                                step.status === 'running' ? "bg-amber-500" :
                                    step.status === 'error' ? "bg-red-500" : "bg-slate-700"
                        )}>
                            {step.status === 'complete' && <CheckCircle2 className="w-3 h-3 text-slate-900" />}
                            {step.status === 'running' && <Loader2 className="w-3 h-3 text-slate-900 animate-spin" />}
                            {step.status === 'pending' && <Circle className="w-3 h-3 text-slate-500" />}
                        </div>

                        {/* Label */}
                        <div className="ml-4 flex-1 flex justify-between items-center">
                            <span className={cn(
                                "font-mono text-xs transition-colors",
                                step.status === 'pending' ? "text-slate-500" : "text-slate-300"
                            )}>
                                {step.label}
                            </span>

                            {/* Duration or Status Text */}
                            {step.duration ? (
                                <span className="text-[11px] font-mono text-slate-500">{step.duration}</span>
                            ) : step.status === 'running' ? (
                                <span className="text-[11px] font-mono text-amber-500 animate-pulse">Running...</span>
                            ) : null}
                        </div>

                        {/* Hover Highlight */}
                        <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity rounded-lg -mx-2 px-2" />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
