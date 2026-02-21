'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Loader2, AlertCircle, PenLine, Plus, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

const IMAGE_BASED_PDF_CODE = 'IMAGE_BASED_PDF';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Tab = 'upload' | 'manual';

interface ManualRow {
    id: string;
    name: string;
    value: string;
    unit: string;
}

function nextId() {
    return `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
    const [tab, setTab] = useState<Tab>('upload');
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const [manualRows, setManualRows] = useState<ManualRow[]>([
        { id: nextId(), name: '', value: '', unit: 'mg/dL' },
    ]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const validateAndSetFile = (selectedFile: File) => {
        const MAX_SIZE = 10 * 1024 * 1024;
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
        setErrorCode(null);
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
            setErrorCode(null);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('symptoms', JSON.stringify([]));

            const response = await fetch('/api/analyze-report', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                const code = data.code || null;
                let errorMessage = data.error || 'Analysis failed';
                if (response.status === 413) errorMessage = 'File is too large (max 10MB)';
                else if (response.status === 429) errorMessage = 'Rate limit exceeded. Please try again later.';
                else if (response.status === 504) errorMessage = 'Analysis timed out.';
                setErrorCode(code);
                setError(errorMessage);
                setIsProcessing(false);
                return;
            }

            toast.success('Report analyzed and saved successfully!');
            onSuccess();
            onClose();
            setTimeout(() => {
                setFile(null);
                setIsProcessing(false);
            }, 500);
        } catch (err: unknown) {
            setError((err as Error).message || 'Something went wrong processing your report.');
            setErrorCode(null);
            setIsProcessing(false);
        }
    };

    const isImageBasedError = errorCode === IMAGE_BASED_PDF_CODE || (error && error.includes('image-based'));

    const addManualRow = () => {
        setManualRows((prev) => [...prev, { id: nextId(), name: '', value: '', unit: 'mg/dL' }]);
    };

    const updateManualRow = (id: string, field: keyof ManualRow, value: string) => {
        setManualRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
        );
    };

    const removeManualRow = (id: string) => {
        setManualRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
    };

    const handleManualSubmit = async () => {
        const biomarkers = manualRows
            .map((r) => ({
                name: r.name.trim(),
                value: parseFloat(r.value),
                unit: r.unit.trim() || 'unit',
            }))
            .filter((b) => b.name && !Number.isNaN(b.value));

        if (biomarkers.length === 0) {
            toast.error('Add at least one biomarker with name and value.');
            return;
        }

        try {
            setIsProcessing(true);
            setError(null);

            const formData = new FormData();
            formData.append('manualPayload', JSON.stringify({ biomarkers }));

            const response = await fetch('/api/analyze-report', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Analysis failed');
                setIsProcessing(false);
                return;
            }

            toast.success('Results saved successfully!');
            onSuccess();
            onClose();
            setManualRows([{ id: nextId(), name: '', value: '', unit: 'mg/dL' }]);
            setIsProcessing(false);
        } catch (err: unknown) {
            setError((err as Error).message || 'Something went wrong.');
            setIsProcessing(false);
        }
    };

    const resetErrorAndSwitchToManual = () => {
        setError(null);
        setErrorCode(null);
        setTab('manual');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isProcessing ? onClose : undefined}
                        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 px-4"
                    >
                        <div className="bg-[#FAFAF7] rounded-[24px] shadow-2xl overflow-hidden border border-[#E8E6DF]">
                            <div className="flex items-center justify-between p-6 border-b border-[#E8E6DF] bg-white">
                                <h2 className="text-xl font-bold font-display text-[#1C1917]">
                                    Add Lab Results
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

                            {/* Tabs: Upload PDF | Enter manually */}
                            <div className="flex border-b border-[#E8E6DF] bg-white">
                                <button
                                    type="button"
                                    onClick={() => { setTab('upload'); setError(null); setErrorCode(null); }}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors',
                                        tab === 'upload'
                                            ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/50'
                                            : 'text-[#57534E] hover:bg-[#F5F4EF]'
                                    )}
                                >
                                    <Upload size={18} />
                                    Upload PDF
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setTab('manual'); setError(null); setErrorCode(null); }}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors',
                                        tab === 'manual'
                                            ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/50'
                                            : 'text-[#57534E] hover:bg-[#F5F4EF]'
                                    )}
                                >
                                    <PenLine size={18} />
                                    Enter manually
                                </button>
                            </div>

                            <div className="p-6">
                                {error && (
                                    <div className={cn(
                                        "mb-6 p-4 rounded-lg flex flex-col gap-3",
                                        isImageBasedError
                                            ? "bg-amber-50 border border-amber-200 text-amber-900"
                                            : "bg-red-50 border border-red-200 text-red-700"
                                    )}>
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className={cn("w-5 h-5 shrink-0 mt-0.5", isImageBasedError ? "text-amber-600" : "text-red-600")} />
                                            <p className="text-sm">{error}</p>
                                        </div>
                                        {isImageBasedError && (
                                            <button
                                                type="button"
                                                onClick={resetErrorAndSwitchToManual}
                                                className="text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-2"
                                            >
                                                <PenLine size={16} />
                                                Enter values manually instead
                                            </button>
                                        )}
                                    </div>
                                )}

                                {tab === 'upload' && (
                                    <>
                                        {!file ? (
                                            <div
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                onClick={() => document.getElementById('modal-file-upload')?.click()}
                                                className={cn(
                                                    "border-2 border-dashed rounded-[20px] p-10 text-center transition-all cursor-pointer relative overflow-hidden group bg-white",
                                                    isDragging ? "border-sky-500 bg-sky-50/50" : "border-[#D9D6CD] hover:border-sky-400 hover:bg-sky-50/30"
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
                                                        <p className="text-[16px] font-semibold text-[#1C1917] mb-1">Click or drag PDF here</p>
                                                        <p className="text-[14px] text-[#A8A29E] mb-4">Maximum file size 10MB</p>
                                                        <a
                                                            href="/samples/sample-report.pdf"
                                                            download
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100 transition-colors"
                                                        >
                                                            Need a test file? Download sample
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-white border text-center justify-center border-[#E8E6DF] rounded-[20px] p-8 flex flex-col items-center gap-6">
                                                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
                                                    <FileText className="w-8 h-8 text-sky-500" />
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="font-semibold text-[#1C1917] truncate max-w-[250px] mx-auto text-lg mb-1">{file.name}</h3>
                                                    <p className="text-[#A8A29E] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
                                                </div>
                                                <button
                                                    onClick={handleUpload}
                                                    disabled={isProcessing}
                                                    className="w-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold py-3.5 rounded-lg transition-all shadow-sm shadow-sky-500/20 flex items-center justify-center"
                                                >
                                                    {isProcessing ? (
                                                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Report...</>
                                                    ) : (
                                                        'Analyze with AI'
                                                    )}
                                                </button>
                                                {!isProcessing && (
                                                    <button onClick={() => setFile(null)} className="text-sm text-[#A8A29E] hover:text-[#1C1917] font-medium transition-colors">
                                                        Choose a different file
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {tab === 'manual' && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-[#57534E]">
                                            Add your lab values below. Use the units from your report (e.g. mg/dL or mmol/L for glucose). AI will interpret and save.
                                        </p>
                                        <div className="space-y-3 max-h-[280px] overflow-y-auto">
                                            {manualRows.map((row) => (
                                                <div key={row.id} className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Name (e.g. Glucose)"
                                                        value={row.name}
                                                        onChange={(e) => updateManualRow(row.id, 'name', e.target.value)}
                                                        className="flex-1 min-w-0 rounded-lg border border-[#E8E6DF] px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder="Value"
                                                        value={row.value}
                                                        onChange={(e) => updateManualRow(row.id, 'value', e.target.value)}
                                                        className="w-20 rounded-lg border border-[#E8E6DF] px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Unit"
                                                        value={row.unit}
                                                        onChange={(e) => updateManualRow(row.id, 'unit', e.target.value)}
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
                                        <button
                                            type="button"
                                            onClick={handleManualSubmit}
                                            disabled={isProcessing}
                                            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2"
                                        >
                                            {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : 'Analyze & save'}
                                        </button>
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
