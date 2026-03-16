# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build (runs TS check)
npm run lint         # ESLint
```

## Environment Setup

Copy `.env.local` and fill in real values:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_STARTER|STUDIO|FIRM`
- `RESEND_API_KEY` + `RESEND_DOMAIN`
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- `CRON_SECRET` — arbitrary secret, sent as `Authorization: Bearer <secret>` by Vercel cron

## Architecture

**Route groups:**
- `src/app/(auth)/` — public pages: login, signup, reset-password
- `src/app/(app)/` — authenticated pages with Sidebar layout: dashboard, invoices, clients, settings
- `src/app/api/` — all API routes (no tRPC, plain Next.js route handlers)

**Auth flow:** Supabase Auth + `src/middleware.ts` protects `(app)` routes. On signup, `/api/auth/setup` creates the `organizations` + `users` record and seeds 4 reminder templates via service role key.

**Core business logic** (all pure, fully typed):
- `src/lib/interest.ts` — UK statutory interest: `(0.05 + 0.08) / 365 * days * principal` + compensation tiers
- `src/lib/reminders.ts` — stage logic (Stage 1–4 by days overdue) + `renderTemplate()` for `{{variable}}` substitution
- `src/lib/pdf.ts` — `@react-pdf/renderer` server-side PDF generation; cast createElement result to `any` to satisfy type checker
- `src/lib/ratelimit.ts` — Upstash Redis sliding window; client is **lazily initialized** to avoid build-time env var failures

**Supabase clients:**
- `src/lib/supabase/client.ts` — browser client (use in `'use client'` components)
- `src/lib/supabase/server.ts` — SSR client (`createClient`) + admin client (`createAdminClient` with service role key)

**Database:** All tables have RLS scoped to `get_user_org_id()` helper. Schema in `supabase/migrations/001_initial_schema.sql`.

**Cron job:** `POST /api/cron/overdue` — runs daily at 06:00 UTC (configured in `vercel.json`). Requires `Authorization: Bearer <CRON_SECRET>` header. Marks invoices overdue and auto-escalates 30+ day overdue ones.

**Stripe:** Webhook at `/api/webhooks/stripe` updates `organizations.plan` on subscription events. Price IDs stored as env vars `STRIPE_PRICE_STARTER|STUDIO|FIRM`. Test with `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

## Key Patterns

- All API routes auth-check via `supabase.auth.getUser()` then look up `organization_id` from `users` table
- `useSearchParams()` always wrapped in `<Suspense>` (Next.js 15 requirement)
- Form `z.string().default('X')` causes resolver type mismatch — use `defaultValues` in `useForm` instead
