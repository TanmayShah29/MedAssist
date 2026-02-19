export default function SettingsLoading() {
    return (
        <div className="min-h-screen p-6 animate-pulse" style={{ background: '#FAFAF7' }}>
            <div className="h-8 w-32 rounded-lg mb-8" style={{ background: '#E8E6DF' }} />

            <div className="space-y-4 max-w-2xl">
                <div className="h-6 w-40 rounded mb-4" style={{ background: '#E8E6DF' }} />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-[14px] mb-4" style={{ background: '#E8E6DF' }} />
                ))}

                <div className="h-6 w-40 rounded mb-4 mt-8" style={{ background: '#E8E6DF' }} />
                {[1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-[14px] mb-4" style={{ background: '#E8E6DF' }} />
                ))}
            </div>
        </div>
    )
}
