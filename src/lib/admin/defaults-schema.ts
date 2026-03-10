/**
 * Admin Defaults Schema
 * Defines the shape of editable defaults per calculator and global settings.
 * Used both for admin UI form generation and runtime consumption.
 */

export interface CreditBandAdjustment {
    "750+": number;
    "725-749": number;
    "700-724": number;
    "680-699": number;
    "660-679": number;
}

export interface GlobalDefaults {
    creditBandAdjustments: CreditBandAdjustment;
}

export interface LTRDefaults {
    baseRate: number;
    defaultTermYears: number;
    defaultVacancyPercent: number;
    defaultManagementPercent: number;
    defaultDownPaymentPercent: number;
}

export interface STRDefaults {
    baseRate: number;
    defaultTermYears: number;
    defaultOccupancyPercent: number;
    defaultManagementPercent: number;
    defaultDownPaymentPercent: number;
}

export interface FlipDefaults {
    baseRate: number;
    defaultDownPaymentPercent: number;
    defaultPointsPercent: number;
    defaultBuyClosingPercent: number;
    defaultSellCostPercent: number;
    defaultHoldingMonths: number;
}

export interface RateTermRefiDefaults {
    baseRate: number;
    defaultNewTermYears: number;
    defaultClosingCosts: number;
}

export interface CashOutRefiDefaults {
    baseRate: number;
    defaultMaxLtvPercent: number;
    defaultNewTermYears: number;
    defaultClosingCostPercent: number;
}

export interface BRRRRDefaults {
    baseRate: number;
    defaultVacancyPercent: number;
    defaultManagementPercent: number;
    defaultRefiLtvPercent: number;
    defaultRefiTermYears: number;
    defaultClosingCostPercent: number;
}

export interface AllDefaults {
    global: GlobalDefaults;
    "long-term-rental": LTRDefaults;
    "short-term-rental": STRDefaults;
    "rate-term-refi": RateTermRefiDefaults;
    "cash-out-refi": CashOutRefiDefaults;
    "fix-and-flip": FlipDefaults;
    brrr: BRRRRDefaults;
}

export type CalculatorSlug = keyof Omit<AllDefaults, "global">;

// System defaults — the hardcoded fallback
export const SYSTEM_DEFAULTS: AllDefaults = {
    global: {
        creditBandAdjustments: {
            "750+": 0,
            "725-749": 0.25,
            "700-724": 0.50,
            "680-699": 0.75,
            "660-679": 1.0,
        },
    },
    "long-term-rental": {
        baseRate: 6.25,
        defaultTermYears: 30,
        defaultVacancyPercent: 5,
        defaultManagementPercent: 8,
        defaultDownPaymentPercent: 25,
    },
    "short-term-rental": {
        baseRate: 6.25,
        defaultTermYears: 30,
        defaultOccupancyPercent: 70,
        defaultManagementPercent: 20,
        defaultDownPaymentPercent: 25,
    },
    "rate-term-refi": {
        baseRate: 6.25,
        defaultNewTermYears: 30,
        defaultClosingCosts: 8000,
    },
    "cash-out-refi": {
        baseRate: 6.25,
        defaultMaxLtvPercent: 75,
        defaultNewTermYears: 30,
        defaultClosingCostPercent: 2,
    },
    "fix-and-flip": {
        baseRate: 11.5,
        defaultDownPaymentPercent: 15,
        defaultPointsPercent: 2,
        defaultBuyClosingPercent: 2,
        defaultSellCostPercent: 6,
        defaultHoldingMonths: 6,
    },
    brrr: {
        baseRate: 8.5,
        defaultVacancyPercent: 5,
        defaultManagementPercent: 8,
        defaultRefiLtvPercent: 75,
        defaultRefiTermYears: 30,
        defaultClosingCostPercent: 2,
    },
};

// Human-readable labels for each field (used to generate the admin form)
export const FIELD_LABELS: Record<string, Record<string, string>> = {
    global: {
        "creditBandAdjustments.750+": "750+ Rate Adjustment (%)",
        "creditBandAdjustments.725-749": "725–749 Rate Adjustment (%)",
        "creditBandAdjustments.700-724": "700–724 Rate Adjustment (%)",
        "creditBandAdjustments.680-699": "680–699 Rate Adjustment (%)",
        "creditBandAdjustments.660-679": "660–679 Rate Adjustment (%)",
    },
    "long-term-rental": {
        baseRate: "Base Rate (%)",
        defaultTermYears: "Default Term (years)",
        defaultVacancyPercent: "Default Vacancy (%)",
        defaultManagementPercent: "Default Management (%)",
        defaultDownPaymentPercent: "Default Down Payment (%)",
    },
    "short-term-rental": {
        baseRate: "Base Rate (%)",
        defaultTermYears: "Default Term (years)",
        defaultOccupancyPercent: "Default Occupancy (%)",
        defaultManagementPercent: "Default Management (%)",
        defaultDownPaymentPercent: "Default Down Payment (%)",
    },
    "rate-term-refi": {
        baseRate: "Base Rate (%)",
        defaultNewTermYears: "Default New Term (years)",
        defaultClosingCosts: "Default Closing Costs ($)",
    },
    "cash-out-refi": {
        baseRate: "Base Rate (%)",
        defaultMaxLtvPercent: "Default Max LTV (%)",
        defaultNewTermYears: "Default New Term (years)",
        defaultClosingCostPercent: "Default Closing Cost (%)",
    },
    "fix-and-flip": {
        baseRate: "Base Rate (%)",
        defaultDownPaymentPercent: "Default Down Payment (%)",
        defaultPointsPercent: "Default Points (%)",
        defaultBuyClosingPercent: "Default Buy Closing Cost (%)",
        defaultSellCostPercent: "Default Sell Cost (%)",
        defaultHoldingMonths: "Default Holding Period (months)",
    },
    brrr: {
        baseRate: "Base Rate (%)",
        defaultVacancyPercent: "Default Vacancy (%)",
        defaultManagementPercent: "Default Management (%)",
        defaultRefiLtvPercent: "Default Refi LTV (%)",
        defaultRefiTermYears: "Default Refi Term (years)",
        defaultClosingCostPercent: "Default Closing Cost (%)",
    },
};

export const CALCULATOR_NAMES: Record<string, string> = {
    global: "Global Credit Adjustments",
    "long-term-rental": "Purchase - Long Term Rental",
    "short-term-rental": "Purchase - Short Term Rental",
    "rate-term-refi": "Refinance - Rate & Term Only",
    "cash-out-refi": "Refinance - Cash Out",
    "fix-and-flip": "Fix and Flip - Sell for Profit",
    brrr: "Fix and Flip - Rent After (BRRRR)",
};
