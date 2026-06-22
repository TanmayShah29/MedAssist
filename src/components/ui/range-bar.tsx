'use client'

interface RangeBarProps {
    value: number
    min: number
    max: number
    referenceMin: number
    referenceMax: number
    unit: string
    status: 'optimal' | 'warning' | 'critical'
}

export function RangeBar({ value, min, max, referenceMin, referenceMax, unit, status }: RangeBarProps) {
    // Handle null/invalid values - don't render
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
        return null
    }

    if (min === null || min === undefined || max === null || max === undefined) {
        return null
    }

    // Calculate display range with 20% padding on each side
    const range = max - min
    if (range <= 0) return null

    const displayMin = Math.min(min, value) - range * 0.2
    const displayMax = Math.max(max, value) + range * 0.2
    const displayRange = displayMax - displayMin
    if (displayRange <= 0) return null

    // Calculate positions as percentages
    const clamp = (next: number, lower = 4, upper = 96) => Math.min(Math.max(next, lower), upper)
    const refMinPos = clamp(((referenceMin - displayMin) / displayRange) * 100)
    const refMaxPos = clamp(((referenceMax - displayMin) / displayRange) * 100)
    const valuePos = ((value - displayMin) / displayRange) * 100

    const statusColor = {
        optimal: '#10B981',
        warning: '#F59E0B',
        critical: '#EF4444'
    }[status]

    return (
        <div style={{ padding: '8px 0', minWidth: 0, overflow: 'hidden' }}>
            {/* Bar container */}
            <div style={{ position: 'relative', height: 8, borderRadius: 4, background: '#E8E6DF', margin: '20px 0 24px 0' }}>

                {/* Reference range highlight — green zone */}
                <div style={{
                    position: 'absolute',
                    left: `${refMinPos}%`,
                    width: `${refMaxPos - refMinPos}%`,
                    height: '100%',
                    background: '#10B98130',
                    borderRadius: 4
                }} />

                {/* Reference range boundaries */}
                <div style={{
                    position: 'absolute',
                    left: `${refMinPos}%`,
                    top: -4,
                    width: 2,
                    height: 16,
                    background: '#10B981',
                    borderRadius: 1
                }} />
                <div style={{
                    position: 'absolute',
                    left: `${refMaxPos}%`,
                    top: -4,
                    width: 2,
                    height: 16,
                    background: '#10B981',
                    borderRadius: 1
                }} />

                {/* Reference range min label */}
                <div style={{
                    position: 'absolute',
                    left: `${refMinPos}%`,
                    top: 16,
                    transform: 'translateX(-50%)',
                    fontSize: 10,
                    color: '#10B981',
                    fontWeight: 600,
                    maxWidth: 72,
                    overflowWrap: 'anywhere',
                    textAlign: 'center',
                    lineHeight: 1.15
                }}>
                    {referenceMin}
                </div>

                {/* Reference range max label */}
                <div style={{
                    position: 'absolute',
                    left: `${refMaxPos}%`,
                    top: 16,
                    transform: 'translateX(-50%)',
                    fontSize: 10,
                    color: '#10B981',
                    fontWeight: 600,
                    maxWidth: 72,
                    overflowWrap: 'anywhere',
                    textAlign: 'center',
                    lineHeight: 1.15
                }}>
                    {referenceMax}
                </div>

                {/* Value indicator */}
                <div style={{
                    position: 'absolute',
                    left: `${Math.min(Math.max(valuePos, 2), 98)}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: statusColor,
                    border: '2px solid white',
                    boxShadow: `0 0 0 2px ${statusColor}`,
                    zIndex: 2,
                    transition: 'left 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                }} className="tick-pop" />

                {/* Value label above indicator */}
                <div style={{
                    position: 'absolute',
                    left: `${Math.min(Math.max(valuePos, 2), 98)}%`,
                    top: -24,
                    transform: 'translateX(-50%)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: statusColor,
                    background: 'white',
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: `1px solid ${statusColor}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    maxWidth: 104,
                    overflowWrap: 'anywhere',
                    textAlign: 'center',
                    lineHeight: 1.15
                }}>
                    {value} {unit}
                </div>
            </div>

            {/* Normal range label */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                fontSize: 11,
                color: '#78716C',
                marginTop: 8,
                minWidth: 0,
                overflowWrap: 'anywhere',
                textAlign: 'center'
            }}>
                Normal range: {referenceMin}–{referenceMax} {unit}
            </div>
        </div>
    )
}
