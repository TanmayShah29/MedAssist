export default function ResultsLoading() {
    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-8 w-48 bg-[#E8E6DF] rounded-lg" />
                <div className="h-10 w-40 bg-[#E8E6DF] rounded-[10px]" />
            </div>
            <div className="h-10 w-96 bg-[#E8E6DF] rounded-full" />
            <div className="grid grid-cols-3 gap-4">
                <div className="h-20 bg-[#E8E6DF] rounded-[12px]" />
                <div className="h-20 bg-[#E8E6DF] rounded-[12px]" />
                <div className="h-20 bg-[#E8E6DF] rounded-[12px]" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
                <div className="space-y-0 rounded-[18px] border border-[#E8E6DF] overflow-hidden">
                    <div className="h-20 bg-[#E8E6DF] border-b border-[#D9D6CD]" />
                    <div className="h-20 bg-[#E8E6DF] border-b border-[#D9D6CD]" />
                    <div className="h-20 bg-[#E8E6DF] border-b border-[#D9D6CD]" />
                    <div className="h-20 bg-[#E8E6DF] border-b border-[#D9D6CD]" />
                    <div className="h-20 bg-[#E8E6DF]" />
                </div>
                <div className="hidden lg:block h-80 bg-[#E8E6DF] rounded-[18px]" />
            </div>
        </div>
    );
}
