"use client";

import { useMemo, useState } from "react";
import { CalculatorLayout } from "@/components/calculator-layout";
import { DealHealthIndicator } from "@/components/deal-health-indicator";
import { KpiCard } from "@/components/kpi-card";
import { LeadCapture } from "@/components/lead-capture";
import { MoneyInput, PercentInput, NumberInput } from "@/components/calculator-inputs";
import { computeBridge, type BridgeInputs } from "@/lib/calculators/bridge";
import { bridgeDealHealth } from "@/lib/deal-health";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { CreditBandValue } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export default function BridgeLoanPage() {
    const [inputs, setInputs] = useState<BridgeInputs>({
        purchasePrice: 400000,
        downPaymentPercent: 20,
        termMonths: 12,
        pointsPercent: 2,
        monthlyHoldingCosts: 800,
        creditBand: "720-759" as CreditBandValue,
    });

    const update = <K extends keyof BridgeInputs>(
        key: K,
        value: BridgeInputs[K]
    ) => {
        setInputs((prev) => ({ ...prev, [key]: value }));
    };

    const outputs = useMemo(() => computeBridge(inputs), [inputs]);
    const dealHealth = useMemo(() => {
        if (!outputs.isComplete) return null;
        return bridgeDealHealth(
            outputs.totalLoanCost,
            outputs.loanAmount,
            inputs.termMonths
        );
    }, [outputs, inputs.termMonths]);

    return (
        <CalculatorLayout
            title="Bridge Loan Cost Calculator"
            description="Model bridge loan costs including IO payments, points, and total holding cost."
            assumptions={[
                `Base rate estimate: 10.50% (before credit adjustment)`,
                `Your estimated rate: ${formatPercent(outputs.estimatedRate)}`,
                `Interest-only payments during bridge period`,
            ]}
            inputs={
                <div className="space-y-5">
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Property & Loan
                        </h3>
                        <div className="space-y-3">
                            <MoneyInput
                                id="purchase-price"
                                label="Purchase Price"
                                value={inputs.purchasePrice}
                                onChange={(v) => update("purchasePrice", v)}
                            />
                            <PercentInput
                                id="down-payment"
                                label="Down Payment"
                                value={inputs.downPaymentPercent}
                                onChange={(v) => update("downPaymentPercent", v)}
                                max={90}
                            />
                            <NumberInput
                                id="term-months"
                                label="Bridge Term"
                                value={inputs.termMonths}
                                onChange={(v) => update("termMonths", v)}
                                unit="months"
                                min={1}
                                max={36}
                                tooltip="Expected duration of the bridge loan"
                            />
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Costs
                        </h3>
                        <div className="space-y-3">
                            <PercentInput
                                id="points"
                                label="Points"
                                value={inputs.pointsPercent}
                                onChange={(v) => update("pointsPercent", v)}
                                tooltip="Origination fee as % of loan"
                                max={10}
                            />
                            <MoneyInput
                                id="monthly-holding"
                                label="Monthly Holding Costs"
                                value={inputs.monthlyHoldingCosts}
                                onChange={(v) => update("monthlyHoldingCosts", v)}
                                tooltip="Taxes, insurance, utilities, etc."
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
                            label="Monthly IO Payment"
                            value={
                                outputs.isComplete
                                    ? formatCurrency(outputs.monthlyIOPayment)
                                    : "—"
                            }
                            variant="primary"
                            size="lg"
                            sublabel={`at ${formatPercent(outputs.estimatedRate)}`}
                        />
                        <KpiCard
                            label="Total Loan Cost"
                            value={
                                outputs.isComplete
                                    ? formatCurrency(outputs.totalLoanCost)
                                    : "—"
                            }
                            size="lg"
                            sublabel="Interest + points + holding"
                            variant={outputs.isComplete ? "warning" : "default"}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <KpiCard
                            label="Loan Amount"
                            value={formatCurrency(outputs.loanAmount)}
                            size="sm"
                        />
                        <KpiCard
                            label="Points Cost"
                            value={formatCurrency(outputs.pointsCost)}
                            size="sm"
                        />
                        <KpiCard
                            label="Down Payment"
                            value={formatCurrency(outputs.downPayment)}
                            size="sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <KpiCard
                            label="Total Interest"
                            value={formatCurrency(outputs.totalInterestCost)}
                            size="sm"
                            sublabel={`Over ${inputs.termMonths} months`}
                        />
                        <KpiCard
                            label="Total Holding"
                            value={formatCurrency(outputs.totalHoldingCost)}
                            size="sm"
                            sublabel={`Over ${inputs.termMonths} months`}
                        />
                    </div>
                </div>
            }
            leadCapture={
                <LeadCapture
                    calculatorType="Bridge Loan"
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
