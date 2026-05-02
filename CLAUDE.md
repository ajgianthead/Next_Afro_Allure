# AfroAllure — Claude Code Instructions

## Environment Variables

### Rule: live/production keys never exist in code or `.env.local`

`.env.local` holds **development/test keys only**. Production keys live exclusively in Vercel's environment variable settings. When Vercel builds or runs the app, it injects the right value for each environment (Preview vs Production). Code never needs to know which environment it's in for the purpose of selecting a key.

**Never write conditionals like this:**
```ts
process.env.NODE_ENV === 'production'
  ? process.env.STRIPE_SECRET_LIVE_KEY
  : process.env.STRIPE_SECRET_KEY
```

**Always write this instead:**
```ts
process.env.STRIPE_SECRET_KEY
```

In Vercel: set `STRIPE_SECRET_KEY` to the test key in Preview environments and the live key in Production. One variable name, Vercel injects the right value.

### How Vercel environment injection works

In the Vercel dashboard under **Project → Settings → Environment Variables**:
- Add each variable once per environment scope (Development / Preview / Production)
- For each variable, the value differs by scope — the variable name stays the same
- `.env.local` provides values for local `next dev` only and is never committed to git

---

## Current environment variables

| Variable | Used in | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_ENV` | General | `development` locally, `production` in Vercel prod |
| `STRIPE_SECRET_KEY` | `src/lib/utils.ts` | Server-side Stripe client |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Multiple client components | Stripe.js / Connect init |
| `SUB_WEBHOOK_SECRET` | `src/app/api/webhook/subscriptions/route.ts` | Stripe webhook verification |
| `CONNECTED_ACCOUNT_WEBHOOK_SECRET` | `src/app/api/webhook/connected_accounts/route.ts` | Stripe webhook verification |
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase clients | Dev project URL locally |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | All Supabase clients | Dev publishable key locally |
| `SUPABASE_ROLE_SECRET_KEY` | Server-side admin operations | Service role / secret key |
| `NEXT_PUBLIC_SUPABASE_CONNECTION_STRING` | `src/app/utils/dbPool.ts` | Direct Postgres pool connection |
| `RESEND_API_KEY` | Email sending (multiple files) | Resend API |
| `NEXT_PUBLIC_TRIGGER_API_KEY` | `src/trigger/reminder.ts` | Trigger.dev task scheduling |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `lib/analytics.ts`, `lib/gtag.ts` | Google Analytics |
| `NEXT_PUBLIC_ANALYTICS_API_SECRET` | `lib/analytics.ts` | GA measurement protocol |
| `ANALYTICS_PROPERTY_ID` | `lib/analytics.ts` | GA property ID |
| `GOOGLE_ANALYTICS_KEY` | `lib/analytics.ts` | Service account JSON (stringified) |
| `GOOGLE_MAPS_KEY` | `src/app/marketplace/actions.ts` | Google Maps geocoding |
| `NEXT_PUBLIC_GOOGLE_FONTS_API_KEY` | `src/useGoogleFonts.ts` | Google Fonts API |
| `NEXT_PUBLIC_MAILCHIMP_API_KEY` | `src/app/utils/bull_mq.ts` | Mailchimp |
| `NEXT_PUBLIC_BASE_URL` | Multiple files | `http://localhost:3000` locally, `https://beta.afroallure.co` in Vercel prod |
| `NEXT_PUBLIC_SECRET` | `src/app/business/[businessName]/edit/components/prebuitComponents/card/index.tsx` | Encryption key |

### Variables that no longer exist
These were removed as part of the env cleanup (2025-04-25). Do not re-add them:
- `STRIPE_SECRET_LIVE_KEY` — replaced by `STRIPE_SECRET_KEY` (Vercel injects correct value)
- `NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY` — replaced by `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_PROD_BASE_URL` — replaced by `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_TRIGGER_PROD_KEY` — replaced by `NEXT_PUBLIC_TRIGGER_API_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — not referenced in code, removed
- `NEXT_PUBLIC_SUPABASE_DEV_URL` — consolidated into `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_DEV_PUBLISHABLE_KEY` — consolidated into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` — prod secret, removed; use `SUPABASE_ROLE_SECRET_KEY` (Vercel injects correct value)
- `SUPABASE_DEV_SECRET_KEY` — renamed to `SUPABASE_ROLE_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_DEV_CONNECTION_STRING` — consolidated into `NEXT_PUBLIC_SUPABASE_CONNECTION_STRING`
- `TRIGGER_API_KEY` — renamed to `NEXT_PUBLIC_TRIGGER_API_KEY`

---

## Project structure notes

- Features live in `src/features/` (automatedBooking, manualBooking, availability, stripe, shared)
- Server actions are co-located under `feature/server/actions.ts`
- Domain models live under `feature/server/models/`
- Dashboard pages in `src/app/dashboard/` import from features — no business logic in page files
