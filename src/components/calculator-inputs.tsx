"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Money Input
interface MoneyInputProps {
    id: string;
    label: string;
    value: number | string;
    onChange: (value: number) => void;
    tooltip?: string;
    placeholder?: string;
    className?: string;
}

export function MoneyInput({
    id,
    label,
    value,
    onChange,
    tooltip,
    placeholder = "0",
    className,
}: MoneyInputProps) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <div className="flex items-center gap-1.5">
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                </Label>
                {tooltip && <InfoTooltip text={tooltip} />}
            </div>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    $
                </span>
                <Input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    value={value === 0 ? "" : String(value)}
                    onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                        const num = parseFloat(cleaned);
                        onChange(isNaN(num) ? 0 : num);
                    }}
                    placeholder={placeholder}
                    className="pl-7 tabular-nums"
                />
            </div>
        </div>
    );
}

// Expense Input — Money input with Monthly/Yearly toggle
export type ExpenseFrequency = "monthly" | "yearly";

interface ExpenseInputProps {
    id: string;
    label: string;
    value: number | string;
    onChange: (monthlyValue: number) => void;
    frequency: ExpenseFrequency;
    onFrequencyChange: (freq: ExpenseFrequency) => void;
    tooltip?: string;
    placeholder?: string;
    className?: string;
}

export function ExpenseInput({
    id,
    label,
    value,
    onChange,
    frequency,
    onFrequencyChange,
    tooltip,
    placeholder = "0",
    className,
}: ExpenseInputProps) {
    // Display value: if yearly, show the yearly amount (monthly * 12)
    // Internal value always stored as monthly
    const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
    const displayValue = frequency === "yearly" ? Math.round(numValue * 12 * 100) / 100 : numValue;

    return (
        <div className={cn("space-y-1.5", className)}>
            <div className="flex items-center gap-1.5">
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                </Label>
                {tooltip && <InfoTooltip text={tooltip} />}
                <div className="ml-auto flex items-center rounded-md border border-border bg-muted/50 text-[11px] font-semibold overflow-hidden">
                    <button
                        type="button"
                        onClick={() => {
                            if (frequency !== "monthly") {
                                // Convert: displayed yearly value → monthly
                                onFrequencyChange("monthly");
                            }
                        }}
                        className={cn(
                            "px-2 py-0.5 transition-colors",
                            frequency === "monthly"
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Mo
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (frequency !== "yearly") {
                                // Convert: displayed monthly value → yearly
                                onFrequencyChange("yearly");
                            }
                        }}
                        className={cn(
                            "px-2 py-0.5 transition-colors",
                            frequency === "yearly"
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Yr
                    </button>
                </div>
            </div>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    $
                </span>
                <Input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    value={displayValue === 0 ? "" : String(displayValue)}
                    onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                        const num = parseFloat(cleaned);
                        const rawValue = isNaN(num) ? 0 : num;
                        // Always store as monthly
                        onChange(frequency === "yearly" ? rawValue / 12 : rawValue);
                    }}
                    placeholder={placeholder}
                    className="pl-7 tabular-nums"
                />
            </div>
        </div>
    );
}

// Percent Input
interface PercentInputProps {
    id: string;
    label: string;
    value: number | string;
    onChange: (value: number) => void;
    tooltip?: string;
    step?: number;
    min?: number;
    max?: number;
    className?: string;
}

export function PercentInput({
    id,
    label,
    value,
    onChange,
    tooltip,
    step = 0.25,
    min = 0,
    max = 100,
    className,
}: PercentInputProps) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <div className="flex items-center gap-1.5">
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                </Label>
                {tooltip && <InfoTooltip text={tooltip} />}
            </div>
            <div className="relative">
                <Input
                    id={id}
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    step={step}
                    min={min}
                    max={max}
                    className="pr-8 tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    %
                </span>
            </div>
        </div>
    );
}

// Number Input
interface NumberInputProps {
    id: string;
    label: string;
    value: number | string;
    onChange: (value: number) => void;
    tooltip?: string;
    unit?: string;
    step?: number;
    min?: number;
    max?: number;
    className?: string;
}

export function NumberInput({
    id,
    label,
    value,
    onChange,
    tooltip,
    unit,
    step = 1,
    min = 0,
    max,
    className,
}: NumberInputProps) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <div className="flex items-center gap-1.5">
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                </Label>
                {tooltip && <InfoTooltip text={tooltip} />}
            </div>
            <div className="relative">
                <Input
                    id={id}
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    step={step}
                    min={min}
                    max={max}
                    className={cn(unit && "pr-14", "tabular-nums")}
                />
                {unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
}

// Select Input
interface SelectInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    tooltip?: string;
    placeholder?: string;
    className?: string;
}

export function SelectInput({
    id,
    label,
    value,
    onChange,
    options,
    tooltip,
    placeholder = "Select...",
    className,
}: SelectInputProps) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <div className="flex items-center gap-1.5">
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                </Label>
                {tooltip && <InfoTooltip text={tooltip} />}
            </div>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger id={id} className="w-full">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

// Toggle Input
interface ToggleInputProps {
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    tooltip?: string;
    className?: string;
}

export function ToggleInput({
    id,
    label,
    checked,
    onChange,
    tooltip,
    className,
}: ToggleInputProps) {
    return (
        <div className={cn("flex items-center justify-between gap-3", className)}>
            <div className="flex items-center gap-1.5">
                <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
                    {label}
                </Label>
                {tooltip && <InfoTooltip text={tooltip} />}
            </div>
            <Switch id={id} checked={checked} onCheckedChange={onChange} />
        </div>
    );
}

// Info Tooltip
function InfoTooltip({ text }: { text: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[260px]">
                <p className="text-sm">{text}</p>
            </TooltipContent>
        </Tooltip>
    );
}
