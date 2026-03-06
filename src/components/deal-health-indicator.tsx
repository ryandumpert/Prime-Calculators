"use client";

import {
    type DealHealthResult,
    getDealHealthBg,
    getDealHealthBgLight,
    getDealHealthColor,
} from "@/lib/deal-health";
import { Shield, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

interface DealHealthIndicatorProps {
    result: DealHealthResult | null;
}

export function DealHealthIndicator({ result }: DealHealthIndicatorProps) {
    if (!result) {
        return (
            <div className="rounded-xl border border-border bg-muted/50 p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <HelpCircle className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Deal Health
                        </p>
                        <p className="text-lg font-bold text-muted-foreground">
                            Incomplete
                        </p>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    Add the remaining fields to see your results
                </p>
            </div>
        );
    }

    const { score, level, label, reasons } = result;
    const Icon =
        level === "good" ? Shield : level === "caution" ? AlertTriangle : XCircle;
    const colorClass = getDealHealthColor(level);
    const bgClass = getDealHealthBg(level);
    const bgLightClass = getDealHealthBgLight(level);

    return (
        <div
            className={`rounded-xl border border-border p-6 ${bgLightClass} transition-all duration-500`}
        >
            <div className="flex items-center gap-3 mb-4">
                <div
                    className={`w-12 h-12 rounded-full ${bgClass} flex items-center justify-center deal-health-glow`}
                >
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Deal Health
                    </p>
                    <p className={`text-2xl font-bold ${colorClass}`}>{label}</p>
                </div>
                <div className="ml-auto">
                    <div
                        className={`text-3xl font-black tabular-nums ${colorClass} kpi-value`}
                    >
                        {score}
                    </div>
                    <p className="text-xs text-muted-foreground text-right">/ 100</p>
                </div>
            </div>

            {/* Score bar */}
            <div className="w-full h-2 rounded-full bg-muted mb-4 overflow-hidden">
                <div
                    className={`h-full rounded-full ${bgClass} deal-health-bar`}
                    style={{ "--score-width": `${score}%` } as React.CSSProperties}
                />
            </div>

            {/* Reasons */}
            <ul className="space-y-1.5">
                {reasons.map((reason, i) => (
                    <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${bgClass} shrink-0`} />
                        {reason}
                    </li>
                ))}
            </ul>
        </div>
    );
}
