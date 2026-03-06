import { getCreditAdjustment, type CreditBandValue } from "@/lib/constants";
import { calcMonthlyPayment } from "@/lib/format";

export interface RateTermRefiInputs {
    currentBalance: number;
    currentRate: number;
    remainingTermYears: number;
    newTermYears: number;
    closingCosts: number;
    creditBand: CreditBandValue;
}

export interface RateTermRefiOutputs {
    currentPayment: number;
    newRate: number;
    newPayment: number;
    monthlySavings: number;
    annualSavings: number;
    breakevenMonths: number;
    lifetimeSavings: number;
    isComplete: boolean;
}

export const RATE_TERM_BASE_RATE = 7.5;

export function computeRateTermRefi(
    inputs: RateTermRefiInputs
): RateTermRefiOutputs {
    const {
        currentBalance,
        currentRate,
        remainingTermYears,
        newTermYears,
        closingCosts,
        creditBand,
    } = inputs;

    const isComplete = currentBalance > 0 && currentRate > 0;

    const currentPayment = calcMonthlyPayment(
        currentBalance,
        currentRate,
        remainingTermYears
    );

    const newRate = RATE_TERM_BASE_RATE + getCreditAdjustment(creditBand);
    const newPayment = calcMonthlyPayment(
        currentBalance + closingCosts,
        newRate,
        newTermYears
    );

    const monthlySavings = currentPayment - newPayment;
    const annualSavings = monthlySavings * 12;
    const breakevenMonths =
        monthlySavings > 0 ? closingCosts / monthlySavings : Infinity;
    const lifetimeSavings = monthlySavings * newTermYears * 12 - closingCosts;

    return {
        currentPayment,
        newRate,
        newPayment,
        monthlySavings,
        annualSavings,
        breakevenMonths,
        lifetimeSavings,
        isComplete,
    };
}
