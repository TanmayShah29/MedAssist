"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import type { ExtractedLabValue } from "@/lib/onboarding-store";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Upload, X, FileText, Shield, Calendar, Lock, PenLine, Plus, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function nextId() {
    return `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

interface ManualRow {
    id: string;
    name: string;
    value: string;
    unit: string;
}

export function StepUpload() {
    const {
        uploadedFile,
        setUploadedFile,
        setStep,
        completeStep,
        setAnalysisResult,
    } = useOnboardingStore();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const router = useRouter();

    // Handle drag events
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };



    const validateAndSetFile = (file: File) => {
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB

        if (file.size > MAX_SIZE) {
            toast.error(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max 10MB.`);
            return;
        }
        setUploadedFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const [showOptions, setShowOptions] = useState(true);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualRows, setManualRows] = useState<ManualRow[]>([
        { id: nextId(), name: "", value: "", unit: "mg/dL" },
    ]);
    const [isManualSubmitting, setIsManualSubmitting] = useState(false);

    // If user has already selected a file (e.g. went back and forth), default to upload view
    if (uploadedFile && showOptions && !showManualEntry) {
        setShowOptions(false);
    }

    const [isSkipping, setIsSkipping] = useState(false);

    const addManualRow = () => setManualRows((p) => [...p, { id: nextId(), name: "", value: "", unit: "mg/dL" }]);
    const updateManualRow = (id: string, field: keyof ManualRow, value: string) =>
        setManualRows((p) => p.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    const removeManualRow = (id: string) =>
        setManualRows((p) => (p.length > 1 ? p.filter((r) => r.id !== id) : p));

    const onSubmitManualEntry = async () => {
        const biomarkers = manualRows
            .map((r) => ({ name: r.name.trim(), value: parseFloat(r.value), unit: r.unit.trim() || "unit" }))
            .filter((b) => b.name && !Number.isNaN(b.value));
        if (biomarkers.length === 0) {
            toast.error("Add at least one biomarker with name and value.");
            return;
        }
        setIsManualSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("manualPayload", JSON.stringify({ biomarkers }));
            const res = await fetch("/api/analyze-report", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Analysis failed");
                setIsManualSubmitting(false);
                return;
            }
            const analysis = JSON.parse(data.analysis);
            const labValues: ExtractedLabValue[] = (analysis.biomarkers || []).map((b: Record<string, unknown>) => ({
                name: b.name as string,
                value: b.value as number,
                unit: b.unit as string,
                status: (b.status as ExtractedLabValue["status"]) || "optimal",
                referenceMin: (b.referenceMin as number | null) ?? null,
                referenceMax: (b.referenceMax as number | null) ?? null,
                rangePosition: 50,
                confidence: (b.confidence as number) ?? 0.8,
                aiInterpretation: (b.aiInterpretation as string) || "See your doctor for interpretation.",
                trend: "",
                category: ["hematology", "inflammation", "metabolic", "vitamins"].includes((b.category as string) || "")
                    ? (b.category as ExtractedLabValue["category"])
                    : "metabolic",
            }));
            setAnalysisResult({
                biomarkers: labValues,
                healthScore: analysis.healthScore ?? 0,
                riskLevel: analysis.riskLevel ?? "low",
                summary: analysis.summary ?? "",
            });
            completeStep(3);
            setStep(5);
        } catch (err) {
            toast.error((err as Error).message || "Something went wrong");
        } finally {
            setIsManualSubmitting(false);
        }
    };

    const onSkip = async () => {
        try {
            setIsSkipping(true);
            setUploadedFile(null);
            completeStep(3);

            // Import Server Action inline or fetch dynamically
            const { completeOnboarding } = await import("@/app/actions/user-data");

            const result = await completeOnboarding();

            if (!result.success) {
                console.error("Failed to complete onboarding:", result.error);
                // Still navigate — don't block the user
            }

            window.location.href = "/dashboard";
        } catch (err) {
            console.error("Non-fatal error skipping onboarding:", err);
            window.location.href = "/dashboard";
        }
    };

    if (showManualEntry) {
        return (
            <div className="max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-6">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-500 mb-2">Step 3 of 5</p>
                    <h2 className="font-display text-3xl text-[#1C1917] mb-2">Enter lab values manually</h2>
                    <p className="text-[#57534E] text-sm">
                        No PDF? Add your results below. Use units from your report (e.g. mg/dL or mmol/L).
                    </p>
                </div>
                <div className="space-y-3 max-h-[280px] overflow-y-auto">
                    {manualRows.map((row) => (
                        <div key={row.id} className="flex gap-2 items-center">
                            <input
                                type="text"
                                placeholder="Name (e.g. Glucose)"
                                value={row.name}
                                onChange={(e) => updateManualRow(row.id, "name", e.target.value)}
                                className="flex-1 min-w-0 rounded-lg border border-[#E8E6DF] px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                            />
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="Value"
                                value={row.value}
                                onChange={(e) => updateManualRow(row.id, "value", e.target.value)}
                                className="w-20 rounded-lg border border-[#E8E6DF] px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                            />
                            <input
                                type="text"
                                placeholder="Unit"
                                value={row.unit}
                                onChange={(e) => updateManualRow(row.id, "unit", e.target.value)}
                                className="w-20 rounded-lg border border-[#E8E6DF] px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                            />
                            <button
                                type="button"
                                onClick={() => removeManualRow(row.id)}
                                className="p-2 text-[#A8A29E] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={addManualRow}
                    className="flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700"
                >
                    <Plus size={16} />
                    Add another value
                </button>
                <div className="flex items-center justify-between pt-2">
                    <button
                        onClick={() => setShowManualEntry(false)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-medium text-[#57534E] hover:bg-[#E8E6DF] transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>
                    <motion.button
                        onClick={onSubmitManualEntry}
                        disabled={isManualSubmitting}
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-[10px] text-sm font-semibold transition-all",
                            isManualSubmitting
                                ? "bg-[#E8E6DF] text-[#A8A29E] cursor-wait"
                                : "bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20"
                        )}
                    >
                        {isManualSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                Analyze & continue
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
        );
    }

    if (showOptions && !uploadedFile) {
        return (
            <div className="max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-8">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-500 mb-2">
                        Step 3 of 5
                    </p>
                    <h2 className="font-display text-3xl text-[#1C1917] mb-2">
                        Upload your lab report
                    </h2>
                    <p className="text-[#57534E] text-sm">
                        Choice is yours: upload now for instant analysis, enter values manually, or explore the app first.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {/* Option 1 — Upload now */}
                    <div
                        onClick={() => setShowOptions(false)}
                        className="bg-[#F5F4EF] border-2 border-[#E8E6DF] rounded-[14px] p-6 cursor-pointer transition-all duration-150 text-center hover:border-sky-500 group"
                    >
                        <div className="flex justify-center mb-3">
                            <FileText className="w-8 h-8 text-[#A8A29E] group-hover:text-sky-500 transition-colors" />
                        </div>
                        <h3 className="text-[16px] font-semibold text-[#1C1917] mb-2 group-hover:text-sky-600 transition-colors">
                            Upload my report now
                        </h3>
                        <p className="text-[13px] text-[#57534E] mb-4 leading-relaxed">
                            Get instant AI analysis, health score, and personalized insights from your latest lab results
                        </p>
                        <span className="inline-block bg-sky-500 text-white rounded-[8px] px-4 py-1.5 text-[13px] font-semibold group-hover:bg-sky-600 transition-colors shadow-sm shadow-sky-500/20">
                            Upload PDF
                        </span>
                    </div>

                    {/* Option 2 — Enter manually */}
                    <div
                        onClick={() => setShowManualEntry(true)}
                        className="bg-[#F0F9FF] border-2 border-sky-100 rounded-[14px] p-6 cursor-pointer transition-all duration-150 text-center hover:border-sky-400 group"
                    >
                        <div className="flex justify-center mb-3">
                            <PenLine className="w-8 h-8 text-sky-500 group-hover:text-sky-600 transition-colors" />
                        </div>
                        <h3 className="text-[16px] font-semibold text-[#1C1917] mb-2 group-hover:text-sky-600 transition-colors">
                            Enter values manually
                        </h3>
                        <p className="text-[13px] text-[#57534E] mb-4 leading-relaxed">
                            No PDF? Type in your lab values and get the same AI analysis and health score
                        </p>
                        <span className="inline-block bg-sky-100 text-sky-700 rounded-[8px] px-4 py-1.5 text-[13px] font-semibold group-hover:bg-sky-200 transition-colors">
                            Add values
                        </span>
                    </div>

                    {/* Option 3 — Not yet */}
                    <div
                        onClick={onSkip}
                        className="bg-[#FAFAF7] border-2 border-[#E8E6DF] rounded-[14px] p-6 cursor-pointer transition-all duration-150 text-center hover:border-[#D9D6CD] group sm:col-span-2"
                    >
                        <div className="flex justify-center mb-3">
                            <Calendar className="w-8 h-8 text-[#A8A29E] group-hover:text-[#57534E] transition-colors" />
                        </div>
                        <h3 className="text-[16px] font-semibold text-[#1C1917] mb-2 group-hover:text-[#57534E] transition-colors">
                            I don&apos;t have one yet
                        </h3>
                        <p className="text-[13px] text-[#57534E] mb-4 leading-relaxed">
                            No problem — explore the app first and upload when you get your next lab results
                        </p>
                        <span className="inline-block bg-[#F5F4EF] text-[#57534E] border border-[#E8E6DF] rounded-[8px] px-4 py-1.5 text-[13px] font-semibold group-hover:bg-[#E8E6DF] transition-colors">
                            Continue without report
                        </span>
                    </div>
                </div>

                {/* Back Button */}
                <div className="pt-2">
                    <button
                        onClick={() => setStep(2)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px]
                         text-sm font-medium text-[#57534E] 
                         hover:bg-[#E8E6DF] transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto w-full px-6 py-10 flex flex-col gap-8">

            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] 
                      text-sky-500 mb-2">
                    Step 3 of 5
                </p>
                <h2 className="font-display text-3xl text-[#1C1917] mb-2">
                    Upload your lab report
                </h2>
                <p className="text-[#57534E] text-sm">
                    Groq AI works with any PDF, JPG, or PNG.
                    Photos of paper reports work great too.
                </p>
            </div>

            {/* Upload Area */}
            {!uploadedFile ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-[16px] h-64",
                        "flex flex-col items-center justify-center cursor-pointer transition-all",
                        isDragging
                            ? "border-sky-500 bg-sky-50"
                            : "border-[#E8E6DF] bg-[#F5F4EF] hover:border-sky-300 hover:bg-[#F0F9FF]"
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <div className="w-12 h-12 rounded-full bg-white 
                          shadow-sm flex items-center justify-center mb-4">
                        <Upload className="w-5 h-5 text-sky-500" />
                    </div>
                    <p className="text-sm font-semibold text-[#1C1917] mb-1">
                        Click to upload or drag & drop
                    </p>
                    <p className="text-xs text-[#A8A29E] mb-4">
                        PDF, JPG, PNG up to 10MB
                    </p>
                    <a
                        href="/samples/sample-report.pdf"
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100 transition-colors"
                    >
                        Don't have a report? Download a sample
                    </a>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-[#E8E6DF] rounded-[16px] p-4 
                     flex items-center gap-4 relative shadow-sm"
                >
                    <div className="w-12 h-12 rounded-[12px] bg-emerald-50 
                          flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1C1917] truncate">
                            {uploadedFile.name}
                        </p>
                        <p className="text-xs text-[#A8A29E]">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
                        </p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                        }}
                        className="p-2 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-[#A8A29E]" />
                    </button>
                </motion.div>
            )}

            {/* Security note */}
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                background: '#F5F4EF',
                border: '1px solid #E8E6DF',
                borderRadius: 10,
                padding: '12px 16px',
                marginTop: 16
            }}>
                <Lock size={14} color="#A8A29E" style={{ marginTop: 2, flexShrink: 0 }} />
                <p style={{
                    fontSize: 12,
                    color: '#78716C',
                    margin: 0,
                    lineHeight: 1.6
                }}>
                    Your report is processed securely. Only the extracted values are stored —
                    the original PDF is never saved to our servers. Your health data is private
                    and only visible to you.
                </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={() => setShowOptions(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px]
                     text-sm font-medium text-[#57534E] 
                     hover:bg-[#E8E6DF] transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>

                <motion.button
                    onClick={() => {
                        if (uploadedFile) {
                            completeStep(3);
                            setStep(4);
                        }
                    }}
                    disabled={!uploadedFile}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-[10px]",
                        "text-sm font-semibold transition-all",
                        uploadedFile
                            ? "bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-500/20"
                            : "bg-[#E8E6DF] text-[#A8A29E] cursor-not-allowed"
                    )}
                >
                    Analyze with AI
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            </div>
        </div>
    );
}
