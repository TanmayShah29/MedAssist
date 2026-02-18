"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { MobileDrawer } from "./mobile-drawer"
import { Menu, Activity } from "lucide-react"

export function AppShell({ children }: { children: React.ReactNode }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Desktop Sidebar (hidden on mobile) */}
            <Sidebar className="hidden md:flex" />

            {/* Mobile Sidebar (Drawer) */}
            <MobileDrawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)}>
                <Sidebar className="static w-full h-full border-none" />
            </MobileDrawer>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Mobile Header Trigger */}
                <div className="md:hidden h-14 border-b border-slate-200 flex items-center px-4 bg-white flex-shrink-0 z-40">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="ml-3 flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-sky-500 flex items-center justify-center">
                            <Activity className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-semibold text-slate-900 tracking-tight">MedAssist</span>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
