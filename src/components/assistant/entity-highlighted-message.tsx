"use client"

import { motion } from "framer-motion"
import { Sparkles, Info } from "lucide-react"
import { cn } from "@/lib/utils"

// Define entity types and colors mapping matches design tokens - BADGE STYLE
const entityStyles = {
    symptom: "bg-blue-50 text-blue-700 border-blue-200",
    condition: "bg-purple-50 text-purple-700 border-purple-200",
    medication: "bg-emerald-50 text-emerald-700 border-emerald-200",
    labValue: "bg-amber-50 text-amber-700 border-amber-200",
    anatomy: "bg-pink-50 text-pink-700 border-pink-200",
}

interface Entity {
    text: string
    type: keyof typeof entityStyles
    confidence: number
    description?: string
}

interface HighlightedMessageProps {
    content: string
    role: 'user' | 'assistant'
    entities?: Entity[]
    citations?: string[]
}

export function HighlightedMessage({ content, role, entities = [], citations = [] }: HighlightedMessageProps) {
    const renderContent = () => {
        if (!entities.length) return <p className="leading-relaxed whitespace-pre-wrap">{content}</p>

        return (
            <p className="leading-relaxed whitespace-pre-wrap relative z-10">
                {content.split(' ').map((word, i) => {
                    const cleanWord = word.replace(/[^a-zA-Z0-9-]/g, '')
                    const entity = entities.find(e => e.text.toLowerCase().includes(cleanWord.toLowerCase()) && cleanWord.length > 3)

                    if (entity) {
                        return (
                            <span key={i} className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border mx-0.5 align-middle transition-colors relative group",
                                entityStyles[entity.type]
                            )}>
                                {word}
                                {/* Tooltip */}
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-left">
                                    <span className="flex items-center justify-between mb-1">
                                        <span className={cn("text-[10px] uppercase font-bold tracking-wider",
                                            entity.type === 'symptom' ? 'text-blue-400' :
                                                entity.type === 'condition' ? 'text-purple-400' :
                                                    entity.type === 'medication' ? 'text-emerald-400' :
                                                        entity.type === 'labValue' ? 'text-amber-400' : 'text-pink-400'
                                        )}>{entity.type}</span>
                                        <span className="text-[10px] text-slate-400">{Math.round(entity.confidence * 100)}% conf</span>
                                    </span>
                                    {entity.description && <span className="block text-xs text-slate-300">{entity.description}</span>}
                                </span>
                            </span>
                        )
                    }
                    return <span key={i}> {word}</span>
                })}
            </p>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex gap-4 p-4 rounded-xl max-w-[90%] mb-6 relative group transition-colors",
                role === 'user' ? "ml-auto bg-slate-800" : "mr-auto bg-transparent"
            )}
        >
            {role === 'assistant' && (
                <div className="absolute -left-[27px] top-4 w-11 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center z-20 shadow-sm">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                </div>
            )}

            <div className="flex-1">
                <div className={cn("text-sm", role === 'user' ? "text-white" : "text-slate-700")}>
                    {role === 'user' ? content : renderContent()}
                </div>

                {citations.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {citations.map((cite, i) => (
                            <span key={i} className="inline-flex items-center text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                                <Info className="w-3 h-3 mr-1" /> {cite}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-sky-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-inner">
                    JD
                </div>
            )}
        </motion.div>
    )
}
