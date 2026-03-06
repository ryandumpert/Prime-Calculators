# agent.md

## Purpose

This file defines **how** the Claude Opus 4.6 agent will build the “Prime Loan Advisors — NQM Calculator Suite” website.

**What to build** (requirements, pages, calculators, UI, copy, data model, and formulas) is defined in `blueprint.md`.  
This file focuses on **process, sequencing, guardrails, and implementation method**.

---

## High-Level Approach

### Build Strategy
1. **Scaffold** a modern, fast marketing site with a calculator gallery landing page.
2. **Implement calculators as modular components** with:
   - Instant/dynamic recalculation (no “Calculate” button)
   - Cashflow/profit-first outputs
   - “Deal Health” indicators (good / caution / poor)
   - Lead capture + “Email me a term sheet” option
3. **Instrument analytics + event tracking** for conversion.
4. **Harden for production** (validation, edge cases, SEO, accessibility, performance).
5. **Deploy** with environment-based configuration and CI checks.

### Non-Overlap Rule
- This file describes **the build plan and engineering workflow**.
- All calculator definitions, formulas, UX requirements, and content details live in `blueprint.md`.

---

## Technical Architecture (Implementation Plan)

### Recommended Stack
- **Next.js (App Router)** for routing, SSR/SSG, performance, SEO
- **TypeScript** for safety
- **Tailwind CSS** for fast, consistent UI
- **Component library** (e.g., shadcn/ui) for “advanced + impressive” feel
- **Zod** for input validation schemas
- **React Hook Form** (optional) or controlled inputs with debounced parsing
- **Email + lead capture**
  - Option A: **Serverless API route** writing to a CRM webhook (Zapier/Make/HubSpot)
  - Option B: Store leads in **Postgres** (Supabase) + email via **Resend**
- **Analytics**: GA4 or Plausible; events for calculator usage + lead submission

---

## Project Execution Plan

### Phase 0 — Read & Lock Requirements
- Read `blueprint.md` fully.
- Extract required pages, calculators, formulas, and UX rules.
- Map every blueprint requirement to a component or route.

### Phase 1 — Scaffold + Design System
- Generate project skeleton:
  - `/app` routes
  - `/components`
  - `/lib`
- Establish UI system:
  - typography
  - card layout
  - input styling
  - KPI result panels

Shared primitives:
- `MoneyInput`
- `PercentInput`
- `NumberInput`
- `SelectInput`
- `KpiCard`
- `DealIndicator`
- `CalculatorLayout`

### Phase 2 — Dynamic Calculator Engine
Implement a shared pattern:
- Controlled inputs
- Derived results via `useMemo`
- No calculate button
- Immediate recalculation

Guardrails:
- Handle empty values safely
- Avoid NaN propagation
- Show incomplete state when required inputs missing

### Phase 3 — Calculator Modules
Each calculator defined in `blueprint.md` becomes a module:

```
/components/calculators/<calculator>/
  schema.ts
  compute.ts
  ui.tsx
```

Rules:
- All math lives in `compute.ts`
- UI never duplicates formulas
- Results prioritize profit / cashflow / savings

### Phase 4 — Landing Page
Landing page shows calculator cards:
- title
- description
- tags
- open calculator CTA

### Phase 5 — Lead Capture
Implement universal lead capture:
- Name
- Email
- Phone
- Credit score band
- Calculator inputs + outputs snapshot

Endpoint:

```
/api/leads
```

Stores lead or forwards to CRM webhook.

### Phase 5.5 — Admin Defaults Editor (Owner Controls)
Build a secure admin page for managing **calculator default values** as specified in `blueprint.md`.

Implementation requirements:
- Route: `/admin`
- AuthN/AuthZ:
  - Minimum viable: password-protected access via environment variable + session cookie
  - Preferred: NextAuth/Auth.js with email magic link for the owner
- Data model:
  - A single “defaults” document keyed by calculator slug + global settings
  - Versioned updates (keep prior versions for rollback)
- API:
  - `GET /api/admin/defaults` returns current defaults
  - `PUT /api/admin/defaults` validates and saves
- UI:
  - Sidebar calculator selector
  - Form generated from schemas to avoid drift
  - Save + Reset buttons
  - “Last updated” display
- Runtime consumption:
  - Calculators load defaults server-side (preferred) or client fetch on first render
  - Cache for performance; invalidate on save
  - Fallback to hardcoded defaults if fetch fails

Security guardrails:
- Never expose admin endpoints without auth checks.
- Rate limit admin endpoints.
- Log changes (who/when/what) for audit.

### Phase 6 — Compliance + SEO
- calculator disclaimers
- page metadata
- accessibility checks

### Phase 7 — Testing + Deployment
- unit test compute functions
- verify dynamic recalculation
- deploy to Vercel

---

## Engineering Conventions

### Code Organization
- math in pure functions
- no side effects in compute layer

### Input Handling
- show units
- validate ranges

### Deal Indicator
Shared component accepting:

```
score
label
reason
```

---

## Completion Checklist

- landing page
- all calculators functional
- dynamic recalculation
- deal health indicators
- credit score input
- lead capture
- admin defaults editor
- deployment ready

---

## References
Full product specification defined in `blueprint.md`.

