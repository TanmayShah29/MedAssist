"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronRight, ChevronLeft, User, Activity, Upload, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
interface Step {
    id: number;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
}

const STEPS: Step[] = [
    { id: 1, title: "Basic Info", subtitle: "Tell us about yourself", icon: <User className="w-4 h-4" /> },
    { id: 2, title: "Symptoms", subtitle: "How are you feeling?", icon: <Activity className="w-4 h-4" /> },
    { id: 3, title: "Lab Report", subtitle: "Upload your results", icon: <Upload className="w-4 h-4" /> },
    { id: 4, title: "Processing", subtitle: "AI analysis", icon: <Sparkles className="w-4 h-4" /> },
];

const SYMPTOM_OPTIONS = [
    "Fatigue", "Headache", "Shortness of breath", "Chest pain",
    "Dizziness", "Nausea", "Joint pain", "Muscle weakness",
    "Brain fog", "Insomnia", "Weight changes", "Fever",
    "Palpitations", "Swelling", "Vision changes", "Appetite loss",
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

// ── Progress Bar ───────────────────────────────────────────────────────────
function StepProgress({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex items-center gap-2 mb-8">
            {STEPS.map((step, idx) => {
                const isComplete = current > step.id;
                const isActive = current === step.id;
                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center gap-1">
                            <motion.div
                                animate={{
                                    backgroundColor: isComplete ? "#10B981" : isActive ? "#0EA5E9" : "#E2E8F0",
                                    scale: isActive ? 1.1 : 1,
                                }}
                                transition={{ duration: 0.2 }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                                style={{ color: isComplete || isActive ? "white" : "#94A3B8" }}
                            >
                                {isComplete ? <Check className="w-4 h-4" /> : step.icon}
                            </motion.div>
                            <span className={cn(
                                "text-[10px] font-medium whitespace-nowrap",
                                isActive ? "text-sky-600" : isComplete ? "text-emerald-600" : "text-slate-400"
                            )}>
                                {step.title}
                            </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <motion.div
                                className="flex-1 h-0.5 mb-4 rounded-full"
                                animate={{ backgroundColor: current > step.id ? "#10B981" : "#E2E8F0" }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ── Step 1: Basic Info ─────────────────────────────────────────────────────
function StepBasicInfo({ data, onChange }: {
    data: Record<string, string>;
    onChange: (key: string, val: string) => void;
}) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">
                        First Name
                    </label>
                    <input
                        type="text"
                        value={data.firstName || ""}
                        onChange={e => onChange("firstName", e.target.value)}
                        placeholder="John"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 
                       text-sm text-slate-900 placeholder-slate-400 bg-white
                       focus:outline-none focus:border-sky-400 focus:ring-2 
                       focus:ring-sky-100 transition-all"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">
                        Last Name
                    </label>
                    <input
                        type="text"
                        value={data.lastName || ""}
                        onChange={e => onChange("lastName", e.target.value)}
                        placeholder="Doe"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 
                       text-sm text-slate-900 placeholder-slate-400 bg-white
                       focus:outline-none focus:border-sky-400 focus:ring-2 
                       focus:ring-sky-100 transition-all"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">
                        Age
                    </label>
                    <input
                        type="number"
                        value={data.age || ""}
                        onChange={e => onChange("age", e.target.value)}
                        placeholder="32"
                        min="1" max="120"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 
                       text-sm text-slate-900 placeholder-slate-400 bg-white
                       focus:outline-none focus:border-sky-400 focus:ring-2 
                       focus:ring-sky-100 transition-all"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">
                        Biological Sex
                    </label>
                    <select
                        value={data.sex || ""}
                        onChange={e => onChange("sex", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 
                       text-sm text-slate-900 bg-white
                       focus:outline-none focus:border-sky-400 focus:ring-2 
                       focus:ring-sky-100 transition-all appearance-none"
                    >
                        <option value="">Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Blood Type
                </label>
                <div className="flex flex-wrap gap-2">
                    {BLOOD_TYPES.map(bt => (
                        <button
                            key={bt}
                            onClick={() => onChange("bloodType", bt)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                                data.bloodType === bt
                                    ? "bg-sky-500 text-white border-sky-500"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600"
                            )}
                        >
                            {bt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Step 2: Symptoms ───────────────────────────────────────────────────────
function StepSymptoms({ selected, onToggle }: {
    selected: string[];
    onToggle: (symptom: string) => void;
}) {
    return (
        <div>
            <p className="text-sm text-slate-500 mb-4">
                Select all symptoms you&apos;re currently experiencing:
            </p>
            <div className="flex flex-wrap gap-2">
                {SYMPTOM_OPTIONS.map(symptom => {
                    const isSelected = selected.includes(symptom);
                    return (
                        <motion.button
                            key={symptom}
                            onClick={() => onToggle(symptom)}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                "px-3 py-2 rounded-full text-sm font-medium border transition-all",
                                isSelected
                                    ? "bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-200"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:bg-sky-50"
                            )}
                        >
                            {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                            {symptom}
                        </motion.button>
                    );
                })}
            </div>
            {selected.length > 0 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 text-xs text-sky-600 font-medium"
                >
                    {selected.length} symptom{selected.length > 1 ? "s" : ""} selected
                </motion.p>
            )}
        </div>
    );
}

// ── Step 3: Upload ─────────────────────────────────────────────────────────
function StepUpload({ file, onFile }: {
    file: File | null;
    onFile: (f: File | null) => void;
}) {
    const [dragging, setDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) onFile(dropped);
    };

    return (
        <div className="space-y-4">
            <motion.div
                animate={{ borderColor: dragging ? "#0EA5E9" : "#E2E8F0" }}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer",
                    "transition-all hover:border-sky-400 hover:bg-sky-50/50",
                    dragging ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-slate-50/50"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={e => onFile(e.target.files?.[0] || null)}
                />
                {file ? (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                            <Check className="w-6 h-6 text-emerald-600" />
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-400 mt-1">
                            {(file.size / 1024).toFixed(0)} KB · Click to change
                        </p>
                    </motion.div>
                ) : (
                    <div>
                        <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center mx-auto mb-3">
                            <Upload className="w-6 h-6 text-sky-500" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                            Drop your lab report here
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            PDF, PNG, or JPEG · Up to 10MB
                        </p>
                    </div>
                )}
            </motion.div>
            <p className="text-xs text-slate-400 text-center">
                Don&apos;t have your report? You can skip this and enter values manually.
            </p>
        </div>
    );
}

// ── Step 4: Processing ─────────────────────────────────────────────────────
function StepProcessing({ onComplete }: { onComplete: () => void }) {
    const steps = [
        { label: "Extracting medical entities", duration: 800 },
        { label: "Running Groq Medical NLP", duration: 1200 },
        { label: "Calculating risk scores", duration: 900 },
        { label: "Generating health insights", duration: 1000 },
        { label: "Updating your dashboard", duration: 600 },
    ];

    const [currentStep, setCurrentStep] = React.useState(0);

    React.useEffect(() => {
        let elapsed = 0;
        const timers: ReturnType<typeof setTimeout>[] = [];
        steps.forEach((step, idx) => {
            const t = setTimeout(() => setCurrentStep(idx + 1), elapsed + step.duration);
            timers.push(t);
            elapsed += step.duration;
        });
        const done = setTimeout(onComplete, elapsed + 500);
        timers.push(done);
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="space-y-3 py-2">
            {steps.map((step, idx) => {
                const done = currentStep > idx;
                const active = currentStep === idx;
                return (
                    <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: currentStep >= idx ? 1 : 0.3, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                            {done ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                                >
                                    <Check className="w-3 h-3 text-white" />
                                </motion.div>
                            ) : active ? (
                                <div className="w-5 h-5 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                            ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                            )}
                        </div>
                        <span className={cn(
                            "text-sm",
                            done ? "text-emerald-600 font-medium" : active ? "text-sky-600 font-medium" : "text-slate-400"
                        )}>
                            {step.label}
                        </span>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────
export interface MultiStepFormProps {
    onComplete?: (data: FormData) => void;
    className?: string;
}

export interface FormData {
    basicInfo: Record<string, string>;
    symptoms: string[];
    labFile: File | null;
}

export function MultiStepForm({ onComplete, className }: MultiStepFormProps) {
    const [step, setStep] = React.useState(1);
    const [direction, setDirection] = React.useState(1);
    const [basicInfo, setBasicInfo] = React.useState<Record<string, string>>({});
    const [symptoms, setSymptoms] = React.useState<string[]>([]);
    const [labFile, setLabFile] = React.useState<File | null>(null);

    const toggleSymptom = (s: string) =>
        setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

    const goNext = () => { setDirection(1); setStep(s => s + 1); };
    const goBack = () => { setDirection(-1); setStep(s => s - 1); };

    const canAdvance = () => {
        if (step === 1) return !!(basicInfo.firstName && basicInfo.age && basicInfo.sex);
        if (step === 2) return symptoms.length > 0;
        return true;
    };

    const variants = {
        enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
    };

    return (
        <div className={cn(
            "w-full max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8",
            className
        )}>
            <StepProgress current={step} total={STEPS.length} />

            <div className="overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900">
                                {STEPS[step - 1].title}
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {STEPS[step - 1].subtitle}
                            </p>
                        </div>

                        {step === 1 && (
                            <StepBasicInfo
                                data={basicInfo}
                                onChange={(k, v) => setBasicInfo(p => ({ ...p, [k]: v }))}
                            />
                        )}
                        {step === 2 && (
                            <StepSymptoms selected={symptoms} onToggle={toggleSymptom} />
                        )}
                        {step === 3 && (
                            <StepUpload file={labFile} onFile={setLabFile} />
                        )}
                        {step === 4 && (
                            <StepProcessing
                                onComplete={() =>
                                    onComplete?.({ basicInfo, symptoms, labFile })
                                }
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {step < 4 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                    <button
                        onClick={goBack}
                        disabled={step === 1}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            step === 1
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-slate-600 hover:bg-slate-100"
                        )}
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>

                    <div className="flex items-center gap-1">
                        {STEPS.slice(0, 3).map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    step === idx + 1 ? "w-6 bg-sky-500" : "w-1.5 bg-slate-200"
                                )}
                            />
                        ))}
                    </div>

                    <motion.button
                        onClick={goNext}
                        disabled={!canAdvance()}
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                            "flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                            canAdvance()
                                ? "bg-sky-500 text-white hover:bg-sky-600 shadow-sm shadow-sky-200"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        {step === 3 ? "Analyze" : "Continue"}
                        <ChevronRight className="w-4 h-4" />
                    </motion.button>
                </div>
            )}
        </div>
    );
}
