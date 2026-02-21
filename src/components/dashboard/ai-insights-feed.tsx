import { Lightbulb, ArrowRight, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AIInsightsFeed() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Insight Card 1 */}
            <div className="bg-white rounded-[14px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <Brain className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900">Sleep & Metabolism</h4>
                        <span className="text-xs text-emerald-600 font-medium tracking-wide uppercase">Correlation Found</span>
                    </div>
                </div>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    Your metabolic score drops by ~12% on days following less than 6 hours of sleep. Prioritizing rest could improve your baseline.
                </p>
                <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 bg-transparent">
                    View Analysis
                </Button>
            </div>

            {/* Insight Card 2 */}
            <div className="bg-white rounded-[14px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-sky-50 rounded-lg">
                        <Lightbulb className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900">Trend Alert</h4>
                        <span className="text-xs text-sky-600 font-medium tracking-wide uppercase">Monitoring</span>
                    </div>
                </div>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    Inflammation markers have stabilized over the last 3 months. The recent diet changes appear to be effective.
                </p>
                <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 bg-transparent">
                    See Trend
                </Button>
            </div>

            {/* CTA Card - Now Consistent White */}
            <div className="bg-white rounded-[14px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center justify-center">
                <h4 className="font-bold text-xl text-slate-900 mb-2">Have a specific question?</h4>
                <p className="text-slate-500 text-sm mb-6">
                    Our AI can analyze your data against millions of medical studies.
                </p>
                <Button className="bg-sky-500 text-white hover:bg-sky-600 w-full font-semibold">
                    Ask Assistant <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}
