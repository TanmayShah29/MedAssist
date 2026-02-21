import { Calendar, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

const appointments = [
    {
        id: 1,
        title: "Hematologist Consultation",
        date: "Feb 24, 2024",
        time: "10:00 AM",
        doctor: "Dr. Sarah Smith",
        location: "Main Clinic, Room 302",
        type: "specialist"
    },
    {
        id: 2,
        title: "Annual Physical",
        date: "Mar 05, 2024",
        time: "2:30 PM",
        doctor: "Dr. James Wilson",
        location: "Wellness Center",
        type: "checkup"
    }
]

export function UpcomingAppointments() {
    return (
        <div className="bg-white rounded-[14px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Upcoming Appointments</h3>
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 text-xs">
                    + Schedule
                </Button>
            </div>

            <div className="space-y-4">
                {appointments.map((apt) => (
                    <div key={apt.id} className="group relative pl-4 border-l-2 border-emerald-200 hover:border-emerald-500 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">
                                {apt.title}
                            </h4>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                {apt.type}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar className="w-3 h-3" />
                                <span>{apt.date}</span>
                                <Clock className="w-3 h-3 ml-2" />
                                <span>{apt.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <MapPin className="w-3 h-3" />
                                <span>{apt.location} ({apt.doctor})</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="outline" size="sm" className="w-full text-xs h-8 text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700 mt-4">
                View Calendar
            </Button>
        </div>
    )
}
