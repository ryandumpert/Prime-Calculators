import { getDSCRRate, type CreditBandValue } from "@/lib/constants";
import { calcMonthlyPayment, calcIOPayment } from "@/lib/format";

export interface STRInputs {
    monthlyGrossRevenue: number;
    occupancyRate: number;
    propertyTaxes: number;
    insurance: number;
    hoa: number;
    managementEnabled: boolean;
    managementRate: number;
    otherExpenses: number;
    purchasePrice: number;
    downPaymentPercent: number;
    loanTermYears: number;
    interestOnly: boolean;
    ioPeriodMonths: number;
    creditBand: CreditBandValue;
}

export interface STROutputs {
    effectiveRevenue: number;
    managementCost: number;
    totalMonthlyExpenses: number;
    noi: number;
    loanAmount: number;
    estimatedRate: number;
    monthlyPayment: number;
    dscr: number;
    monthlyCashflow: number;
    annualCashflow: number;
    downPaymentAmount: number;
    annualGrossRevenue: number;
    capRate: number;
    isComplete: boolean;
}


export function computeSTR(inputs: STRInputs): STROutputs {
    const {
        monthlyGrossRevenue,
        occupancyRate,
        propertyTaxes,
        insurance,
        hoa,
        managementEnabled,
        managementRate,
        otherExpenses,
        purchasePrice,
        downPaymentPercent,
        loanTermYears,
        interestOnly,
        creditBand,
    } = inputs;

    const isComplete = monthlyGrossRevenue > 0 && purchasePrice > 0;

    // Effective revenue accounts for occupancy (vacancy inverse)
    const effectiveRevenue = monthlyGrossRevenue * (occupancyRate / 100);
    const managementCost = managementEnabled
        ? effectiveRevenue * (managementRate / 100)
        : 0;
    const totalMonthlyExpenses =
        propertyTaxes +
        insurance +
        hoa +
        managementCost +
        otherExpenses;
    const noi = effectiveRevenue - totalMonthlyExpenses;

    const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
    const loanAmount = purchasePrice - downPaymentAmount;
    const estimatedRate = getDSCRRate(creditBand);

    const monthlyPayment = interestOnly
        ? calcIOPayment(loanAmount, estimatedRate)
        : calcMonthlyPayment(loanAmount, estimatedRate, loanTermYears);

    const dscr = monthlyPayment > 0 ? noi / monthlyPayment : 0;
    const monthlyCashflow = noi - monthlyPayment;
    const annualCashflow = monthlyCashflow * 12;
    const annualGrossRevenue = effectiveRevenue * 12;
    const annualNOI = noi * 12;
    const capRate = purchasePrice > 0 ? (annualNOI / purchasePrice) * 100 : 0;

    return {
        effectiveRevenue,
        managementCost,
        totalMonthlyExpenses,
        noi,
        loanAmount,
        estimatedRate,
        monthlyPayment,
        dscr,
        monthlyCashflow,
        annualCashflow,
        downPaymentAmount,
        annualGrossRevenue,
        capRate,
        isComplete,
    };
}
