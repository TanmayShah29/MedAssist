export const colors = {
    // Semantic Colors (WCAG AA Compliant)
    critical: {
        DEFAULT: '#DC2626', // Red-600
        bg: '#FEF2F2',      // Red-50
        border: '#FCA5A5',  // Red-300
        text: '#991B1B',    // Red-800 (Text on bg)
    },
    warning: {
        DEFAULT: '#B45309', // Amber-700
        bg: '#FFFBEB',      // Amber-50
        border: '#FCD34D',  // Amber-300
        text: '#92400E',    // Amber-800
    },
    optimal: {
        DEFAULT: '#047857', // Emerald-700
        bg: '#ECFDF5',      // Emerald-50
        border: '#6EE7B7',  // Emerald-300
        text: '#065F46',    // Emerald-800
    },
    monitor: {
        DEFAULT: '#1D4ED8', // Blue-700
        bg: '#EFF6FF',      // Blue-50
        border: '#93C5FD',  // Blue-300
        text: '#1E40AF',    // Blue-800
    },
    brand: {
        primary: '#10B981', // Emerald-500
        dark: '#059669',    // Emerald-600
    }
};

export const typography = {
    family: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
    },
    size: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
        '5xl': '3rem',     // 48px
    }
};

export const spacing = {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
};

export const shadows = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    glow: {
        optimal: '0 0 20px rgba(16, 185, 129, 0.3)',
    }
};
