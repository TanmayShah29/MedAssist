import type { ReactNode } from "react";
import { ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const toneClasses = {
  neutral: "border-[#E8E6DF] bg-white",
  info: "border-sky-100 bg-sky-50/70",
  success: "border-emerald-100 bg-emerald-50/70",
  warning: "border-amber-100 bg-amber-50/70",
  critical: "border-red-100 bg-red-50/70",
};

export type InsightTone = keyof typeof toneClasses;

export function InsightCard({
  eyebrow,
  title,
  description,
  icon,
  tone = "neutral",
  action,
  onClick,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  tone?: InsightTone;
  action?: string;
  onClick?: () => void;
  className?: string;
}) {
  const interactive = Boolean(onClick);

  return (
    <article
      className={cn(
        "rounded-[14px] border p-4 shadow-sm transition-all min-w-0",
        toneClasses[tone],
        interactive && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-sky-500/20",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/80 text-sky-600 ring-1 ring-black/5">
          {icon ?? <Info className="h-4 w-4" />}
        </div>
        <div className="min-w-0 grow">
          {eyebrow && (
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#78716C]">
              {eyebrow}
            </p>
          )}
          <h3 className="text-[15px] font-bold leading-tight text-[#1C1917] text-wrap-safe">{title}</h3>
          {description && (
            <div className="mt-1.5 text-[13px] leading-relaxed text-[#57534E] text-wrap-safe">
              {description}
            </div>
          )}
          {action && (
            <button
              type="button"
              className="mt-3 inline-flex min-h-[36px] items-center gap-1.5 rounded-[9px] text-[13px] font-semibold text-sky-600 hover:text-sky-700"
              onClick={(event) => {
                event.stopPropagation();
                onClick?.();
              }}
            >
              {action}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
