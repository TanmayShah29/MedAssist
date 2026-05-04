"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Download, Trash2, KeyRound, Terminal, Eye, EyeOff,
  Shield, ChevronRight, Lock
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { mergeBiomarkerSources } from "@/lib/medical-data";
import { Biomarker } from "@/types/medical";
import { signOutAndResetMedAssist } from "@/lib/account-session";

// ── Toggle Switch ──────────────────────────────────────────────────────────
function Toggle({ checked, onToggle, disabled }: { checked: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      disabled={disabled}
      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: checked ? "#0EA5E9" : "#E8E6DF",
        borderColor: checked ? "#0EA5E9" : "#E8E6DF",
        WebkitAppearance: "none",
      }}
    >
      <span
        className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0px)" }}
      />
    </button>
  );
}

// ── Section card ───────────────────────────────────────────────────────────
function SettingsCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#F5F4EF] border border-[#E8E6DF] rounded-[18px] overflow-hidden shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  iconColor = "text-sky-500",
  iconBg = "bg-sky-50",
  title,
  description,
  children,
  danger,
}: {
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={`flex items-start gap-4 p-5 ${danger ? "bg-red-50/50" : ""}`}>
      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${danger ? "text-red-700" : "text-[#1C1917]"}`}>{title}</p>
        {description && <p className="text-[12px] text-[#A8A29E] mt-0.5 leading-relaxed">{description}</p>}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function SettingsPage() {
  const supabase = createClient();
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    try { setIsDebugMode(localStorage.getItem("medassist_debug_mode") === "true"); } catch { /* */ }
  }, []);

  const toggleDebugMode = () => {
    const next = !isDebugMode;
    setIsDebugMode(next);
    try { localStorage.setItem("medassist_debug_mode", next.toString()); } catch { /* */ }
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
    if (error) { toast.error(error.message); }
    else { toast.success("Password updated"); setNewPassword(""); }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const [{ data: biomarkerRows }, { data: labResults }] = await Promise.all([
        supabase
          .from("biomarkers")
          .select("id, name, value, unit, status, category, reference_range_min, reference_range_max, ai_interpretation, lab_result_id, created_at, lab_results!inner(user_id, uploaded_at, created_at)")
          .eq("lab_results.user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("lab_results")
          .select("id, uploaded_at, created_at, raw_ai_json")
          .eq("user_id", user.id)
          .order("uploaded_at", { ascending: false }),
      ]);

      const biomarkers = mergeBiomarkerSources(biomarkerRows as Biomarker[] | null, labResults || []);

      const csvCell = (value: unknown) => {
        const text = value == null ? "" : String(value);
        return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
      };

      let csv = "Date,Biomarker,Value,Unit,Status\n";
      biomarkers.forEach(b => {
        csv += [new Date(b.created_at).toLocaleDateString(), b.name, b.value, b.unit, b.status].map(csvCell).join(",") + "\n";
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = "medassist-health-data.csv";
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Health data exported successfully.");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to export data");
    } finally { setIsExporting(false); }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");
      await signOutAndResetMedAssist(supabase);
      toast.success("Account deleted.");
      window.location.href = "/auth?mode=signup";
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to delete account");
    } finally { setIsDeleting(false); setShowDeleteConfirm(false); }
  };

  return (
    <div className="max-w-none 2xl:max-w-6xl 2xl:mx-auto px-4 py-8 md:px-6 md:py-12 xl:px-8 space-y-8">

      {/* Page heading */}
      <div>
        <h1 className="font-display text-3xl text-[#1C1917]">Settings</h1>
        <p className="text-[14px] text-[#A8A29E] mt-1">Manage your account, security, and data.</p>
      </div>

      {/* ── Security ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
      <section>
        <SectionHeader label="Security" className="mb-3" />
        <SettingsCard>
          <SettingsRow
            icon={KeyRound}
            iconColor="text-sky-500"
            iconBg="bg-sky-50"
            title="Change Password"
            description="Update your account password. Use at least 6 characters."
          >
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 bg-white border border-[#E8E6DF] rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 min-h-[44px] transition-all"
                  style={{ WebkitAppearance: "none" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#57534E] transition-colors"
                  style={{ WebkitAppearance: "none" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={isUpdatingPassword || !newPassword}
                className="px-4 py-2.5 bg-sky-500 text-white rounded-[10px] text-sm font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50 min-h-[44px] sm:shrink-0"
                style={{ WebkitAppearance: "none" }}
              >
                {isUpdatingPassword ? "Saving…" : "Update"}
              </button>
            </form>
          </SettingsRow>

          <hr className="border-[#E8E6DF] mx-5" />

          <SettingsRow
            icon={Lock}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            title="Data Encryption"
            description="All health data is encrypted at rest with AES-256 and in transit with TLS 1.3. We never share or sell your data."
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Protected
            </span>
          </SettingsRow>
        </SettingsCard>
      </section>

      {/* ── Data ── */}
      <section>
        <SectionHeader label="Privacy & Data" className="mb-3" />
        <SettingsCard>
          <SettingsRow
            icon={Download}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            title="Export Health Data"
            description="Download a CSV of all your biomarkers and health scores. Your data belongs to you."
          >
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8E6DF] text-[#1C1917] rounded-[10px] text-sm font-semibold hover:bg-[#EFEDE6] transition-colors disabled:opacity-50 min-h-[44px]"
              style={{ WebkitAppearance: "none" }}
            >
              <Download className="w-4 h-4 text-emerald-500" />
              {isExporting ? "Exporting…" : "Export to CSV"}
            </button>
          </SettingsRow>
        </SettingsCard>
      </section>
      </div>

      {/* ── Developer ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
      <section>
        <SectionHeader label="Developer" className="mb-3" />
        <SettingsCard>
          <SettingsRow
            icon={Terminal}
            iconColor="text-indigo-500"
            iconBg="bg-indigo-50"
            title="Debug Mode"
            description="Show raw AI/OCR data and diagnostic overlays. Useful for demos and presentations."
          >
            <div className="flex items-center gap-3">
              <Toggle checked={isDebugMode} onToggle={toggleDebugMode} />
              <span className="text-sm font-medium text-[#57534E]">
                {isDebugMode ? "Debug mode is ON" : "Debug mode is off"}
              </span>
            </div>
          </SettingsRow>
        </SettingsCard>
      </section>

      {/* ── Danger Zone ── */}
      <section>
        <SectionHeader label="Danger Zone" className="mb-3" />
        <div className="bg-[#FEF2F2] border-2 border-red-100 rounded-[18px] overflow-hidden">
          <SettingsRow
            icon={Trash2}
            iconColor="text-red-500"
            iconBg="bg-red-100"
            title="Delete Account"
            description="Permanently delete your account, profile, and all health data. This action cannot be undone."
            danger
          >
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-[10px] text-sm font-semibold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all min-h-[44px]"
                style={{ WebkitAppearance: "none" }}
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-[13px] text-red-700 font-medium">
                  This will permanently delete all your data. Are you absolutely sure?
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="px-4 py-2.5 bg-red-600 text-white rounded-[10px] text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60 min-h-[44px]"
                    style={{ WebkitAppearance: "none" }}
                  >
                    {isDeleting ? "Deleting…" : "Yes, delete permanently"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-[10px] text-sm font-semibold hover:bg-red-50 transition-colors min-h-[44px]"
                    style={{ WebkitAppearance: "none" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </SettingsRow>
        </div>
      </section>
      </div>

      {/* About */}
      <section>
        <SectionHeader label="About" className="mb-3" />
        <SettingsCard>
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-sky-50 flex items-center justify-center">
                <Shield className="w-4 h-4 text-sky-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1C1917]">MedAssist</p>
                <p className="text-[11px] text-[#A8A29E]">Health Intelligence Platform</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#C5C2B8]" />
          </div>
        </SettingsCard>
      </section>
    </div>
  );
}
