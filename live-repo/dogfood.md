You are dogfooding this app. Fix bugs as you find them — do not skip steps.

Use Playwright. PASS/FAIL each step. Stop and fix on failure before continuing.

## What this app is (READ FIRST — it was REDESIGNED; the docs/plans are stale)

A single-page, **no-account, no-backend** mortgage tool with **two journeys** selected by a
header toggle, each a **single-focus, one-question-per-screen progressive flow** (Sana/Typeform
style). All state (inputs + selected mode) is encoded in the URL; there is no auth, no DB, no
sidebar. `docs/plans/00-*` describe the OLD dense single-screen calculator — IGNORE them. Test
against the CURRENT implementation in `src/pages/calculator/**` and `src/lib/mortgage.ts`.

The two modes:
- **Monthly payment** (`?mode` absent / default): price → what it costs. Steps: The home · The
  loan · Ongoing costs · Pay it off faster (optional).
- **Affordability** (`?mode=affordability`): income → how much you can borrow. Steps: Your income ·
  Monthly debts · Your down payment · The loan.

Flow chrome: a chromeless header with a thin top **progress line**, a "Mortgage Calculator"
wordmark (links `/`), a centered **mode toggle** ("Monthly payment" | "Affordability"), a
**Reset** control, and **Copy link** (only on the results screen). Each step: a big question on a
frosted tonal card, big inputs, **Back / Continue** pills (+ **Skip** on the optional step).
Results reveal at the end with a count-up hero, stat tiles, a breakdown, editable answer chips,
and a "See full breakdown" reveal (chart + donut + amortization).

## THE ORACLE — how to know the "correct" number (CRITICAL)

The app's own `computeMortgage(inputs)` and `computeAffordability(inputs)` in
`src/lib/mortgage.ts` are the single source of truth. Import them and assert the DOM equals their
output via `formatCurrency` from `src/pages/calculator/format.ts`.

```ts
import { computeMortgage, computeAffordability, useUrlState, currentMonth } from "@/lib/mortgage";
import { defaultInputs } from "@/data/seed";
import { formatCurrency } from "@/pages/calculator/format";
```

Do NOT assert the numbers drawn in `docs/plans/00-screenboard.md` — they are a documented
SPEC-GAP (computed on full home price + fixed Feb-2025 start). The implementation correctly uses
the loan amount and the current month.

**Start-date-INDEPENDENT anchors** (safe to hard-assert):

Monthly-payment defaults ($400,000 / 20% down $80,000 / 5.98% / 30yr / tax $5,000 / ins $1,200 /
HOA $0 / PMI 0.5% / no extra / no biweekly):
- Loan amount **$320,000** · Hero P&I **$1,914** · Property tax **$417** · Home insurance **$100**
- PMI row **hidden** (LTV = 80%, not > 80%) · HOA row **hidden** ($0)
- Total monthly **$2,431** · Total interest **$369,202** · Total of payments **$689,202**
- Amortization rows: **360** monthly.

Affordability defaults (income $120,000 / debts $500 / down $80,000 / DTI 36% / 5.98% / 30yr /
tax $5,000 / ins $1,200 / HOA $0):
- Max home price **$461,659** · Max loan **$381,659** · Est. monthly (PITI) **$2,800**
- Affordable P&I **$2,283** · Property tax **$417** · Home insurance **$100**
- Binding constraint: **income** (front-end 28% of gross); front $2,800 ≤ back ($3,600 − $500).

**Start-DEPENDENT values** (payoff date, PMI drop date, row date labels): derive from the oracle
with `startDate: currentMonth()` — never hard-code a month/year.

RULES:
- Every step has ONE action and ONE expected result. No "or". No SKIP. No dead ends — every
  control in the UI must transform state; if it renders but does nothing, that's a FAIL (fix it
  or remove it).
- If a step fails, fix the bug in source, then re-run that step.
- Use real clicks/typing; `page.goto` only for direct-URL tests (routes, shared links, 404).
- After each mutation batch, reload (URL carries state) and assert values persist.
- Charts: assert the SVG drew marks (bars + balance line, donut arcs), not just that a container
  exists ("renders" ≠ "drew").
- Screenshot every failure and every completed phase.

---

# PHASE 1 — SMOKE, ROUTES, CHROME (no auth, no sidebar)

1. Navigate to `/` → verify: page loads, no JS console errors, no error overlay.
2. Verify: header shows the "Mortgage Calculator" wordmark.
3. Verify: a mode toggle shows two options, "Monthly payment" and "Affordability".
4. Verify: "Monthly payment" is the active toggle option on first load.
5. Verify: a "Reset" control is visible in the header.
6. Verify: "Copy link" is NOT in the header during the flow (it appears only on results).
7. Verify: a thin progress line is present at the very top of the page.
8. Verify: step 1 shows overline "THE HOME", counter "Step 1 of 4", and the question "How much is the home?".
9. Verify: the Home Price input has document focus on load (it auto-focuses).
10. Click the wordmark "Mortgage Calculator" → verify: no 404, stays on the calculator.
11. Navigate to `/demo` → verify: calculator renders with the same defaults (Home price 400,000 shown).
12. Navigate to `/demo/` (trailing slash) → verify: renders (not a 404).
13. Navigate to `/this-does-not-exist` → verify: NotFound renders (heading "404", text "Page not found").
14. Click the "Go home" link on the 404 → verify: navigates to `/`, calculator renders.
15. Screenshot `/` at 1440px.

---

# PHASE 2 — MONTHLY PAYMENT JOURNEY (full flow + oracle + results)

**Step 1 — The home:**
16. Verify: Home Price input shows `400,000` with a live thousands separator (comma present).
17. Verify: "Loan amount:" readout reads `$320,000`.
18. Click Home Price → clear → type `525000` → verify: the field shows `525,000` (comma inserted live).
19. Verify: "Loan amount:" updates to the oracle value for {homePrice:525000, rest default} (dollar-mode keeps down $80,000 → loan `$445,000`, and the % field shows `15.24`).
20. Reset via header "Reset" → verify: Home Price returns to `400,000`, loan `$320,000`.
21. Set Home Price to `525000` again. Click Down Payment amount → clear → type `105000` → verify: the % field auto-updates to `20`, "Loan amount:" reads `$420,000`.
22. Verify: no PMI foreshadow hint shows (LTV = 80%, not < 20% down).
23. Click "Continue" → verify: advances to step 2 ("Tell us about the loan.").

**Step 2 — The loan:**
24. Verify: Interest rate input shows `5.98`, suffixed with `%`.
25. Open the Loan term select → verify options are exactly `10 years, 15 years, 20 years, 25 years, 30 years`; the value is not clipped (full glyph height visible).
26. Select `30 years` → verify: no change (already 30).
27. Verify: Start date select shows `formatMonthLong(currentMonth())` and its value is not clipped.
28. Change Interest rate to `6.75` → verify: field shows `6.75`.
29. Click "Continue" → verify: advances to step 3 ("What are the ongoing costs?").
30. Click "Back" → verify: returns to step 2 with rate still `6.75`.
31. Click "Continue" → step 3.

**Step 3 — Ongoing costs:**
32. Change Property tax to `6560` → verify: shows `6,560`.
33. Change Home insurance to `1560` → verify: shows `1,560`.
34. Verify: a "No PMI" line shows (down payment is 20%, LTV = 80%, PMI not required).
35. Click "+ Advanced: HOA dues" → verify: an HOA input appears.
36. Set HOA to `250` → verify: shows `250`.
37. Click "Continue" → verify: advances to step 4 ("Want to pay it off faster?", labeled optional).

**Step 4 — Pay it off faster (optional):**
38. Verify: a "Skip" control is present (this step is optional).
39. Set Extra monthly payment to `200` → verify: a savings callout appears matching `computeMortgage(...).savingsInfo.extraPayment` (formatCurrency of interestSaved + formatDuration of monthsSaved).
40. Toggle Biweekly ON → verify: a second savings callout appears matching `.savingsInfo.biweekly`.
41. Click "See results" → verify: the results screen renders (hero + "Copy link" now visible in header).

**Results (payment):**
42. Verify: the hero shows the count-up value = `computeMortgage(inputs).summary.monthlyPrincipalAndInterest + extra` (P&I + $200). Wait for the count-up to settle, then assert the final formatted value.
43. Verify: overline "Your monthly payment" and the "…all-in" total = `summary.totalMonthly + extra`.
44. Verify: three stat tiles — "Total monthly", "Payoff date" (= oracle payoffDate, derived), "Total interest" (= oracle) — with oracle values.
45. Verify: a green savings banner shows "You'll save <interestSaved> … pay off <duration> sooner" (extra-payment figures, matching the oracle).
46. Verify: the breakdown card lists Principal & interest, Extra payment $200, Property tax $547, Home insurance $130, HOA $250, and Total monthly = oracle total.
47. Verify: four editable chips are present — "The home", "The loan", "Ongoing costs", "Boosters".
48. Click the "See full breakdown" trigger → verify: it expands.
49. Verify: the payment-schedule chart SVG drew stacked bars (>5 rect/path marks) AND a balance line (`.recharts-line-curve` present).
50. Click "Show breakdown" on Lifetime Totals → verify: the donut SVG drew ≥3 arc sectors; legend shows Principal paid / Total interest / Tax & insurance / Total cost matching `.lifetimeTotals`.
51. Verify: the amortization table "Monthly" tab shows rows with 6 columns (Date, Payment, Principal, Interest, Taxes & Fees, Balance); the "(N rows total)" note is present.
52. Click the "Yearly" tab → verify: it re-renders with year rows (first Date cell = a 4-digit year = currentMonth()'s year); tabs are readable on the tonal card.
53. Click the "Monthly" tab → verify: returns to monthly rows.

**Persistence + share:**
54. Read the URL — verify it has `price=525000`, `rate=6.75`, `tax=6560`, `hoa=250`, `extra=200`, `biweekly=1` and NO `mode=` (payment is default).
55. Reload the page → verify: it opens directly on the results screen with the same hero value (a URL with encoded state is a report, not a form).
56. Click "Copy link" in the header → verify: a Sonner toast "Link copied to clipboard" appears.
57. Read the clipboard URL (grant clipboard-read); open it in a FRESH browser context → verify: identical results render (same hero), no crash, no auth wall (there is none).

---

# PHASE 3 — AFFORDABILITY JOURNEY (full flow + oracle + results)

58. Navigate to `/` fresh. Click the "Affordability" toggle in the header → verify: the flow resets to step 1 and shows overline "YOUR INCOME", "Step 1 of 4", question "What do you earn?".
59. Verify: the URL now contains `mode=affordability`.

**Step 1 — Income:**
60. Verify: Gross annual income shows `120,000` and a live helper shows `$10,000/mo` (income ÷ 12, formatted).
61. Click "Continue" → verify: advances to "Any monthly debts?" (Step 2 of 4).

**Step 2 — Debts:**
62. Verify: Monthly debt payments shows `500`.
63. Click "Continue" → verify: advances to "How much can you put down?" (Step 3).

**Step 3 — Down payment:**
64. Verify: Down payment shows `80,000`.
65. Click "Continue" → verify: advances to "What loan terms?" (Step 4).

**Step 4 — The loan:**
66. Verify: Interest rate `5.98`, Loan term `30 years` (both readable, not clipped).
67. Click "+ Advanced: debt-to-income limit" → verify: a DTI input appears showing `36`.
68. Verify: there is NO "Skip" control here (affordability step 4 is required, unlike the payment flow's optional step 4).
69. Click "See results" → verify: the affordability results render.

**Results (affordability):**
70. Verify: overline "You can afford up to" and the count-up hero = `computeAffordability(inputs).maxHomePrice` → **$461,659** at defaults.
71. Verify: subtitle "home price · <maxLoan> loan" where maxLoan = **$381,659**.
72. Verify: three stat tiles — "Max loan" $381,659, "Est. monthly" $2,800, "Down payment" $80,000.
73. Verify: the binding note reads "Your income sets the ceiling (front-end 28% of gross)." (income binds at defaults).
74. Verify: the breakdown lists Principal & interest $2,283, Property tax $417, Home insurance $100, Total monthly $2,800.
75. Verify: four editable chips — "Income", "Debts", "Down payment", "The loan".
76. Verify: a disclaimer line notes this is a standard-DTI estimate (taxes/insurance approximate, PMI not included).
77. Change the binding: click the "Debts" chip → set Monthly debts to `4000` → "See results" → verify: the binding note now reads the DEBTS variant ("Your debts set the ceiling (back-end 36% …)"), and maxHomePrice drops to `computeAffordability(...)` for debts=4000. Restore debts to `500` afterward.
78. Reload the page → verify: it reopens on affordability results (mode + inputs persisted), hero unchanged.
79. Click "Copy link" → open the copied URL in a fresh context → verify: affordability results render identically (mode preserved).

---

# PHASE 4 — ALTERNATIVE PATHS, ROBUSTNESS, RESPONSIVE

**Down payment via percent mode (Matrix E — Phase 2 used dollar mode):**
80. Reset. On step 1 click the `%` toggle → verify: it becomes active (`aria-pressed=true`), the % field becomes editable and the $ field read-only.
81. Set the % field to `10` → verify: the $ field auto-updates to `$40,000` and "Loan amount:" reads `$360,000`.
82. Continue to step 3 → verify: because LTV is 90% (>80%), the PMI block now shows a PMI rate input + a qualitative note (drops at 78% LTV) and NO dollar amount (PMI $ is deferred to results).
83. Complete the flow → on results verify a "PMI" row now appears in the breakdown with the oracle `summary.monthlyPmi`.

**Garbage / hand-built URLs (public robustness):**
84. Fresh context: `page.goto('/?price=abc&rate=&down=nope&term=')` → verify: no crash; every invalid param falls back to default (hero = $1,914 at defaults).
85. Fresh context: `page.goto('/?mode=affordability&income=200000&debts=0&cash=100000&rate=6&term=30')` → verify: affordability results decode and match `computeAffordability(...)` for those inputs.

**Reset vs Start over (Matrix E):**
86. From a populated payment results screen, click "Start over" → verify: returns to step 1 with default values, hero gone.
87. Click "Reset" from a mid-flow step → verify: inputs return to defaults and it returns to step 1.

**Chart / asset integrity:**
88. On payment results with "See full breakdown" open: assert the chart bars, balance line, and donut arcs all drew (as in steps 49–50). FAIL if any SVG is empty.
89. Enumerate every `<img>` on `/` (there are none in the product UI) → assert any present has `naturalWidth > 0`. Verify `/favicon.ico` returns 200.

**Responsive (both modes, one step per viewport):**
90. Set viewport 375px, navigate to `/` → verify: no horizontal overflow (`scrollWidth <= innerWidth + 1`); the mode toggle drops below the header row; inputs stack → screenshot.
91. Set viewport 375px → switch to Affordability, complete the flow → verify: results readable, no overflow → screenshot.
92. Set viewport 768px, `/` → verify: no overflow → screenshot.
93. Set viewport 1024px, `/` → verify: no overflow, toggle centered in header → screenshot.

**Console + screenshots:**
94. Navigate through both flows once more → verify: zero console errors and zero failed network requests throughout.
95. Screenshot: payment step 1, payment results (full breakdown open), affordability step 1, affordability results — all at 1440px.

---

# AUDITS (send as a separate message AFTER this script completes)

Run all audits and fix everything found. Full auto-fix.
1. Security — no client-side secrets; URL params are typed/parsed (no unescaped injection via
   `mode`, `downMode`, `start`); clipboard failure handled in try/catch.
2. Accessibility — WCAG: every input has an associated label; the `$`/`%` toggle and the mode
   toggle expose pressed/selected state; Back/Continue/Skip and the tabs/collapsible are
   keyboard-operable; the Material Symbols icons are aria-hidden with accessible button labels;
   AA contrast for white text on the tonal cards and the muted helper text.
3. Responsive — 375 / 768 / 1024 / 1440px for both modes; fix any overflow/clipping (especially
   the two-column down-payment inputs and the select values at the large type size).
