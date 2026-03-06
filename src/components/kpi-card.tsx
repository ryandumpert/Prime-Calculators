"use client";

import { cn } from "@/lib/utils";

interface KpiCardProps {
    label: string;
    value: string;
    sublabel?: string;
    variant?: "default" | "primary" | "success" | "warning" | "danger";
    size?: "sm" | "md" | "lg";
}

const variantStyles = {
    default: "bg-card border-border",
    primary: "bg-primary/5 border-primary/20",
    success: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800",
    warning: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
    danger: "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
};

const valueStyles = {
    default: "text-foreground",
    primary: "text-primary",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
};

const sizeStyles = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
};

export function KpiCard({
    label,
    value,
    sublabel,
    variant = "default",
    size = "md",
}: KpiCardProps) {
    return (
        <div
            className={cn(
                "rounded-lg border p-4 transition-all duration-300",
                variantStyles[variant]
            )}
        >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {label}
            </p>
            <p
                className={cn(
                    "font-bold tabular-nums kpi-value",
                    sizeStyles[size],
                    valueStyles[variant]
                )}
            >
                {value}
            </p>
            {sublabel && (
                <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
            )}
        </div>
    );
}
