import { getDSCRRate, type CreditBandValue } from "@/lib/constants";
import { calcMonthlyPayment } from "@/lib/format";

export interface RateTermRefiInputs {
    currentBalance: number;
    currentRate: number;
    remainingTermYears: number;
    propertyValue: number;
    monthlyRent: number;
    propertyTaxes: number;
    insurance: number;
    hoa: number;
    otherExpenses: number;
    creditBand: CreditBandValue;
}

export interface RateTermRefiOutputs {
    currentPayment: number;
    newRate: number;
    closingCosts: number;
    newLoanAmount: number;
    newPayment: number;
    monthlySavings: number;
    annualSavings: number;
    breakevenMonths: number;
    lifetimeSavings: number;
    // DSCR outputs
    totalMonthlyExpenses: number;
    noi: number;
    dscr: number;
    monthlyCashflow: number;
    annualCashflow: number;
    ltv: number;
    isComplete: boolean;
}

/** Closing costs are locked at 4% of the new loan amount */
export const REFI_CLOSING_COST_PERCENT = 4;
/** New loan term is always 30 years */
export const REFI_TERM_YEARS = 30;

export function computeRateTermRefi(
    inputs: RateTermRefiInputs
): RateTermRefiOutputs {
    const {
        currentBalance,
        currentRate,
        remainingTermYears,
        propertyValue,
        monthlyRent,
        propertyTaxes,
        insurance,
        hoa,
        otherExpenses,
        creditBand,
    } = inputs;

    const isComplete = currentBalance > 0 && currentRate > 0 && monthlyRent > 0;

    // Current payment based on existing loan terms
    const currentPayment = calcMonthlyPayment(
        currentBalance,
        currentRate,
        remainingTermYears
    );

    // New loan: closing costs are 4% of current balance, rolled into the new loan
    const closingCosts = currentBalance * (REFI_CLOSING_COST_PERCENT / 100);
    const newLoanAmount = currentBalance + closingCosts;
    const newRate = getDSCRRate(creditBand);
    const newPayment = calcMonthlyPayment(
        newLoanAmount,
        newRate,
        REFI_TERM_YEARS
    );

    // Payment comparison
    const monthlySavings = currentPayment - newPayment;
    const annualSavings = monthlySavings * 12;
    const breakevenMonths =
        monthlySavings > 0 ? closingCosts / monthlySavings : Infinity;
    const lifetimeSavings = monthlySavings * REFI_TERM_YEARS * 12 - closingCosts;

    // DSCR calculation
    const totalMonthlyExpenses =
        propertyTaxes + insurance + hoa + otherExpenses;
    const noi = monthlyRent - totalMonthlyExpenses;
    const dscr = newPayment > 0 ? noi / newPayment : 0;
    const monthlyCashflow = noi - newPayment;
    const annualCashflow = monthlyCashflow * 12;

    // LTV
    const ltv = propertyValue > 0 ? (newLoanAmount / propertyValue) * 100 : 0;

    return {
        currentPayment,
        newRate,
        closingCosts,
        newLoanAmount,
        newPayment,
        monthlySavings,
        annualSavings,
        breakevenMonths,
        lifetimeSavings,
        totalMonthlyExpenses,
        noi,
        dscr,
        monthlyCashflow,
        annualCashflow,
        ltv,
        isComplete,
    };
}
