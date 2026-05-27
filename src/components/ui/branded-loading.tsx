import { BrandLockup } from "@/components/branding/brand-lockup";
import { cn } from "@/lib/utils";

type BrandedLoadingProps = {
  title: string;
  subtitle?: string;
  variant?: "dashboard" | "list" | "chat" | "profile" | "settings";
};

export function BrandedLoading({
  title,
  subtitle = "Preparing your doctor-ready workspace.",
  variant = "dashboard",
}: BrandedLoadingProps) {
  const rows = variant === "chat" ? 4 : variant === "profile" ? 3 : 5;

  return (
    <div className="brand-loading min-h-[100dvh] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between border-b border-[#E4E0D6] pb-5">
          <div>
            <BrandLockup showTagline />
            <h1 className="mt-8 font-display text-3xl leading-tight text-[#18211F] sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5B665F]">{subtitle}</p>
          </div>
          <div className="hidden rounded-full border border-sky-200 bg-white/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-sky-700 shadow-sm sm:inline-flex">
            Loading brief
          </div>
        </div>

        <div className={cn("grid gap-4", variant === "dashboard" ? "lg:grid-cols-[1.35fr_0.8fr]" : "lg:grid-cols-[1fr_1fr]")}>
          <div className="rounded-[18px] border border-[#E4E0D6] bg-white/72 p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="brand-skeleton h-4 w-36 rounded-full" />
              <div className="brand-skeleton h-8 w-24 rounded-[10px]" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="rounded-[14px] border border-[#ECE8DE] bg-[#FAFAF7]/80 p-4">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div className="brand-skeleton h-4 w-36 rounded-full" />
                    <div className="brand-skeleton h-5 w-16 rounded-full" />
                  </div>
                  <div className="brand-skeleton h-3 w-full rounded-full" />
                  <div className="brand-skeleton mt-2 h-3 w-2/3 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-sky-100 bg-sky-50/55 p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">MedAssist is assembling</p>
            <div className="mt-6 space-y-4">
              {["Key results", "Trend context", "Doctor questions"].map((item, i) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-sky-600 shadow-sm">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#18211F]">{item}</p>
                    <div className="brand-skeleton mt-2 h-2 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 h-2 overflow-hidden rounded-full bg-white">
              <div className="brand-loading-bar h-full rounded-full bg-sky-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
