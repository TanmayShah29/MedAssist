"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
export interface CalendarEvent {
    id: string;
    date: Date;
    title: string;
    type: "specialist" | "checkup" | "lab" | "followup";
    time?: string;
    location?: string;
    doctor?: string;
}

const EVENT_COLORS = {
    specialist: { dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200" },
    checkup: { dot: "bg-sky-500", badge: "bg-sky-50 text-sky-700 border-sky-200" },
    lab: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
    followup: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// ── Utils ──────────────────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
    return (
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear()
    );
}

// ── Calendar Component ─────────────────────────────────────────────────────
export interface CalendarProps {
    events?: CalendarEvent[];
    onDateSelect?: (date: Date) => void;
    className?: string;
    compact?: boolean;
}

export function Calendar({
    events = [],
    onDateSelect,
    className,
    compact = false,
}: CalendarProps) {
    const today = new Date();
    const [viewYear, setViewYear] = React.useState(today.getFullYear());
    const [viewMonth, setViewMonth] = React.useState(today.getMonth());
    const [selected, setSelected] = React.useState<Date | null>(null);
    const [direction, setDirection] = React.useState(0);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

    const prevMonth = () => {
        setDirection(-1);
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };

    const nextMonth = () => {
        setDirection(1);
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const handleDayClick = (day: number) => {
        const date = new Date(viewYear, viewMonth, day);
        setSelected(date);
        onDateSelect?.(date);
    };

    const getEventsForDay = (day: number) => {
        const date = new Date(viewYear, viewMonth, day);
        return events.filter(e => isSameDay(e.date, date));
    };

    const selectedEvents = selected
        ? events.filter(e => isSameDay(e.date, selected))
        : [];

    return (
        <div className={cn("bg-white rounded-2xl border border-slate-200 overflow-hidden", className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <button
                    onClick={prevMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-lg 
                     hover:bg-slate-100 transition-colors text-slate-500"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <motion.h3
                    key={`${viewMonth}-${viewYear}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-semibold text-slate-900"
                >
                    {MONTHS[viewMonth]} {viewYear}
                </motion.h3>
                <button
                    onClick={nextMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-lg 
                     hover:bg-slate-100 transition-colors text-slate-500"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="p-4">
                {/* Day labels */}
                <div className="grid grid-cols-7 mb-2">
                    {DAYS.map(d => (
                        <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Day grid */}
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={`${viewMonth}-${viewYear}`}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * -20 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-7 gap-y-1"
                    >
                        {/* Empty cells for first week */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}

                        {/* Day cells */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const date = new Date(viewYear, viewMonth, day);
                            const isToday = isSameDay(date, today);
                            const isSelected = selected ? isSameDay(date, selected) : false;
                            const dayEvents = getEventsForDay(day);

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    className={cn(
                                        "relative flex flex-col items-center justify-start pt-1 pb-1.5 rounded-lg",
                                        "transition-all duration-150 text-sm",
                                        compact ? "h-8" : "h-10",
                                        isSelected
                                            ? "bg-sky-500 text-white"
                                            : isToday
                                                ? "bg-sky-50 text-sky-700 font-semibold"
                                                : "text-slate-700 hover:bg-slate-100"
                                    )}
                                >
                                    <span className={cn(
                                        "text-xs font-medium leading-none",
                                        isSelected ? "text-white" : ""
                                    )}>
                                        {day}
                                    </span>
                                    {/* Event dots */}
                                    {dayEvents.length > 0 && !compact && (
                                        <div className="flex gap-0.5 mt-1">
                                            {dayEvents.slice(0, 3).map(e => (
                                                <div
                                                    key={e.id}
                                                    className={cn(
                                                        "w-1 h-1 rounded-full",
                                                        isSelected ? "bg-white" : EVENT_COLORS[e.type].dot
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Selected day events */}
            {!compact && selectedEvents.length > 0 && (
                <div className="border-t border-slate-100 px-4 pb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-3 mb-2">
                        {selected?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <div className="space-y-2">
                        {selectedEvents.map(event => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                            >
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                                    EVENT_COLORS[event.type].dot
                                )} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-900">{event.title}</p>
                                    {event.time && (
                                        <p className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                                            <Clock className="w-2.5 h-2.5" /> {event.time}
                                        </p>
                                    )}
                                    {event.location && (
                                        <p className="flex items-center gap-1 text-[10px] text-slate-500">
                                            <MapPin className="w-2.5 h-2.5" /> {event.location}
                                        </p>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[9px] font-semibold px-1.5 py-0.5 rounded-full border capitalize flex-shrink-0",
                                    EVENT_COLORS[event.type].badge
                                )}>
                                    {event.type}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
