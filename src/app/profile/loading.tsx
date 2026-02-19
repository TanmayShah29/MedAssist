export default function ProfileLoading() {
    return (
        <div className="min-h-screen p-6 animate-pulse" style={{ background: '#FAFAF7' }}>
            <div className="h-8 w-32 rounded-lg mb-2" style={{ background: '#E8E6DF' }} />
            <div className="h-4 w-48 rounded-lg mb-8" style={{ background: '#E8E6DF' }} />

            <div className="h-32 w-32 rounded-full mb-8 mx-auto" style={{ background: '#E8E6DF' }} />

            <div className="space-y-6 max-w-xl mx-auto">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                        <div className="h-4 w-24 rounded mb-2" style={{ background: '#E8E6DF' }} />
                        <div className="h-12 w-full rounded-[10px]" style={{ background: '#E8E6DF' }} />
                    </div>
                ))}
            </div>
        </div>
    )
}
