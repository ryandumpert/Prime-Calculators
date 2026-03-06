import { getCreditAdjustment, type CreditBandValue } from "@/lib/constants";
import { calcIOPayment } from "@/lib/format";

export interface BridgeInputs {
    purchasePrice: number;
    downPaymentPercent: number;
    termMonths: number;
    pointsPercent: number;
    monthlyHoldingCosts: number;
    creditBand: CreditBandValue;
}

export interface BridgeOutputs {
    loanAmount: number;
    estimatedRate: number;
    monthlyIOPayment: number;
    pointsCost: number;
    totalInterestCost: number;
    totalHoldingCost: number;
    totalLoanCost: number;
    downPayment: number;
    isComplete: boolean;
}

export const BRIDGE_BASE_RATE = 10.5;

export function computeBridge(inputs: BridgeInputs): BridgeOutputs {
    const {
        purchasePrice,
        downPaymentPercent,
        termMonths,
        pointsPercent,
        monthlyHoldingCosts,
        creditBand,
    } = inputs;

    const isComplete = purchasePrice > 0;

    const downPayment = purchasePrice * (downPaymentPercent / 100);
    const loanAmount = purchasePrice - downPayment;
    const estimatedRate = BRIDGE_BASE_RATE + getCreditAdjustment(creditBand);

    const monthlyIOPayment = calcIOPayment(loanAmount, estimatedRate);
    const pointsCost = (loanAmount * pointsPercent) / 100;
    const totalInterestCost = monthlyIOPayment * termMonths;
    const totalHoldingCost = monthlyHoldingCosts * termMonths;
    const totalLoanCost = totalInterestCost + pointsCost + totalHoldingCost;

    return {
        loanAmount,
        estimatedRate,
        monthlyIOPayment,
        pointsCost,
        totalInterestCost,
        totalHoldingCost,
        totalLoanCost,
        downPayment,
        isComplete,
    };
}
