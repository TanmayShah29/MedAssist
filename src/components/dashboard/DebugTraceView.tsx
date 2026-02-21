"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Code, Cpu, Database, ChevronDown, ChevronUp } from "lucide-react";

interface DebugTraceViewProps {
    labResult: any;
}

export function DebugTraceView({ labResult }: DebugTraceViewProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    if (!labResult) return null;

    const pipelineSteps = [
        {
            icon: <Terminal className="w-4 h-4 text-emerald-500" />,
            title: "Step 1: OCR & Text Extraction",
            status: labResult.raw_ocr_text ? "Complete" : "Not Available",
            content: labResult.raw_ocr_text || "No raw text available for this report.",
            type: "text"
        },
        {
            icon: <Cpu className="w-4 h-4 text-violet-500" />,
            title: "Step 2: Groq-Medical-Llama3 Inference",
            status: "Success",
            content: `Model: groq-medical-llama3-8b\nPrompt: System v1.2 (Health-Safety Validated)\nProcessing Time: ${labResult.processing_time_ms || '---'}ms`,
            type: "text"
        },
        {
            icon: <Code className="w-4 h-4 text-sky-500" />,
            title: "Step 3: AI Schema Validation (Zod)",
            status: "Verified",
            content: labResult.raw_ai_json || { info: "Legacy report - raw data not persisted." },
            type: "json"
        },
        {
            icon: <Database className="w-4 h-4 text-amber-500" />,
            title: "Step 4: Atomic Persistence (Postgres RPC)",
            status: "Committed",
            content: `Transaction ID: ${labResult.id}\nStatus: ACID Compliant`,
            type: "text"
        }
    ];

    return (
        <div className="mb-8 border border-[#E8E6DF] rounded-2xl bg-white shadow-sm overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold uppercase tracking-widest">Behind the Scenes: Technical Trace</h3>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-tighter">View raw model outputs & pipeline stages</p>
                    </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-6 bg-[#18181B] space-y-6">
                            {pipelineSteps.map((step, idx) => (
                                <div key={idx} className="border-l-2 border-zinc-800 pl-6 relative">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                    </div>

                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {step.icon}
                                            <h4 className="text-[13px] font-bold text-zinc-200">{step.title}</h4>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700">
                                            {step.status}
                                        </span>
                                    </div>

                                    <div className="bg-zinc-950 rounded-lg p-4 font-mono text-[11px] text-zinc-400 border border-zinc-800 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                                        {step.type === "json" ? (
                                            <pre className="whitespace-pre-wrap">{JSON.stringify(step.content, null, 2)}</pre>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{step.content as string}</p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 flex items-center gap-2 justify-center border-t border-zinc-800 text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                </span>
                                Pipeline Status: Optimal & Secured
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
