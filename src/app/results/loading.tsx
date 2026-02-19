export default function ResultsLoading() {
    return (
        <div className="min-h-screen p-6 animate-pulse" style={{ background: '#FAFAF7' }}>
            <div className="h-8 w-36 rounded-lg mb-2" style={{ background: '#E8E6DF' }} />
            <div className="h-4 w-48 rounded-lg mb-8" style={{ background: '#E8E6DF' }} />
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="h-24 rounded-[14px]" style={{ background: '#E8E6DF' }} />
                <div className="h-24 rounded-[14px]" style={{ background: '#E8E6DF' }} />
                <div className="h-24 rounded-[14px]" style={{ background: '#E8E6DF' }} />
            </div>
            <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-9 w-24 rounded-[10px]" style={{ background: '#E8E6DF' }} />
                ))}
            </div>
            <div className="space-y-1">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                    <div key={i} className="h-16 rounded-[14px]" style={{ background: '#E8E6DF' }} />
                ))}
            </div>
        </div>
    )
}
