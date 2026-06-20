import { PATIENT_STATUS } from "@/lib/patient-status";

export function StatusSummary({
  optimal,
  warning,
  critical,
}: {
  optimal: number;
  warning: number;
  critical: number;
}) {
  const items = [
    { key: "optimal", count: optimal, meta: PATIENT_STATUS.optimal },
    { key: "warning", count: warning, meta: PATIENT_STATUS.warning },
    { key: "critical", count: critical, meta: PATIENT_STATUS.critical },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-2" aria-label="Lab status summary">
      {items.map(({ key, count, meta }) => (
        <div key={key} className={`rounded-[12px] border px-3 py-2 ${meta.bgClass} ${meta.borderClass}`}>
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} aria-hidden="true" />
            <span className={`text-[10px] font-bold uppercase tracking-[0.08em] ${meta.textClass}`}>
              {meta.shortLabel}
            </span>
          </div>
          <p className={`mt-1 text-2xl font-black leading-none ${meta.textClass}`}>{count}</p>
        </div>
      ))}
    </div>
  );
}
