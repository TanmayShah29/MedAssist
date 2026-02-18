import { cn } from "@/lib/utils";

type Badge = {
    id: string;
    label: string;
    type: "symptom" | "condition" | "medication" | "lab";
};

export function BadgeGroup({ badges }: { badges: ReadonlyArray<Badge> }) {
    const getColor = (type: Badge["type"]) => {
        switch (type) {
            case "symptom": return "bg-blue-900/50 text-blue-300 border-blue-800";
            case "condition": return "bg-purple-900/50 text-purple-300 border-purple-800";
            case "medication": return "bg-emerald-900/50 text-emerald-300 border-emerald-800";
            case "lab": return "bg-amber-900/50 text-amber-300 border-amber-800";
            default: return "bg-slate-900/50 text-slate-300 border-slate-800";
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
                <span
                    key={badge.id}
                    className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-medium border",
                        getColor(badge.type)
                    )}
                >
                    {badge.label}
                </span>
            ))}
        </div>
    );
}
