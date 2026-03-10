import { getDSCRRate, type CreditBandValue } from "@/lib/constants";
import { calcMonthlyPayment, calcIOPayment } from "@/lib/format";

export interface LTRInputs {
    monthlyGrossRent: number;
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

export interface LTROutputs {
    effectiveRent: number;
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
    isComplete: boolean;
}


export function computeLTR(inputs: LTRInputs): LTROutputs {
    const {
        monthlyGrossRent,
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

    const isComplete = monthlyGrossRent > 0 && purchasePrice > 0;

    const effectiveRent = monthlyGrossRent;
    const managementCost = managementEnabled
        ? effectiveRent * (managementRate / 100)
        : 0;
    const totalMonthlyExpenses =
        propertyTaxes + insurance + hoa + otherExpenses + managementCost;
    const noi = effectiveRent - totalMonthlyExpenses;

    const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
    const loanAmount = purchasePrice - downPaymentAmount;
    const estimatedRate = getDSCRRate(creditBand);

    const monthlyPayment = interestOnly
        ? calcIOPayment(loanAmount, estimatedRate)
        : calcMonthlyPayment(loanAmount, estimatedRate, loanTermYears);

    const dscr = monthlyPayment > 0 ? noi / monthlyPayment : 0;
    const monthlyCashflow = noi - monthlyPayment;
    const annualCashflow = monthlyCashflow * 12;

    return {
        effectiveRent,
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
        isComplete,
    };
}
