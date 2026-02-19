"use client";

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<{ first_name: string; last_name: string } | null>(null);
    const [reports, setReports] = useState<{ id: string; created_at: string; summary: string }[]>([]);
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const [profileRes, reportsRes, symptomsRes] = await Promise.all([
                supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single(),
                supabase.from('lab_results').select('id, created_at, summary').eq('user_id', user.id).order('created_at', { ascending: false }),
                supabase.from('symptoms').select('symptom').eq('user_id', user.id)
            ]);

            if (profileRes.data) setProfile(profileRes.data);
            if (reportsRes.data) setReports(reportsRes.data);
            if (symptomsRes.data) setSymptoms(symptomsRes.data.map((s: { symptom: string }) => s.symptom));
            setLoading(false);
        };
        fetchData();
    }, [router]);

    if (loading) return <div className="p-8 text-center text-[#A8A29E]">Loading...</div>;

    const reportCount = reports.length;

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">

            <div>
                <h1 className="font-display text-3xl text-[#1C1917]">Clinical Profile</h1>
                <p className="text-sm text-[#A8A29E] mt-1">{profile?.first_name} {profile?.last_name} · Patient</p>
            </div>

            {/* Completion card — simplified for honesty */}
            <div className="bg-[#E0F2FE] rounded-[18px] border border-[#BAE6FD] p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-sky-100 rounded-lg text-sky-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sky-900 text-lg">Report History</h3>
                        <p className="text-sky-700 max-w-xl mt-1 text-sm leading-relaxed">
                            {reportCount === 0
                                ? "You haven't uploaded any reports yet. Uploading consistently helps the AI track your health trends."
                                : reportCount < 2
                                    ? "You're just getting started. Doctors recommend getting a full blood panel every 6–12 months to build a reliable health baseline."
                                    : "Great job keeping your health records up to date. Consistent tracking allows for more accurate trend analysis."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

                {/* Left Column */}
                <div className="flex flex-col gap-5">
                    {/* Personal Information - Real Data Only */}
                    <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] p-5 flex flex-col">
                        <p className="text-base font-semibold text-[#1C1917] mb-4">
                            Personal Information
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A8A29E]">Full Name</p>
                                <p className="text-sm font-medium text-[#1C1917] mt-0.5">{profile?.first_name} {profile?.last_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A8A29E]">Role</p>
                                <p className="text-sm font-medium text-[#1C1917] mt-0.5">Patient</p>
                            </div>
                        </div>
                    </div>

                    {/* Report List */}
                    <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] p-5 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-base font-semibold text-[#1C1917]">
                                Uploaded Reports
                            </p>
                            <button
                                onClick={() => router.push('/upload')}
                                className="text-xs text-sky-500 font-medium hover:text-sky-600 transition-colors"
                            >
                                + Upload new
                            </button>
                        </div>
                        <div className="space-y-2.5">
                            {reports.length > 0 ? reports.map(report => (
                                <div key={report.id} className="flex items-center gap-3 p-3 bg-[#FAFAF7] rounded-[10px] border border-[#E8E6DF]">
                                    <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-4 h-4 text-sky-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#1C1917] truncate">
                                            Lab Report
                                        </p>
                                        <p className="text-xs text-[#A8A29E]">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => router.push('/results')}
                                        className="text-xs text-sky-500 hover:text-sky-600 font-medium flex-shrink-0"
                                    >
                                        View →
                                    </button>
                                </div>
                            )) : (
                                <p className="text-sm text-[#A8A29E] italic">No reports uploaded yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-5">
                    {/* Health Summary - Only showing real symptoms */}
                    <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] p-5 flex flex-col flex-1">
                        <p className="text-base font-semibold text-[#1C1917] mb-4">
                            Health Context
                        </p>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A8A29E] mb-1.5">
                                    Reported Symptoms
                                </p>
                                {symptoms.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {symptoms.map(s => (
                                            <span key={s} className="text-xs bg-white border border-[#E8E6DF] px-2 py-1 rounded-md text-[#57534E]">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-[#A8A29E] italic">No symptoms reported.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
