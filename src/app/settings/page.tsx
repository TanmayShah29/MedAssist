"use client";

import React, { useState } from "react";
import { User, Bell, Shield, Lock, Smartphone, Moon, Globe, ChevronRight, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [biometric, setBiometric] = useState(true);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>

            <div className="space-y-6">

                {/* ACCOUNT SETTINGS */}
                <section className="bg-white rounded-2xl border border-border overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-foreground flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Account & Profile
                        </h2>
                    </div>
                    <div className="p-2">
                        <SettingItem
                            label="Personal Information"
                            desc="Update your name, email, and phone number."
                            action={<ChevronRight className="w-4 h-4 text-slate-300" />}
                        />
                        <SettingItem
                            label="Change Password"
                            desc="Last changed 3 months ago."
                            action={<ChevronRight className="w-4 h-4 text-slate-300" />}
                        />
                        <SettingItem
                            label="Linked Providers"
                            desc="Manage connections to MyChart, Quest, and LabCorp."
                            action={<span className="text-xs font-bold text-emerald-600 bg-success-light px-2 py-1 rounded">2 Connected</span>}
                        />
                    </div>
                </section>

                {/* NOTIFICATIONS */}
                <section className="bg-white rounded-2xl border border-border overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-foreground flex items-center gap-2">
                            <Bell className="w-5 h-5 text-amber-500" />
                            Notifications
                        </h2>
                    </div>
                    <div className="p-2">
                        <SettingSwitch
                            label="Email Notifications"
                            desc="Receive weekly health summaries and appointment reminders."
                            checked={emailNotifs}
                            onChange={setEmailNotifs}
                        />
                        <SettingSwitch
                            label="Push Notifications"
                            desc="Get real-time alerts for new test results."
                            checked={pushNotifs}
                            onChange={setPushNotifs}
                        />
                    </div>
                </section>

                {/* PRIVACY & SECURITY */}
                <section className="bg-white rounded-2xl border border-border overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-foreground flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-600" />
                            Privacy & Security
                        </h2>
                    </div>
                    <div className="p-2">
                        <SettingSwitch
                            label="Biometric Login"
                            desc="Use FaceID / TouchID to access the app."
                            checked={biometric}
                            onChange={setBiometric}
                        />
                        <SettingItem
                            label="Data Export"
                            desc="Download a copy of all your medical data."
                            action={<button className="text-sm font-bold text-blue-600 hover:underline">Request Archive</button>}
                        />
                        <SettingItem
                            label="Delete Account"
                            desc="Permanently remove your account and all data."
                            action={<button className="text-sm font-bold text-red-600 hover:underline">Delete</button>}
                        />
                    </div>
                </section>

                {/* APP PREFERENCES */}
                <section className="bg-white rounded-2xl border border-border overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="font-bold text-foreground flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-slate-600" />
                            App Preferences
                        </h2>
                    </div>
                    <div className="p-2">
                        <SettingSwitch
                            label="Dark Mode"
                            desc="Switch to a dark theme interface."
                            checked={darkMode}
                            onChange={setDarkMode}
                            icon={<Moon className="w-4 h-4" />}
                        />
                        <SettingItem
                            label="Language"
                            desc="English (US)"
                            action={<Globe className="w-4 h-4 text-slate-400" />}
                        />
                    </div>
                </section>

            </div>

            <div className="flex justify-end pt-8">
                <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                </button>
            </div>
        </div>
    );
}

function SettingItem({ label, desc, action }: any) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
            <div>
                <div className="font-bold text-foreground text-sm group-hover:text-blue-700 transition-colors">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
            </div>
            <div>{action}</div>
        </div>
    )
}

function SettingSwitch({ label, desc, checked, onChange, icon }: any) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
                {icon}
                <div>
                    <div className="font-bold text-foreground text-sm">{label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    )
}
