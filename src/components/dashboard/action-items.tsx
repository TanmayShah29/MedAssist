import { AlertTriangle, ArrowRight, Pill, ClipboardCheck } from "lucide-react"

export function ActionItems() {
    return (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Action Required
            </h3>

            <div className="space-y-3">
                {/* Item 1 */}
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 flex gap-3 items-start">
                    <div className="mt-0.5 bg-white p-1.5 rounded-full shadow-sm">
                        <Pill className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-amber-900">Vitamin D Low</p>
                        <p className="text-xs text-amber-700/80 mb-2">Levels at 24ng/mL (Optimal: 30+)</p>
                        <button className="text-xs font-semibold text-amber-700 flex items-center gap-1 hover:gap-2 transition-all">
                            View Supplement Plan <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Item 2 */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 flex gap-3 items-start">
                    <div className="mt-0.5 bg-white p-1.5 rounded-full shadow-sm">
                        <ClipboardCheck className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-blue-900">Missing Information</p>
                        <p className="text-xs text-blue-700/80 mb-2">Update your family history profile</p>
                        <button className="text-xs font-semibold text-blue-700 flex items-center gap-1 hover:gap-2 transition-all">
                            Complete Profile <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
