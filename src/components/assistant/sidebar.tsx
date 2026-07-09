import { FileText, HelpCircle } from "lucide-react"
import { getPatientStatus } from "@/lib/patient-status"

interface AssistantSidebarProps {
    biomarkers: import('@/types/medical').Biomarker[]
}

export function AssistantSidebar({ biomarkers }: AssistantSidebarProps) {
    const displayMarkers = biomarkers.slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Recent Labs Context */}
            <div className="bg-white rounded-[14px] p-5 lg:p-6 border border-slate-200 shadow-sm min-w-0 transition-all duration-300 hover:border-slate-300 hover:shadow-md">
                <h3 className="flex items-center gap-2 font-sans font-semibold text-slate-900 mb-4 text-wrap-safe">
                    <FileText className="w-4 h-4 text-sky-500" />
                    Recent Context
                </h3>
                {displayMarkers.length > 0 ? (
                    <div className="space-y-3">
                        {displayMarkers.map((b, i) => (
                            <div
                                key={i}
                                className="flex flex-col gap-1 text-sm p-3 bg-slate-50 rounded-lg min-w-0 sm:flex-row sm:justify-between sm:items-center transition-all duration-200 hover:bg-sky-50/60 hover:-translate-y-0.5 stagger-fade-sm"
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                <span className="text-slate-600 text-wrap-safe">{b.name}</span>
                                <span className={`font-semibold sm:shrink-0 text-wrap-safe ${b.status === 'optimal' ? 'text-emerald-600' :
                                    b.status === 'critical' ? 'text-red-600' : 'text-amber-600'
                                    }`}>
                                    {b.value} {b.unit} · {getPatientStatus(b.status).shortLabel}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 italic text-center py-4">No lab data found</p>
                )}
                <p className="text-xs text-slate-400 mt-4 text-center">
                    AI uses your saved report context for visit prep
                </p>
            </div>

            {/* Suggested Questions */}
            <div className="bg-[#FFFFFF] rounded-[14px] p-5 lg:p-6 border border-[#EBEAE4] min-w-0 transition-all duration-300 hover:border-[#D1CFCD]">
                <h3 className="flex items-center gap-2 font-sans font-semibold text-[#0F172A] mb-4 text-wrap-safe">
                    <HelpCircle className="w-4 h-4 text-sky-500" />
                    Help & Guidance
                </h3>
                <div className="space-y-2 text-sm text-[#475569] leading-relaxed text-wrap-safe">
                    <p>You can ask things like:</p>
                    <ul className="list-disc ml-4 space-y-1">
                        <li>"What should I ask about Vitamin D?"</li>
                        <li>"What context matters for Glucose?"</li>
                        <li>"What changed since my last report?"</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
