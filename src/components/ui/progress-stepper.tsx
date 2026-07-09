import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProgressStepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex items-center overflow-x-auto pb-1" aria-label="Progress">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const complete = current > stepNumber;
        const active = current === stepNumber;
        return (
          <div key={step} className="flex min-w-0 grow items-center last:grow-0">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                  complete && "bg-emerald-500 text-white",
                  active && "bg-sky-500 text-white",
                  !complete && !active && "bg-[#EBEAE4] text-[#475569]"
                )}
              >
                {complete ? <Check className="h-3.5 w-3.5" /> : stepNumber}
              </div>
              <span className={cn("mt-1 whitespace-nowrap text-[9px] font-bold", active ? "text-sky-600" : "text-[#94A3B8]")}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && <div className={cn("mx-1 mb-4 h-0.5 grow", complete ? "bg-emerald-500" : "bg-[#EBEAE4]")} />}
          </div>
        );
      })}
    </div>
  );
}
