import { FileText, Upload, Calendar } from "lucide-react"

interface RecentActivityProps {
    labResults: any[]
}

export function RecentActivity({ labResults }: RecentActivityProps) {
    const activities = labResults.slice(0, 3).map((report, idx) => ({
        id: report.id,
        title: "Lab Report Uploaded",
        desc: report.file_name || "Blood Panel Analysis",
        time: new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        icon: Upload,
        color: "text-sky-500"
    }));

    return (
        <div className="bg-white rounded-[14px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full">
            <h3 className="text-[10px] font-semibold uppercase text-[#A8A29E] mb-4 tracking-wider">Recent Activity</h3>

            {activities.length > 0 ? (
                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                    {activities.map((item) => (
                        <div key={item.id} className="relative flex items-center gap-4">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 border border-slate-100 shrink-0 z-10">
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#1C1917]">{item.title}</p>
                                <p className="text-xs text-[#57534E] truncate">{item.desc}</p>
                            </div>
                            <div className="text-[10px] text-[#A8A29E] font-bold uppercase whitespace-nowrap">
                                {item.time}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
                    <Calendar className="w-8 h-8 text-[#A8A29E] mb-2" />
                    <p className="text-xs font-medium text-[#A8A29E]">No activity recorded yet</p>
                </div>
            )}
        </div>
    )
}
