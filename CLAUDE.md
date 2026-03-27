# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js Version Warning

**This is NOT the Next.js you know.** This version has breaking changes — APIs, conventions, and file structure may all differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Docker (full self-hosted Supabase stack)
docker compose up -d   # Start all services (Postgres, Auth, API Gateway, Next.js, etc.)
```

No test framework is configured in this project.

## Architecture Overview

### Stack
- **Next.js** (latest) with App Router and React 19
- **Supabase** (self-hosted via Docker Compose) for database, auth, storage, and realtime
- **PostgreSQL 15** with Row-Level Security as the primary data store
- **TypeScript** with strict mode
- **Tailwind CSS** + **shadcn/ui** for UI components
- **pnpm** as the package manager

### Authentication

Authentication uses `@supabase/ssr` for cookie-based sessions. The critical flow:

1. **Middleware** (`proxy.ts` → `lib/supabase/proxy.ts`): Runs on every request, calls `supabase.auth.getClaims()` to refresh sessions. **Never put code between `createServerClient` and `getClaims()` — it causes random logouts.** Unauthenticated users are redirected to `/auth/login` (except `/` and `/auth/*` routes).

2. **Server Components**: Use `lib/supabase/server.ts` → `createServerClient()`. Never create a global client instance (breaks Fluid compute).

3. **Client Components**: Use `lib/supabase/client.ts` → `createBrowserClient()`.

4. **Auth confirm route** (`app/auth/confirm/route.ts`): Handles OTP/magic link verification via `supabase.auth.verifyOtp()`.

### Database Schema

The schema (`supabase/migrations/schema.sql`) is organized into four domains:

- **Core ecommerce**: `profiles`, `shops`, `products`, `product_images`, `product_variants`, `product_categories`, `orders`, `order_items`, `reviews`
- **Subscriptions**: `subscription_plans`, `user_subscriptions`, `subscription_invoices`
- **Analytics pipeline** (raw): `user_events` (partitioned by `created_at`), `store_daily_metrics`, `product_daily_metrics`
- **Insights output** (analytics server writes, app reads): `store_insight_scores`, `product_insights`, `platform_insights`

Key enums: `user_role` (buyer/seller/admin), `shop_status`, `product_status`, `order_status`.

RLS policies enforce multi-tenancy at the database layer — sellers only see their own data, premium insights are gated by active subscription plan tier. No additional application-level auth checks needed.

### Data Access

All data is accessed via the Supabase client SDK (PostgREST), not raw SQL queries from the app. RLS handles authorization automatically based on the authenticated user's JWT claims.

### Environment Variables

Key variables (see `.env.example` for the full list):
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase API URL (public)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase anon key (public)
- The middleware checks `hasEnvVars` from `lib/utils.ts` and skips auth enforcement if env vars are missing (for initial setup).

### UI Components

shadcn/ui components live in `components/ui/`. Add new components via the shadcn CLI. Use `cn()` from `lib/utils.ts` for conditional class merging (combines `clsx` + `tailwind-merge`).

Dark mode is provided by `next-themes` configured in the root layout.

### Deployment

- **Docker Compose**: Full self-hosted stack with Supabase services (GoTrue, PostgREST, Realtime, Storage, Kong gateway, Studio dashboard), PostgreSQL, Redis, and Next.js
- **Vercel**: Supported — the Next.js app is Vercel-compatible
- **Standalone output**: `next.config.ts` sets `output: "standalone"` for the Docker image
