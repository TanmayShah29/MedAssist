import { cn } from "@/lib/utils";

type BrandLockupProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showTagline?: boolean;
  collapsed?: boolean;
  inverse?: boolean;
};

export function BrandMark({ className = "", inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]",
        inverse
          ? "bg-white text-sky-600 shadow-[0_10px_24px_rgba(255,255,255,0.14)]"
          : "bg-sky-500 text-white shadow-[0_10px_24px_rgba(14,165,233,0.24)]",
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="h-[23px] w-[23px]" fill="none">
        <path
          d="M16 3.8 6.5 7.9v7.2c0 6.2 4 10.8 9.5 13.1 5.5-2.3 9.5-6.9 9.5-13.1V7.9L16 3.8Z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M10.4 17.4h3.5l2.1-5.3 2.4 8 1.8-4.2h3.4"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="12.1" r="1.6" fill="currentColor" opacity="0.9" />
      </svg>
      <span className={cn("absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2", inverse ? "border-slate-950 bg-emerald-400" : "border-white bg-emerald-400")} />
    </span>
  );
}

export function BrandLockup({
  className = "",
  markClassName = "",
  textClassName = "",
  showTagline = false,
  collapsed = false,
  inverse = false,
}: BrandLockupProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className={markClassName} inverse={inverse} />
      {!collapsed && (
        <span className={cn("min-w-0 leading-none", textClassName)}>
          <span className={cn("block font-display text-[22px] tracking-tight", inverse ? "text-white" : "text-[#18211F]")}>
            MedAssist
          </span>
          {showTagline && (
            <span className={cn("mt-1 block text-[9px] font-black uppercase tracking-[0.18em]", inverse ? "text-sky-200" : "text-sky-700")}>
              Visit prep intelligence
            </span>
          )}
        </span>
      )}
    </span>
  );
}
