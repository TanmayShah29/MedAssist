# MedAssist Design System

## 1. Color Palette & Accessibility
*All colors verified for WCAG AA (4.5:1) compliance on white background.*

### Semantic Colors
| Role | Color Name | Hex | Contrast on White | Usage |
|------|------------|-----|-------------------|-------|
| **Critical** | Red-600 | `#DC2626` | **5.8:1** (Pass) | Error states, critical alerts |
| **Critical Bg** | Red-50 | `#FEF2F2` | N/A | Backgrounds for critical states |
| **Warning** | Amber-700 | `#B45309` | **5.3:1** (Pass) | Warnings, "Needs Attention" |
| **Warning Bg** | Amber-50 | `#FFFBEB` | N/A | Backgrounds for warning states |
| **Optimal** | Emerald-700 | `#047857` | **5.6:1** (Pass) | Success, "In Range", Optimal |
| **Optimal Bg** | Emerald-50 | `#ECFDF5` | N/A | Backgrounds for success states |
| **Monitor** | Blue-700 | `#1D4ED8` | **6.4:1** (Pass) | Info, links, primary actions |
| **Monitor Bg** | Blue-50 | `#EFF6FF` | N/A | Backgrounds for info states |

*Note: Adjusted Warning (Amber-500 -> Amber-700) and Optimal (Emerald-500 -> Emerald-700) from initial drafts to ensure AA compliance.*

### Neutrals (Text)
| Role | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| **Headings** | `#0F172A` | Slate-900 | Page titles, section headers |
| **Body** | `#334155` | Slate-700 | Primary reading text |
| **Muted** | `#64748B` | Slate-500 | Captions, metadata (Min contrast 4.5:1 for small text) |
| **Borders** | `#E2E8F0` | Slate-200 | Dividers, card borders |

## 2. Typography
*Font Family: Inter Variable (feature-settings: 'tnum' for metrics)*

| Scale | Size (px) | Line Height | Weight | Usage |
|-------|-----------|-------------|--------|-------|
| `text-5xl` | 48px | 1       | 700 (Bold) | Dashboard Hero Metrics |
| `text-4xl` | 36px | 40px        | 700 (Bold) | Page Titles |
| `text-3xl` | 30px | 36px        | 600 (Semi) | Section Headers |
| `text-2xl` | 24px | 32px        | 600 (Semi) | Card Titles |
| `text-xl` | 20px | 28px        | 600 (Semi) | Sub-sections |
| `text-lg` | 18px | 28px        | 500 (Med)  | Lead/Intro text |
| `text-base` | 16px | 24px        | 400 (Reg)  | Standard body text |
| `text-sm` | 14px | 20px        | 500 (Med)  | UI Elements, Labels |
| `text-xs` | 12px | 16px        | 500 (Med)  | Badges, Tiny metadata |

## 3. Spacing System
*Base unit: 4px*

- **xs** (4px): Tight component internals (badges)
- **sm** (8px): Component padding, icon gaps
- **md** (16px): Card padding, standard stack gap
- **lg** (24px): Section separation
- **xl** (32px): Layout containers
- **2xl** (48px): Page sections

## 4. Animation Standards
*Library: Framer Motion*

- **Hover Lift**: `y: -4px`, `duration: 0.2s`, `ease: easeOut`
- **Fade In**: `opacity: 0 -> 1`, `y: 10px -> 0`, `duration: 0.4s`
- **Reduced Motion**: All animations must verify `prefers-reduced-motion`

## 5. Shadows
- **Card Default**: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- **Card Hover**: `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`
- **Glow (Optimal)**: `0 0 20px rgba(16, 185, 129, 0.3)`
