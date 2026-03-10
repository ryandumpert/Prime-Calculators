"use client";

import { useEffect, useMemo, useState } from "react";
import { CalculatorLayout } from "@/components/calculator-layout";
import { DealHealthIndicator } from "@/components/deal-health-indicator";
import { KpiCard } from "@/components/kpi-card";
import { LeadCapture } from "@/components/lead-capture";
import {
    MoneyInput,
    ExpenseInput,
    PercentInput,
    ToggleInput,
    SelectInput,
    type ExpenseFrequency,
} from "@/components/calculator-inputs";
import { computeLTR, type LTRInputs } from "@/lib/calculators/long-term-rental";
import { ltrDealHealth } from "@/lib/deal-health";
import { formatCurrency, formatPercent, formatRatio } from "@/lib/format";
import { CREDIT_BANDS, getDSCRDownPaymentOptions, type CreditBandValue } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export default function LongTermRentalPage() {
    const [inputs, setInputs] = useState<LTRInputs>({
        monthlyGrossRent: 2500,
        propertyTaxes: 250,
        insurance: 125,
        hoa: 0,
        managementEnabled: true,
        managementRate: 8,
        otherExpenses: 0,
        purchasePrice: 300000,
        downPaymentPercent: 20,
        loanTermYears: 30,
        interestOnly: false,
        ioPeriodMonths: 12,
        creditBand: "750+" as CreditBandValue,
    });

    // Available down-payment options based on the selected credit band
    const downPaymentOptions = useMemo(
        () => getDSCRDownPaymentOptions(inputs.creditBand),
        [inputs.creditBand]
    );

    // When the credit band changes, reset the down payment to the tier's default
    // if the current selection is no longer available.
    useEffect(() => {
        if (!downPaymentOptions.options.includes(inputs.downPaymentPercent)) {
            setInputs((prev) => ({
                ...prev,
                downPaymentPercent: downPaymentOptions.defaultPercent,
            }));
        }
    }, [inputs.creditBand]); // eslint-disable-line react-hooks/exhaustive-deps

    const [freqs, setFreqs] = useState<Record<string, ExpenseFrequency>>({
        propertyTaxes: "monthly",
        insurance: "monthly",
        hoa: "monthly",
        otherExpenses: "monthly",
    });

    const update = <K extends keyof LTRInputs>(key: K, value: LTRInputs[K]) => {
        setInputs((prev) => ({ ...prev, [key]: value }));
    };

    const outputs = useMemo(() => computeLTR(inputs), [inputs]);

    const dealHealth = useMemo(() => {
        if (!outputs.isComplete) return null;
        return ltrDealHealth(
            outputs.dscr,
            outputs.monthlyCashflow,
            outputs.estimatedRate
        );
    }, [outputs]);

    const cashflowVariant = outputs.monthlyCashflow >= 0 ? "success" : "danger";
    const dscrVariant =
        outputs.dscr > 1.3 ? "excellent" : outputs.dscr >= 1.21 ? "success" : outputs.dscr >= 1.0 ? "warning" : "danger";

    return (
        <CalculatorLayout
            title="Purchase - Long Term Rental"
            description="Calculate DSCR ratio, estimated payment, and monthly cashflow for long-term rental investment properties."
            assumptions={[
                `DSCR base rate: 6.25% (750+ credit)`,
                `Your estimated rate: ${formatPercent(outputs.estimatedRate)}`,
                `Property management: ${inputs.managementEnabled ? `${inputs.managementRate}%` : "Disabled"}`,
                `Loan term: 30-year fixed`,
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
                            tooltip="Total rent collected before expenses"
                        />
                    </div>

                    <Separator />

                    {/* Expenses */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Expenses
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <ExpenseInput
                                id="taxes"
                                label="Property Taxes"
                                value={inputs.propertyTaxes}
                                onChange={(v) => update("propertyTaxes", v)}
                                frequency={freqs.propertyTaxes}
                                onFrequencyChange={(f) => setFreqs((p) => ({ ...p, propertyTaxes: f }))}
                                tooltip="Property tax amount"
                            />
                            <ExpenseInput
                                id="insurance"
                                label="Insurance"
                                value={inputs.insurance}
                                onChange={(v) => update("insurance", v)}
                                frequency={freqs.insurance}
                                onFrequencyChange={(f) => setFreqs((p) => ({ ...p, insurance: f }))}
                            />
                            <ExpenseInput
                                id="hoa"
                                label="HOA"
                                value={inputs.hoa}
                                onChange={(v) => update("hoa", v)}
                                frequency={freqs.hoa}
                                onFrequencyChange={(f) => setFreqs((p) => ({ ...p, hoa: f }))}
                                tooltip="Homeowners association fee, if applicable"
                            />
                            <ExpenseInput
                                id="other-expenses"
                                label="Other Expenses"
                                value={inputs.otherExpenses}
                                onChange={(v) => update("otherExpenses", v)}
                                frequency={freqs.otherExpenses}
                                onFrequencyChange={(f) => setFreqs((p) => ({ ...p, otherExpenses: f }))}
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
                            <SelectInput
                                id="credit-score"
                                label="Estimated Credit Score"
                                value={inputs.creditBand}
                                onChange={(v) => update("creditBand", v as CreditBandValue)}
                                options={CREDIT_BANDS.map((b) => ({ label: b.label, value: b.value }))}
                                tooltip="Your credit score determines the interest rate and available down payment options"
                            />
                            <MoneyInput
                                id="purchase-price"
                                label="Purchase Price"
                                value={inputs.purchasePrice}
                                onChange={(v) => update("purchasePrice", v)}
                            />
                            <SelectInput
                                id="down-payment"
                                label="Down Payment"
                                value={String(inputs.downPaymentPercent)}
                                onChange={(v) => update("downPaymentPercent", Number(v))}
                                options={downPaymentOptions.options.map((dp) => ({
                                    label: `${dp}%`,
                                    value: String(dp),
                                }))}
                                tooltip="Available down payment options based on your credit score"
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
                            sublabel="Monthly gross rent"
                        />
                    </div>
                </div>
            }
            leadCapture={
                <LeadCapture
                    calculatorType="Purchase - Long Term Rental"
                    inputsSnapshot={inputs as unknown as Record<string, unknown>}
                    outputsSnapshot={outputs as unknown as Record<string, unknown>}
                    dealHealthScore={dealHealth?.score}
                    dealHealthLabel={dealHealth?.label}
                />
            }
        />
    );
}
