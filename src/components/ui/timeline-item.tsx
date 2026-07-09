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
    <article className={cn("group relative flex gap-3 pl-1", className)}>
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-sky-100 bg-sky-50 text-sky-600 transition-transform duration-200 group-hover:scale-110">
          {icon}
        </div>
        <div className="mt-2 h-full min-h-6 w-px bg-[#EBEAE4]" />
      </div>
      <div className="min-w-0 pb-5">
        {date && <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">{date}</p>}
        <h3 className="mt-0.5 text-sm font-bold leading-tight text-[#0F172A] text-wrap-safe transition-colors duration-200 group-hover:text-sky-700">{title}</h3>
        {detail && <div className="mt-1 text-[13px] leading-relaxed text-[#475569] text-wrap-safe">{detail}</div>}
      </div>
    </article>
  );
}
