export default function DashboardLoading() {
    return (
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6 animate-pulse">
            <div className="h-8 w-64 bg-[#E8E6DF] rounded-lg" />
            <div className="h-40 bg-[#E8E6DF] rounded-[18px]" />
            <div className="grid grid-cols-3 gap-4">
                <div className="h-24 bg-[#E8E6DF] rounded-[14px]" />
                <div className="h-24 bg-[#E8E6DF] rounded-[14px]" />
                <div className="h-24 bg-[#E8E6DF] rounded-[14px]" />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="h-64 bg-[#E8E6DF] rounded-[14px]" />
                <div className="h-64 bg-[#E8E6DF] rounded-[14px]" />
            </div>
        </div>
    )
}
