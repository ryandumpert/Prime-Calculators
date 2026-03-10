"use client";

import { useMemo, useState } from "react";
import { CalculatorLayout } from "@/components/calculator-layout";
import { DealHealthIndicator } from "@/components/deal-health-indicator";
import { KpiCard } from "@/components/kpi-card";
import { LeadCapture } from "@/components/lead-capture";
import { MoneyInput, ExpenseInput, PercentInput, NumberInput, SelectInput, type ExpenseFrequency } from "@/components/calculator-inputs";
import {
    computeCashOutRefi,
    type CashOutRefiInputs,
} from "@/lib/calculators/cash-out-refi";
import { cashOutDealHealth } from "@/lib/deal-health";
import { formatCurrency, formatPercent } from "@/lib/format";
import { CREDIT_BANDS, type CreditBandValue } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export default function CashOutRefiPage() {
    const [inputs, setInputs] = useState<CashOutRefiInputs>({
        propertyValue: 500000,
        currentBalance: 300000,
        maxLtvPercent: 75,
        newTermYears: 30,
        closingCostPercent: 2,
        monthlyTaxes: 400,
        monthlyInsurance: 150,
        creditBand: "750+" as CreditBandValue,
    });

    const [freqs, setFreqs] = useState<Record<string, ExpenseFrequency>>({
        monthlyTaxes: "monthly",
        monthlyInsurance: "monthly",
    });

    const update = <K extends keyof CashOutRefiInputs>(
        key: K,
        value: CashOutRefiInputs[K]
    ) => {
        setInputs((prev) => ({ ...prev, [key]: value }));
    };

    const outputs = useMemo(() => computeCashOutRefi(inputs), [inputs]);
    const dealHealth = useMemo(() => {
        if (!outputs.isComplete) return null;
        return cashOutDealHealth(
            outputs.netCashOut,
            outputs.paymentDifference,
            outputs.newLtv
        );
    }, [outputs]);

    return (
        <CalculatorLayout
            title="Refinance - Cash Out"
            description="Calculate net cash-out proceeds and understand the impact on your monthly payment."
            assumptions={[
                `DSCR base rate: 6.25% (750+ credit)`,
                `Your estimated rate: ${formatPercent(outputs.newRate)}`,
                `Closing costs as a percentage of new loan amount`,
            ]}
            inputs={
                <div className="space-y-5">
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Property & Current Loan
                        </h3>
                        <div className="space-y-3">
                            <MoneyInput
                                id="property-value"
                                label="Property Value"
                                value={inputs.propertyValue}
                                onChange={(v) => update("propertyValue", v)}
                                tooltip="Current market value or appraised value"
                            />
                            <MoneyInput
                                id="current-balance"
                                label="Current Loan Balance"
                                value={inputs.currentBalance}
                                onChange={(v) => update("currentBalance", v)}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            New Loan Terms
                        </h3>
                        <div className="space-y-3">
                            <SelectInput
                                id="credit-score"
                                label="Estimated Credit Score"
                                value={inputs.creditBand}
                                onChange={(v) => update("creditBand", v as CreditBandValue)}
                                options={CREDIT_BANDS.map((b) => ({ label: b.label, value: b.value }))}
                                tooltip="Your credit score determines the interest rate used in calculations"
                            />
                            <PercentInput
                                id="max-ltv"
                                label="Max LTV"
                                value={inputs.maxLtvPercent}
                                onChange={(v) => update("maxLtvPercent", v)}
                                tooltip="Maximum Loan-to-Value ratio for cash-out refi"
                                max={95}
                            />
                            <NumberInput
                                id="new-term"
                                label="New Term"
                                value={inputs.newTermYears}
                                onChange={(v) => update("newTermYears", v)}
                                unit="years"
                                min={5}
                                max={40}
                            />
                            <PercentInput
                                id="closing-cost-pct"
                                label="Closing Costs"
                                value={inputs.closingCostPercent}
                                onChange={(v) => update("closingCostPercent", v)}
                                tooltip="As a percentage of the new loan"
                                max={10}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Costs (Optional)
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <ExpenseInput
                                id="monthly-taxes"
                                label="Taxes"
                                value={inputs.monthlyTaxes}
                                onChange={(v) => update("monthlyTaxes", v)}
                                frequency={freqs.monthlyTaxes}
                                onFrequencyChange={(f) => setFreqs((p) => ({ ...p, monthlyTaxes: f }))}
                            />
                            <ExpenseInput
                                id="monthly-insurance"
                                label="Insurance"
                                value={inputs.monthlyInsurance}
                                onChange={(v) => update("monthlyInsurance", v)}
                                frequency={freqs.monthlyInsurance}
                                onFrequencyChange={(f) => setFreqs((p) => ({ ...p, monthlyInsurance: f }))}
                            />
                        </div>
                    </div>
                </div>
            }
            dealHealth={<DealHealthIndicator result={dealHealth} />}
            outputs={
                <div className="space-y-4">
                    <KpiCard
                        label="Net Cash Out"
                        value={
                            outputs.isComplete ? formatCurrency(outputs.netCashOut) : "—"
                        }
                        variant={outputs.isComplete && outputs.netCashOut > 0 ? "success" : "default"}
                        size="lg"
                        sublabel="After closing costs"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <KpiCard
                            label="New Payment"
                            value={
                                outputs.isComplete ? formatCurrency(outputs.newPayment) : "—"
                            }
                            sublabel={`P&I + T&I at ${formatPercent(outputs.newRate)}`}
                            variant="primary"
                        />
                        <KpiCard
                            label="Payment Change"
                            value={
                                outputs.isComplete
                                    ? `${outputs.paymentDifference >= 0 ? "+" : ""}${formatCurrency(outputs.paymentDifference)}`
                                    : "—"
                            }
                            variant={
                                outputs.isComplete && outputs.paymentDifference <= 200
                                    ? "success"
                                    : "warning"
                            }
                            sublabel="vs estimated current"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <KpiCard
                            label="Max Loan"
                            value={formatCurrency(outputs.maxLoanAmount)}
                            size="sm"
                            sublabel={`${inputs.maxLtvPercent}% LTV`}
                        />
                        <KpiCard
                            label="Gross Cash Out"
                            value={formatCurrency(outputs.grossCashOut)}
                            size="sm"
                        />
                        <KpiCard
                            label="Closing Costs"
                            value={formatCurrency(outputs.closingCosts)}
                            size="sm"
                        />
                    </div>
                </div>
            }
            leadCapture={
                <LeadCapture
                    calculatorType="Refinance - Cash Out"
                    inputsSnapshot={inputs as unknown as Record<string, unknown>}
                    outputsSnapshot={outputs as unknown as Record<string, unknown>}
                    dealHealthScore={dealHealth?.score}
                    dealHealthLabel={dealHealth?.label}
                />
            }
        />
    );
}
