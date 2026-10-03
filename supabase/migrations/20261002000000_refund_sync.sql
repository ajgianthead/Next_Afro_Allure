-- Refunds issued through Stripe's embedded Connect UI (ConnectPayments,
-- src/features/monetization/components/EarningsTab.tsx) never synced back
-- to Supabase — there was no REFUNDED status and no webhook handler for
-- charge.refunded. This adds both. Run in the Supabase SQL editor (or via
-- the CLI) — it is not executed automatically by the application.

ALTER TYPE status ADD VALUE IF NOT EXISTS 'REFUNDED';

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS refund_id text,
  ADD COLUMN IF NOT EXISTS refunded_amount numeric,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz;
