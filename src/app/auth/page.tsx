import { Suspense } from "react";
import AuthContent from "./AuthContent";

export const dynamic = "force-dynamic";

export default function AuthPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen min-h-[100dvh] bg-[#FAFAF7] flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-sky-300 border-t-sky-500 rounded-full animate-spin" />
                </div>
            }
        >
            <AuthContent />
        </Suspense>
    );
}
