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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Main AI Summary */}
            <div className="bg-white rounded-[18px] p-6 border border-[#E8E6DF] shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                        <Brain className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-[#1C1917]">AI Clinical Summary</h4>
                        <span className="text-xs text-emerald-600 font-semibold tracking-wide uppercase">Latest Report</span>
                    </div>
                </div>
                <p className="text-[#57534E] text-sm mb-6 leading-relaxed">
                    {analysis?.summary || "Upload a lab report to see your AI-powered clinical summary."}
                </p>
                <Link
                    href="/results"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[10px] border border-[#E8E6DF] text-sm font-semibold text-[#57534E] hover:bg-[#F5F4EF] hover:text-[#1C1917] transition-colors"
                >
                    View Detailed Results
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* CTA Card */}
            <div className="bg-[#1C1917] rounded-[18px] p-6 border border-[#2C2A27] shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={48} className="text-sky-400" />
                </div>
                <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-5 h-5 text-sky-400" />
                    </div>
                    <h4 className="font-bold text-lg text-white mb-2">Questions?</h4>
                    <p className="text-[#A8A29E] text-sm mb-6 leading-relaxed">
                        Our AI can explain exactly what these numbers mean for your health.
                    </p>
                    <Link
                        href="/assistant"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[10px] bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold transition-colors"
                    >
                        Ask Assistant <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
