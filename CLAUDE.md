# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build (runs TS check)
npm run lint         # ESLint
```

## What This Product Is

**Irvo** — UK late payment enforcement SaaS for freelancers and small agencies. It tracks overdue B2B invoices, applies statutory interest under the Late Payment of Commercial Debts Act 1998 (8% + BoE base rate = 13% p.a.), runs automated 4-stage reminder sequences, and generates PDF evidence packs. Stripe handles billing and client payment portals.

## Environment Setup

Copy `.env.local` and fill in real values:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` — full origin URL (e.g. `https://irvo.co.uk`), used in payment links and emails
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_STUDIO` / `STRIPE_PRICE_FIRM`
- `RESEND_API_KEY` + `RESEND_DOMAIN`
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- `CRON_SECRET` — arbitrary secret, sent as `Authorization: Bearer <secret>` by Vercel cron

## Route Structure

- `src/app/(auth)/` — login, signup, reset-password (public, dark design)
- `src/app/(app)/` — dashboard, invoices, clients, settings (auth-gated, sidebar layout)
- `src/app/api/` — all API routes, plain Next.js route handlers
- `src/app/page.tsx` — public landing page
- `src/app/audit/page.tsx` — free "Late Payment Audit" lead-gen tool (no auth required)
- `src/app/pay/[token]/page.tsx` — client-facing payment portal (no auth, token-gated)

## Design System

**Colours (never deviate from these):**
- Background: `#040404`
- Surface: `#0c0c0c`
- Surface 2: `#131313` / app shell: `#080808`
- Accent (teal): `#00e5bf` — used for CTAs, active states, highlights
- Text: `#e8e8e8` / muted: `#666` / dim: `#333`
- Error: `#e54747` / success: `#36bd5f`

**Typography:** Raleway (Next.js font, weights 400–900). Applied via `var(--font-raleway)` CSS variable set on `<body>`. Always pass `fontFamily: 'var(--font-raleway), Raleway, Helvetica, Arial, sans-serif'` on containers.

**Visual style:** Flat, dark, sharp — no border-radius on cards/inputs/buttons (except pill buttons which use `borderRadius: 100`). Borders: `1px solid rgba(255,255,255,0.07)`. Buttons use dark text `#040404` on teal backgrounds.

**Shared-wall border grids:** `className="wall-grid"` on container + children auto get internal borders. See globals.css.

## Responsive / Mobile Architecture

**Critical pattern:** All layout uses inline React `style={{}}` props. To override these on mobile, CSS classes with `!important` are used in `globals.css`. This is intentional — do not fight it.

**Responsive CSS classes** (defined in `src/app/globals.css`):
- `.r-grid-2/3/4/6` — responsive grid columns (collapse at 768px/480px)
- `.wall-grid` — shared-wall borders that switch to bottom-borders on mobile
- `.table-scroll` — horizontal scroll wrapper for tables
- `.mobile-only` / `.desktop-only` — visibility helpers
- `.hp-section-pad` / `.hp-hero-pad` / `.hp-cta-pad` — homepage section padding (120px → 64px on mobile)
- `.hp-law-grid` / `.hp-esc-grid` — 2-col homepage grids that collapse to 1-col
- `.hp-modal-grid-2` / `.hp-modal-grid-3` — EscalationModal form grids that stack on mobile
- `.hp-pricing-header` — pricing toggle row that stacks on mobile
- `.auth-right-panel` — auth form panel (fills screen on mobile)
- `.app-mobile-header` — fixed top bar shown on mobile only (hidden desktop)
- `.sidebar-root` / `.sidebar-open` — sidebar becomes a fixed drawer on mobile
- `.sidebar-close-btn` — X button shown inside sidebar on mobile only
- `.pay-main` — pay page padding adjustment on mobile

**iPhone-specific fixes already in place:**
- `viewport` is a separate `export const viewport: Viewport` in `layout.tsx` — NOT inside `metadata` (Next.js 14+ requirement; putting it in metadata is silently ignored and breaks iOS)
- Inputs get `font-size: 16px !important` on mobile (prevents iOS auto-zoom)
- Sidebar uses `height: 100dvh` (not `vh`) to handle iOS address bar
- `viewportFit: 'cover'` + `env(safe-area-inset-*)` for notch support

## App Shell (Authenticated Layout)

`src/components/layout/AppNavigationWrapper.tsx` — client component that owns mobile sidebar open/close state. Renders the fixed mobile header bar (hamburger + IRVO wordmark) and backdrop overlay. Passes `mobileOpen`/`onMobileClose` props to `Sidebar`.

`src/components/layout/Sidebar.tsx` — uses plain `<aside className="sidebar-root">` (not motion.aside). The `.sidebar-open` CSS class triggers the slide-in transition. Nav links call `onMobileClose` on click to close the drawer.

`src/app/(app)/layout.tsx` — server component that fetches org/plan from Supabase, then renders `<AppNavigationWrapper>`.

## Core Business Logic

- `src/lib/interest.ts` — `calculateInterest(invoice)` → `{ days_overdue, interest_amount, compensation_fee, total }`. Rate: `(0.05 + 0.08) / 365`. Compensation: <£1k → £40, £1k–£10k → £70, ≥£10k → £100.
- `src/lib/reminders.ts` — `determineReminderStage(invoice)` → 1–4 or null. `renderTemplate()` substitutes `{{variable}}` placeholders.
- `src/lib/pdf.ts` — `@react-pdf/renderer` server-side PDF generation. Cast `createElement` result to `any` to satisfy the type checker.
- `src/lib/ratelimit.ts` — Upstash Redis sliding window. Client is **lazily initialized** to avoid build-time env var failures. Two exported functions: `checkReminderRateLimit(orgId)` (20/hr) and `checkPublicRateLimit(ip)` (5/hr for unauthenticated endpoints).

## Security

**`next.config.ts`:** Security headers on every response (`X-Frame-Options: DENY`, `X-Content-Type-Options`, `Strict-Transport-Security` 2yr, `Referrer-Policy`, `Permissions-Policy`). `poweredByHeader: false`. `productionBrowserSourceMaps: false`.

**`src/lib/api-error.ts`:** Shared helpers used by all API routes — `serverError()`, `unauthorized()`, `forbidden()`, `notFound()`, `badRequest()`. Never return raw `error.message` from Supabase to clients. Always use these helpers.

**Public API endpoints** (`/api/public/legal-demand`, `/api/public/ccj-pack`): IP-based rate limiting via `checkPublicRateLimit`, full Zod validation, max invoice amount £1M.

**Database:** RLS enabled on all tables, scoped via `get_user_org_id()` security-definer function. Even if API auth is bypassed, a user cannot read another org's data at the DB level.

**Stripe webhook** (`/api/webhooks/stripe`): Signature verified via `stripe.webhooks.constructEvent`. Cron endpoint requires `Authorization: Bearer <CRON_SECRET>`.

## Supabase Clients

- `src/lib/supabase/client.ts` — browser client, use in `'use client'` components
- `src/lib/supabase/server.ts` — `createClient()` for SSR/route handlers + `createAdminClient()` (service role, bypasses RLS — only for cron, webhooks, pay portal)

## Infrastructure

**Cron:** `POST /api/cron/overdue` — daily at 06:00 UTC (`vercel.json`). Marks overdue invoices, auto-escalates 30+ day ones, recomputes client risk scores + payment predictions.

**Stripe:** Webhook at `/api/webhooks/stripe` handles subscription lifecycle → updates `organizations.plan`. Test: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

**Pay portal:** `/pay/[token]` — public page. Tokens stored in `payment_tokens` table with expiry. Admin client used server-side to read past RLS.

## Key Patterns

- All API routes: auth-check with `supabase.auth.getUser()` → look up `organization_id` from `users` table → use that for all DB queries
- `useSearchParams()` always wrapped in `<Suspense>` (Next.js 15 requirement)
- Form validation: use `defaultValues` in `useForm`, not `z.string().default()` (causes resolver type mismatch)
- Adding a new grid layout: add a CSS class to `globals.css` with desktop styles + `@media (max-width: 768px)` override using `!important`. Add `className` to the JSX element. Do not attempt to use inline style media queries.
- New public API endpoints must import `checkPublicRateLimit` from `src/lib/ratelimit.ts` and use `serverError`/`unauthorized` from `src/lib/api-error.ts`
