"use client";

import { useMemo, useState } from "react";
import { CalculatorLayout } from "@/components/calculator-layout";
import { DealHealthIndicator } from "@/components/deal-health-indicator";
import { KpiCard } from "@/components/kpi-card";
import { LeadCapture } from "@/components/lead-capture";
import { MoneyInput, PercentInput, NumberInput } from "@/components/calculator-inputs";
import {
    computeRateTermRefi,
    type RateTermRefiInputs,
} from "@/lib/calculators/rate-term-refi";
import { refiDealHealth } from "@/lib/deal-health";
import { formatCurrency, formatPercent, formatMonths } from "@/lib/format";
import type { CreditBandValue } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export default function RateTermRefiPage() {
    const [inputs, setInputs] = useState<RateTermRefiInputs>({
        currentBalance: 350000,
        currentRate: 9.5,
        remainingTermYears: 27,
        newTermYears: 30,
        closingCosts: 8000,
        creditBand: "720-759" as CreditBandValue,
    });

    const update = <K extends keyof RateTermRefiInputs>(
        key: K,
        value: RateTermRefiInputs[K]
    ) => {
        setInputs((prev) => ({ ...prev, [key]: value }));
    };

    const outputs = useMemo(() => computeRateTermRefi(inputs), [inputs]);
    const dealHealth = useMemo(() => {
        if (!outputs.isComplete) return null;
        return refiDealHealth(outputs.monthlySavings, outputs.breakevenMonths);
    }, [outputs]);

    const savingsVariant = outputs.monthlySavings > 0 ? "success" : "danger";

    return (
        <CalculatorLayout
            title="Rate & Term Refinance Calculator"
            description="See your monthly savings and breakeven timeline when refinancing to a better rate."
            assumptions={[
                `New rate estimate: 7.50% (before credit adjustment)`,
                `Your estimated new rate: ${formatPercent(outputs.newRate)}`,
                `Closing costs rolled into new loan balance`,
            ]}
            inputs={
                <div className="space-y-5">
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Current Loan
                        </h3>
                        <div className="space-y-3">
                            <MoneyInput
                                id="current-balance"
                                label="Current Loan Balance"
                                value={inputs.currentBalance}
                                onChange={(v) => update("currentBalance", v)}
                            />
                            <PercentInput
                                id="current-rate"
                                label="Current Rate"
                                value={inputs.currentRate}
                                onChange={(v) => update("currentRate", v)}
                                max={20}
                            />
                            <NumberInput
                                id="remaining-term"
                                label="Remaining Term"
                                value={inputs.remainingTermYears}
                                onChange={(v) => update("remainingTermYears", v)}
                                unit="years"
                                min={1}
                                max={40}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            New Loan Terms
                        </h3>
                        <div className="space-y-3">
                            <NumberInput
                                id="new-term"
                                label="New Term"
                                value={inputs.newTermYears}
                                onChange={(v) => update("newTermYears", v)}
                                unit="years"
                                min={5}
                                max={40}
                            />
                            <MoneyInput
                                id="closing-costs"
                                label="Closing Costs"
                                value={inputs.closingCosts}
                                onChange={(v) => update("closingCosts", v)}
                                tooltip="Total closing costs for the new loan"
                            />
                        </div>
                    </div>
                </div>
            }
            dealHealth={<DealHealthIndicator result={dealHealth} />}
            outputs={
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <KpiCard
                            label="Monthly Savings"
                            value={
                                outputs.isComplete
                                    ? formatCurrency(outputs.monthlySavings)
                                    : "—"
                            }
                            variant={outputs.isComplete ? savingsVariant : "default"}
                            size="lg"
                            sublabel="Per month"
                        />
                        <KpiCard
                            label="Breakeven"
                            value={
                                outputs.isComplete && isFinite(outputs.breakevenMonths)
                                    ? formatMonths(outputs.breakevenMonths)
                                    : "—"
                            }
                            size="lg"
                            sublabel="To recoup closing costs"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <KpiCard
                            label="Current Payment"
                            value={
                                outputs.isComplete
                                    ? formatCurrency(outputs.currentPayment)
                                    : "—"
                            }
                            sublabel={`at ${formatPercent(inputs.currentRate)}`}
                        />
                        <KpiCard
                            label="New Payment"
                            value={
                                outputs.isComplete ? formatCurrency(outputs.newPayment) : "—"
                            }
                            sublabel={`at ${formatPercent(outputs.newRate)}`}
                            variant="primary"
                        />
                    </div>
                    <KpiCard
                        label="Lifetime Savings"
                        value={
                            outputs.isComplete
                                ? formatCurrency(outputs.lifetimeSavings)
                                : "—"
                        }
                        sublabel={`Over the ${inputs.newTermYears}-year term, net of closing costs`}
                        variant={outputs.isComplete && outputs.lifetimeSavings > 0 ? "success" : "default"}
                    />
                </div>
            }
            leadCapture={
                <LeadCapture
                    calculatorType="Rate & Term Refi"
                    creditBand={inputs.creditBand}
                    onCreditBandChange={(v) => update("creditBand", v)}
                    inputsSnapshot={inputs as unknown as Record<string, unknown>}
                    outputsSnapshot={outputs as unknown as Record<string, unknown>}
                    dealHealthScore={dealHealth?.score}
                    dealHealthLabel={dealHealth?.label}
                />
            }
        />
    );
}
