import { getCreditAdjustment, type CreditBandValue } from "@/lib/constants";
import { calcIOPayment } from "@/lib/format";

export interface FlipInputs {
    purchasePrice: number;
    rehabBudget: number;
    arv: number;
    holdingPeriodMonths: number;
    downPaymentPercent: number;
    pointsPercent: number;
    buyClosingCostPercent: number;
    sellCostPercent: number;
    monthlyTaxes: number;
    monthlyInsurance: number;
    monthlyUtilities: number;
    creditBand: CreditBandValue;
}

export interface FlipOutputs {
    totalProjectCost: number;
    loanAmount: number;
    estimatedRate: number;
    monthlyIOPayment: number;
    totalInterestCost: number;
    totalHoldingCost: number;
    pointsCost: number;
    buyClosingCost: number;
    sellCost: number;
    totalCost: number;
    grossProfit: number;
    cashInvested: number;
    roi: number;
    annualizedROI: number;
    totalFinancingCost: number;
    isComplete: boolean;
}

export const FLIP_BASE_RATE = 11.5;

export function computeFlip(inputs: FlipInputs): FlipOutputs {
    const {
        purchasePrice,
        rehabBudget,
        arv,
        holdingPeriodMonths,
        downPaymentPercent,
        pointsPercent,
        buyClosingCostPercent,
        sellCostPercent,
        monthlyTaxes,
        monthlyInsurance,
        monthlyUtilities,
        creditBand,
    } = inputs;

    const isComplete = purchasePrice > 0 && arv > 0;

    const loanAmount = purchasePrice * (1 - downPaymentPercent / 100);
    const estimatedRate = FLIP_BASE_RATE + getCreditAdjustment(creditBand);

    const monthlyIOPayment = calcIOPayment(loanAmount, estimatedRate);
    const totalInterestCost = monthlyIOPayment * holdingPeriodMonths;

    const pointsCost = (loanAmount * pointsPercent) / 100;
    const buyClosingCost = (purchasePrice * buyClosingCostPercent) / 100;
    const sellCost = (arv * sellCostPercent) / 100;

    const monthlyHolding = monthlyTaxes + monthlyInsurance + monthlyUtilities;
    const totalHoldingCost = monthlyHolding * holdingPeriodMonths;

    const totalFinancingCost = totalInterestCost + pointsCost;
    const totalCost =
        purchasePrice +
        rehabBudget +
        totalFinancingCost +
        buyClosingCost +
        sellCost +
        totalHoldingCost;

    const grossProfit = arv - totalCost;

    const downPayment = purchasePrice * (downPaymentPercent / 100);
    const cashInvested =
        downPayment + rehabBudget + pointsCost + buyClosingCost;
    const roi = cashInvested > 0 ? (grossProfit / cashInvested) * 100 : 0;
    const annualizedROI =
        holdingPeriodMonths > 0 ? roi * (12 / holdingPeriodMonths) : 0;

    const totalProjectCost = purchasePrice + rehabBudget;

    return {
        totalProjectCost,
        loanAmount,
        estimatedRate,
        monthlyIOPayment,
        totalInterestCost,
        totalHoldingCost,
        pointsCost,
        buyClosingCost,
        sellCost,
        totalCost,
        grossProfit,
        cashInvested,
        roi,
        annualizedROI,
        totalFinancingCost,
        isComplete,
    };
}
