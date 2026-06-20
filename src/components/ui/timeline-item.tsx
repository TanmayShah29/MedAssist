import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TimelineItem({
  title,
  detail,
  date,
  icon,
  className,
}: {
  title: string;
  detail?: ReactNode;
  date?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("relative flex gap-3 pl-1", className)}>
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-sky-100 bg-sky-50 text-sky-600">
          {icon}
        </div>
        <div className="mt-2 h-full min-h-6 w-px bg-[#E8E6DF]" />
      </div>
      <div className="min-w-0 pb-5">
        {date && <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#78716C]">{date}</p>}
        <h3 className="mt-0.5 text-sm font-bold leading-tight text-[#1C1917] text-wrap-safe">{title}</h3>
        {detail && <div className="mt-1 text-[13px] leading-relaxed text-[#57534E] text-wrap-safe">{detail}</div>}
      </div>
    </article>
  );
}
