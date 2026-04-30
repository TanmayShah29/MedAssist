import { cn } from "@/lib/utils";

export type StatusType = "optimal" | "warning" | "critical" | "neutral";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md";
  className?: string;
  showDot?: boolean;
}

const STATUS_CONFIG: Record<StatusType, { label: string; dotClass: string; badgeClass: string }> = {
  optimal: {
    label: "Optimal",
    dotClass: "bg-emerald-500",
    badgeClass: "status-optimal",
  },
  warning: {
    label: "Monitor",
    dotClass: "bg-amber-500",
    badgeClass: "status-warning",
  },
  critical: {
    label: "Action",
    dotClass: "bg-red-500",
    badgeClass: "status-critical",
  },
  neutral: {
    label: "Unknown",
    dotClass: "bg-stone-400",
    badgeClass: "status-neutral",
  },
};

/**
 * Unified status badge for biomarker status display.
 * Replaces the scattered inline status styling across:
 * - biomarker-grid.tsx
 * - dashboard-client.tsx
 * - BiomarkerDetailSheet.tsx
 * - health-score-overview.tsx
 */
export function StatusBadge({
  status,
  label,
  size = "md",
  className,
  showDot = false,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.neutral;
  const displayLabel = label ?? config.label;

  return (
    <span
      className={cn(
        "status-badge",
        config.badgeClass,
        size === "sm" && "text-[9px] px-1.5 py-0.5",
        className
      )}
    >
      {showDot && (
        <span className={cn("inline-block w-1.5 h-1.5 rounded-full", config.dotClass)} />
      )}
      {displayLabel}
    </span>
  );
}

/** Just the coloured dot — for compact list views */
export function StatusDot({ status, className }: { status: StatusType; className?: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.neutral;
  return (
    <span
      className={cn(
        "inline-block rounded-full flex-shrink-0",
        config.dotClass,
        className ?? "w-2 h-2"
      )}
    />
  );
}
