'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const validateAndSetFile = (selectedFile: File) => {
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (selectedFile.size > MAX_SIZE) {
            toast.error(`File is too large (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB). Max 10MB.`);
            return;
        }
        if (selectedFile.type !== 'application/pdf') {
            toast.error('Only PDF files are supported.');
            return;
        }
        setFile(selectedFile);
        setError(null);
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

    const handleUpload = async () => {
        if (!file) return;

        try {
            setIsProcessing(true);
            setError(null);

            const formData = new FormData();
            formData.append('file', file);
            // We pass empty symptoms since we don't have that context here
            formData.append('symptoms', JSON.stringify([]));

            const response = await fetch('/api/analyze-report', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                let errorMessage = data.error || 'Analysis failed';
                if (response.status === 413) errorMessage = 'File is too large (max 10MB)';
                else if (response.status === 429) errorMessage = 'Rate limit exceeded. Please try again later.';
                else if (response.status === 504) errorMessage = 'Analysis timed out.';
                throw new Error(errorMessage);
            }

            toast.success('Report analyzed and saved successfully!');
            onSuccess();
            onClose();

            // Reset state
            setTimeout(() => {
                setFile(null);
                setIsProcessing(false);
            }, 500);

        } catch (err: any) {
            setError(err.message || 'Something went wrong processing your report.');
            setIsProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isProcessing ? onClose : undefined}
                        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 px-4"
                    >
                        <div className="bg-[#FAFAF7] rounded-[24px] shadow-2xl overflow-hidden border border-[#E8E6DF]">
                            <div className="flex items-center justify-between p-6 border-b border-[#E8E6DF] bg-white">
                                <h2 className="text-xl font-bold font-display text-[#1C1917]">
                                    Upload New Report
                                </h2>
                                {!isProcessing && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-[#F5F4EF] rounded-full transition-colors text-[#A8A29E] hover:text-[#1C1917]"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>

                            <div className="p-6">
                                {error && (
                                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p className="text-sm">{error}</p>
                                    </div>
                                )}

                                {!file ? (
                                    /* Upload Dropzone */
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById('modal-file-upload')?.click()}
                                        className={cn(
                                            "border-2 border-dashed rounded-[20px] p-10 text-center transition-all cursor-pointer relative overflow-hidden group bg-white",
                                            isDragging
                                                ? "border-sky-500 bg-sky-50/50"
                                                : "border-[#D9D6CD] hover:border-sky-400 hover:bg-sky-50/30"
                                        )}
                                    >
                                        <input
                                            id="modal-file-upload"
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />

                                        <div className="flex flex-col items-center gap-4 relative z-10">
                                            <div className={cn(
                                                "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                                                isDragging ? "bg-sky-100 text-sky-600" : "bg-[#F5F4EF] text-[#A8A29E] group-hover:text-sky-500 group-hover:bg-sky-50"
                                            )}>
                                                <Upload className="w-8 h-8" />
                                            </div>

                                            <div>
                                                <p className="text-[16px] font-semibold text-[#1C1917] mb-1">
                                                    Click or drag PDF here
                                                </p>
                                                <p className="text-[14px] text-[#A8A29E]">
                                                    Maximum file size 10MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Selected File State */
                                    <div className="bg-white border text-center justify-center border-[#E8E6DF] rounded-[20px] p-8 flex flex-col items-center gap-6">
                                        <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
                                            <FileText className="w-8 h-8 text-sky-500" />
                                        </div>

                                        <div className="text-center">
                                            <h3 className="font-semibold text-[#1C1917] truncate max-w-[250px] mx-auto text-lg mb-1">
                                                {file.name}
                                            </h3>
                                            <p className="text-[#A8A29E] text-sm">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleUpload}
                                            disabled={isProcessing}
                                            className="w-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm shadow-sky-500/20 flex items-center justify-center"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Analyzing Report...
                                                </>
                                            ) : (
                                                'Analyze with AI'
                                            )}
                                        </button>

                                        {!isProcessing && (
                                            <button
                                                onClick={() => setFile(null)}
                                                className="text-sm text-[#A8A29E] hover:text-[#1C1917] font-medium transition-colors"
                                            >
                                                Choose a different file
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
