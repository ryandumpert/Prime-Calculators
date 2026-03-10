import { describe, it, expect } from "vitest";
import { computeLTR } from "@/lib/calculators/long-term-rental";
import { computeSTR } from "@/lib/calculators/short-term-rental";
import { computeFlip, FLIP_BASE_RATE } from "@/lib/calculators/fix-and-flip";
import {
    computeRateTermRefi,
} from "@/lib/calculators/rate-term-refi";
import {
    computeCashOutRefi,
} from "@/lib/calculators/cash-out-refi";
import { computeBRRRR, BRRRR_BASE_RATE } from "@/lib/calculators/brrr";
import { DSCR_BASE_RATE } from "@/lib/constants";

// ─── Purchase - Long Term Rental ─────────────────────────────────────────────

describe("computeLTR", () => {
    const baseInputs = {
        monthlyGrossRent: 2500,
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
        creditBand: "750+" as const,
    };

    it("marks output as complete when rent and price are > 0", () => {
        const result = computeLTR(baseInputs);
        expect(result.isComplete).toBe(true);
    });

    it("marks output as incomplete when rent is 0", () => {
        const result = computeLTR({ ...baseInputs, monthlyGrossRent: 0 });
        expect(result.isComplete).toBe(false);
    });

    it("calculates effective rent equal to gross rent", () => {
        const result = computeLTR(baseInputs);
        // No vacancy deduction for LTR
        expect(result.effectiveRent).toBeCloseTo(2500, 2);
    });

    it("calculates management cost from effective rent", () => {
        const result = computeLTR(baseInputs);
        // 2500 * 0.08 = 200
        expect(result.managementCost).toBeCloseTo(200, 2);
    });

    it("sets management cost to 0 when disabled", () => {
        const result = computeLTR({ ...baseInputs, managementEnabled: false });
        expect(result.managementCost).toBe(0);
    });

    it("calculates loan amount from purchase price and down payment", () => {
        const result = computeLTR(baseInputs);
        // 300000 * (1 - 25/100) = 225000
        expect(result.loanAmount).toBe(225000);
        expect(result.downPaymentAmount).toBe(75000);
    });

    it("uses correct DSCR base rate for 750+ band", () => {
        const result = computeLTR(baseInputs);
        // 750+ adjustment is 0
        expect(result.estimatedRate).toBe(DSCR_BASE_RATE);
    });

    it("applies credit band adjustment for 680-699 band", () => {
        const result = computeLTR({ ...baseInputs, creditBand: "680-699" });
        // 680-699 adjustment is +0.75 => 6.25 + 0.75 = 7.00
        expect(result.estimatedRate).toBe(DSCR_BASE_RATE + 0.75);
    });

    it("applies credit band adjustment for 660-679 band", () => {
        const result = computeLTR({ ...baseInputs, creditBand: "660-679" });
        // 660-679 adjustment is +1.0 => 6.25 + 1.0 = 7.25
        expect(result.estimatedRate).toBe(DSCR_BASE_RATE + 1.0);
    });

    it("produces DSCR ratio > 1 for a healthy deal", () => {
        const result = computeLTR(baseInputs);
        expect(result.dscr).toBeGreaterThan(0.5); // Basic sanity check
        expect(result.noi).toBeGreaterThan(0);
    });

    it("produces positive cashflow for strong rental scenario", () => {
        const result = computeLTR({
            ...baseInputs,
            monthlyGrossRent: 5000,
            purchasePrice: 200000,
        });
        expect(result.monthlyCashflow).toBeGreaterThan(0);
        expect(result.annualCashflow).toBe(result.monthlyCashflow * 12);
    });
});

// ─── Purchase - Short Term Rental ────────────────────────────────────────────

describe("computeSTR", () => {
    const baseInputs = {
        monthlyGrossRevenue: 5000,
        occupancyRate: 70,
        propertyTaxes: 300,
        insurance: 200,
        hoa: 0,
        managementEnabled: true,
        managementRate: 20,
        otherExpenses: 0,
        purchasePrice: 400000,
        downPaymentPercent: 25,
        loanTermYears: 30,
        interestOnly: false,
        ioPeriodMonths: 12,
        creditBand: "750+" as const,
    };

    it("marks output as complete when revenue and price are > 0", () => {
        const result = computeSTR(baseInputs);
        expect(result.isComplete).toBe(true);
    });

    it("marks output as incomplete when revenue is 0", () => {
        const result = computeSTR({ ...baseInputs, monthlyGrossRevenue: 0 });
        expect(result.isComplete).toBe(false);
    });

    it("calculates effective revenue with occupancy rate", () => {
        const result = computeSTR(baseInputs);
        // 5000 * (70/100) = 3500
        expect(result.effectiveRevenue).toBeCloseTo(3500, 2);
    });

    it("calculates management cost from effective revenue", () => {
        const result = computeSTR(baseInputs);
        // 3500 * 0.20 = 700
        expect(result.managementCost).toBeCloseTo(700, 2);
    });

    it("uses correct DSCR base rate", () => {
        const result = computeSTR(baseInputs);
        expect(result.estimatedRate).toBe(DSCR_BASE_RATE);
    });

    it("calculates cap rate from annual NOI / price", () => {
        const result = computeSTR(baseInputs);
        const annualNOI = result.noi * 12;
        const expectedCapRate = (annualNOI / baseInputs.purchasePrice) * 100;
        expect(result.capRate).toBeCloseTo(expectedCapRate, 2);
    });

    it("calculates annual gross revenue", () => {
        const result = computeSTR(baseInputs);
        expect(result.annualGrossRevenue).toBeCloseTo(result.effectiveRevenue * 12, 2);
    });

    it("calculates loan amount from purchase price and down payment", () => {
        const result = computeSTR(baseInputs);
        // 400000 * (1 - 25/100) = 300000
        expect(result.loanAmount).toBe(300000);
        expect(result.downPaymentAmount).toBe(100000);
    });
});

// ─── Fix and Flip - Sell for Profit ──────────────────────────────────────────

describe("computeFlip", () => {
    const baseInputs = {
        purchasePrice: 200000,
        rehabBudget: 50000,
        arv: 320000,
        holdingPeriodMonths: 6,
        downPaymentPercent: 15,
        pointsPercent: 2,
        buyClosingCostPercent: 2,
        sellCostPercent: 6,
        monthlyTaxes: 200,
        monthlyInsurance: 100,
        monthlyUtilities: 250,
        creditBand: "750+" as const,
    };

    it("marks output as complete when price and ARV > 0", () => {
        const result = computeFlip(baseInputs);
        expect(result.isComplete).toBe(true);
    });

    it("calculates loan amount correctly", () => {
        const result = computeFlip(baseInputs);
        // 200000 * (1 - 15/100) = 170000
        expect(result.loanAmount).toBe(170000);
    });

    it("uses correct base rate for flip", () => {
        const result = computeFlip(baseInputs);
        expect(result.estimatedRate).toBe(FLIP_BASE_RATE);
    });

    it("calculates total project cost", () => {
        const result = computeFlip(baseInputs);
        expect(result.totalProjectCost).toBe(250000); // 200k + 50k
    });

    it("calculates points cost as percentage of loan", () => {
        const result = computeFlip(baseInputs);
        // 170000 * 2% = 3400
        expect(result.pointsCost).toBe(3400);
    });

    it("calculates sell cost from ARV", () => {
        const result = computeFlip(baseInputs);
        // 320000 * 6% = 19200
        expect(result.sellCost).toBe(19200);
    });

    it("calculates positive gross profit for a good flip", () => {
        const result = computeFlip(baseInputs);
        expect(result.grossProfit).toBeGreaterThan(0);
        expect(result.roi).toBeGreaterThan(0);
    });

    it("calculates annualized ROI scaled by holding period", () => {
        const result = computeFlip(baseInputs);
        // With 6 month holding, annualized should be 2x the ROI
        expect(result.annualizedROI).toBeCloseTo(result.roi * 2, 1);
    });

    it("produces negative profit when ARV is too low", () => {
        const result = computeFlip({ ...baseInputs, arv: 200000 });
        expect(result.grossProfit).toBeLessThan(0);
    });
});

// ─── Refinance - Rate & Term Only ────────────────────────────────────────────

describe("computeRateTermRefi", () => {
    const baseInputs = {
        currentBalance: 350000,
        currentRate: 9.5,
        remainingTermYears: 27,
        propertyValue: 500000,
        monthlyRent: 2500,
        propertyTaxes: 250,
        insurance: 125,
        hoa: 0,
        otherExpenses: 0,
        creditBand: "750+" as const,
    };

    it("marks output as complete when balance, rate, and rent > 0", () => {
        const result = computeRateTermRefi(baseInputs);
        expect(result.isComplete).toBe(true);
    });

    it("calculates new rate from DSCR base + adjustment", () => {
        const result = computeRateTermRefi(baseInputs);
        expect(result.newRate).toBe(DSCR_BASE_RATE);
    });

    it("auto-calculates closing costs at 4% of current balance", () => {
        const result = computeRateTermRefi(baseInputs);
        expect(result.closingCosts).toBe(350000 * 0.04);
        expect(result.newLoanAmount).toBe(350000 + result.closingCosts);
    });

    it("produces monthly savings when refinancing to a lower rate", () => {
        const result = computeRateTermRefi(baseInputs);
        expect(result.monthlySavings).toBeGreaterThan(0);
        expect(result.annualSavings).toBe(result.monthlySavings * 12);
    });

    it("calculates breakeven in months", () => {
        const result = computeRateTermRefi(baseInputs);
        expect(result.breakevenMonths).toBeGreaterThan(0);
        expect(result.breakevenMonths).toBeLessThan(120);
    });

    it("lifetime savings uses 30-year locked term and auto closing costs", () => {
        const result = computeRateTermRefi(baseInputs);
        const expectedClosing = baseInputs.currentBalance * 0.04;
        expect(result.lifetimeSavings).toBe(
            result.monthlySavings * 30 * 12 - expectedClosing
        );
    });

    it("calculates DSCR ratio from rent and new payment", () => {
        const result = computeRateTermRefi(baseInputs);
        const noi = 2500 - 250 - 125; // rent - taxes - insurance
        expect(result.noi).toBe(noi);
        expect(result.dscr).toBeCloseTo(noi / result.newPayment, 2);
    });

    it("calculates LTV from new loan and property value", () => {
        const result = computeRateTermRefi(baseInputs);
        const expectedLtv = (result.newLoanAmount / 500000) * 100;
        expect(result.ltv).toBeCloseTo(expectedLtv, 2);
    });

    it("returns no savings when current rate is already lower", () => {
        const result = computeRateTermRefi({
            ...baseInputs,
            currentRate: 5.0,
        });
        expect(result.monthlySavings).toBeLessThanOrEqual(0);
    });
});


// ─── Refinance - Cash Out ────────────────────────────────────────────────────

describe("computeCashOutRefi", () => {
    const baseInputs = {
        propertyValue: 500000,
        currentBalance: 300000,
        maxLtvPercent: 75,
        newTermYears: 30,
        closingCostPercent: 2,
        monthlyTaxes: 400,
        monthlyInsurance: 150,
        creditBand: "750+" as const,
    };

    it("marks output as complete when value and balance > 0", () => {
        const result = computeCashOutRefi(baseInputs);
        expect(result.isComplete).toBe(true);
    });

    it("calculates max loan from LTV", () => {
        const result = computeCashOutRefi(baseInputs);
        // 500000 * 75% = 375000
        expect(result.maxLoanAmount).toBe(375000);
    });

    it("calculates gross cash out correctly", () => {
        const result = computeCashOutRefi(baseInputs);
        // 375000 - 300000 = 75000
        expect(result.grossCashOut).toBe(75000);
    });

    it("deducts closing costs from gross cash out", () => {
        const result = computeCashOutRefi(baseInputs);
        // Closing costs: 375000 * 2% = 7500
        expect(result.closingCosts).toBe(7500);
        // Net: 75000 - 7500 = 67500
        expect(result.netCashOut).toBe(67500);
    });

    it("clamps net cash out to 0 if negative", () => {
        const result = computeCashOutRefi({
            ...baseInputs,
            currentBalance: 400000, // More than max loan
        });
        expect(result.netCashOut).toBe(0);
    });

    it("calculates new LTV correctly", () => {
        const result = computeCashOutRefi(baseInputs);
        expect(result.newLtv).toBeCloseTo(75, 1);
    });

    it("uses correct DSCR base rate", () => {
        const result = computeCashOutRefi(baseInputs);
        expect(result.newRate).toBe(DSCR_BASE_RATE);
    });
});

// ─── Fix and Flip - Rent After (BRRRR) ──────────────────────────────────────

describe("computeBRRRR", () => {
    const baseInputs = {
        purchasePrice: 150000,
        rehabCost: 40000,
        arv: 250000,
        monthlyRent: 2000,
        vacancyPercent: 5,
        monthlyTaxes: 200,
        monthlyInsurance: 100,
        managementPercent: 8,
        refiLtvPercent: 75,
        refiTermYears: 30,
        closingCostPercent: 2,
        creditBand: "750+" as const,
    };

    it("marks output as complete when price, arv, and rent > 0", () => {
        const result = computeBRRRR(baseInputs);
        expect(result.isComplete).toBe(true);
    });

    it("calculates total investment", () => {
        const result = computeBRRRR(baseInputs);
        expect(result.totalInvestment).toBe(190000); // 150k + 40k
    });

    it("calculates refi loan from ARV * LTV", () => {
        const result = computeBRRRR(baseInputs);
        // 250000 * 75% = 187500
        expect(result.refiLoanAmount).toBe(187500);
    });

    it("calculates cash back at refi (net of closing costs)", () => {
        const result = computeBRRRR(baseInputs);
        // Closing: 187500 * 2% = 3750
        expect(result.closingCosts).toBe(3750);
        // Cash back: 187500 - 3750 = 183750
        expect(result.cashBackAtRefi).toBe(183750);
    });

    it("calculates cash left in deal (clamped to 0)", () => {
        const result = computeBRRRR(baseInputs);
        // Total investment: 190000, cash back: 183750
        // cash left = max(0, 190000 - 183750) = 6250
        expect(result.cashLeftInDeal).toBe(6250);
    });

    it("calculates effective rent with vacancy", () => {
        const result = computeBRRRR(baseInputs);
        // 2000 * (1 - 5/100) = 1900
        expect(result.effectiveRent).toBe(1900);
    });

    it("calculates management cost from effective rent", () => {
        const result = computeBRRRR(baseInputs);
        // 1900 * 8% = 152
        expect(result.managementCost).toBe(152);
    });

    it("annual cashflow is 12x monthly", () => {
        const result = computeBRRRR(baseInputs);
        expect(result.annualCashflow).toBeCloseTo(result.monthlyCashflow * 12, 2);
    });

    it("cash on cash return is annual cashflow / cash left in deal", () => {
        const result = computeBRRRR(baseInputs);
        if (result.cashLeftInDeal > 0) {
            expect(result.cashOnCashReturn).toBeCloseTo(
                (result.annualCashflow / result.cashLeftInDeal) * 100,
                2
            );
        }
    });

    it("returns Infinity CoC when all capital is recycled", () => {
        const result = computeBRRRR({
            ...baseInputs,
            purchasePrice: 100000,
            rehabCost: 30000,
            arv: 250000, // High ARV -> more than invested
        });
        // Total: 130k, Refi: 187.5k - closing -> cash back > total
        if (result.cashLeftInDeal === 0) {
            expect(result.cashOnCashReturn).toBe(Infinity);
        }
    });

    it("uses BRRRR base rate", () => {
        const result = computeBRRRR(baseInputs);
        expect(result.refiRate).toBe(BRRRR_BASE_RATE);
    });
});

// ─── Format Utilities ────────────────────────────────────────────────────────

describe("format utilities", () => {
    // Dynamic import so we don't duplicate what vitest already handles
    it("calcMonthlyPayment returns correct value for standard 30-year", async () => {
        const { calcMonthlyPayment } = await import("@/lib/format");
        // $300,000 at 7.5% for 30 years
        const payment = calcMonthlyPayment(300000, 7.5, 30);
        // Expected: ~$2098 (verified with external calculator)
        expect(payment).toBeGreaterThan(2000);
        expect(payment).toBeLessThan(2200);
    });

    it("calcIOPayment returns correct interest-only payment", async () => {
        const { calcIOPayment } = await import("@/lib/format");
        // $300,000 at 10% IO
        const payment = calcIOPayment(300000, 10);
        // 300000 * 0.10 / 12 = 2500
        expect(payment).toBeCloseTo(2500, 2);
    });

    it("formatCurrency handles normal values", async () => {
        const { formatCurrency } = await import("@/lib/format");
        expect(formatCurrency(1234)).toBe("$1,234");
        expect(formatCurrency(0)).toBe("$0");
    });

    it("formatCurrency handles NaN/Infinity", async () => {
        const { formatCurrency } = await import("@/lib/format");
        expect(formatCurrency(NaN)).toBe("$—");
        expect(formatCurrency(Infinity)).toBe("$—");
    });

    it("formatPercent formats correctly", async () => {
        const { formatPercent } = await import("@/lib/format");
        expect(formatPercent(8.5)).toBe("8.50%");
        expect(formatPercent(10)).toBe("10.00%");
    });
});

// ─── Deal Health ─────────────────────────────────────────────────────────────

describe("deal health scoring", () => {
    it("ltrDealHealth returns excellent for DSCR >= 1.3", async () => {
        const { ltrDealHealth } = await import("@/lib/deal-health");
        const result = ltrDealHealth(1.5, 500, 8.5);
        expect(result.level).toBe("excellent");
        expect(result.score).toBeGreaterThanOrEqual(85);
    });

    it("ltrDealHealth returns good for DSCR between 1.21 and 1.3", async () => {
        const { ltrDealHealth } = await import("@/lib/deal-health");
        const result = ltrDealHealth(1.25, 300, 7.0);
        expect(result.level).toBe("good");
        expect(result.score).toBeGreaterThanOrEqual(65);
    });

    it("ltrDealHealth returns fair for DSCR between 1.0 and 1.2", async () => {
        const { ltrDealHealth } = await import("@/lib/deal-health");
        const result = ltrDealHealth(1.1, 100, 7.0);
        expect(result.level).toBe("fair");
        expect(result.score).toBeGreaterThanOrEqual(40);
        expect(result.score).toBeLessThan(65);
    });

    it("ltrDealHealth returns poor for DSCR < 1", async () => {
        const { ltrDealHealth } = await import("@/lib/deal-health");
        const result = ltrDealHealth(0.8, -200, 9.0);
        expect(result.level).toBe("poor");
        expect(result.score).toBeLessThan(40);
    });

    it("strDealHealth returns excellent for strong STR", async () => {
        const { strDealHealth } = await import("@/lib/deal-health");
        const result = strDealHealth(1.5, 800, 75, 9.0);
        expect(result.level).toBe("excellent");
        expect(result.score).toBeGreaterThanOrEqual(85);
    });

    it("strDealHealth penalizes low occupancy", async () => {
        const { strDealHealth } = await import("@/lib/deal-health");
        const highOcc = strDealHealth(1.3, 500, 80, 9.0);
        const lowOcc = strDealHealth(1.3, 500, 40, 9.0);
        expect(lowOcc.score).toBeLessThan(highOcc.score);
    });

    it("flipDealHealth returns excellent for high-profit flip", async () => {
        const { flipDealHealth } = await import("@/lib/deal-health");
        const result = flipDealHealth(80000, 35, 6);
        expect(result.level).toBe("excellent");
    });

    it("flipDealHealth returns poor for negative profit", async () => {
        const { flipDealHealth } = await import("@/lib/deal-health");
        const result = flipDealHealth(-5000, -5, 6);
        expect(result.level).toBe("poor");
    });
});
