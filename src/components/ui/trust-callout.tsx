import { Lock, ShieldCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrustCallout({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[14px] border border-[#E8E6DF] bg-white p-4 shadow-sm", className)}>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#78716C]">Private health workspace</p>
      <div className="mt-3 grid gap-2 text-[12px] font-semibold text-[#57534E] sm:grid-cols-3 lg:grid-cols-1">
        <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-sky-500" /> Encrypted records</span>
        <span className="flex items-center gap-2"><Trash2 className="h-4 w-4 text-sky-500" /> Delete anytime</span>
        <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sky-500" /> No report training</span>
      </div>
    </div>
  );
}
