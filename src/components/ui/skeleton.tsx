import { cn } from "@/lib/utils";

/**
 * Base skeleton with shimmer animation.
 * Uses the skeleton-shimmer utility class from globals.css.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-lg", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

/** Skeleton for text lines */
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? "65%" : "100%" }}
        />
      ))}
    </div>
  );
}

/** Skeleton for a biomarker card */
function BiomarkerCardSkeleton() {
  return (
    <div className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[14px] p-4 min-h-[120px]">
      <div className="flex justify-between items-start mb-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-12 rounded" />
      </div>
      <Skeleton className="h-6 w-20 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

/** Skeleton for the health score ring card */
function HealthScoreSkeleton() {
  return (
    <div className="bg-[#FAFAF7] border border-[#E8E6DF] rounded-[18px] p-6 h-full">
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="flex items-center gap-6">
        <Skeleton className="w-[120px] h-[120px] rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for a card with a header and body text */
function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-[#F5F4EF] border border-[#E8E6DF] rounded-[18px] p-6">
      <Skeleton className="h-5 w-40 mb-2" />
      <Skeleton className="h-3 w-24 mb-5" />
      <SkeletonText lines={rows} />
    </div>
  );
}

/** Skeleton for an avatar / initials circle */
function AvatarSkeleton({ size = 40 }: { size?: number }) {
  return (
    <Skeleton
      className="rounded-full flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

/** Skeleton for a list item with avatar + text */
function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <AvatarSkeleton size={36} />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  BiomarkerCardSkeleton,
  HealthScoreSkeleton,
  CardSkeleton,
  AvatarSkeleton,
  ListItemSkeleton,
};
