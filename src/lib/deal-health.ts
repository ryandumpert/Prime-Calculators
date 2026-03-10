export type DealHealthLevel = "excellent" | "good" | "fair" | "poor" | "incomplete";

export interface DealHealthResult {
    score: number; // 0-100
    level: DealHealthLevel;
    label: string;
    reasons: string[];
}

export function getDealHealthLevel(score: number): DealHealthLevel {
    if (score >= 85) return "excellent";
    if (score >= 65) return "good";
    if (score >= 40) return "fair";
    return "poor";
}

export function getDealHealthLabel(level: DealHealthLevel): string {
    switch (level) {
        case "excellent":
            return "Excellent";
        case "good":
            return "Good";
        case "fair":
            return "Fair";
        case "poor":
            return "Poor";
        case "incomplete":
            return "Incomplete";
    }
}

export function getDealHealthColor(level: DealHealthLevel): string {
    switch (level) {
        case "excellent":
            return "text-blue-500";
        case "good":
            return "text-emerald-600";
        case "fair":
            return "text-amber-500";
        case "poor":
            return "text-red-500";
        case "incomplete":
            return "text-muted-foreground";
    }
}

export function getDealHealthBg(level: DealHealthLevel): string {
    switch (level) {
        case "excellent":
            return "bg-blue-500";
        case "good":
            return "bg-emerald-500";
        case "fair":
            return "bg-amber-500";
        case "poor":
            return "bg-red-500";
        case "incomplete":
            return "bg-muted-foreground";
    }
}

export function getDealHealthBgLight(level: DealHealthLevel): string {
    switch (level) {
        case "excellent":
            return "bg-blue-50 dark:bg-blue-950/30";
        case "good":
            return "bg-emerald-50 dark:bg-emerald-950/30";
        case "fair":
            return "bg-amber-50 dark:bg-amber-950/30";
        case "poor":
            return "bg-red-50 dark:bg-red-950/30";
        case "incomplete":
            return "bg-muted";
    }
}

// ─── Purchase - Long Term Rental Deal Health ────────────────────────────────
// DSCR-driven: Poor (<1), Fair (1–1.2), Good (1.21–1.3), Excellent (1.3+)
export function ltrDealHealth(
    dscr: number,
    cashflow: number,
    rate: number
): DealHealthResult {
    const reasons: string[] = [];
    let score: number;

    if (dscr >= 1.3) {
        score = 90;
        reasons.push("Prime deal — DSCR above 1.3x with excellent cashflow coverage");
        reasons.push("Strong debt service cushion provides maximum lender flexibility");
    } else if (dscr >= 1.21) {
        score = 72;
        reasons.push("High-value deal — DSCR between 1.21x and 1.3x with solid cashflow");
        reasons.push("Healthy margins support sustainable rental income");
    } else if (dscr >= 1.0) {
        score = 45;
        reasons.push("Loan eligible — DSCR between 1.0x and 1.2x, but cashflow margins are tight");
        reasons.push("Proceed with caution — consider reserves for vacancies and repairs");
    } else {
        score = 20;
        reasons.push("DSCR below 1.0 — rental income does not cover debt service");
        reasons.push("Property cashflow will not sustain loan payments and expenses");
    }

    // Minor adjustments for cashflow and rate
    if (cashflow > 500 && dscr >= 1.0) score += 5;
    if (rate > 10) score -= 5;

    score = Math.max(0, Math.min(100, score));
    const level = getDealHealthLevel(score);
    return { score, level, label: getDealHealthLabel(level), reasons: reasons.slice(0, 2) };
}

// ─── Purchase - Short Term Rental Deal Health ───────────────────────────────
// DSCR-driven: Poor (<1), Fair (1–1.2), Good (1.21–1.3), Excellent (1.3+)
export function strDealHealth(
    dscr: number,
    cashflow: number,
    occupancyRate: number,
    rate: number
): DealHealthResult {
    const reasons: string[] = [];
    let score: number;

    if (dscr >= 1.3) {
        score = 90;
        reasons.push("Prime deal — DSCR above 1.3x with excellent short-term rental performance");
        reasons.push("Strong revenue coverage provides a cushion for seasonal fluctuations");
    } else if (dscr >= 1.21) {
        score = 72;
        reasons.push("High-value deal — DSCR between 1.21x and 1.3x with solid cashflow");
        reasons.push("Good revenue margins support sustainable STR operations");
    } else if (dscr >= 1.0) {
        score = 45;
        reasons.push("Loan eligible — DSCR between 1.0x and 1.2x, but cashflow margins are tight");
        reasons.push("Proceed with caution — STR income can be seasonal and unpredictable");
    } else {
        score = 20;
        reasons.push("DSCR below 1.0 — rental revenue does not cover debt service");
        reasons.push("Property cashflow will not sustain loan payments and expenses");
    }

    // Minor adjustments for occupancy and rate
    if (occupancyRate < 50) score -= 5;
    if (occupancyRate >= 70 && dscr >= 1.0) score += 3;
    if (rate > 10) score -= 5;

    score = Math.max(0, Math.min(100, score));
    const level = getDealHealthLevel(score);
    return { score, level, label: getDealHealthLabel(level), reasons: reasons.slice(0, 2) };
}

// Fix and Flip - Sell for Profit Deal Health
export function flipDealHealth(
    grossProfit: number,
    roi: number,
    holdingMonths: number
): DealHealthResult {
    let score = 50;
    const reasons: string[] = [];

    if (grossProfit > 50000) {
        score += 20;
        reasons.push("Strong gross profit target");
    } else if (grossProfit > 20000) {
        score += 10;
        reasons.push("Moderate profit — thin margin for surprises");
    } else {
        score -= 20;
        reasons.push("Low profit — high risk of loss on cost overruns");
    }

    if (roi > 20) {
        score += 15;
        reasons.push("Excellent ROI on cash invested");
    } else if (roi > 10) {
        score += 5;
        reasons.push("Acceptable ROI");
    } else {
        score -= 10;
        reasons.push("Low ROI — capital may be better deployed elsewhere");
    }

    if (holdingMonths > 9) {
        score -= 10;
        reasons.push("Extended holding period increases carrying costs");
    }

    score = Math.max(0, Math.min(100, score));
    return {
        score,
        level: getDealHealthLevel(score),
        label: getDealHealthLabel(getDealHealthLevel(score)),
        reasons: reasons.slice(0, 2),
    };
}

// ─── Refinance - Rate & Term Only Deal Health ───────────────────────────────
export function refiDealHealth(
    monthlySavings: number,
    breakevenMonths: number,
    dscr: number,
    rate: number
): DealHealthResult {
    const reasons: string[] = [];
    let score: number;

    // Primary scoring based on DSCR (matching purchase calc thresholds)
    if (dscr >= 1.3) {
        score = 90;
        reasons.push("Prime refinance — DSCR above 1.3x with excellent cashflow coverage");
    } else if (dscr >= 1.21) {
        score = 72;
        reasons.push("Solid refinance — DSCR between 1.21x and 1.3x with good cashflow");
    } else if (dscr >= 1.0) {
        score = 45;
        reasons.push("Refinance viable — DSCR between 1.0x and 1.2x, but margins are tight");
    } else {
        score = 20;
        reasons.push("DSCR below 1.0 — rental income does not cover new debt service");
    }

    // Secondary adjustments for savings/breakeven
    if (monthlySavings > 300 && breakevenMonths < 24) {
        score += 5;
        reasons.push("Significant monthly savings with a fast breakeven timeline");
    } else if (monthlySavings > 0 && breakevenMonths < 60) {
        reasons.push("Positive monthly savings — refinance reduces your cost of capital");
    } else if (monthlySavings <= 0) {
        score -= 5;
        reasons.push("Payment increases — current terms may be more favorable");
    }

    if (rate > 10) score -= 5;

    score = Math.max(0, Math.min(100, score));
    const level = getDealHealthLevel(score);
    return { score, level, label: getDealHealthLabel(level), reasons: reasons.slice(0, 2) };
}


// ─── Refinance - Cash Out Deal Health ───────────────────────────────────────
export function cashOutDealHealth(
    netCashOut: number,
    paymentDiff: number,
    ltv: number
): DealHealthResult {
    const reasons: string[] = [];
    let score: number;

    if (netCashOut > 50000 && paymentDiff < 300 && ltv <= 75) {
        score = 90;
        reasons.push("Prime cash-out — substantial proceeds with manageable payment impact");
        reasons.push("Conservative LTV preserves equity and supports favorable terms");
    } else if (netCashOut > 20000 && paymentDiff < 500) {
        score = 72;
        reasons.push("Solid cash-out — good proceeds with a reasonable payment increase");
        reasons.push("Useful capital extraction while maintaining sustainable payments");
    } else if (netCashOut > 5000 && paymentDiff < 800) {
        score = 45;
        reasons.push("Modest cash-out — proceeds available but proceed with caution");
        reasons.push("Payment increase and closing costs may eat into the benefit");
    } else {
        score = 20;
        reasons.push("Cash-out may not be advantageous — low proceeds or high payment impact");
        reasons.push(netCashOut <= 0
            ? "Insufficient equity — closing costs may exceed available proceeds"
            : "Significant payment increase may strain cashflow");
    }

    if (ltv > 80) score -= 5;

    score = Math.max(0, Math.min(100, score));
    const level = getDealHealthLevel(score);
    return { score, level, label: getDealHealthLabel(level), reasons: reasons.slice(0, 2) };
}

// Fix and Flip - Rent After (BRRRR) Deal Health
export function brrrrDealHealth(
    cashLeftInDeal: number,
    monthlyCashflow: number,
    cashBack: number
): DealHealthResult {
    let score = 50;
    const reasons: string[] = [];

    if (cashLeftInDeal <= 0) {
        score += 25;
        reasons.push("All cash recycled — infinite cash-on-cash return potential");
    } else if (cashLeftInDeal < 20000) {
        score += 10;
        reasons.push("Minimal cash left in deal");
    } else {
        score -= 10;
        reasons.push("Significant capital still trapped in the deal");
    }

    if (monthlyCashflow > 300) {
        score += 20;
        reasons.push("Strong recurring cashflow");
    } else if (monthlyCashflow > 0) {
        score += 5;
        reasons.push("Positive cashflow — but thin margin");
    } else {
        score -= 20;
        reasons.push("Negative cashflow after refi — reconsider numbers");
    }

    score = Math.max(0, Math.min(100, score));
    return {
        score,
        level: getDealHealthLevel(score),
        label: getDealHealthLabel(getDealHealthLevel(score)),
        reasons: reasons.slice(0, 2),
    };
}
