# Component Dependency Tree

## Core Elements
- **App Layout**: `src/app/layout.tsx` -> `src/components/layout/navbar.tsx`
- **Design Tokens**: `src/lib/design-tokens.ts` (Consumed by Tailwind Config)
- **Utilities**: `src/lib/utils.ts` (Used globally)

## Shared UI (`src/components/ui`)
| Component | Dependencies | Usage |
|-----------|--------------|-------|
| `Button` | `lucide-react`, `utils` | Forms, Actions |
| `StatusBadge` | `lucide-react`, `utils`, `design-tokens` | Cards, Lists |
| `Skeleton` | `utils` | Loading States |
| `Input` | `lucide-react`, `utils` | Forms |

## Dashboard Domain (`src/components/dashboard`)
| Component | Dependencies |
|-----------|--------------|
| `MetricCard` | `StatusBadge`, `TrendIcon` (Lucide), `framer-motion` |

## Results Domain (`src/components/results`)
| Component | Dependencies |
|-----------|--------------|
| `LabResultCard` | `StatusBadge`, `RangeVisualizer` (inline), `framer-motion` |

## Charts (`src/components/charts`)
| Component | Dependencies |
|-----------|--------------|
| `WellnessTrendChart` | `recharts`, `framer-motion` |

## Pages (`src/app`)
### `/dashboard`
- `MetricCard` x4
- `WellnessTrendChart`
- `Skeleton` (Suspense fallback)

### `/results`
- `LabResultCard` (List)
- Filter Chips (Inline UI)

### `/assistant`
- `AIChat` (Internal Chat UI)
- `Button`, `Input`
- `fetch('/api/assistant')`
