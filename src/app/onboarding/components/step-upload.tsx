"use client";

import { useOnboardingStore } from "@/lib/onboarding-store";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Upload, X, FileText, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

export function StepUpload() {
    const {
        uploadedFile,
        setUploadedFile,
        setStep,
        completeStep,
    } = useOnboardingStore();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Handle drag events
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setUploadedFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
        }
    };

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
                    <p className="text-xs text-[#A8A29E]">
                        PDF, JPG, PNG up to 10MB
                    </p>
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
            <div className="flex items-start gap-3 p-4 bg-[#F5F4EF] 
                      rounded-[12px] border border-[#E8E6DF]">
                <Shield className="w-4 h-4 text-[#A8A29E] mt-0.5" />
                <p className="text-xs text-[#57534E] leading-relaxed">
                    Your data is encrypted end-to-end. We delete the raw file
                    after extraction is complete. Only the extracted values
                    are stored in your secure health profile.
                </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={() => setStep(2)}
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
