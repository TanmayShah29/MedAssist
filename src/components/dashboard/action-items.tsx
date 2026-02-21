import { AlertTriangle, ArrowRight, Pill, ClipboardCheck, Activity } from "lucide-react"
import Link from "next/link"

interface ActionItemsProps {
    biomarkers: any[]
}

export function ActionItems({ biomarkers }: ActionItemsProps) {
    const criticalItems = biomarkers.filter(b => b.status === 'critical' || b.status === 'warning').slice(0, 3);

    return (
        <div className="bg-white rounded-[14px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Action Required
            </h3>

            <div className="space-y-3">
                {criticalItems.length > 0 ? (
                    criticalItems.map((item, idx) => (
                        <Link key={idx} href={`/assistant?context=${encodeURIComponent(item.name)}`}>
                            <div className={`rounded-lg p-3 border mb-3 flex gap-3 items-start transition-colors ${item.status === 'critical' ? 'bg-red-50 border-red-100 hover:bg-red-100' : 'bg-amber-50 border-amber-100 hover:bg-amber-100'}`}>
                                <div className="mt-0.5 bg-white p-1.5 rounded-full shadow-sm">
                                    <Activity className={`w-4 h-4 ${item.status === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${item.status === 'critical' ? 'text-red-900' : 'text-amber-900'}`}>{item.name}</p>
                                    <p className={`text-xs truncate ${item.status === 'critical' ? 'text-red-700/80' : 'text-amber-700/80'}`}>{item.value} {item.unit} (Outside range)</p>
                                    <span className="text-[10px] font-bold uppercase mt-1 block flex items-center gap-1">
                                        Ask AI assistant <ArrowRight className="w-2.5 h-2.5" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 text-center">
                        <p className="text-sm font-medium text-emerald-900">All clear!</p>
                        <p className="text-xs text-emerald-700/80">No critical biomarkers detected in your latest report.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
