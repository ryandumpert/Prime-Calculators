/**
 * Admin Defaults Schema
 * Defines the shape of editable defaults per calculator and global settings.
 * Used both for admin UI form generation and runtime consumption.
 */

export interface CreditBandAdjustment {
    "760+": number;
    "720-759": number;
    "680-719": number;
    "640-679": number;
    "<640": number;
}

export interface GlobalDefaults {
    creditBandAdjustments: CreditBandAdjustment;
}

export interface DSCRDefaults {
    baseRate: number;
    defaultTermYears: number;
    defaultVacancyPercent: number;
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

export interface BridgeDefaults {
    baseRate: number;
    defaultDownPaymentPercent: number;
    defaultTermMonths: number;
    defaultPointsPercent: number;
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
    dscr: DSCRDefaults;
    "fix-and-flip": FlipDefaults;
    "rate-term-refi": RateTermRefiDefaults;
    "cash-out-refi": CashOutRefiDefaults;
    bridge: BridgeDefaults;
    brrr: BRRRRDefaults;
}

export type CalculatorSlug = keyof Omit<AllDefaults, "global">;

// System defaults — the hardcoded fallback
export const SYSTEM_DEFAULTS: AllDefaults = {
    global: {
        creditBandAdjustments: {
            "760+": -0.25,
            "720-759": 0.0,
            "680-719": 0.5,
            "640-679": 1.0,
            "<640": 1.75,
        },
    },
    dscr: {
        baseRate: 8.5,
        defaultTermYears: 30,
        defaultVacancyPercent: 5,
        defaultManagementPercent: 8,
        defaultDownPaymentPercent: 25,
    },
    "fix-and-flip": {
        baseRate: 11.5,
        defaultDownPaymentPercent: 15,
        defaultPointsPercent: 2,
        defaultBuyClosingPercent: 2,
        defaultSellCostPercent: 6,
        defaultHoldingMonths: 6,
    },
    "rate-term-refi": {
        baseRate: 7.5,
        defaultNewTermYears: 30,
        defaultClosingCosts: 8000,
    },
    "cash-out-refi": {
        baseRate: 8.0,
        defaultMaxLtvPercent: 75,
        defaultNewTermYears: 30,
        defaultClosingCostPercent: 2,
    },
    bridge: {
        baseRate: 10.5,
        defaultDownPaymentPercent: 20,
        defaultTermMonths: 12,
        defaultPointsPercent: 2,
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
        "creditBandAdjustments.760+": "760+ Rate Adjustment (%)",
        "creditBandAdjustments.720-759": "720–759 Rate Adjustment (%)",
        "creditBandAdjustments.680-719": "680–719 Rate Adjustment (%)",
        "creditBandAdjustments.640-679": "640–679 Rate Adjustment (%)",
        "creditBandAdjustments.<640": "< 640 Rate Adjustment (%)",
    },
    dscr: {
        baseRate: "Base Rate (%)",
        defaultTermYears: "Default Term (years)",
        defaultVacancyPercent: "Default Vacancy (%)",
        defaultManagementPercent: "Default Management (%)",
        defaultDownPaymentPercent: "Default Down Payment (%)",
    },
    "fix-and-flip": {
        baseRate: "Base Rate (%)",
        defaultDownPaymentPercent: "Default Down Payment (%)",
        defaultPointsPercent: "Default Points (%)",
        defaultBuyClosingPercent: "Default Buy Closing Cost (%)",
        defaultSellCostPercent: "Default Sell Cost (%)",
        defaultHoldingMonths: "Default Holding Period (months)",
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
    bridge: {
        baseRate: "Base Rate (%)",
        defaultDownPaymentPercent: "Default Down Payment (%)",
        defaultTermMonths: "Default Term (months)",
        defaultPointsPercent: "Default Points (%)",
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
    dscr: "DSCR Ratio + Cashflow",
    "fix-and-flip": "Fix & Flip Profit",
    "rate-term-refi": "Rate & Term Refi",
    "cash-out-refi": "Cash-Out Refi",
    bridge: "Bridge Loan",
    brrr: "BRRRR Snapshot",
};
