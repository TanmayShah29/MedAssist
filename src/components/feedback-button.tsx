"use client";

import { useState } from "react";
import { HelpCircle, X, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function FeedbackButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('feedback').insert([
                {
                    message: message.trim(),
                    url: window.location.href
                }
            ]);

            if (error) throw error;

            toast.success("Feedback sent! Thank you.");
            setIsOpen(false);
            setMessage("");
        } catch (error: any) {
            toast.error(error.message || "Failed to send feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="bg-white border border-[#E8E6DF] shadow-xl rounded-[16px] p-4 w-72 mb-4 origin-bottom-right"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-semibold text-[#1C1917]">Send Feedback</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[#A8A29E] hover:text-[#1C1917] transition-colors p-1"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Found a bug? Have a suggestion?"
                                className="w-full text-sm bg-[#FAFAF7] border border-[#E8E6DF] rounded-[10px] p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 mb-3 text-[#1C1917] placeholder:text-[#A8A29E]"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting || !message.trim()}
                                className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-[10px] text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isSubmitting ? "Sending..." : (
                                    <>
                                        Send <Send size={14} />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-12 h-12 rounded-full shadow-lg shadow-sky-500/20 flex items-center justify-center transition-all duration-200 ${isOpen ? 'bg-[#1C1917] hover:bg-[#292524] text-white' : 'bg-sky-500 hover:bg-sky-600 hover:-translate-y-0.5 text-white'}`}
                aria-label="Feedback"
            >
                {isOpen ? <X size={24} /> : <HelpCircle size={24} />}
            </button>
        </div>
    );
}
