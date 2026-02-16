import React from "react";
import { useStore } from "@/store/useStore";
import { Activity, Zap, Shield, Heart } from "lucide-react";

export function InsightPanel() {
    const { riskAnalysis } = useStore();

    // Sort domains by score (lowest/worst first) to show critical areas
    const domains = riskAnalysis?.domains.slice(0, 3) || [];

    const getIcon = (domain: string) => {
        if (domain.includes("Cardio")) return <Heart className="w-4 h-4" />;
        if (domain.includes("Inflammation")) return <Shield className="w-4 h-4" />;
        if (domain.includes("Metabolic")) return <Activity className="w-4 h-4" />;
        return <Zap className="w-4 h-4" />;
    };

    return (
        <div className="grid md:grid-cols-3 gap-6 bg-slate-50 rounded-2xl p-6 border border-border">
            {domains.map((domain) => (
                <div key={domain.name} className="space-y-2">
                    <div className={`flex items-center gap-2 font-bold text-sm
                        ${domain.tier === 'Optimal' ? 'text-success' :
                            domain.tier === 'Monitor' ? 'text-warning' : 'text-destructive'}`}>
                        {getIcon(domain.name)}
                        <span>{domain.name}</span>
                        <span className="ml-auto text-xs opacity-80">{domain.score}%</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Status: <span className="font-medium">{domain.tier}</span>.
                        Key driver: {domain.contributors[0]?.marker} ({domain.contributors[0]?.value}).
                    </p>
                </div>
            ))}

            {domains.length === 0 && (
                <div className="col-span-3 text-center text-sm text-muted-foreground py-4">
                    Initializing Health Intelligence Engine...
                </div>
            )}
        </div>
    );
}
