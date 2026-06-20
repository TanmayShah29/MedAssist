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
    <article className={cn("rounded-[14px] border border-[#E8E6DF] bg-white p-4 shadow-sm", done && "opacity-70", className)}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FAFAF7] text-[#78716C] hover:text-emerald-600"
          aria-label={done ? "Mark action not done" : "Mark action done"}
          disabled={!onToggle}
        >
          {done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5" />}
        </button>
        <div className="min-w-0 grow">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", meta.className)}>
              <Icon className="h-3 w-3" />
              {meta.label}
            </span>
            {timeframe && <span className="text-[11px] font-semibold text-[#78716C]">{timeframe}</span>}
          </div>
          <h3 className="mt-2 text-[15px] font-bold leading-tight text-[#1C1917] text-wrap-safe">{title}</h3>
          {reason && <p className="mt-1 text-[13px] leading-relaxed text-[#57534E] text-wrap-safe">{reason}</p>}
          {!!related?.length && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {related.map((item) => (
                <span key={item} className="rounded-full border border-[#E8E6DF] bg-[#FAFAF7] px-2 py-0.5 text-[11px] font-semibold text-[#57534E]">
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
