import { AlertTriangle, ArrowRight, Activity } from "lucide-react"
import Link from "next/link"
import { getPatientStatus, needsClinicianDiscussion, sortByPatientPriority } from "@/lib/patient-status"

interface ActionItemsProps {
    biomarkers: import('@/types/medical').Biomarker[]
}

export function ActionItems({ biomarkers }: ActionItemsProps) {
    const discussionItems = sortByPatientPriority(biomarkers.filter(needsClinicianDiscussion)).slice(0, 3);

    return (
        <div className="bg-white rounded-[14px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full min-w-0">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4 min-w-0">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                Visit Agenda
            </h3>

            <div className="space-y-3">
                {discussionItems.length > 0 ? (
                    discussionItems.map((item, idx) => {
                        const status = getPatientStatus(item.status);
                        return (
                        <Link key={idx} href={`/assistant?context=${encodeURIComponent(item.name)}`} className="block">
                            <div className={`rounded-lg p-3 border flex gap-3 items-start transition-colors min-w-0 ${item.status === 'critical' ? 'bg-red-50 border-red-100 hover:bg-red-100' : 'bg-amber-50 border-amber-100 hover:bg-amber-100'}`}>
                                <div className="mt-0.5 bg-white p-1.5 rounded-full shadow-sm shrink-0">
                                    <Activity className={`w-4 h-4 ${item.status === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                                </div>
                                <div className="grow shrink basis-0 min-w-0">
                                    <p className={`text-sm font-medium break-words ${item.status === 'critical' ? 'text-red-900' : 'text-amber-900'}`}>{item.name}</p>
                                    <p className={`text-xs break-words ${item.status === 'critical' ? 'text-red-700/80' : 'text-amber-700/80'}`}>{item.value} {item.unit} · {status.label}</p>
                                    <span className="text-[10px] font-bold uppercase mt-1 inline-flex items-center gap-1">
                                        Prepare talking point <ArrowRight className="w-2.5 h-2.5" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )})
                ) : (
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 text-center">
                        <p className="text-sm font-medium text-emerald-900">No discuss-soon agenda items</p>
                        <p className="text-xs text-emerald-700/80">Use your visit to confirm what should be monitored next.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
