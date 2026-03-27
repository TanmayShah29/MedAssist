import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50">
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <p className="text-slate-600 mb-6">The page you're looking for doesn't exist or has been moved.</p>
            <Link
                href="/dashboard"
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
                Go to Dashboard
            </Link>
        </div>
    );
}
