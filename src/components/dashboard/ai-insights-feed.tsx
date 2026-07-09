import { ArrowRight, Brain, Sparkles } from "lucide-react"
import Link from "next/link"

interface AIInsightsFeedProps {
    analysis?: {
        summary: string
        longitudinalInsights?: string[]
    }
}

export function AIInsightsFeed({ analysis }: AIInsightsFeedProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
            {/* Main AI Summary */}
            <div className="bg-white rounded-[18px] p-6 border border-[#EBEAE4] shadow-sm hover:shadow-md hover:border-[#D1CFCD] hover:-translate-y-0.5 transition-all duration-300 ease-out md:col-span-2 2xl:col-span-2 min-w-0 group">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 transition-transform duration-300 group-hover:scale-110">
                        <Brain className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold text-[#0F172A]">Visit Summary</h4>
                        <span className="text-xs text-emerald-600 font-semibold tracking-wide uppercase">Latest Report Context</span>
                    </div>
                </div>
                <p className="text-[#475569] text-sm mb-6 leading-relaxed break-words">
                    {analysis?.summary || "Upload a lab report to create an appointment-ready summary."}
                </p>
                <Link
                    href="/results"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[10px] border border-[#EBEAE4] text-sm font-semibold text-[#475569] hover:bg-[#FFFFFF] hover:text-[#0F172A] hover:border-[#D1CFCD] transition-all duration-200"
                >
                    Review lab details
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
            </div>

            {/* CTA Card */}
            <div className="bg-[#0F172A] rounded-[18px] p-6 border border-[#2C2A27] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out flex flex-col items-center text-center justify-center relative overflow-hidden min-w-0 group">
                <div className="absolute top-0 right-0 p-4 opacity-10 landing-breathe">
                    <Sparkles size={48} className="text-sky-400" />
                </div>
                <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
                        <Sparkles className="w-5 h-5 text-sky-400" />
                    </div>
                    <h4 className="font-bold text-lg text-white mb-2">Before the visit?</h4>
                    <p className="text-[#94A3B8] text-sm mb-6 leading-relaxed">
                        Ask the assistant to turn your results into clear questions and a concise doctor-facing summary.
                    </p>
                    <Link
                        href="/assistant"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[10px] bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-sm font-bold transition-all duration-200"
                    >
                        Open prep assistant <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
