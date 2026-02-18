import { CheckCircle, AlertTriangle, AlertOctagon } from "lucide-react"

export function ResultSummary({ optimal, warning, critical }: { optimal: number, warning: number, critical: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-100 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5 p-4 transform translate-x-1/4 -translate-y-1/4">
                    <CheckCircle className="w-32 h-32 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between mb-2 relative z-10">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="text-4xl font-bold text-slate-800">{optimal}</span>
                </div>
                <p className="text-slate-900 font-bold text-lg relative z-10">Optimal Range</p>
                <p className="text-sm text-slate-500 relative z-10">Biomarkers within healthy limits</p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-amber-100 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5 p-4 transform translate-x-1/4 -translate-y-1/4">
                    <AlertTriangle className="w-32 h-32 text-amber-500" />
                </div>
                <div className="flex items-center justify-between mb-2 relative z-10">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-4xl font-bold text-slate-800">{warning}</span>
                </div>
                <p className="text-slate-900 font-bold text-lg relative z-10">Needs Monitoring</p>
                <p className="text-sm text-slate-500 relative z-10">Slightly outside typical range</p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-red-100 shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5 p-4 transform translate-x-1/4 -translate-y-1/4">
                    <AlertOctagon className="w-32 h-32 text-red-500" />
                </div>
                <div className="flex items-center justify-between mb-2 relative z-10">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <AlertOctagon className="w-6 h-6 text-red-600" />
                    </div>
                    <span className="text-4xl font-bold text-slate-800">{critical}</span>
                </div>
                <p className="text-slate-900 font-bold text-lg relative z-10">Action Required</p>
                <p className="text-sm text-slate-500 relative z-10">Requires immediate attention</p>
            </div>
        </div>
    )
}
