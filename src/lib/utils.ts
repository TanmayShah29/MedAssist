import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals = 1): string {
    return value.toFixed(decimals);
}

export function formatDate(date: Date | string, locale: string = 'en-US'): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(d);
}

export function getStatusColor(status: 'critical' | 'warning' | 'optimal' | 'monitor') {
    const map = {
        critical: 'text-critical border-critical bg-critical-bg',
        warning: 'text-warning border-warning bg-warning-bg',
        optimal: 'text-optimal border-optimal bg-optimal-bg',
        monitor: 'text-monitor border-monitor bg-monitor-bg',
    };
    return map[status] || map.monitor;
}
