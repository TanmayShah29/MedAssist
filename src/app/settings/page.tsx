"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Shield, Download, Trash2, KeyRound, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
    const supabase = createClient();
    const router = useRouter();

    const [newPassword, setNewPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDebugMode, setIsDebugMode] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("medassist_debug_mode") === "true";
        setIsDebugMode(saved);
    }, []);

    const toggleDebugMode = () => {
        const next = !isDebugMode;
        setIsDebugMode(next);
        localStorage.setItem("medassist_debug_mode", next.toString());
        toast.info(next ? "Debug mode enabled" : "Debug mode disabled");
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setIsUpdatingPassword(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        setIsUpdatingPassword(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Password updated successfully");
            setNewPassword("");
        }
    };

    const handleExportData = async () => {
        setIsExporting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Fetch biomarkers
            const { data: biomarkers } = await supabase
                .from("biomarkers")
                .select("name, value, unit, status, created_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            // Create CSV
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Date,Biomarker,Value,Unit,Status\n";

            if (biomarkers) {
                biomarkers.forEach(b => {
                    const row = [
                        new Date(b.created_at).toLocaleDateString(),
                        b.name,
                        b.value,
                        b.unit,
                        b.status
                    ].join(",");
                    csvContent += row + "\n";
                });
            }

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "medassist-health-data.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Health data exported successfully.");
        } catch (error: any) {
            toast.error(error.message || "Failed to export data");
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm("Are you sure you want to permanently delete your account and all associated health data? This cannot be undone.");
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            // Delete the user record using our secure route
            const res = await fetch("/api/account/delete", { method: "DELETE" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to delete account");

            await supabase.auth.signOut();
            toast.success("Account deleted successfully.");
            window.location.href = "/";
        } catch (error: any) {
            toast.error(error.message || "Failed to delete account");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-10 font-sans">
            <h1 className="text-3xl font-display font-bold text-[#1C1917] mb-8">Account Settings</h1>

            <section className="bg-white border border-[#E8E6DF] rounded-[16px] p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <KeyRound className="w-5 h-5 text-sky-500" />
                    <h2 className="text-lg font-semibold text-[#1C1917]">Change Password</h2>
                </div>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#E8E6DF] rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="px-4 py-2 bg-sky-500 text-white rounded-[10px] text-sm font-medium hover:bg-sky-600 transition-colors disabled:opacity-70"
                    >
                        {isUpdatingPassword ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </section>

            <section className="bg-white border border-[#E8E6DF] rounded-[16px] p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <Download className="w-5 h-5 text-[#10B981]" />
                    <h2 className="text-lg font-semibold text-[#1C1917]">Export Health Data</h2>
                </div>
                <p className="text-sm text-[#57534E] mb-4">
                    Download a CSV spreadsheet of all your extracted biomarkers and health scores.
                </p>
                <button
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="px-4 py-2 bg-[#FAFAF7] border border-[#E8E6DF] text-[#1C1917] rounded-[10px] text-sm font-medium hover:bg-[#E8E6DF] transition-colors disabled:opacity-70"
                >
                    {isExporting ? "Exporting..." : "Export to CSV"}
                </button>
            </section>

            <section className="bg-white border border-[#E8E6DF] rounded-[16px] p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <Terminal className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-semibold text-[#1C1917]">Developer Settings</h2>
                </div>
                <p className="text-sm text-[#57534E] mb-4">
                    Enable extra diagnostic information and view raw AI/OCR data. Useful for project presentations.
                </p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleDebugMode}
                        className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-colors ${isDebugMode
                            ? "bg-indigo-500 text-white"
                            : "bg-[#FAFAF7] border border-[#E8E6DF] text-[#1C1917]"
                            }`}
                    >
                        {isDebugMode ? "Debug Mode: ON" : "Debug Mode: OFF"}
                    </button>
                </div>
            </section>

            <section className="bg-white border-2 border-red-100 rounded-[16px] p-6 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5 p-4">
                    <Trash2 className="w-16 h-16 text-red-500" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-semibold text-[#1C1917]">Danger Zone</h2>
                </div>
                <p className="text-sm text-[#57534E] mb-4">
                    Permanently delete your account, your profile, and all associated health data.
                    This action cannot be reversed.
                </p>
                <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="px-4 py-2 border border-red-200 text-red-600 rounded-[10px] text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-70"
                >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                </button>
            </section>

        </div>
    );
}
