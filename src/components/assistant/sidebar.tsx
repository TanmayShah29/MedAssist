import { MessageSquare, FileText, HelpCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AssistantSidebarProps {
    biomarkers: any[]
}

export function AssistantSidebar({ biomarkers }: AssistantSidebarProps) {
    const displayMarkers = biomarkers.slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Recent Labs Context */}
            <div className="bg-white rounded-[14px] p-6 border border-slate-200 shadow-sm">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
                    <FileText className="w-4 h-4 text-sky-500" />
                    Recent Context
                </h3>
                {displayMarkers.length > 0 ? (
                    <div className="space-y-3">
                        {displayMarkers.map((b, i) => (
                            <div key={i} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-600 truncate mr-2">{b.name}</span>
                                <span className={`font-semibold shrink-0 ${b.status === 'optimal' ? 'text-emerald-600' :
                                    b.status === 'critical' ? 'text-red-600' : 'text-amber-600'
                                    }`}>
                                    {b.value} {b.unit}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 italic text-center py-4">No lab data found</p>
                )}
                <p className="text-xs text-slate-400 mt-4 text-center">
                    AI has access to your full health history
                </p>
            </div>

            {/* Suggested Questions */}
            <div className="bg-[#F5F4EF] rounded-[14px] p-6 border border-[#E8E6DF]">
                <h3 className="flex items-center gap-2 font-semibold text-[#1C1917] mb-4">
                    <HelpCircle className="w-4 h-4 text-sky-500" />
                    Help & Guidance
                </h3>
                <div className="space-y-2 text-sm text-[#57534E] leading-relaxed">
                    <p>You can ask things like:</p>
                    <ul className="list-disc ml-4 space-y-1">
                        <li>"What does my low Vitamin D mean?"</li>
                        <li>"How can I improve my Glucose levels?"</li>
                        <li>"Are my inflammation markers normal?"</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
