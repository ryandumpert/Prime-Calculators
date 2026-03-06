// Credit score bands and their rate adjustments
export const CREDIT_BANDS = [
  { label: "760+", value: "760+", adjustment: -0.25 },
  { label: "720–759", value: "720-759", adjustment: 0.0 },
  { label: "680–719", value: "680-719", adjustment: 0.5 },
  { label: "640–679", value: "640-679", adjustment: 1.0 },
  { label: "< 640", value: "<640", adjustment: 1.75 },
] as const;

export type CreditBandValue = (typeof CREDIT_BANDS)[number]["value"];

export function getCreditAdjustment(band: CreditBandValue): number {
  const found = CREDIT_BANDS.find((b) => b.value === band);
  return found ? found.adjustment : 0;
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
    slug: "dscr",
    title: "DSCR Ratio + Cashflow",
    description:
      "Instantly calculate your DSCR ratio, estimated payment, and monthly cashflow for investment properties.",
    bestFor: ["Rental Investors", "DSCR Loans", "Buy & Hold"],
    route: "/calculators/dscr",
    icon: "building-2",
    baseRate: 8.5,
    color: "from-blue-600 to-indigo-600",
  },
  {
    slug: "fix-and-flip",
    title: "Fix & Flip Profit",
    description:
      "Estimate your gross profit, ROI, annualized return, and total financing cost for a flip project.",
    bestFor: ["House Flippers", "Short-Term Loans", "Hard Money"],
    route: "/calculators/fix-and-flip",
    icon: "hammer",
    baseRate: 11.5,
    color: "from-orange-500 to-red-500",
  },
  {
    slug: "rate-term-refi",
    title: "Rate & Term Refi Savings",
    description:
      "See your monthly savings, new payment, and breakeven timeline when refinancing to a better rate.",
    bestFor: ["Existing Homeowners", "Rate Reduction", "Non-QM Refi"],
    route: "/calculators/rate-term-refi",
    icon: "arrow-down-circle",
    baseRate: 7.5,
    color: "from-green-500 to-emerald-600",
  },
  {
    slug: "cash-out-refi",
    title: "Cash-Out Refi Proceeds",
    description:
      "Calculate your net cash-out proceeds and understand the impact on your monthly payment.",
    bestFor: ["Cash Access", "Debt Consolidation", "Value Extraction"],
    route: "/calculators/cash-out-refi",
    icon: "banknote",
    baseRate: 8.0,
    color: "from-purple-500 to-violet-600",
  },
  {
    slug: "bridge",
    title: "Bridge Loan Cost",
    description:
      "Model bridge loan costs including IO payments, points, and total holding cost through exit.",
    bestFor: ["Quick Close", "Transitional", "Non-QM Bridge"],
    route: "/calculators/bridge",
    icon: "git-branch",
    baseRate: 10.5,
    color: "from-cyan-500 to-blue-500",
  },
  {
    slug: "brrr",
    title: "BRRRR Snapshot",
    description:
      "Full BRRRR analysis: cash left in deal, cash-back at refi, and monthly cashflow projection.",
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
