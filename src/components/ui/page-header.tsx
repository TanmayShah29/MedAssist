import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("app-header", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-600">
            {eyebrow}
          </p>
        )}
        <h1 className="app-title text-wrap-safe">{title}</h1>
        {description && <div className="app-subtitle text-wrap-safe">{description}</div>}
      </div>
      {actions && <div className="app-actions shrink-0 print:hidden">{actions}</div>}
    </header>
  );
}
