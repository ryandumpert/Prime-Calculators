export type DealHealthLevel = "good" | "caution" | "poor" | "incomplete";

export interface DealHealthResult {
    score: number; // 0-100
    level: DealHealthLevel;
    label: string;
    reasons: string[];
}

export function getDealHealthLevel(score: number): DealHealthLevel {
    if (score >= 70) return "good";
    if (score >= 40) return "caution";
    return "poor";
}

export function getDealHealthLabel(level: DealHealthLevel): string {
    switch (level) {
        case "good":
            return "Good";
        case "caution":
            return "Caution";
        case "poor":
            return "Poor";
        case "incomplete":
            return "Incomplete";
    }
}

export function getDealHealthColor(level: DealHealthLevel): string {
    switch (level) {
        case "good":
            return "text-emerald-600";
        case "caution":
            return "text-amber-500";
        case "poor":
            return "text-red-500";
        case "incomplete":
            return "text-muted-foreground";
    }
}

export function getDealHealthBg(level: DealHealthLevel): string {
    switch (level) {
        case "good":
            return "bg-emerald-500";
        case "caution":
            return "bg-amber-500";
        case "poor":
            return "bg-red-500";
        case "incomplete":
            return "bg-muted-foreground";
    }
}

export function getDealHealthBgLight(level: DealHealthLevel): string {
    switch (level) {
        case "good":
            return "bg-emerald-50 dark:bg-emerald-950/30";
        case "caution":
            return "bg-amber-50 dark:bg-amber-950/30";
        case "poor":
            return "bg-red-50 dark:bg-red-950/30";
        case "incomplete":
            return "bg-muted";
    }
}

// DSCR Deal Health
export function dscrDealHealth(
    dscr: number,
    cashflow: number,
    rate: number
): DealHealthResult {
    let score = 50;
    const reasons: string[] = [];

    if (dscr >= 1.25) {
        score += 25;
        reasons.push("Strong DSCR — well above lender minimums");
    } else if (dscr >= 1.0) {
        score += 10;
        reasons.push("DSCR meets minimum thresholds");
    } else {
        score -= 20;
        reasons.push("DSCR below 1.0 — negative cashflow risk");
    }

    if (cashflow > 500) {
        score += 15;
        reasons.push("Healthy monthly cashflow buffer");
    } else if (cashflow > 0) {
        score += 5;
        reasons.push("Positive but thin cashflow margin");
    } else {
        score -= 15;
        reasons.push("Negative cashflow — property costs exceed rental income");
    }

    if (rate > 10) {
        score -= 10;
        reasons.push("High estimated rate may compress margins");
    }

    score = Math.max(0, Math.min(100, score));
    return {
        score,
        level: getDealHealthLevel(score),
        label: getDealHealthLabel(getDealHealthLevel(score)),
        reasons: reasons.slice(0, 2),
    };
}

// Fix & Flip Deal Health
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

// Rate & Term Refi Deal Health
export function refiDealHealth(
    monthlySavings: number,
    breakevenMonths: number
): DealHealthResult {
    let score = 50;
    const reasons: string[] = [];

    if (monthlySavings > 300) {
        score += 25;
        reasons.push("Significant monthly savings");
    } else if (monthlySavings > 100) {
        score += 10;
        reasons.push("Moderate savings — worth considering");
    } else if (monthlySavings > 0) {
        score += 0;
        reasons.push("Minimal savings — evaluate if closing costs are justified");
    } else {
        score -= 25;
        reasons.push("Payment increases — refinance may not be beneficial");
    }

    if (breakevenMonths < 24) {
        score += 20;
        reasons.push("Quick breakeven on closing costs");
    } else if (breakevenMonths < 48) {
        score += 5;
        reasons.push("Reasonable breakeven timeline");
    } else {
        score -= 10;
        reasons.push("Long breakeven — staying in the loan long enough matters");
    }

    score = Math.max(0, Math.min(100, score));
    return {
        score,
        level: getDealHealthLevel(score),
        label: getDealHealthLabel(getDealHealthLevel(score)),
        reasons: reasons.slice(0, 2),
    };
}

// Cash-Out Refi Deal Health
export function cashOutDealHealth(
    netCashOut: number,
    paymentDiff: number,
    ltv: number
): DealHealthResult {
    let score = 50;
    const reasons: string[] = [];

    if (netCashOut > 50000) {
        score += 20;
        reasons.push("Substantial cash-out proceeds");
    } else if (netCashOut > 10000) {
        score += 10;
        reasons.push("Moderate cash-out amount");
    } else {
        score -= 15;
        reasons.push("Low cash-out — closing costs may eat proceeds");
    }

    if (paymentDiff < 200) {
        score += 15;
        reasons.push("Minimal payment increase");
    } else if (paymentDiff < 500) {
        score += 5;
        reasons.push("Moderate payment impact");
    } else {
        score -= 10;
        reasons.push("Significant payment increase");
    }

    if (ltv > 80) {
        score -= 10;
        reasons.push("High LTV may require higher rate or MI");
    }

    score = Math.max(0, Math.min(100, score));
    return {
        score,
        level: getDealHealthLevel(score),
        label: getDealHealthLabel(getDealHealthLevel(score)),
        reasons: reasons.slice(0, 2),
    };
}

// Bridge Loan Deal Health
export function bridgeDealHealth(
    totalCost: number,
    loanAmount: number,
    termMonths: number
): DealHealthResult {
    let score = 50;
    const reasons: string[] = [];

    const costRatio = totalCost / Math.max(loanAmount, 1);
    if (costRatio < 0.05) {
        score += 20;
        reasons.push("Low total cost relative to loan");
    } else if (costRatio < 0.1) {
        score += 10;
        reasons.push("Moderate financing cost");
    } else {
        score -= 15;
        reasons.push("High total financing cost — ensure exit strategy is solid");
    }

    if (termMonths <= 6) {
        score += 15;
        reasons.push("Short-term bridge — manageable risk window");
    } else if (termMonths <= 12) {
        score += 5;
        reasons.push("Standard bridge term");
    } else {
        score -= 10;
        reasons.push("Extended bridge — consider permanent financing options");
    }

    score = Math.max(0, Math.min(100, score));
    return {
        score,
        level: getDealHealthLevel(score),
        label: getDealHealthLabel(getDealHealthLevel(score)),
        reasons: reasons.slice(0, 2),
    };
}

// BRRRR Deal Health
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
