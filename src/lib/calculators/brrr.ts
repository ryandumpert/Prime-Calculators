import { getCreditAdjustment, type CreditBandValue } from "@/lib/constants";
import { calcMonthlyPayment } from "@/lib/format";

export interface BRRRRInputs {
    purchasePrice: number;
    rehabCost: number;
    arv: number;
    monthlyRent: number;
    vacancyPercent: number;
    monthlyTaxes: number;
    monthlyInsurance: number;
    managementPercent: number;
    refiLtvPercent: number;
    refiTermYears: number;
    closingCostPercent: number;
    creditBand: CreditBandValue;
}

export interface BRRRROutputs {
    totalInvestment: number;
    refiLoanAmount: number;
    refiRate: number;
    closingCosts: number;
    cashBackAtRefi: number;
    cashLeftInDeal: number;
    effectiveRent: number;
    managementCost: number;
    totalExpenses: number;
    refiMonthlyPayment: number;
    monthlyCashflow: number;
    annualCashflow: number;
    cashOnCashReturn: number;
    isComplete: boolean;
}

export const BRRRR_BASE_RATE = 8.5;

export function computeBRRRR(inputs: BRRRRInputs): BRRRROutputs {
    const {
        purchasePrice,
        rehabCost,
        arv,
        monthlyRent,
        vacancyPercent,
        monthlyTaxes,
        monthlyInsurance,
        managementPercent,
        refiLtvPercent,
        refiTermYears,
        closingCostPercent,
        creditBand,
    } = inputs;

    const isComplete = purchasePrice > 0 && arv > 0 && monthlyRent > 0;

    const totalInvestment = purchasePrice + rehabCost;
    const refiLoanAmount = arv * (refiLtvPercent / 100);
    const refiRate = BRRRR_BASE_RATE + getCreditAdjustment(creditBand);
    const closingCosts = (refiLoanAmount * closingCostPercent) / 100;

    const cashBackAtRefi = refiLoanAmount - closingCosts;
    const cashLeftInDeal = Math.max(0, totalInvestment - cashBackAtRefi);

    const effectiveRent = monthlyRent * (1 - vacancyPercent / 100);
    const managementCost = effectiveRent * (managementPercent / 100);
    const totalExpenses = monthlyTaxes + monthlyInsurance + managementCost;

    const refiMonthlyPayment = calcMonthlyPayment(
        refiLoanAmount,
        refiRate,
        refiTermYears
    );

    const monthlyCashflow = effectiveRent - totalExpenses - refiMonthlyPayment;
    const annualCashflow = monthlyCashflow * 12;
    const cashOnCashReturn =
        cashLeftInDeal > 0 ? (annualCashflow / cashLeftInDeal) * 100 : Infinity;

    return {
        totalInvestment,
        refiLoanAmount,
        refiRate,
        closingCosts,
        cashBackAtRefi,
        cashLeftInDeal,
        effectiveRent,
        managementCost,
        totalExpenses,
        refiMonthlyPayment,
        monthlyCashflow,
        annualCashflow,
        cashOnCashReturn,
        isComplete,
    };
}
