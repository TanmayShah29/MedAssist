"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Brain,
    FlaskConical,
    User,
    Settings,
    Shield,
    LogOut
} from "lucide-react";

const navItems = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, shortcut: "⌘D" },
    { id: "results", label: "Results", path: "/results", icon: FlaskConical, shortcut: "⌘R" },
    { id: "assistant", label: "Assistant", path: "/assistant", icon: Brain, shortcut: "⌘A" },
    { id: "profile", label: "Profile", path: "/profile", icon: User, shortcut: "⌘P" },
    { id: "settings", label: "Settings", path: "/settings", icon: Settings, shortcut: "⌘S" },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const [userName, setUserName] = useState<string | null>(null);
    const [userInitials, setUserInitials] = useState("?");
    // const supabase = createClientComponentClient();

    useEffect(() => {
        // Get from onboarding store first (most up to date)
        const stored = localStorage.getItem("medassist-onboarding");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const firstName = parsed?.state?.basicInfo?.firstName;
                const lastName = parsed?.state?.basicInfo?.lastName;
                if (firstName) {
                    setUserName(`${firstName} ${lastName || ""}`.trim());
                    setUserInitials(
                        `${firstName[0]}${lastName?.[0] || ""}`.toUpperCase()
                    );
                    return;
                }
            } catch { }
        }

        /*
        // Fallback: get from Supabase session
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                const emailName = user.email.split("@")[0];
                setUserName(emailName);
                setUserInitials(emailName[0].toUpperCase());
            }
        };
        getUser();
        */

        // Mock fallback
        setUserName("John Doe");
        setUserInitials("JD");
    }, []);

    return (
        <aside className={cn(`
            hidden lg:flex
            w-60 min-h-screen fixed left-0 top-0 z-40
            bg-[#F0EFE9] border-r border-[#E8E6DF]
            flex-col
        `, className)}>
            {/* Logo — 64px height */}
            <div className="h-16 flex items-center justify-between px-5 
                      border-b border-[#E8E6DF]">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center 
                          justify-center shadow-sm shadow-sky-500/30">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-display text-lg text-[#1C1917]">MedAssist</span>
                </div>
                {/* Live status dot */}
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute h-2 w-2 rounded-full 
                           bg-emerald-400 opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                      text-[#A8A29E] px-3 mb-2">
                    Navigation
                </p>
                {navItems.map(item => {
                    const isActive = pathname?.startsWith(item.path);
                    return (
                        <Link
                            key={item.id}
                            href={item.path}
                            className={cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-[10px]",
                                "text-sm transition-all duration-150 group border-l-3",
                                isActive
                                    ? "bg-sky-100 text-sky-700 border-sky-500"
                                    : "text-[#57534E] hover:bg-[#EFEDE6] hover:text-[#1C1917] border-transparent"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </div>
                            <span className={cn(
                                "text-[10px] font-mono",
                                isActive ? "text-sky-200" : "text-[#C5C2B8] group-hover:text-[#A8A29E]"
                            )}>
                                {item.shortcut}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* AI Status — dark card */}
            <div className="mx-3 mb-3 p-3 bg-[#0F172A] rounded-[12px] 
                      border border-[#334155]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                      text-[#475569] mb-2.5">
                    AI Status
                </p>
                <div className="space-y-2">
                    {["Groq AI (Llama 3.3)"].map(model => (
                        <div key={model} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span className="text-xs text-[#94A3B8] font-mono">{model}</span>
                            </div>
                            <span className="text-[10px] text-[#475569]">online</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* User */}
            {/* User */}
            <div className="p-4 border-t border-[#E8E6DF] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-200
                        flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-sky-700">
                        {userInitials}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1C1917] truncate">
                        {userName || (
                            <span className="text-[#A8A29E]">Loading...</span>
                        )}
                    </p>
                    <p className="text-[11px] text-[#A8A29E]">Patient</p>
                </div>
                <button className="text-[#A8A29E] hover:text-[#57534E] transition-colors">
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </aside>
    );
}
