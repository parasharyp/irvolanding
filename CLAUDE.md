# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build (runs TS check)
npm run lint         # ESLint
```

## What This Product Is

**Irvo** — AI Act compliance SaaS for EU/UK SMEs. It guides companies through documenting their AI and automation workflows for EU AI Act compliance (enforcement: August 2, 2026). Users describe an AI system, answer a 12-question risk questionnaire, receive AI-powered risk classification + obligations mapping, capture evidence per obligation (with AI-assisted drafting), and export regulator-ready evidence packs as PDF.

## Environment Setup

Copy `.env.local` and fill in real values:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` — full origin URL (e.g. `https://irvo.co.uk`)
- `ANTHROPIC_API_KEY` — for AI classification and evidence drafting (Claude API)
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_GROWTH` / `STRIPE_PRICE_PLUS`
- `RESEND_API_KEY` + `RESEND_DOMAIN`
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`

## Route Structure

- `src/app/(auth)/` — login, signup, reset-password (public, dark design)
- `src/app/(app)/` — dashboard, systems, settings (auth-gated, sidebar layout)
- `src/app/api/` — all API routes, plain Next.js route handlers
- `src/app/page.tsx` — public landing page

### Core App Pages
- `/dashboard` — compliance overview: metrics, risk breakdown, quick actions
- `/systems` — list all documented AI systems with risk badges + progress
- `/systems/new` — 3-step wizard: Describe → Questionnaire → Classification
- `/systems/[id]` — system detail: evidence capture per obligation, AI drafting, PDF export
- `/systems/[id]/questionnaire` — review questionnaire answers
- `/settings` — org name, plan management, billing

### API Routes
- `POST /api/systems` — create system (plan limit enforced)
- `GET/PATCH/DELETE /api/systems/[id]` — system CRUD
- `POST /api/systems/classify` — AI risk classification + obligations generation
- `GET/POST /api/systems/[id]/evidence` — evidence items CRUD
- `POST /api/systems/[id]/export` — generate PDF evidence pack
- `POST /api/ai/draft` — AI-assisted evidence section drafting
- `GET /api/dashboard` — compliance metrics

## Design System

**Colours (never deviate from these):**
- Background: `#040404`
- Surface: `#0c0c0c`
- Surface 2: `#131313` / app shell: `#080808`
- Accent (teal): `#00e5bf` — used for CTAs, active states, highlights
- Text: `#e8e8e8` / muted: `#666` / dim: `#333`
- Error: `#e54747` / success: `#36bd5f` / warning: `#f59e0b`

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
- `.app-mobile-header` — fixed top bar shown on mobile only (hidden desktop)
- `.sidebar-root` / `.sidebar-open` — sidebar becomes a fixed drawer on mobile
- `.sidebar-close-btn` — X button shown inside sidebar on mobile only

**iPhone-specific fixes already in place:**
- `viewport` is a separate `export const viewport: Viewport` in `layout.tsx`
- Inputs get `font-size: 16px !important` on mobile (prevents iOS auto-zoom)
- Sidebar uses `height: 100dvh` (not `vh`) to handle iOS address bar
- `viewportFit: 'cover'` + `env(safe-area-inset-*)` for notch support

## App Shell (Authenticated Layout)

`src/components/layout/AppNavigationWrapper.tsx` — client component that owns mobile sidebar open/close state. Renders the fixed mobile header bar (hamburger + IRVO wordmark) and backdrop overlay.

`src/components/layout/Sidebar.tsx` — Nav items: Dashboard, AI Systems, Settings. Uses `.sidebar-root` CSS class for mobile drawer behavior.

`src/app/(app)/layout.tsx` — server component that fetches org/plan from Supabase, then renders `<AppNavigationWrapper>`.

## AI Layer

- `src/lib/ai/prompts.ts` — centralised prompt registry (CLASSIFY_SYSTEM_PROMPT, DRAFT_SECTION_PROMPT)
- `src/lib/ai/classify.ts` — `classifySystem()` → calls Claude API, returns ClassificationResult
- `src/lib/ai/draft.ts` — `draftEvidenceSection()` → calls Claude API, returns drafted text
- `src/lib/ai/questionnaire.ts` — QUESTIONNAIRE constant (12 questions for risk classification)

## Security

**`next.config.ts`:** Security headers on every response (`X-Frame-Options: DENY`, `X-Content-Type-Options`, `Strict-Transport-Security` 2yr, `Referrer-Policy`, `Permissions-Policy`). `poweredByHeader: false`. `productionBrowserSourceMaps: false`.

**`src/lib/api-error.ts`:** Shared helpers — `serverError()`, `unauthorized()`, `forbidden()`, `notFound()`, `badRequest()`. Never return raw `error.message` from Supabase to clients.

**Database:** RLS enabled on all tables, scoped via `get_user_org_id()` security-definer function. Even if API auth is bypassed, a user cannot read another org's data at the DB level.

**Rate limiting:** `src/lib/ratelimit.ts` — Upstash Redis sliding window. `checkAuthenticatedRateLimit(userId)` (100/min). `checkPublicRateLimit(ip)` (5/hr). Webhook idempotency via Redis SET NX.

## Supabase Clients

- `src/lib/supabase/client.ts` — browser client, use in `'use client'` components
- `src/lib/supabase/server.ts` — `createClient()` for SSR/route handlers + `createAdminClient()` (service role, bypasses RLS)

## Key Patterns

- All API routes: auth-check with `supabase.auth.getUser()` → look up `organization_id` from `users` table → use that for all DB queries
- `useSearchParams()` always wrapped in `<Suspense>` (Next.js 15 requirement)
- Form validation: use `defaultValues` in `useForm`, not `z.string().default()`
- New API endpoints must use rate limiting + Zod validation + error helpers
- Plan limits enforced: PLAN_SYSTEM_LIMITS in types/index.ts (starter: 3, growth: 10, plus: 25)
