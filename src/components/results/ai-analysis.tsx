import { LabResult } from "@/types/dashboard"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AIAnalysisSection({ results }: { results: LabResult[] }) {
    const abnormalCount = results.filter(r => r.status !== 'optimal').length;

    return (
        <section className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl mt-12">
            <div className="grid md:grid-cols-5">
                <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 p-8 flex flex-col justify-center border-r border-white/5">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">AI Analysis</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Based on your results from {results.length} markers, our AI has identified {abnormalCount > 0 ? `${abnormalCount} potential areas of focus` : 'no major concerns'}.
                    </p>
                    <Button className="w-fit bg-white text-indigo-950 hover:bg-slate-100 font-semibold gap-2">
                        Start Full Analysis <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>

                <div className="md:col-span-3 p-8">
                    <h3 className="font-semibold text-slate-300 mb-6 uppercase tracking-wider text-xs">Generated Insights</h3>
                    <div className="space-y-4">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-emerald-300">Overall Trends Positive</h4>
                                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">High Confidence</span>
                            </div>
                            <p className="text-slate-400 text-sm">
                                Marked improvement in inflammatory markers compared to last quarter. Lifestyle changes appear effective.
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-amber-300">Vitamin D Absorption</h4>
                                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">Moderate Confidence</span>
                            </div>
                            <p className="text-slate-400 text-sm">
                                Despite supplementation, levels remain static. Consider checking for absorption co-factors like Magnesium.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
