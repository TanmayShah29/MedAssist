import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-[#E8E6DF]", className)}
            {...props}
        />
    )
}

function BiomarkerCardSkeleton() {
    return (
        <div className="bg-white border border-[#E8E6DF] rounded-[14px] p-4 min-h-[120px]">
            <div className="flex justify-between items-start mb-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-12 rounded" />
            </div>
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-3 w-24" />
        </div>
    )
}

function HealthScoreSkeleton() {
    return (
        <div className="bg-[#FAFAF7] border border-[#E8E6DF] rounded-[18px] p-6 h-full">
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="flex items-center gap-6">
                <Skeleton className="w-[120px] h-[120px] rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        </div>
    )
}

export { Skeleton, BiomarkerCardSkeleton, HealthScoreSkeleton }
