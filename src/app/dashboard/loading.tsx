export default function DashboardLoading() {
    return (
        <div className="min-h-screen p-6 animate-pulse" style={{ background: '#FAFAF7' }}>
            <div className="h-8 w-48 rounded-lg mb-2" style={{ background: '#E8E6DF' }} />
            <div className="h-4 w-64 rounded-lg mb-8" style={{ background: '#E8E6DF' }} />
            <div className="h-36 rounded-[18px] mb-6" style={{ background: '#E8E6DF' }} />
            <div className="h-5 w-36 rounded mb-4" style={{ background: '#E8E6DF' }} />
            <div className="space-y-3">
                <div className="h-20 rounded-[14px]" style={{ background: '#E8E6DF' }} />
                <div className="h-20 rounded-[14px]" style={{ background: '#E8E6DF' }} />
                <div className="h-20 rounded-[14px]" style={{ background: '#E8E6DF' }} />
            </div>
        </div>
    )
}
