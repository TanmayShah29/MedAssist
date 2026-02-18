export default function AssistantLoading() {
    return (
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-[#FAFAF7] animate-pulse">
            {/* Left: Chat skeleton */}
            <div className="flex flex-col flex-1 lg:w-[52%] lg:flex-none border-r-2 border-[#D4CBBB] bg-[#F7F6F2]">
                <div className="h-16 border-b border-[#E2DFD8] bg-[#F0EEE8]" />
                <div className="flex-1 p-6 space-y-6">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#E8E6DF]" />
                        <div className="bg-[#E8E6DF] rounded-[14px] h-32 flex-1" />
                    </div>
                    <div className="pl-12 space-y-2">
                        <div className="h-12 bg-[#E8E6DF] rounded-[10px]" />
                        <div className="h-12 bg-[#E8E6DF] rounded-[10px]" />
                        <div className="h-12 bg-[#E8E6DF] rounded-[10px]" />
                    </div>
                </div>
                <div className="p-5 border-t border-[#E2DFD8]">
                    <div className="h-11 bg-[#E8E6DF] rounded-[12px]" />
                </div>
            </div>
            {/* Right: Analysis skeleton */}
            <div className="flex-1 bg-[#1C2B3A]">
                <div className="h-16 border-b border-[#243447]" />
                <div className="p-6 space-y-6">
                    <div className="h-12 bg-[#243447] rounded-lg" />
                    <div className="h-24 bg-[#243447] rounded-lg" />
                    <div className="h-40 bg-[#243447] rounded-lg" />
                </div>
            </div>
        </div>
    );
}
