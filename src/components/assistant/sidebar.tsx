import { motion } from "framer-motion"
import { MessageSquare, FileText, HelpCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AssistantSidebar() {
    return (
        <div className="space-y-6">
            {/* Recent Labs Context */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    Recent Context
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Hemoglobin A1c</span>
                        <span className="font-semibold text-slate-900">5.7%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Vitamin D</span>
                        <span className="font-semibold text-amber-600">24 ng/mL</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Heart Rate</span>
                        <span className="font-semibold text-emerald-600">72 bpm</span>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-4 text-center">
                    AI has access to these metrics
                </p>
            </div>

            {/* Suggested Questions */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                <h3 className="flex items-center gap-2 font-semibold text-indigo-900 mb-4">
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                    Suggested Questions
                </h3>
                <div className="space-y-2">
                    <button className="w-full text-left text-sm p-3 bg-white rounded-lg border border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all text-indigo-800 flex items-center justify-between group">
                        <span>How can I improve my Vitamin D?</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="w-full text-left text-sm p-3 bg-white rounded-lg border border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all text-indigo-800 flex items-center justify-between group">
                        <span>Interpret my latest lipid panel</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="w-full text-left text-sm p-3 bg-white rounded-lg border border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all text-indigo-800 flex items-center justify-between group">
                        <span>Is my sleep pattern affecting recovery?</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </div>

            {/* History / Export */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    History
                </h3>
                <div className="space-y-3">
                    <p className="text-sm text-slate-500 italic text-center py-4">
                        No previous conversations
                    </p>
                    <Button variant="outline" className="w-full text-xs h-8">
                        View Archive
                    </Button>
                </div>
            </div>
        </div>
    )
}
