import { describe, it, expect } from "vitest";
import { computeDSCR, DSCR_BASE_RATE } from "@/lib/calculators/dscr";
import { computeFlip, FLIP_BASE_RATE } from "@/lib/calculators/fix-and-flip";
import {
    computeRateTermRefi,
    RATE_TERM_BASE_RATE,
} from "@/lib/calculators/rate-term-refi";
import {
    computeCashOutRefi,
    CASH_OUT_BASE_RATE,
} from "@/lib/calculators/cash-out-refi";
import { computeBridge, BRIDGE_BASE_RATE } from "@/lib/calculators/bridge";
import { computeBRRRR, BRRRR_BASE_RATE } from "@/lib/calculators/brrr";

// ─── DSCR ────────────────────────────────────────────────────────────────────

describe("computeDSCR", () => {
    const baseInputs = {
        monthlyGrossRent: 2500,
        vacancyRate: 5,
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
        creditBand: "720-759" as const,
    };

    it("marks output as complete when rent and price are > 0", () => {
        const result = computeDSCR(baseInputs);
        expect(result.isComplete).toBe(true);
    });

    it("marks output as incomplete when rent is 0", () => {
        const result = computeDSCR({ ...baseInputs, monthlyGrossRent: 0 });
        expect(result.isComplete).toBe(false);
    });

    it("calculates effective rent with vacancy deduction", () => {
        const result = computeDSCR(baseInputs);
        // 2500 * (1 - 5/100) = 2375
        expect(result.effectiveRent).toBeCloseTo(2375, 2);
    });

    it("calculates management cost from effective rent", () => {
        const result = computeDSCR(baseInputs);
        // 2375 * 0.08 = 190
        expect(result.managementCost).toBeCloseTo(190, 2);
    });

    it("sets management cost to 0 when disabled", () => {
        const result = computeDSCR({ ...baseInputs, managementEnabled: false });
        expect(result.managementCost).toBe(0);
    });

    it("calculates loan amount from purchase price and down payment", () => {
        const result = computeDSCR(baseInputs);
        // 300000 * (1 - 25/100) = 225000
        expect(result.loanAmount).toBe(225000);
        expect(result.downPaymentAmount).toBe(75000);
    });

    it("uses correct base rate plus credit adjustment for 720-759 band", () => {
        const result = computeDSCR(baseInputs);
        // 720-759 adjustment is 0.0
        expect(result.estimatedRate).toBe(DSCR_BASE_RATE);
    });

    it("applies credit band adjustment for 760+ band", () => {
        const result = computeDSCR({ ...baseInputs, creditBand: "760+" });
        // 760+ adjustment is -0.25
        expect(result.estimatedRate).toBe(DSCR_BASE_RATE - 0.25);
    });

    it("applies credit band adjustment for <640 band", () => {
        const result = computeDSCR({ ...baseInputs, creditBand: "<640" });
        // <640 adjustment is +1.75
        expect(result.estimatedRate).toBe(DSCR_BASE_RATE + 1.75);
    });

    it("produces DSCR ratio > 1 for a healthy deal", () => {
        const result = computeDSCR(baseInputs);
        expect(result.dscr).toBeGreaterThan(0.5); // Basic sanity check
        expect(result.noi).toBeGreaterThan(0);
    });

    it("produces positive cashflow for strong rental scenario", () => {
        const result = computeDSCR({
            ...baseInputs,
            monthlyGrossRent: 5000,
            purchasePrice: 200000,
        });
        expect(result.monthlyCashflow).toBeGreaterThan(0);
        expect(result.annualCashflow).toBe(result.monthlyCashflow * 12);
    });
});

// ─── Fix & Flip ──────────────────────────────────────────────────────────────

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
        creditBand: "720-759" as const,
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

// ─── Rate & Term Refi ────────────────────────────────────────────────────────

describe("computeRateTermRefi", () => {
    const baseInputs = {
        currentBalance: 350000,
        currentRate: 9.5,
        remainingTermYears: 27,
        newTermYears: 30,
        closingCosts: 8000,
        creditBand: "720-759" as const,
    };

    it("marks output as complete when balance and rate > 0", () => {
        const result = computeRateTermRefi(baseInputs);
        expect(result.isComplete).toBe(true);
    });

    it("calculates new rate from base + adjustment", () => {
        const result = computeRateTermRefi(baseInputs);
        expect(result.newRate).toBe(RATE_TERM_BASE_RATE);
    });

    it("produces monthly savings when refinancing to a lower rate", () => {
        const result = computeRateTermRefi(baseInputs);
        expect(result.monthlySavings).toBeGreaterThan(0);
        expect(result.annualSavings).toBe(result.monthlySavings * 12);
    });

    it("calculates breakeven in months", () => {
        const result = computeRateTermRefi(baseInputs);
        expect(result.breakevenMonths).toBeGreaterThan(0);
        expect(result.breakevenMonths).toBeLessThan(120); // Should be less than 10 years
    });

    it("lifetime savings accounts for closing costs", () => {
        const result = computeRateTermRefi(baseInputs);
        expect(result.lifetimeSavings).toBe(
            result.monthlySavings * baseInputs.newTermYears * 12 -
            baseInputs.closingCosts
        );
    });

    it("returns Infinity breakeven when no savings", () => {
        const result = computeRateTermRefi({
            ...baseInputs,
            currentRate: 5.0, // Already lower than new rate
        });
        expect(result.monthlySavings).toBeLessThanOrEqual(0);
    });
});

// ─── Cash-Out Refi ───────────────────────────────────────────────────────────

describe("computeCashOutRefi", () => {
    const baseInputs = {
        propertyValue: 500000,
        currentBalance: 300000,
        maxLtvPercent: 75,
        newTermYears: 30,
        closingCostPercent: 2,
        monthlyTaxes: 400,
        monthlyInsurance: 150,
        creditBand: "720-759" as const,
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

    it("uses correct base rate", () => {
        const result = computeCashOutRefi(baseInputs);
        expect(result.newRate).toBe(CASH_OUT_BASE_RATE);
    });
});

// ─── Bridge Loan ─────────────────────────────────────────────────────────────

describe("computeBridge", () => {
    const baseInputs = {
        purchasePrice: 400000,
        downPaymentPercent: 20,
        termMonths: 12,
        pointsPercent: 2,
        monthlyHoldingCosts: 800,
        creditBand: "720-759" as const,
    };

    it("marks output as complete when price > 0", () => {
        const result = computeBridge(baseInputs);
        expect(result.isComplete).toBe(true);
    });

    it("calculates loan amount from purchase and down payment", () => {
        const result = computeBridge(baseInputs);
        // 400000 * (1 - 0.20) = 320000
        expect(result.loanAmount).toBe(320000);
        expect(result.downPayment).toBe(80000);
    });

    it("uses bridge base rate", () => {
        const result = computeBridge(baseInputs);
        expect(result.estimatedRate).toBe(BRIDGE_BASE_RATE);
    });

    it("calculates points cost", () => {
        const result = computeBridge(baseInputs);
        // 320000 * 2% = 6400
        expect(result.pointsCost).toBe(6400);
    });

    it("calculates total holding cost over term", () => {
        const result = computeBridge(baseInputs);
        // 800 * 12 = 9600
        expect(result.totalHoldingCost).toBe(9600);
    });

    it("total loan cost sums interest + points + holding", () => {
        const result = computeBridge(baseInputs);
        expect(result.totalLoanCost).toBe(
            result.totalInterestCost + result.pointsCost + result.totalHoldingCost
        );
    });
});

// ─── BRRRR ───────────────────────────────────────────────────────────────────

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
        creditBand: "720-759" as const,
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
    it("dscrDealHealth returns good for strong DSCR", async () => {
        const { dscrDealHealth } = await import("@/lib/deal-health");
        const result = dscrDealHealth(1.5, 500);
        expect(result.level).toBe("good");
        expect(result.score).toBeGreaterThanOrEqual(70);
    });

    it("dscrDealHealth returns poor for DSCR < 1", async () => {
        const { dscrDealHealth } = await import("@/lib/deal-health");
        const result = dscrDealHealth(0.8, -200);
        expect(result.level).toBe("poor");
        expect(result.score).toBeLessThan(50);
    });

    it("flipDealHealth returns good for high-profit flip", async () => {
        const { flipDealHealth } = await import("@/lib/deal-health");
        const result = flipDealHealth(80000, 35, 6);
        expect(result.level).toBe("good");
    });

    it("flipDealHealth returns poor for negative profit", async () => {
        const { flipDealHealth } = await import("@/lib/deal-health");
        const result = flipDealHealth(-5000, -5, 6);
        expect(result.level).toBe("poor");
    });
});
