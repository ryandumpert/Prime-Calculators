"use client";

import { useMemo, useState } from "react";
import { CalculatorLayout } from "@/components/calculator-layout";
import { DealHealthIndicator } from "@/components/deal-health-indicator";
import { KpiCard } from "@/components/kpi-card";
import { LeadCapture } from "@/components/lead-capture";
import {
    MoneyInput,
    PercentInput,
    NumberInput,
} from "@/components/calculator-inputs";
import { computeFlip, type FlipInputs } from "@/lib/calculators/fix-and-flip";
import { flipDealHealth } from "@/lib/deal-health";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { CreditBandValue } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export default function FixAndFlipPage() {
    const [inputs, setInputs] = useState<FlipInputs>({
        purchasePrice: 200000,
        rehabBudget: 50000,
        arv: 320000,
        holdingPeriodMonths: 6,
        downPaymentPercent: 15,
        pointsPercent: 2,
        buyClosingCostPercent: 2,
        sellCostPercent: 6,
        monthlyTaxes: 200,
        monthlyInsurance: 100,
        monthlyUtilities: 250,
        creditBand: "720-759" as CreditBandValue,
    });

    const update = <K extends keyof FlipInputs>(key: K, value: FlipInputs[K]) => {
        setInputs((prev) => ({ ...prev, [key]: value }));
    };

    const outputs = useMemo(() => computeFlip(inputs), [inputs]);
    const dealHealth = useMemo(() => {
        if (!outputs.isComplete) return null;
        return flipDealHealth(
            outputs.grossProfit,
            outputs.roi,
            inputs.holdingPeriodMonths
        );
    }, [outputs, inputs.holdingPeriodMonths]);

    const profitVariant = outputs.grossProfit >= 0 ? "success" : "danger";

    return (
        <CalculatorLayout
            title="Fix & Flip Profit Calculator"
            description="Estimate your gross profit, ROI, and total financing cost for a flip project."
            assumptions={[
                `Base rate estimate: 11.50% (before credit adjustment)`,
                `Your estimated rate: ${formatPercent(outputs.estimatedRate)}`,
                `Loan type: Interest-Only during holding period`,
                `Sell costs include agent commissions, transfer taxes, etc.`,
            ]}
            inputs={
                <div className="space-y-5">
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Property
                        </h3>
                        <div className="space-y-3">
                            <MoneyInput
                                id="purchase-price"
                                label="Purchase Price"
                                value={inputs.purchasePrice}
                                onChange={(v) => update("purchasePrice", v)}
                            />
                            <MoneyInput
                                id="rehab-budget"
                                label="Rehab Budget"
                                value={inputs.rehabBudget}
                                onChange={(v) => update("rehabBudget", v)}
                                tooltip="Total estimated renovation costs"
                            />
                            <MoneyInput
                                id="arv"
                                label="After Repair Value (ARV)"
                                value={inputs.arv}
                                onChange={(v) => update("arv", v)}
                                tooltip="Expected market value after renovations"
                            />
                            <NumberInput
                                id="holding-period"
                                label="Holding Period"
                                value={inputs.holdingPeriodMonths}
                                onChange={(v) => update("holdingPeriodMonths", v)}
                                unit="months"
                                min={1}
                                max={36}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Financing
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <PercentInput
                                id="down-payment"
                                label="Down Payment"
                                value={inputs.downPaymentPercent}
                                onChange={(v) => update("downPaymentPercent", v)}
                                max={100}
                            />
                            <PercentInput
                                id="points"
                                label="Points"
                                value={inputs.pointsPercent}
                                onChange={(v) => update("pointsPercent", v)}
                                tooltip="Origination fee as % of loan"
                                max={10}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Transaction Costs
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <PercentInput
                                id="buy-closing"
                                label="Buy Closing Costs"
                                value={inputs.buyClosingCostPercent}
                                onChange={(v) => update("buyClosingCostPercent", v)}
                                max={10}
                            />
                            <PercentInput
                                id="sell-cost"
                                label="Sell Costs"
                                value={inputs.sellCostPercent}
                                onChange={(v) => update("sellCostPercent", v)}
                                tooltip="Agent commissions, transfer tax, etc."
                                max={15}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Monthly Holding Costs
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <MoneyInput
                                id="monthly-taxes"
                                label="Taxes"
                                value={inputs.monthlyTaxes}
                                onChange={(v) => update("monthlyTaxes", v)}
                            />
                            <MoneyInput
                                id="monthly-insurance"
                                label="Insurance"
                                value={inputs.monthlyInsurance}
                                onChange={(v) => update("monthlyInsurance", v)}
                            />
                        </div>
                        <div className="mt-3">
                            <MoneyInput
                                id="monthly-utilities"
                                label="Utilities / Holding"
                                value={inputs.monthlyUtilities}
                                onChange={(v) => update("monthlyUtilities", v)}
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
                            label="Estimated Gross Profit"
                            value={
                                outputs.isComplete
                                    ? formatCurrency(outputs.grossProfit)
                                    : "—"
                            }
                            variant={outputs.isComplete ? profitVariant : "default"}
                            size="lg"
                        />
                        <KpiCard
                            label="ROI"
                            value={
                                outputs.isComplete ? formatPercent(outputs.roi) : "—"
                            }
                            variant={outputs.isComplete && outputs.roi > 15 ? "success" : "default"}
                            size="lg"
                            sublabel="On cash invested"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <KpiCard
                            label="Annualized ROI"
                            value={
                                outputs.isComplete ? formatPercent(outputs.annualizedROI) : "—"
                            }
                            sublabel={`Over ${inputs.holdingPeriodMonths} months`}
                        />
                        <KpiCard
                            label="Total Financing Cost"
                            value={
                                outputs.isComplete
                                    ? formatCurrency(outputs.totalFinancingCost)
                                    : "—"
                            }
                            sublabel="Interest + points"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <KpiCard
                            label="Cash Invested"
                            value={formatCurrency(outputs.cashInvested)}
                            size="sm"
                        />
                        <KpiCard
                            label="Monthly IO"
                            value={formatCurrency(outputs.monthlyIOPayment)}
                            size="sm"
                            sublabel={`at ${formatPercent(outputs.estimatedRate)}`}
                        />
                        <KpiCard
                            label="Total Cost"
                            value={formatCurrency(outputs.totalCost)}
                            size="sm"
                            sublabel="All-in"
                        />
                    </div>
                </div>
            }
            leadCapture={
                <LeadCapture
                    calculatorType="Fix & Flip"
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
