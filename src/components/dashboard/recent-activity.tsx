import { FileText, MessageSquare, Upload } from "lucide-react"

const activity = [
    {
        id: 1,
        title: "Lab Report Uploaded",
        desc: "Metabolic Panel Complete",
        time: "2h ago",
        icon: Upload,
        color: "bg-blue-100 text-blue-600"
    },
    {
        id: 2,
        title: "AI Consultation",
        desc: "Asked about sleep patterns",
        time: "1d ago",
        icon: MessageSquare,
        color: "bg-purple-100 text-purple-600"
    },
    {
        id: 3,
        title: "Monthly Summary",
        desc: "January Health Report",
        time: "3d ago",
        icon: FileText,
        color: "bg-emerald-100 text-emerald-600"
    }
]

export function RecentActivity() {
    return (
        <div className="bg-white rounded-[14px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full">
            <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>

            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {activity.map((item) => (
                    <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <item.icon className="w-5 h-5 text-sky-500" />
                        </div>

                        {/* Content */}
                        <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-slate-800">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                        <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
                            {item.time}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
