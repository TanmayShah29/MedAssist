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
    const displayMin = Math.min(min, value) - range * 0.2
    const displayMax = Math.max(max, value) + range * 0.2
    const displayRange = displayMax - displayMin

    // Calculate positions as percentages
    const refMinPos = ((referenceMin - displayMin) / displayRange) * 100
    const refMaxPos = ((referenceMax - displayMin) / displayRange) * 100
    const valuePos = ((value - displayMin) / displayRange) * 100

    const statusColor = {
        optimal: '#10B981',
        warning: '#F59E0B',
        critical: '#EF4444'
    }[status]

    return (
        <div style={{ padding: '8px 0' }}>
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
                    whiteSpace: 'nowrap'
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
                    whiteSpace: 'nowrap'
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
                    zIndex: 2
                }} />

                {/* Value label above indicator */}
                <div style={{
                    position: 'absolute',
                    left: `${Math.min(Math.max(valuePos, 2), 98)}%`,
                    top: -24,
                    transform: 'translateX(-50%)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: statusColor,
                    whiteSpace: 'nowrap',
                    background: 'white',
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: `1px solid ${statusColor}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}>
                    {value} {unit}
                </div>
            </div>

            {/* Normal range label */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                fontSize: 11,
                color: '#A8A29E',
                marginTop: 8
            }}>
                Normal range: {referenceMin}–{referenceMax} {unit}
            </div>
        </div>
    )
}
