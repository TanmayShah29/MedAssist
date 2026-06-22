"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Pill, Plus, Trash2, Activity, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { toast } from "sonner";

interface Supplement {
    id: number;
    name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    active: boolean;
}

export function MedicineCabinet() {
    const [supplements, setSupplements] = useState<Supplement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSupp, setNewSupp] = useState({
        name: "",
        dosage: "",
        frequency: "",
        start_date: new Date().toISOString().split('T')[0]
    });

    const fetchSupplements = async () => {
        try {
            const res = await fetch('/api/supplements');
            const data = await res.json();
            if (data.supplements) {
                setSupplements(data.supplements);
            }
        } catch (error) {
            logger.error("Failed to fetch supplements", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupplements();
    }, []);

    const handleAddSupplement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSupp.name.trim() || !newSupp.start_date) return;

        try {
            const res = await fetch('/api/supplements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSupp)
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Failed to add supplement');
                return;
            }
            if (data.supplement) {
                setSupplements([data.supplement, ...supplements]);
                setShowAddForm(false);
                setNewSupp({
                    name: "",
                    dosage: "",
                    frequency: "",
                    start_date: new Date().toISOString().split('T')[0]
                });
                toast.success('Medication or supplement added to your context');
            }
        } catch (_error) {
            toast.error('Failed to add supplement. Please check your connection.');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/supplements?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setSupplements(supplements.filter(s => s.id !== id));
                toast.success('Medication or supplement removed');
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.error || 'Failed to remove supplement');
            }
        } catch (_error) {
            toast.error('Failed to remove supplement. Please check your connection.');
        }
    };

    return (
        <div className="bg-white border border-[#E8E6DF] rounded-[18px] p-6 shadow-sm transition-all duration-300 hover:border-[#D9D6CD] hover:shadow-md">
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="p-2 bg-rose-50 rounded-lg">
                        <Pill className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-[18px] font-bold text-[#1C1917] truncate">Medication Context</h3>
                        <p className="text-[12px] text-[#78716C] truncate">Track medications & supplements for your clinician</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="p-2 bg-[#F5F4EF] hover:bg-[#EFEDE6] active:scale-90 rounded-full transition-all duration-200"
                    aria-label={showAddForm ? "Close add medication or supplement form" : "Add medication or supplement"}
                >
                    {showAddForm ? <X size={20} className="text-[#57534E] transition-transform duration-200 rotate-0" /> : <Plus size={20} className="text-[#57534E] transition-transform duration-200" />}
                </button>
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.form
                        initial={{ opacity: 0.01, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0.01, height: 0 }}
                        onSubmit={handleAddSupplement}
                        className="mb-6 space-y-4 overflow-hidden"
                    >
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="text-[11px] font-bold text-[#78716C] uppercase mb-1 block">Medication or Supplement</label>
                                <input
                                    type="text"
                                    required
                                    value={newSupp.name}
                                    onChange={e => setNewSupp({ ...newSupp, name: e.target.value })}
                                    placeholder="e.g. Vitamin D3, Metformin"
                                    className="w-full px-3 py-2 bg-[#F5F4EF] border border-[#E8E6DF] rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-[#78716C] uppercase mb-1 block">Dosage</label>
                                <input
                                    type="text"
                                    value={newSupp.dosage}
                                    onChange={e => setNewSupp({ ...newSupp, dosage: e.target.value })}
                                    placeholder="e.g. 5000 IU"
                                    className="w-full px-3 py-2 bg-[#F5F4EF] border border-[#E8E6DF] rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-[#78716C] uppercase mb-1 block">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={newSupp.start_date}
                                    onChange={e => setNewSupp({ ...newSupp, start_date: e.target.value })}
                                    className="w-full px-3 py-2 bg-[#F5F4EF] border border-[#E8E6DF] rounded-lg text-sm"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2.5 bg-[#1C1917] text-white rounded-lg font-bold text-sm hover:bg-black transition-colors"
                        >
                            Add to visit context
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-3">
                {loading ? (
                    [1, 2].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />)
                ) : supplements.length > 0 ? (
                    supplements.map((supp, idx) => (
                        <div
                            key={supp.id}
                            className="group flex items-center justify-between gap-3 p-3 bg-[#FAFAF7] border border-[#E8E6DF] rounded-xl hover:border-rose-200 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 ease-out min-w-0 stagger-fade-sm"
                            style={{ animationDelay: `${idx * 60}ms` }}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 bg-white rounded-lg border border-[#E8E6DF] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                                    <Activity size={18} className="text-rose-500" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-[#1C1917] truncate">{supp.name}</h4>
                                    <p className="text-[11px] text-[#57534E] truncate">{supp.dosage || "No dosage"} · Started {new Date(supp.start_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(supp.id)}
                                className="p-2 text-[#78716C] hover:text-rose-600 hover:bg-rose-50 active:scale-90 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 shrink-0"
                                aria-label={`Remove ${supp.name}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-[#E8E6DF]">
                        <p className="text-[12px] text-[#78716C]">No medications or supplements logged yet.</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E8E6DF]">
                <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-rose-400 mt-0.5" />
                    <p className="text-[11px] text-[#78716C] leading-relaxed">
                        Start dates are shown as context on biomarker trend charts. Review medication or supplement changes with your clinician.
                    </p>
                </div>
            </div>
        </div>
    );
}
