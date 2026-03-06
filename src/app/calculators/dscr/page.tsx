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
    ToggleInput,
} from "@/components/calculator-inputs";
import { computeDSCR, type DSCRInputs } from "@/lib/calculators/dscr";
import { dscrDealHealth } from "@/lib/deal-health";
import { formatCurrency, formatPercent, formatRatio } from "@/lib/format";
import type { CreditBandValue } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export default function DSCRCalculatorPage() {
    const [inputs, setInputs] = useState<DSCRInputs>({
        monthlyGrossRent: 2500,
        vacancyRate: 5,
        propertyTaxes: 250,
        insurance: 125,
        hoa: 0,
        managementEnabled: true,
        managementRate: 8,
        otherExpenses: 0,
        purchasePrice: 300000,
        downPaymentPercent: 25,
        loanTermYears: 30,
        interestOnly: false,
        ioPeriodMonths: 12,
        creditBand: "720-759" as CreditBandValue,
    });

    const update = <K extends keyof DSCRInputs>(key: K, value: DSCRInputs[K]) => {
        setInputs((prev) => ({ ...prev, [key]: value }));
    };

    const outputs = useMemo(() => computeDSCR(inputs), [inputs]);

    const dealHealth = useMemo(() => {
        if (!outputs.isComplete) return null;
        return dscrDealHealth(
            outputs.dscr,
            outputs.monthlyCashflow,
            outputs.estimatedRate
        );
    }, [outputs]);

    const cashflowVariant = outputs.monthlyCashflow >= 0 ? "success" : "danger";
    const dscrVariant =
        outputs.dscr >= 1.25 ? "success" : outputs.dscr >= 1.0 ? "warning" : "danger";

    return (
        <CalculatorLayout
            title="DSCR Ratio + Cashflow Calculator"
            description="Quickly evaluate investment property DSCR, estimated payment, and monthly cashflow."
            assumptions={[
                `Base rate estimate: 8.50% (before credit adjustment)`,
                `Your estimated rate: ${formatPercent(outputs.estimatedRate)}`,
                `Vacancy default: ${inputs.vacancyRate}%`,
                `Property management: ${inputs.managementEnabled ? `${inputs.managementRate}%` : "Disabled"}`,
                `Loan type: ${inputs.interestOnly ? "Interest-Only" : "Fully Amortizing"}`,
            ]}
            inputs={
                <div className="space-y-5">
                    {/* Income */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Rental Income
                        </h3>
                        <MoneyInput
                            id="gross-rent"
                            label="Monthly Gross Rent"
                            value={inputs.monthlyGrossRent}
                            onChange={(v) => update("monthlyGrossRent", v)}
                            tooltip="Total rent collected before vacancy or expenses"
                        />
                        <div className="mt-3">
                            <PercentInput
                                id="vacancy"
                                label="Vacancy Rate"
                                value={inputs.vacancyRate}
                                onChange={(v) => update("vacancyRate", v)}
                                tooltip="Estimated percentage of time the unit is vacant"
                                max={50}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Expenses */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Monthly Expenses
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <MoneyInput
                                id="taxes"
                                label="Property Taxes"
                                value={inputs.propertyTaxes}
                                onChange={(v) => update("propertyTaxes", v)}
                                tooltip="Monthly property tax amount"
                            />
                            <MoneyInput
                                id="insurance"
                                label="Insurance"
                                value={inputs.insurance}
                                onChange={(v) => update("insurance", v)}
                            />
                            <MoneyInput
                                id="hoa"
                                label="HOA"
                                value={inputs.hoa}
                                onChange={(v) => update("hoa", v)}
                                tooltip="Monthly homeowners association fee, if applicable"
                            />
                            <MoneyInput
                                id="other-expenses"
                                label="Other Expenses"
                                value={inputs.otherExpenses}
                                onChange={(v) => update("otherExpenses", v)}
                            />
                        </div>
                        <div className="mt-3 space-y-3">
                            <ToggleInput
                                id="management-toggle"
                                label="Property Management"
                                checked={inputs.managementEnabled}
                                onChange={(v) => update("managementEnabled", v)}
                                tooltip="Professional property management fee"
                            />
                            {inputs.managementEnabled && (
                                <PercentInput
                                    id="management-rate"
                                    label="Management Rate"
                                    value={inputs.managementRate}
                                    onChange={(v) => update("managementRate", v)}
                                    max={20}
                                />
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Loan Details */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Loan Details
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
                                tooltip="Percentage of purchase price"
                                max={90}
                            />
                            <NumberInput
                                id="loan-term"
                                label="Loan Term"
                                value={inputs.loanTermYears}
                                onChange={(v) => update("loanTermYears", v)}
                                unit="years"
                                min={1}
                                max={40}
                            />
                            <ToggleInput
                                id="io-toggle"
                                label="Interest Only"
                                checked={inputs.interestOnly}
                                onChange={(v) => update("interestOnly", v)}
                                tooltip="Interest-only period with deferred principal"
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
                            label="DSCR Ratio"
                            value={outputs.isComplete ? formatRatio(outputs.dscr) : "—"}
                            variant={outputs.isComplete ? dscrVariant : "default"}
                            size="lg"
                            sublabel="Debt Service Coverage"
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
                            sublabel="After all expenses"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <KpiCard
                            label="Monthly Payment"
                            value={
                                outputs.isComplete
                                    ? formatCurrency(outputs.monthlyPayment)
                                    : "—"
                            }
                            sublabel={`at ${formatPercent(outputs.estimatedRate)}`}
                        />
                        <KpiCard
                            label="Monthly NOI"
                            value={
                                outputs.isComplete ? formatCurrency(outputs.noi) : "—"
                            }
                            sublabel="Net Operating Income"
                        />
                        <KpiCard
                            label="Annual Cashflow"
                            value={
                                outputs.isComplete
                                    ? formatCurrency(outputs.annualCashflow)
                                    : "—"
                            }
                            variant={outputs.isComplete && outputs.annualCashflow >= 0 ? "success" : "default"}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <KpiCard
                            label="Loan Amount"
                            value={formatCurrency(outputs.loanAmount)}
                            size="sm"
                        />
                        <KpiCard
                            label="Down Payment"
                            value={formatCurrency(outputs.downPaymentAmount)}
                            size="sm"
                        />
                        <KpiCard
                            label="Effective Rent"
                            value={formatCurrency(outputs.effectiveRent)}
                            size="sm"
                            sublabel="After vacancy"
                        />
                    </div>
                </div>
            }
            leadCapture={
                <LeadCapture
                    calculatorType="DSCR"
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
