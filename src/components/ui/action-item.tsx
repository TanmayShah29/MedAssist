import { CheckCircle2, Circle, Clock, Stethoscope, TestTube2 } from "lucide-react";
import { cn } from "@/lib/utils";

const kindMeta = {
  ask_doctor: { label: "Ask doctor", icon: Stethoscope, className: "bg-sky-50 text-sky-700 border-sky-100" },
  monitor: { label: "Monitor", icon: Clock, className: "bg-amber-50 text-amber-700 border-amber-100" },
  lifestyle: { label: "Lifestyle", icon: Circle, className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  retest: { label: "Retest", icon: TestTube2, className: "bg-violet-50 text-violet-700 border-violet-100" },
};

export type CarePlanKind = keyof typeof kindMeta;
export type CarePlanStatus = "not_started" | "in_progress" | "done" | "dismissed";

export function ActionItem({
  title,
  reason,
  kind,
  status = "not_started",
  timeframe,
  related,
  onToggle,
  className,
}: {
  title: string;
  reason?: string;
  kind: CarePlanKind;
  status?: CarePlanStatus;
  timeframe?: string;
  related?: string[];
  onToggle?: () => void;
  className?: string;
}) {
  const meta = kindMeta[kind];
  const Icon = meta.icon;
  const done = status === "done";

  return (
    <article
      className={cn(
        "rounded-[14px] border border-[#EBEAE4] bg-white p-4 shadow-sm transition-all duration-300 ease-out",
        "hover:border-[#D1CFCD] hover:shadow-md hover:-translate-y-0.5",
        done && "opacity-60",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FDFDFB] text-[#64748B] transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600 active:scale-90"
          aria-label={done ? "Mark action not done" : "Mark action done"}
          disabled={!onToggle}
        >
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 tick-pop" />
          ) : (
            <Circle className="h-5 w-5 transition-transform duration-200" />
          )}
        </button>
        <div className="min-w-0 grow">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", meta.className)}>
              <Icon className="h-3 w-3" />
              {meta.label}
            </span>
            {timeframe && <span className="text-[11px] font-semibold text-[#64748B]">{timeframe}</span>}
          </div>
          <h3 className={cn("mt-2 text-[15px] font-bold leading-tight text-[#0F172A] text-wrap-safe transition-all duration-300", done && "line-through")}>{title}</h3>
          {reason && <p className="mt-1 text-[13px] leading-relaxed text-[#475569] text-wrap-safe">{reason}</p>}
          {!!related?.length && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {related.map((item) => (
                <span key={item} className="rounded-full border border-[#EBEAE4] bg-[#FDFDFB] px-2 py-0.5 text-[11px] font-semibold text-[#475569] transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
