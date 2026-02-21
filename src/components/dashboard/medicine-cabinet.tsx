"use client";

import { useState, useEffect } from "react";
import { Pill, Plus, Trash2, Calendar, Activity, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
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
            console.error("Failed to fetch supplements", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupplements();
    }, []);

    const handleAddSupplement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSupp.name || !newSupp.start_date) return;

        try {
            const res = await fetch('/api/supplements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSupp)
            });
            const data = await res.json();
            if (data.supplement) {
                setSupplements([data.supplement, ...supplements]);
                setShowAddForm(false);
                setNewSupp({
                    name: "",
                    dosage: "",
                    frequency: "",
                    start_date: new Date().toISOString().split('T')[0]
                });
                toast.success("Supplement added to your cabinet");
            }
        } catch (error) {
            toast.error("Failed to add supplement");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/supplements?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setSupplements(supplements.filter(s => s.id !== id));
                toast.success("Supplement removed");
            }
        } catch (error) {
            toast.error("Failed to remove supplement");
        }
    };

    return (
        <div className="bg-white border border-[#E8E6DF] rounded-[18px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-50 rounded-lg">
                        <Pill className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                        <h3 className="text-[18px] font-bold text-[#1C1917]">Medicine Cabinet</h3>
                        <p className="text-[12px] text-[#A8A29E]">Track supplements & medications</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="p-2 bg-[#F5F4EF] hover:bg-[#EFEDE6] rounded-full transition-colors"
                >
                    {showAddForm ? <X size={20} className="text-[#57534E]" /> : <Plus size={20} className="text-[#57534E]" />}
                </button>
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleAddSupplement}
                        className="mb-6 space-y-4 overflow-hidden"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="text-[11px] font-bold text-[#A8A29E] uppercase mb-1 block">Supplement Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newSupp.name}
                                    onChange={e => setNewSupp({ ...newSupp, name: e.target.value })}
                                    placeholder="e.g. Vitamin D3, Magnesium"
                                    className="w-full px-3 py-2 bg-[#F5F4EF] border border-[#E8E6DF] rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-[#A8A29E] uppercase mb-1 block">Dosage</label>
                                <input
                                    type="text"
                                    value={newSupp.dosage}
                                    onChange={e => setNewSupp({ ...newSupp, dosage: e.target.value })}
                                    placeholder="e.g. 5000 IU"
                                    className="w-full px-3 py-2 bg-[#F5F4EF] border border-[#E8E6DF] rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-[#A8A29E] uppercase mb-1 block">Start Date</label>
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
                            Add to Cabinet
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-3">
                {loading ? (
                    [1, 2].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />)
                ) : supplements.length > 0 ? (
                    supplements.map((supp) => (
                        <div key={supp.id} className="group flex items-center justify-between p-3 bg-[#FAFAF7] border border-[#E8E6DF] rounded-xl hover:border-rose-200 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg border border-[#E8E6DF] flex items-center justify-center">
                                    <Activity size={18} className="text-rose-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-[#1C1917]">{supp.name}</h4>
                                    <p className="text-[11px] text-[#57534E]">{supp.dosage || "No dosage"} · Started {new Date(supp.start_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(supp.id)}
                                className="p-2 text-[#A8A29E] hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-[#E8E6DF]">
                        <p className="text-[12px] text-[#A8A29E]">No supplements logged yet.</p>
                    </div>
                )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-[#E8E6DF]">
                <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-rose-400 mt-0.5" />
                    <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                        Supplements are automatically correlated with your biomarker trends to show you what's working.
                    </p>
                </div>
            </div>
        </div>
    );
}
