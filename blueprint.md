# blueprint.md

## Overview

Build a simple-but-impressive website that provides **interactive calculators for Non-QM mortgage scenarios** (DSCR, Fix & Flip, refinance variants, and related tools). The experience should feel advanced through:

- Clean, modern UI
- Instant results (no calculate buttons)
- Profit/cashflow-first outputs
- A clear “Deal Health” indicator
- Lead capture with “Email me a term sheet” option

This document defines **what to build**.  
**How to build it** is defined in `agent.md`.

---

## Goals

- Provide a landing page with a **selection of Non-QM calculators**.
- Each calculator:
  - Accepts required inputs with simple form controls
  - Updates outputs dynamically as inputs change
  - Emphasizes **monthly cashflow**, **profit**, or **savings**
  - Collects **estimated credit score**
  - Offers **lead capture** with a button and an option to email a term sheet
- Make the site feel “advanced” and trustworthy without being complex.

## Non-Goals

- Full loan origination workflow
- Credit report pulls
- Binding rate quotes or underwriting decisions
- Storing sensitive data beyond basic lead info

---

## Site Structure

### Routes / Pages
1. `/` — **Calculator Gallery Landing Page**
2. `/calculators/dscr` — DSCR Ratio + DSCR Loan Cashflow Snapshot
3. `/calculators/fix-and-flip` — Fix & Flip Profit + Loan + ROI
4. `/calculators/rate-term-refi` — Rate & Term Refi Savings
5. `/calculators/cash-out-refi` — Cash-Out Proceeds + Payment Impact
6. `/calculators/bridge` — Bridge Loan Cost + Exit Scenarios (Non-QM relevant)
7. `/calculators/brrr` — BRRRR Snapshot (Buy/Rehab/Rent/Refi) cashflow/profit
8. `/admin` — **Admin Defaults Editor** (rates/terms/default inputs per calculator)
9. `/privacy` — basic privacy notice
10. `/disclaimer` — estimation + non-offer disclaimer

> The implementation must ensure calculators are the centerpiece; content pages stay minimal.

---

## Admin Defaults Editor (`/admin`)

### Purpose
Provide an owner-only interface to control the **default values** used across calculators (e.g., base rates, default terms, vacancy %, management %, points, closing cost defaults). This allows rapid updates as market assumptions change.

### Requirements
- **Access controlled** (not publicly accessible).
- Clearly shows **which calculator** is being edited.
- Defaults are grouped and labeled in plain language.
- Supports **Save** and **Reset to system defaults**.
- Changes apply site-wide immediately after save (or within a short cache window).

### Admin UI
- Left sidebar: list of calculators (DSCR, Fix & Flip, Rate/Term Refi, Cash-Out Refi, Bridge, BRRRR)
- Main panel: editable defaults for the selected calculator
- Top bar:
  - “Last updated” timestamp
  - “Publish/Save” button
  - Optional: “Preview impact” toggle (shows a sample scenario)

### Editable Defaults (Minimum)
- Global:
  - Credit score band adjustments (the pricing band deltas)
- Per-calculator:
  - Base rate (before credit adjustment)
  - Default term (years) or term (months)
  - Default points (%) where applicable
  - Default closing cost (% or $) where applicable
  - Default vacancy (%) and management (%) for rental calculators
  - Any other defaults explicitly listed in the calculator’s “Shared Assumptions” section

### Storage + Behavior
- Defaults persist in a backend store (database or config store) and are loaded by calculators at runtime.
- If the defaults store is unavailable, calculators fall back to the **hardcoded system defaults**.

### Auditability
- Record:
  - Who changed defaults (admin user)
  - What changed (diff)
  - Timestamp

---

## Global UX Requirements

### Visual & Layout
- Clean, modern, “fintech” aesthetic
- Calculator pages use:
  - Left: inputs
  - Right: results summary (KPIs) + Deal Health indicator
- Sticky CTA button: **“Get My Term Sheet”**
- Use informative tooltips for unfamiliar terms (DSCR, ARV, points, etc.)

### Dynamic Updates
- Results must update **immediately** when any input changes.
- No “Calculate” button.
- If required fields are missing, show:
  - “Add the remaining fields to see your results”
  - Disable Deal Health scoring until complete (or show “Incomplete”).

### Deal Health Indicator (Required)
Each calculator displays a prominent indicator with:
- **Label:** Good / Caution / Poor
- **Score:** 0–100
- **Reason summary:** 1–2 bullet points explaining why

Use consistent colors:
- Good: green
- Caution: amber
- Poor: red

### Lead Capture (Required)
Every calculator page includes:
- Fields:
  - Name (required)
  - Email (required)
  - Phone (optional)
  - Estimated credit score (required; 3 bands minimum)
- Button:
  - “Get My Term Sheet”
- Option toggle / checkbox:
  - “Email me a term sheet”
- When submitted, capture:
  - Calculator type
  - All inputs
  - Key outputs (KPIs)
  - Deal Health score/label
  - Timestamp

---

## Credit Score Input (Pricing Band)

Collect estimated credit score using either:
- Dropdown bands (recommended):
  - `760+`
  - `720–759`
  - `680–719`
  - `640–679`
  - `<640`

Use this only for **estimate adjustments** and term-sheet messaging.

### Generic Rate/Cost Adjuster (Applies Across Calculators)
Use a simple pricing adjustment model:
- Base rate estimate depends on calculator type (defined per calculator below)
- Apply credit band adjustment to the base rate:
  - `760+`: -0.25%
  - `720–759`: +0.00%
  - `680–719`: +0.50%
  - `640–679`: +1.00%
  - `<640`: +1.75%

> These are heuristic estimates for UI only; disclaim as “estimate”.

---

## Calculator Gallery Landing Page

### Required Elements
- Headline: “Non-QM Deal Calculators”
- Subheadline: “Instant cashflow and profit insights for DSCR, Fix & Flip, refinance scenarios, and more.”
- Calculator cards (at least 6, per routes list):
  - Title
  - 1-line description
  - “Best for” tags
  - CTA: “Open Calculator”

### Card List (Minimum)
- DSCR Ratio + Cashflow
- Fix & Flip Profit
- Rate & Term Refi Savings
- Cash-Out Refi Proceeds
- Bridge Loan Cost
- BRRRR Snapshot

---

## Calculator Specifications

### Shared Assumptions (Default Values)
If user doesn’t enter values, initialize with reasonable defaults:
- Term: 30 years (360 months) unless a short-term product
- Interest-only term (where relevant): 12 months
- Taxes/Insurance: allow inputs; default to 0 if unknown
- Closing costs: as % or $ depending on calculator
- Vacancy: 5% default for rental scenarios
- Property management: 8% default (optional toggle)

All calculators must display a small “Assumptions” accordion showing:
- What defaults were used
- That results are estimates

---

### 1) DSCR Ratio + DSCR Loan Cashflow Calculator (`/calculators/dscr`)

#### Purpose
Help investors quickly see DSCR, estimated rate/payment, and monthly cashflow.

#### Inputs
- Property address (optional)
- Monthly gross rent ($)
- Vacancy rate (%) default 5%
- Property taxes (monthly $)
- Insurance (monthly $)
- HOA (monthly $) optional
- Property management (%) default 8% (toggle on/off)
- Other monthly expenses ($) optional
- Purchase price ($)
- Down payment (%) or amount ($)
- Loan term (years) default 30
- Interest-only toggle (Yes/No)
- IO period months default 12
- Estimated credit score band (required)

#### Computations
- Effective rent = gross rent * (1 - vacancy)
- Management cost = effective rent * mgmt%
- Total monthly expenses = taxes + insurance + HOA + other + management
- NOI (monthly) = effective rent - total monthly expenses
- Loan amount = purchase price - down payment
- Estimated rate base = 8.50% + credit band adjustment
- Monthly payment calculated using IO or amortization
- DSCR = NOI / payment

#### Outputs
- DSCR ratio
- Estimated monthly payment
- Estimated monthly cashflow

---

### 2) Fix & Flip Calculator (`/calculators/fix-and-flip`)

#### Purpose
Estimate profit, financing cost, and ROI for a flip.

#### Inputs
- Purchase price
- Rehab budget
- ARV
- Holding period (months)
- Down payment %
- Points %
- Estimated rate (base 11.50% + credit adjustment)
- Buy closing cost %
- Sell cost %
- Monthly taxes
- Monthly insurance
- Utilities/holding costs
- Estimated credit score

#### Outputs
- Estimated gross profit
- ROI
- Annualized ROI
- Total financing cost

---

### 3) Rate & Term Refinance (`/calculators/rate-term-refi`)

Inputs:
- Current loan balance
- Current rate
- Remaining term
- New rate estimate
- New term
- Closing costs
- Credit score band

Outputs:
- Current payment
- New payment
- Monthly savings
- Breakeven months

---

### 4) Cash-Out Refinance (`/calculators/cash-out-refi`)

Inputs:
- Property value
- Current balance
- Max LTV
- New rate estimate
- New term
- Closing costs
- Taxes/insurance optional
- Credit score band

Outputs:
- Net cash out
- New payment
- Payment difference

---

### 5) Bridge Loan Calculator (`/calculators/bridge`)

Inputs:
- Purchase price
- Down payment
- Term months
- Interest rate
- Points
- Holding costs
- Credit score

Outputs:
- Monthly IO payment
- Total loan cost

---

### 6) BRRRR Calculator (`/calculators/brrr`)

Inputs:
- Purchase price
- Rehab
- ARV
- Rent
- Vacancy
- Taxes/insurance
- Property management
- Refi LTV
- Refi rate
- Closing costs
- Credit score

Outputs:
- Cash left in deal
- Cash back
- Monthly cashflow

---

## Term Sheet Email

When requested:
- Email includes
  - Name
  - Calculator used
  - Key inputs
  - Key outputs
  - Credit band
  - Disclaimer

---

## Disclaimers

Every calculator must display:

- “Estimates only. Not a commitment to lend.”
- “Rates shown are illustrative.”
- “Actual terms may vary.”

---

## Acceptance Criteria

- Landing page with calculator gallery
- All calculators dynamically update results
- Each includes Deal Health indicator
- Credit score collected
- Lead capture available

---

## References
Implementation process defined in `agent.md`.

