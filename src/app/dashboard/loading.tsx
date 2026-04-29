import { Skeleton, BiomarkerCardSkeleton, HealthScoreSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="min-h-[100dvh] p-6" style={{ background: '#FAFAF7' }}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <div>
                    <Skeleton className="h-8 w-48 rounded-lg mb-2" />
                    <Skeleton className="h-4 w-64 rounded-lg" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-10 rounded-[12px]" />
                    <Skeleton className="h-10 w-24 rounded-[10px]" />
                </div>
            </div>

            <HealthScoreSkeleton />

            <div className="mt-8">
                <Skeleton className="h-5 w-36 mb-4" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 md:gap-4">
                    <BiomarkerCardSkeleton />
                    <BiomarkerCardSkeleton />
                    <BiomarkerCardSkeleton />
                    <BiomarkerCardSkeleton />
                    <BiomarkerCardSkeleton />
                    <BiomarkerCardSkeleton />
                </div>
            </div>
        </div>
    )
}