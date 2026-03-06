import { getCreditAdjustment, type CreditBandValue } from "@/lib/constants";
import { calcMonthlyPayment } from "@/lib/format";

export interface CashOutRefiInputs {
    propertyValue: number;
    currentBalance: number;
    maxLtvPercent: number;
    newTermYears: number;
    closingCostPercent: number;
    monthlyTaxes: number;
    monthlyInsurance: number;
    creditBand: CreditBandValue;
}

export interface CashOutRefiOutputs {
    newRate: number;
    maxLoanAmount: number;
    grossCashOut: number;
    closingCosts: number;
    netCashOut: number;
    newLoanAmount: number;
    newPayment: number;
    currentPaymentEstimate: number;
    paymentDifference: number;
    newLtv: number;
    isComplete: boolean;
}

export const CASH_OUT_BASE_RATE = 8.0;

export function computeCashOutRefi(
    inputs: CashOutRefiInputs
): CashOutRefiOutputs {
    const {
        propertyValue,
        currentBalance,
        maxLtvPercent,
        newTermYears,
        closingCostPercent,
        monthlyTaxes,
        monthlyInsurance,
        creditBand,
    } = inputs;

    const isComplete = propertyValue > 0 && currentBalance > 0;

    const newRate = CASH_OUT_BASE_RATE + getCreditAdjustment(creditBand);
    const maxLoanAmount = propertyValue * (maxLtvPercent / 100);
    const grossCashOut = maxLoanAmount - currentBalance;
    const closingCosts = (maxLoanAmount * closingCostPercent) / 100;
    const netCashOut = Math.max(0, grossCashOut - closingCosts);
    const newLoanAmount = maxLoanAmount;
    const newLtv = propertyValue > 0 ? (newLoanAmount / propertyValue) * 100 : 0;

    const newPayment =
        calcMonthlyPayment(newLoanAmount, newRate, newTermYears) +
        monthlyTaxes +
        monthlyInsurance;

    // Estimate current payment for comparison (assume similar remaining term)
    const currentPaymentEstimate =
        calcMonthlyPayment(currentBalance, newRate - 0.5, newTermYears) +
        monthlyTaxes +
        monthlyInsurance;

    const paymentDifference = newPayment - currentPaymentEstimate;

    return {
        newRate,
        maxLoanAmount,
        grossCashOut,
        closingCosts,
        netCashOut,
        newLoanAmount,
        newPayment,
        currentPaymentEstimate,
        paymentDifference,
        newLtv,
        isComplete,
    };
}
