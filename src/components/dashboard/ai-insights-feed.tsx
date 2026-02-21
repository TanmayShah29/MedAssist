import { Lightbulb, ArrowRight, Brain, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
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
            <div className="bg-white rounded-[14px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <Brain className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900">AI Clinical Summary</h4>
                        <span className="text-xs text-emerald-600 font-medium tracking-wide uppercase">Latest Report</span>
                    </div>
                </div>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    {analysis?.summary || "Upload a lab report to see your AI-powered clinical summary."}
                </p>
                <Link href="/results">
                    <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 bg-transparent">
                        View Detailed Results
                    </Button>
                </Link>
            </div>

            {/* CTA Card */}
            <div className="bg-white rounded-[14px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center justify-center">
                <h4 className="font-bold text-xl text-slate-900 mb-2">Questions?</h4>
                <p className="text-slate-500 text-sm mb-6">
                    Our AI can explain exactly what these numbers mean for your health.
                </p>
                <Link href="/assistant" className="w-full">
                    <Button className="bg-sky-500 text-white hover:bg-sky-600 w-full font-semibold">
                        Ask Assistant <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}
