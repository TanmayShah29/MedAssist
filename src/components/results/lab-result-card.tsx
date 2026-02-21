"use client"

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, Activity, CheckCircle, Info } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import { LabResult } from '@/types/dashboard';

interface LabResultCardProps {
    result?: LabResult;
    isSelected?: boolean; // Added prop
    // Fallback props...
    name?: string;
    value?: number;
    unit?: string;
    range?: string | { min: number, max: number };
    date?: string | Date;
    status?: 'optimal' | 'warning' | 'critical' | 'monitor';
    className?: string;
}

export function LabResultCard(props: LabResultCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Normalize props to result object
    const result: LabResult = props.result || {
        id: 'temp',
        name: props.name || '',
        value: props.value || 0,
        unit: props.unit || '',
        range: typeof props.range === 'object' ? props.range : { min: 0, max: 100 },
        date: props.date instanceof Date ? props.date : new Date(),
        status: props.status || 'monitor',
        category: 'metabolic'
    };

    // ... (keep logic)
    const min = result.range.min;
    const max = result.range.max;
    const span = max - min || 1;
    const padding = span * 0.2;
    const barMin = Math.max(0, min - padding);
    const barMax = max + padding;
    const totalSpan = barMax - barMin;
    const position = ((result.value - barMin) / totalSpan) * 100;
    const clampedPosition = Math.max(0, Math.min(100, position));
    const isOptimal = result.status === 'optimal';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, borderColor: 'var(--border-hover)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
                'group relative bg-card rounded-lg p-5 cursor-pointer',
                'border-2 transition-colors shadow-sm hover:shadow-md',
                props.isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : '', // Handle isSelected
                result.status === 'critical' ? 'border-red-200 dark:border-red-900/50 hover:border-red-400' :
                    result.status === 'warning' ? 'border-amber-200 dark:border-amber-900/50 hover:border-amber-400' :
                        result.status === 'optimal' ? 'border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400' :
                            'border-border hover:border-primary/50',
                props.className
            )}
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ '--border-hover': isOptimal ? '#10B8A6' : result.status === 'critical' ? '#EF4444' : '#F59E0B' } as React.CSSProperties & { '--border-hover': string }}
        >
            {/* Status indicator bar */}
            <motion.div
                className={cn(
                    'absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl',
                    result.status === 'critical' ? 'bg-gradient-to-b from-red-500 to-red-600' :
                        result.status === 'warning' ? 'bg-gradient-to-b from-amber-500 to-amber-600' :
                            result.status === 'optimal' ? 'bg-gradient-to-b from-emerald-500 to-emerald-600' :
                                'bg-gradient-to-b from-blue-500 to-blue-600'
                )}
                animate={
                    result.status === 'critical'
                        ? { opacity: [1, 0.5, 1] }
                        : {}
                }
                transition={{ duration: 2, repeat: Infinity }}
            />

            <div className="flex items-start justify-between gap-4 pl-3">
                {/* Left: Label & metadata */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {result.status !== 'optimal' && result.status !== 'monitor' && (
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                            >
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                            </motion.div>
                        )}
                        {result.status === 'optimal' && (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        )}
                        <h4 className="font-semibold text-foreground">{result.name}</h4>
                        <StatusBadge status={result.status} className="scale-90 origin-left" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Activity className="w-3 h-3" />
                        <span className="capitalize">{result.category}</span>
                        <span>•</span>
                        <span>{typeof result.date === 'string' ? result.date : result.date.toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Right: Value with animated counter */}
                <div className="text-right">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className={cn(
                            'text-2xl font-bold',
                            result.status === 'critical' ? 'text-red-600 dark:text-red-400' :
                                result.status === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                                    result.status === 'optimal' ? 'text-emerald-600 dark:text-emerald-400' :
                                        'text-foreground'
                        )}
                    >
                        {result.value}
                    </motion.div>
                    <p className="text-muted-foreground text-xs">{result.unit}</p>
                </div>
            </div>

            {/* Range visualization */}
            <div className="mt-4 pt-4 border-t border-border/50 pl-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{barMin.toFixed(1)}</span>
                    <span className="font-medium">Ref: {min} - {max}</span>
                    <span>{barMax.toFixed(1)}</span>
                </div>

                {/* Multi-zone range bar */}
                <div className="relative h-2.5 bg-secondary rounded-full overflow-hidden">
                    {/* We map the min/max range onto the barMin/barMax scale */}
                    {/* The "Normal" range starts at (min - barMin) / totalSpan * 100 */}

                    {/* Low Zone */}
                    <div
                        className="absolute inset-y-0 left-0 bg-red-400/30"
                        style={{ width: `${((min - barMin) / totalSpan) * 100}%` }}
                    />
                    {/* Optimal Zone */}
                    <div
                        className="absolute inset-y-0 bg-emerald-400/30"
                        style={{
                            left: `${((min - barMin) / totalSpan) * 100}%`,
                            width: `${((max - min) / totalSpan) * 100}%`
                        }}
                    />
                    {/* High Zone */}
                    <div
                        className="absolute inset-y-0 right-0 bg-red-400/30"
                        style={{ width: `${((barMax - max) / totalSpan) * 100}%` }}
                    />


                    {/* Animated current value marker */}
                    <motion.div
                        initial={{ left: 0 }}
                        animate={{ left: `${clampedPosition}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                        className="absolute top-0 bottom-0 w-1 bg-foreground z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                        style={{ transform: 'translateX(-50%)' }}
                    >
                        <div className={cn(
                            "absolute -top-1 -bottom-1 -left-0.5 w-2 rounded-full",
                            result.status === 'critical' ? 'bg-red-500' :
                                result.status === 'warning' ? 'bg-amber-500' :
                                    result.status === 'optimal' ? 'bg-emerald-500' : 'bg-blue-500'
                        )} />
                    </motion.div>
                </div>
            </div>

            {/* Expand/collapse indicator */}
            <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                className="flex justify-center mt-2"
            >
                <ChevronDown className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </motion.div>

            {/* Expanded content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden pl-3"
                    >
                        <div className="pt-3 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2 bg-secondary/30 p-3 rounded-lg">
                                <Info className="w-4 h-4 mt-0.5 text-blue-500" />
                                <div>
                                    <p className="font-medium text-foreground mb-1">Interpretation</p>
                                    <p className="text-xs leading-relaxed">
                                        {result.status === 'optimal' ? 'Your levels are within the optimal range. Keep up the good work!' :
                                            result.status === 'warning' ? 'Levels are slightly outside the reference range. Monitor closely.' :
                                                'Requires attention. Please consult with your healthcare provider.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
