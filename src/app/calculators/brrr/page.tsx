"use client";

import { useMemo, useState } from "react";
import { CalculatorLayout } from "@/components/calculator-layout";
import { DealHealthIndicator } from "@/components/deal-health-indicator";
import { KpiCard } from "@/components/kpi-card";
import { LeadCapture } from "@/components/lead-capture";
import { MoneyInput, ExpenseInput, PercentInput, NumberInput, type ExpenseFrequency } from "@/components/calculator-inputs";
import { computeBRRRR, type BRRRRInputs } from "@/lib/calculators/brrr";
import { brrrrDealHealth } from "@/lib/deal-health";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { CreditBandValue } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export default function BRRRRPage() {
    const [inputs, setInputs] = useState<BRRRRInputs>({
        purchasePrice: 150000,
        rehabCost: 40000,
        arv: 250000,
        monthlyRent: 2000,
        vacancyPercent: 5,
        monthlyTaxes: 200,
        monthlyInsurance: 100,
        managementPercent: 8,
        refiLtvPercent: 75,
        refiTermYears: 30,
        closingCostPercent: 2,
        creditBand: "750+" as CreditBandValue,
    });

    const [freqs, setFreqs] = useState<Record<string, ExpenseFrequency>>({
        monthlyTaxes: "monthly",
        monthlyInsurance: "monthly",
    });

    const update = <K extends keyof BRRRRInputs>(
        key: K,
        value: BRRRRInputs[K]
    ) => {
        setInputs((prev) => ({ ...prev, [key]: value }));
    };

    const outputs = useMemo(() => computeBRRRR(inputs), [inputs]);
    const dealHealth = useMemo(() => {
        if (!outputs.isComplete) return null;
        return brrrrDealHealth(
            outputs.cashLeftInDeal,
            outputs.monthlyCashflow,
            outputs.cashBackAtRefi
        );
    }, [outputs]);

    const cashflowVariant = outputs.monthlyCashflow >= 0 ? "success" : "danger";

    return (
        <CalculatorLayout
            title="Fix and Flip - Rent After (BRRRR)"
            description="Full BRRRR analysis: buy, rehab, rent, refinance, and repeat. See cash left in deal and monthly cashflow."
            assumptions={[
                `Base refi rate: 8.50% (before credit adjustment)`,
                `Your estimated rate: ${formatPercent(outputs.refiRate)}`,
                `Vacancy: ${inputs.vacancyPercent}%`,
                `Management: ${inputs.managementPercent}%`,
                `Assumes cash purchase + rehab, then refinance at ARV`,
            ]}
            inputs={
                <div className="space-y-5">
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Buy & Rehab
                        </h3>
                        <div className="space-y-3">
                            <MoneyInput
                                id="purchase-price"
                                label="Purchase Price"
                                value={inputs.purchasePrice}
                                onChange={(v) => update("purchasePrice", v)}
                            />
                            <MoneyInput
                                id="rehab"
                                label="Rehab Cost"
                                value={inputs.rehabCost}
                                onChange={(v) => update("rehabCost", v)}
                            />
                            <MoneyInput
                                id="arv"
                                label="After Repair Value (ARV)"
                                value={inputs.arv}
                                onChange={(v) => update("arv", v)}
                                tooltip="Expected value after renovations"
                            />
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Rent & Expenses
                        </h3>
                        <div className="space-y-3">
                            <MoneyInput
                                id="monthly-rent"
                                label="Monthly Rent"
                                value={inputs.monthlyRent}
                                onChange={(v) => update("monthlyRent", v)}
                            />
                            <PercentInput
                                id="vacancy"
                                label="Vacancy"
                                value={inputs.vacancyPercent}
                                onChange={(v) => update("vacancyPercent", v)}
                                max={30}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <ExpenseInput
                                    id="taxes"
                                    label="Taxes"
                                    value={inputs.monthlyTaxes}
                                    onChange={(v) => update("monthlyTaxes", v)}
                                    frequency={freqs.monthlyTaxes}
                                    onFrequencyChange={(f) => setFreqs((p) => ({ ...p, monthlyTaxes: f }))}
                                />
                                <ExpenseInput
                                    id="insurance"
                                    label="Insurance"
                                    value={inputs.monthlyInsurance}
                                    onChange={(v) => update("monthlyInsurance", v)}
                                    frequency={freqs.monthlyInsurance}
                                    onFrequencyChange={(f) => setFreqs((p) => ({ ...p, monthlyInsurance: f }))}
                                />
                            </div>
                            <PercentInput
                                id="management"
                                label="Property Management"
                                value={inputs.managementPercent}
                                onChange={(v) => update("managementPercent", v)}
                                max={20}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Refinance Terms
                        </h3>
                        <div className="space-y-3">
                            <PercentInput
                                id="refi-ltv"
                                label="Refi LTV"
                                value={inputs.refiLtvPercent}
                                onChange={(v) => update("refiLtvPercent", v)}
                                tooltip="Loan-to-Value for refinance based on ARV"
                                max={90}
                            />
                            <NumberInput
                                id="refi-term"
                                label="Refi Term"
                                value={inputs.refiTermYears}
                                onChange={(v) => update("refiTermYears", v)}
                                unit="years"
                                min={5}
                                max={40}
                            />
                            <PercentInput
                                id="closing-costs"
                                label="Closing Costs"
                                value={inputs.closingCostPercent}
                                onChange={(v) => update("closingCostPercent", v)}
                                max={10}
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
                            label="Cash Left in Deal"
                            value={
                                outputs.isComplete
                                    ? formatCurrency(outputs.cashLeftInDeal)
                                    : "—"
                            }
                            variant={
                                outputs.isComplete && outputs.cashLeftInDeal <= 0
                                    ? "success"
                                    : outputs.cashLeftInDeal < 20000
                                        ? "warning"
                                        : "default"
                            }
                            size="lg"
                            sublabel={
                                outputs.cashLeftInDeal <= 0
                                    ? "All capital recycled!"
                                    : "Still trapped"
                            }
                        />
                        <KpiCard
                            label="Monthly Cashflow"
                            value={
                                outputs.isComplete
                                    ? formatCurrency(outputs.monthlyCashflow)
                                    : "—"
                            }
                            variant={outputs.isComplete ? cashflowVariant : "default"}
                            size="lg"
                            sublabel="After refi payment + expenses"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <KpiCard
                            label="Cash Back at Refi"
                            value={formatCurrency(outputs.cashBackAtRefi)}
                            sublabel="Net of closing costs"
                            variant="primary"
                        />
                        <KpiCard
                            label="Annual Cashflow"
                            value={formatCurrency(outputs.annualCashflow)}
                            variant={outputs.annualCashflow >= 0 ? "success" : "danger"}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <KpiCard
                            label="Total Investment"
                            value={formatCurrency(outputs.totalInvestment)}
                            size="sm"
                            sublabel="Buy + Rehab"
                        />
                        <KpiCard
                            label="Refi Loan"
                            value={formatCurrency(outputs.refiLoanAmount)}
                            size="sm"
                            sublabel={`${inputs.refiLtvPercent}% of ARV`}
                        />
                        <KpiCard
                            label="Cash-on-Cash"
                            value={
                                outputs.isComplete && isFinite(outputs.cashOnCashReturn)
                                    ? formatPercent(outputs.cashOnCashReturn)
                                    : outputs.cashLeftInDeal <= 0
                                        ? "∞"
                                        : "—"
                            }
                            size="sm"
                            sublabel="Annual return"
                        />
                    </div>
                </div>
            }
            leadCapture={
                <LeadCapture
                    calculatorType="Fix and Flip - Rent After (BRRRR)"
                    inputsSnapshot={inputs as unknown as Record<string, unknown>}
                    outputsSnapshot={outputs as unknown as Record<string, unknown>}
                    dealHealthScore={dealHealth?.score}
                    dealHealthLabel={dealHealth?.label}
                />
            }
        />
    );
}
