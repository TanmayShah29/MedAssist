// src/lib/design-tokens.ts — REPLACE ENTIRE FILE

export const tokens = {
    bg: {
        page: '#FAFAF7',  // warm cream — page background everywhere
        card: '#F5F4EF',  // parchment — all card surfaces
        cardHover: '#EFEDE6',  // slightly deeper on hover
        sidebar: '#F0EFE9',  // sidebar background
        input: '#FAFAF7',  // inputs match page (seamless)
        dark: '#0F172A',  // dark sections (pipeline, AI analysis)
        darkCard: '#1E293B',  // cards inside dark sections
    },
    border: {
        light: '#E8E6DF',   // all borders in light sections
        medium: '#D9D6CD',   // hover borders, active borders
        dark: '#334155',   // borders inside dark sections
    },
    text: {
        primary: '#1C1917',  // main headings — warm near-black
        secondary: '#57534E',  // body text — warm gray
        muted: '#A8A29E',  // captions, labels — warm muted
        subtle: '#D6D3D1',  // placeholders, dividers
        onDark: '#F1F5F9',  // text on dark sections
        onDarkMuted: '#94A3B8', // muted text on dark sections
    },
    brand: {
        primary: '#0EA5E9',  // sky-500 — interactive, CTAs, links
        primaryHover: '#0284C7', // sky-600
        primarySoft: '#E0F2FE', // sky-100 — soft backgrounds
    },
    status: {
        optimal: '#10B981',  // emerald — good results
        optimalBg: '#ECFDF5',  // emerald-50
        warning: '#F59E0B',  // amber — monitor
        warningBg: '#FFFBEB',  // amber-50
        critical: '#EF4444',  // red — urgent
        criticalBg: '#FEF2F2',  // red-50
    },
    entity: {
        symptom: '#3B82F6',  // blue
        condition: '#8B5CF6',  // purple
        medication: '#10B981',  // emerald
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
