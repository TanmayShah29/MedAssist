import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label: string;
  className?: string;
  action?: React.ReactNode;
}

/**
 * The standard section label used throughout the app.
 * Replaces the repeated `text-[10px] font-semibold uppercase text-[#A8A29E] tracking-wider` pattern.
 */
export function SectionHeader({ label, className, action }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <p className="section-label">{label}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
