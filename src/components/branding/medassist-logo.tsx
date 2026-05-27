"use client";

import { BrandLockup } from "@/components/branding/brand-lockup";

export function MedAssistLogo({ className = "", collapsed = false, monochrome = false }: { className?: string; collapsed?: boolean; monochrome?: boolean }) {
    return (
        <BrandLockup className={className} collapsed={collapsed} showTagline inverse={!monochrome} />
    );
}
