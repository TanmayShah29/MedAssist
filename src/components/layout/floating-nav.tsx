'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Activity, Sparkles, BarChart3, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function FloatingNav() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const actions = [
        { icon: BarChart3, label: 'Dashboard', path: '/dashboard', color: 'emerald' },
        { icon: Activity, label: 'Lab Results', path: '/results', color: 'blue' },
        { icon: Sparkles, label: 'AI Assistant', path: '/assistant', color: 'purple' },
    ];

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute bottom-20 right-0 space-y-3 min-w-[160px]"
                    >
                        {actions.map((action, i) => (
                            <motion.button
                                key={action.path}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => {
                                    router.push(action.path);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-full shadow-lg w-full',
                                    'bg-white hover:shadow-xl transition-all group',
                                    `border-2 hover:border-${action.color}-400`
                                )}
                                style={{ borderColor: isOpen ? undefined : 'transparent' }} // Simplified dynamic border 
                            >
                                <div className={cn(
                                    "p-1.5 rounded-full bg-slate-50",
                                    action.color === 'emerald' && "bg-emerald-100 text-emerald-600",
                                    action.color === 'blue' && "bg-blue-100 text-blue-600",
                                    action.color === 'purple' && "bg-purple-100 text-purple-600",
                                )}>
                                    <action.icon className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-slate-700 text-sm whitespace-nowrap">{action.label}</span>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 
                   shadow-2xl shadow-emerald-500/50 flex items-center justify-center text-white"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </motion.div>
            </motion.button>
        </div>
    );
}
