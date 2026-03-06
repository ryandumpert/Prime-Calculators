/**
 * Format a number as USD currency
 */
export function formatCurrency(value: number): string {
    if (!isFinite(value) || isNaN(value)) return "$—";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format a number as USD currency with cents
 */
export function formatCurrencyCents(value: number): string {
    if (!isFinite(value) || isNaN(value)) return "$—";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Format a number as a percentage
 */
export function formatPercent(value: number, decimals = 2): string {
    if (!isFinite(value) || isNaN(value)) return "—%";
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format a DSCR ratio
 */
export function formatRatio(value: number): string {
    if (!isFinite(value) || isNaN(value)) return "—";
    return value.toFixed(2) + "x";
}

/**
 * Format months as human readable
 */
export function formatMonths(months: number): string {
    if (!isFinite(months) || isNaN(months) || months < 0) return "—";
    if (months < 1) return "< 1 month";
    const years = Math.floor(months / 12);
    const remainingMonths = Math.round(months % 12);
    if (years === 0) return `${remainingMonths} mo`;
    if (remainingMonths === 0) return `${years} yr`;
    return `${years} yr ${remainingMonths} mo`;
}

/**
 * Parse a string to a number, returns NaN on failure
 */
export function parseNum(value: string | number): number {
    if (typeof value === "number") return value;
    const cleaned = value.replace(/[,$\s%]/g, "");
    return cleaned === "" ? NaN : Number(cleaned);
}

/**
 * Calculate monthly payment (P&I amortization)
 */
export function calcMonthlyPayment(
    principal: number,
    annualRate: number,
    termYears: number
): number {
    if (principal <= 0 || annualRate <= 0 || termYears <= 0) return 0;
    const r = annualRate / 100 / 12;
    const n = termYears * 12;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * Calculate interest-only monthly payment
 */
export function calcIOPayment(principal: number, annualRate: number): number {
    if (principal <= 0 || annualRate <= 0) return 0;
    return (principal * (annualRate / 100)) / 12;
}
