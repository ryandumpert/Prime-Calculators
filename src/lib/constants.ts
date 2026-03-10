// DSCR credit score bands — base rate is 6.25% (750+)
export const DSCR_BASE_RATE = 6.25;

export const CREDIT_BANDS = [
  { label: "750+", value: "750+", adjustment: 0 },
  { label: "725–749", value: "725-749", adjustment: 0.25 },
  { label: "700–724", value: "700-724", adjustment: 0.50 },
  { label: "680–699", value: "680-699", adjustment: 0.75 },
  { label: "660–679", value: "660-679", adjustment: 1.0 },
] as const;

export type CreditBandValue = (typeof CREDIT_BANDS)[number]["value"];

export function getDSCRRate(band: CreditBandValue): number {
  const found = CREDIT_BANDS.find((b) => b.value === band);
  return DSCR_BASE_RATE + (found ? found.adjustment : 0);
}

// Returns just the adjustment amount (for non-DSCR calcs with their own base rates)
export function getCreditAdjustment(band: CreditBandValue): number {
  const found = CREDIT_BANDS.find((b) => b.value === band);
  return found ? found.adjustment : 0;
}

// DSCR down-payment requirements by credit band
// Each tier's minimum down payment; higher-credit borrowers can also choose
// any down payment from a lower credit tier (i.e. a higher percentage).
export const DSCR_DOWN_PAYMENT_MAP: Record<CreditBandValue, number> = {
  "750+": 20,
  "725-749": 20,
  "700-724": 25,
  "680-699": 25,
  "660-679": 30,
};

/**
 * Returns the available down-payment options for a DSCR purchase loan
 * based on the selected credit band.
 *
 * Rules:
 *   660-679  → 30% only
 *   680-699  → 25%, 30%
 *   700-724  → 25%, 30%
 *   725-749  → 20%, 25%, 30%
 *   750+     → 20%, 25%, 30%
 */
export function getDSCRDownPaymentOptions(band: CreditBandValue): {
  options: number[];
  defaultPercent: number;
} {
  const minDown = DSCR_DOWN_PAYMENT_MAP[band] ?? 25;
  // All possible tiers — deduplicated and sorted ascending
  const ALL_DOWN_OPTIONS = [20, 25, 30];
  const options = ALL_DOWN_OPTIONS.filter((dp) => dp >= minDown);
  return { options, defaultPercent: minDown };
}

// Calculator definitions for the gallery
export interface CalculatorDef {
  slug: string;
  title: string;
  description: string;
  bestFor: string[];
  route: string;
  icon: string; // lucide icon name
  baseRate: number;
  color: string;
}

export const CALCULATORS: CalculatorDef[] = [
  {
    slug: "long-term-rental",
    title: "Purchase - Long Term Rental",
    description:
      "Calculate DSCR ratio, estimated payment, and monthly cashflow for long-term rental investment properties.",
    bestFor: ["Rental Investors", "DSCR Loans", "Buy & Hold"],
    route: "/calculators/long-term-rental",
    icon: "building-2",
    baseRate: 6.25,
    color: "from-blue-600 to-indigo-600",
  },
  {
    slug: "short-term-rental",
    title: "Purchase - Short Term Rental",
    description:
      "Analyze cashflow and DSCR for short-term vacation rental properties like Airbnb and VRBO.",
    bestFor: ["Airbnb / VRBO", "Vacation Rentals", "STR Investors"],
    route: "/calculators/short-term-rental",
    icon: "home",
    baseRate: 6.25,
    color: "from-cyan-500 to-blue-500",
  },
  {
    slug: "rate-term-refi",
    title: "Refinance - Rate & Term Only",
    description:
      "See your monthly savings and breakeven timeline when refinancing to a better rate or term.",
    bestFor: ["Existing Homeowners", "Rate Reduction", "Non-QM Refi"],
    route: "/calculators/rate-term-refi",
    icon: "arrow-down-circle",
    baseRate: 6.25,
    color: "from-green-500 to-emerald-600",
  },
  {
    slug: "cash-out-refi",
    title: "Refinance - Cash Out",
    description:
      "Calculate net cash-out proceeds and understand the impact on your monthly payment.",
    bestFor: ["Cash Access", "Debt Consolidation", "Value Extraction"],
    route: "/calculators/cash-out-refi",
    icon: "banknote",
    baseRate: 6.25,
    color: "from-purple-500 to-violet-600",
  },
  {
    slug: "fix-and-flip",
    title: "Fix and Flip - Sell for Profit",
    description:
      "Estimate your gross profit, ROI, annualized return, and total financing cost for a flip project.",
    bestFor: ["House Flippers", "Short-Term Loans", "Hard Money"],
    route: "/calculators/fix-and-flip",
    icon: "hammer",
    baseRate: 11.5,
    color: "from-orange-500 to-red-500",
  },
  {
    slug: "brrr",
    title: "Fix and Flip - Rent After (BRRRR)",
    description:
      "Full BRRRR analysis: buy, rehab, rent, refinance, and repeat. See cash left in deal and monthly cashflow.",
    bestFor: ["BRRRR Strategy", "Wealth Building", "Portfolio Growth"],
    route: "/calculators/brrr",
    icon: "repeat",
    baseRate: 8.5,
    color: "from-teal-500 to-green-500",
  },
];

// Shared default assumptions
export const DEFAULTS = {
  term: 30,
  ioTermMonths: 12,
  vacancyRate: 5,
  managementRate: 8,
  closingCostPercent: 2,
};
