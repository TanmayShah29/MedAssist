"use client"

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HealthMetric } from '@/types/dashboard';

// Add animated counter hook
function useAnimatedCounter(end: number | string, duration = 1000) {
    const [count, setCount] = useState(0);
    const isNumber = typeof end === 'number';

    useEffect(() => {
        if (!isNumber) return;

        let startTime: number;
        let animationFrame: number;
        const target = end as number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(target * eased));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, isNumber]);

    return isNumber ? count : end;
}

interface MetricCardProps {
    metric: HealthMetric;
    onClick?: () => void;
    index?: number; // for staggered animation
}

export function MetricCard({ metric, onClick, index = 0 }: MetricCardProps) {
    const animatedValue = useAnimatedCounter(metric.value, 1200);

    const TrendIcon =
        metric.trend === 'up' ? TrendingUp :
            metric.trend === 'down' ? TrendingDown : Minus;

    // Status color mapping
    const statusColors = {
        critical: {
            border: 'border-red-500/30 hover:border-red-500',
            glow: 'shadow-red-500/20 hover:shadow-red-500/40',
            gradient: 'from-red-500/10 via-transparent to-transparent',
            pulse: 'animate-pulse',
            text: 'text-red-700',
            bg: 'bg-red-100',
            icon: 'text-red-500'
        },
        warning: {
            border: 'border-amber-500/30 hover:border-amber-500',
            glow: 'shadow-amber-500/20 hover:shadow-amber-500/40',
            gradient: 'from-amber-500/10 via-transparent to-transparent',
            pulse: '',
            text: 'text-amber-700',
            bg: 'bg-amber-100',
            icon: 'text-amber-500'
        },
        optimal: {
            border: 'border-emerald-500/30 hover:border-emerald-500',
            glow: 'shadow-emerald-500/20 hover:shadow-emerald-500/40',
            gradient: 'from-emerald-500/10 via-transparent to-transparent',
            pulse: '',
            text: 'text-emerald-700',
            bg: 'bg-emerald-100',
            icon: 'text-emerald-500'
        },
        monitor: {
            border: 'border-blue-500/30 hover:border-blue-500',
            glow: 'shadow-blue-500/20 hover:shadow-blue-500/40',
            gradient: 'from-blue-500/10 via-transparent to-transparent',
            pulse: '',
            text: 'text-blue-700',
            bg: 'bg-blue-100',
            icon: 'text-blue-500'
        },
    };

    const colors = statusColors[metric.status || 'monitor'];
    const numericValue = typeof metric.value === 'number' ? metric.value : 0;
    // Calculate percentage for progress bar (assuming range 0-100 for simplicity, or normalizing)
    const progressPercent = Math.min(Math.max(numericValue, 0), 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
            whileHover={{
                y: -8,
                transition: { duration: 0.2 }
            }}
            onClick={onClick}
            className={cn(
                'group relative bg-card rounded-2xl p-6 cursor-pointer',
                'border-2 transition-all duration-300',
                'shadow-md hover:shadow-xl',
                colors.border,
                colors.glow,
                // colors.pulse // Disabled pulse on main card to avoid layout shifts/distractions, keep for glow
            )}
        >
            {/* Animated gradient overlay */}
            <div className={cn(
                'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0',
                'group-hover:opacity-100 transition-opacity duration-500',
                colors.gradient
            )} />

            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
                        {metric.label}
                    </span>
                    <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <Activity className={cn("w-5 h-5", colors.icon)} />
                    </motion.div>
                </div>

                {/* Value with counter animation */}
                <div className="flex items-baseline gap-2 mb-4">
                    <motion.span
                        className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent"
                        key={String(animatedValue)}
                    >
                        {animatedValue}
                    </motion.span>
                    {metric.unit && (
                        <span className="text-muted-foreground text-lg">{metric.unit}</span>
                    )}

                    {/* Trend badge with animation */}
                    {metric.trend && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + (index * 0.1) }}
                            className={cn(
                                'ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
                                metric.trend === 'up' && 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
                                metric.trend === 'down' && 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
                                metric.trend === 'stable' && 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                            )}
                        >
                            <TrendIcon className="w-3 h-3" />
                            {metric.trend === 'up' ? '+' : ''}{metric.trendValue}%
                        </motion.span>
                    )}
                </div>

                {/* Progress bar with animated fill (only if value is numeric) */}
                {typeof metric.value === 'number' && (
                    <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 + (index * 0.1) }}
                            className={cn("h-full rounded-full relative",
                                metric.status === 'critical' ? 'bg-red-500' :
                                    metric.status === 'warning' ? 'bg-amber-500' :
                                        metric.status === 'optimal' ? 'bg-emerald-500' : 'bg-blue-500'
                            )}
                        >
                            {/* Animated shine effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                    ease: 'linear'
                                }}
                            />
                        </motion.div>
                    </div>
                )}

                {/* Footer metadata */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {metric.subtitle && <span>{metric.subtitle}</span>}
                </div>
            </div>

            {/* Hover glow effect background */}
            <div className={cn(
                'absolute -inset-0.5 rounded-2xl blur-xl opacity-0',
                'group-hover:opacity-30 transition-opacity duration-500',
                metric.status === 'critical' && 'bg-red-500',
                metric.status === 'warning' && 'bg-amber-500',
                metric.status === 'optimal' && 'bg-emerald-500',
                metric.status === 'monitor' && 'bg-blue-500'
            )} style={{ zIndex: -1 }} />
        </motion.div>
    );
}
