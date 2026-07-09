import { Lock, ShieldCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrustCallout({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[14px] border border-[#EBEAE4] bg-white p-4 shadow-sm transition-all duration-300 hover:border-[#D1CFCD] hover:shadow-md", className)}>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">Private health workspace</p>
      <div className="mt-3 grid gap-2 text-[12px] font-semibold text-[#475569] sm:grid-cols-3 lg:grid-cols-1">
        <span className="group flex items-center gap-2"><Lock className="h-4 w-4 text-sky-500 transition-transform duration-200 group-hover:scale-110" /> Encrypted records</span>
        <span className="group flex items-center gap-2"><Trash2 className="h-4 w-4 text-sky-500 transition-transform duration-200 group-hover:scale-110" /> Delete anytime</span>
        <span className="group flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sky-500 transition-transform duration-200 group-hover:scale-110" /> No report training</span>
      </div>
    </div>
  );
}
