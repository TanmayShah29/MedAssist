"use client";

import { useRouter } from "next/navigation";
import { FileText, ChevronRight, Trash2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { deleteLabResult, updateUserProfile } from "@/app/actions/user-data";
import { SYMPTOM_OPTIONS } from "@/lib/constants";

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<{ first_name: string; last_name: string; age?: number; sex?: string; blood_type?: string } | null>(null);
    const [reports, setReports] = useState<{ id: string; created_at: string; summary: string }[]>([]);
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const [profileRes, reportsRes, symptomsRes] = await Promise.all([
                supabase.from('profiles').select('first_name, last_name, age, sex, blood_type').eq('id', user.id).single(),
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

    const handleSave = async () => {
        setIsSaving(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsSaving(false);
            return;
        }

        try {
            const res = await updateUserProfile(user.id, {
                first_name: profile?.first_name,
                last_name: profile?.last_name,
                age: profile?.age,
                sex: profile?.sex,
                blood_type: profile?.blood_type,
                symptoms: symptoms
            });

            if (res.success) {
                toast.success("Profile updated successfully!");
                // Trigger sidebar update
                window.dispatchEvent(new Event('medassist_profile_updated'));
            } else {
                toast.error(res.error || "Failed to update profile");
            }
        } catch (err) {
            toast.error("An error occurred while saving");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteReport = async (id: string) => {
        if (!confirm("Are you sure you want to delete this report? This will remove all associated biomarkers.")) return;

        try {
            const res = await deleteLabResult(parseInt(id));
            if (res.success) {
                setReports(prev => prev.filter(r => r.id !== id));
                toast.success("Report deleted successfully");
            } else {
                toast.error(res.error || "Failed to delete report");
            }
        } catch (err) {
            toast.error("An error occurred while deleting");
        }
    };

    const handleToggleSymptom = (s: string) => {
        setSymptoms(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    };

    if (loading) return <div className="p-8 text-center text-[#A8A29E]">Loading...</div>;

    const reportCount = reports.length;

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">

            <div>
                <h1 className="font-display text-3xl text-[#1C1917]">Clinical Profile</h1>
                <p className="text-sm text-[#A8A29E] mt-1">{profile?.first_name} {profile?.last_name} · Patient</p>
            </div>

            {/* Completion card */}
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
                    {/* Personal Information */}
                    <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] p-5 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-base font-semibold text-[#1C1917]">
                                Personal Information
                            </p>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="text-xs bg-sky-500 text-white px-3 py-1.5 rounded-[10px] font-semibold tracking-wide hover:bg-sky-600 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A8A29E] block mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={profile?.first_name || ''}
                                    onChange={(e) => setProfile(prev => prev ? { ...prev, first_name: e.target.value } : null)}
                                    className="w-full text-sm font-medium text-[#1C1917] bg-white border border-[#E8E6DF] rounded-[10px] px-3 py-2.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A8A29E] block mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={profile?.last_name || ''}
                                    onChange={(e) => setProfile(prev => prev ? { ...prev, last_name: e.target.value } : null)}
                                    className="w-full text-sm font-medium text-[#1C1917] bg-white border border-[#E8E6DF] rounded-[10px] px-3 py-2.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A8A29E] block mb-1">Age</label>
                                <input
                                    type="number"
                                    value={profile?.age || ''}
                                    onChange={(e) => setProfile(prev => prev ? { ...prev, age: parseInt(e.target.value) } : null)}
                                    className="w-full text-sm font-medium text-[#1C1917] bg-white border border-[#E8E6DF] rounded-[10px] px-3 py-2.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A8A29E] block mb-1">Sex</label>
                                <select
                                    value={profile?.sex || ''}
                                    onChange={(e) => setProfile(prev => prev ? { ...prev, sex: e.target.value } : null)}
                                    className="w-full text-sm font-medium text-[#1C1917] bg-white border border-[#E8E6DF] rounded-[10px] px-3 py-2.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                                >
                                    <option value="">Select...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A8A29E] block mb-1">Blood Type</label>
                                <input
                                    type="text"
                                    value={profile?.blood_type || ''}
                                    onChange={(e) => setProfile(prev => prev ? { ...prev, blood_type: e.target.value } : null)}
                                    placeholder="e.g. O+, A-"
                                    className="w-full text-sm font-medium text-[#1C1917] bg-white border border-[#E8E6DF] rounded-[10px] px-3 py-2.5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                                />
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
                                onClick={() => router.push('/dashboard')}
                                className="text-xs text-sky-500 font-semibold tracking-wide hover:text-sky-600 transition-colors bg-white px-2 py-1 rounded-[6px] border border-[#E8E6DF] hover:border-sky-200"
                            >
                                + Upload new
                            </button>
                        </div>
                        <div className="space-y-2.5">
                            {reports.length > 0 ? reports.map(report => (
                                <div key={report.id} className="flex items-center gap-3 p-3 bg-[#FAFAF7] rounded-[10px] border border-[#E8E6DF] transition-colors hover:bg-white group cursor-pointer" onClick={() => router.push('/results')}>
                                    <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-500 transition-colors">
                                        <FileText className="w-4 h-4 text-sky-500 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#1C1917] truncate">
                                            Blood Panel Report
                                        </p>
                                        <p className="text-xs text-[#A8A29E] mt-0.5">
                                            {new Date(report.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-xs text-[#A8A29E] group-hover:text-sky-500 font-medium flex-shrink-0 transition-colors flex items-center gap-1" onClick={() => router.push('/results')}>
                                        View Details
                                        <ChevronRight size={14} />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteReport(report.id);
                                        }}
                                        className="p-2 text-[#A8A29E] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                                        title="Delete report"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )) : (
                                <div className="text-center py-6 bg-white border border-[#E8E6DF] border-dashed rounded-[10px]">
                                    <FileText className="w-6 h-6 text-[#D6D3C9] mx-auto mb-2" />
                                    <p className="text-sm text-[#A8A29E] font-medium">No reports uploaded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-5">
                    {/* Health Summary - Only showing real symptoms */}
                    <div className="bg-[#F5F4EF] rounded-[14px] border border-[#E8E6DF] p-5 flex flex-col flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-base font-semibold text-[#1C1917]">
                                Health Context
                            </p>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="text-xs bg-sky-500 text-white px-3 py-1.5 rounded-[10px] font-semibold tracking-wide hover:bg-sky-600 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? "Update Context" : "Update Context"}
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A8A29E] mb-2">
                                    Reported Symptoms
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {symptoms.length > 0 ? symptoms.map(s => (
                                        <span key={s} className="text-xs font-medium bg-white border border-[#E8E6DF] px-3 py-1.5 rounded-[8px] text-[#57534E] shadow-sm flex items-center gap-2 group">
                                            {s}
                                            <button onClick={() => handleToggleSymptom(s)} className="text-[#A8A29E] hover:text-red-500 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    )) : (
                                        <p className="text-sm text-[#A8A29E] italic">No symptoms selected.</p>
                                    )}
                                </div>

                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A8A29E] mb-2">
                                    Quick Add
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {SYMPTOM_OPTIONS.map(opt => (
                                        <button
                                            key={opt.label}
                                            onClick={() => handleToggleSymptom(opt.label)}
                                            className={cn(
                                                "text-xs px-2 py-1 rounded-md border transition-all",
                                                symptoms.includes(opt.label)
                                                    ? "bg-sky-500 text-white border-sky-500"
                                                    : "bg-white text-[#57534E] border-[#E8E6DF] hover:border-sky-300"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
