// src/lib/design-tokens.ts — REPLACE ENTIRE FILE

export const tokens = {
    bg: {
        page: '#FDFDFB',  // warm cream — page background everywhere
        card: '#FFFFFF',  // parchment — all card surfaces
        cardHover: '#FAFAFA',  // slightly deeper on hover
        sidebar: '#F0EFE9',  // sidebar background
        input: '#FDFDFB',  // inputs match page (seamless)
        dark: '#0F172A',  // dark sections (pipeline, AI analysis)
        darkCard: '#1E293B',  // cards inside dark sections
    },
    border: {
        light: '#EBEAE4',   // all borders in light sections
        medium: '#D1CFCD',   // hover borders, active borders
        dark: '#334155',   // borders inside dark sections
    },
    text: {
        primary: '#0F172A',  // main headings — warm near-black
        secondary: '#475569',  // body text — warm gray
        muted: '#94A3B8',  // captions, labels — warm muted
        subtle: '#D6D3D1',  // placeholders, dividers
        onDark: '#F1F5F9',  // text on dark sections
        onDarkMuted: '#94A3B8', // muted text on dark sections
    },
    brand: {
        primary: '#0369A1',  // sky-500 — interactive, CTAs, links
        primaryHover: '#0369A1', // sky-600
        primarySoft: '#F0F9FF', // sky-100 — soft backgrounds
    },
    status: {
        optimal: '#059669',  // emerald — good results
        optimalBg: '#ECFDF5',  // emerald-50
        warning: '#F59E0B',  // amber — monitor
        warningBg: '#FFFBEB',  // amber-50
        critical: '#EF4444',  // red — urgent
        criticalBg: '#FEF2F2',  // red-50
    },
    entity: {
        symptom: '#3B82F6',  // blue
        condition: '#8B5CF6',  // purple
        medication: '#059669',  // emerald
        labValue: '#F59E0B',  // amber
    },
    radius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        xxl: '24px',
    },
    font: {
        display: '"Instrument Serif", Georgia, serif',
        body: '"DM Sans", system-ui, sans-serif',
    }
};
