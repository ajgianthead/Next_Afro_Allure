-- In-app refund system. Businesses issue refunds only from the appointment
-- detail modal (src/features/refunds); the refund button in the embedded
-- Stripe Connect payments widget is disabled. Every Stripe refund gets one
-- row in `refunds`, and the appointment's refunded_amount / refund_status
-- are always recomputed from those rows — never written directly — so two
-- refunds on the same appointment (deposit + balance) can't overwrite each
-- other the way the old single refund_id/refunded_amount columns did.
--
-- Run in the Supabase SQL editor (or via the CLI) — it is not executed
-- automatically by the application.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'refund_status') THEN
    CREATE TYPE refund_status AS ENUM ('NONE', 'PARTIAL', 'FULL');
  END IF;
END$$;

-- Refund state lives alongside the appointment's lifecycle status instead of
-- replacing it, so a cancelled + refunded appointment still reads Cancelled.
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS refund_status refund_status NOT NULL DEFAULT 'NONE';

CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES business_users(business_id),
  stripe_refund_id text NOT NULL UNIQUE,
  payment_intent_id text NOT NULL,
  charge_type text NOT NULL CHECK (charge_type IN ('DEPOSIT', 'SERVICE')),
  amount integer NOT NULL CHECK (amount > 0),
  status text NOT NULL CHECK (status IN ('pending', 'requires_action', 'succeeded', 'failed', 'canceled')),
  reason text,
  note text,
  -- The business user who issued it from the app. NULL means the refund
  -- reached us through the webhook without app metadata (e.g. issued from
  -- the platform's own Stripe dashboard).
  initiated_by uuid,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refunds_appointment_id_idx ON refunds (appointment_id);
CREATE INDEX IF NOT EXISTS refunds_business_id_idx ON refunds (business_id);

-- Businesses can read their own refunds. All writes go through the service
-- role (server action after an ownership check, or the Stripe webhook), so
-- there are deliberately no INSERT/UPDATE/DELETE policies — a business can't
-- fabricate or edit refund records from the browser.
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Businesses can read their own refunds" ON refunds;
CREATE POLICY "Businesses can read their own refunds"
  ON refunds FOR SELECT
  TO authenticated
  USING (business_id = auth.uid());

-- Recompute an appointment's refund totals from its refund rows. Pending
-- refunds count: the money is committed and Stripe already counts them
-- against the charge's refundable amount. Failed/canceled ones don't.
CREATE OR REPLACE FUNCTION refresh_appointment_refund_totals(p_appointment_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  WITH totals AS (
    SELECT coalesce(sum(amount), 0) AS total, max(created_at) AS last_refund_at
    FROM refunds
    WHERE appointment_id = p_appointment_id
      AND status IN ('pending', 'requires_action', 'succeeded')
  )
  UPDATE appointments a
  SET refunded_amount = totals.total,
      refunded_at = totals.last_refund_at,
      refund_status = (
        CASE
          WHEN totals.total = 0 THEN 'NONE'
          WHEN totals.total >= a.paid_amount THEN 'FULL'
          ELSE 'PARTIAL'
        END
      )::refund_status
  FROM totals
  WHERE a.id = p_appointment_id;
$$;

REVOKE EXECUTE ON FUNCTION refresh_appointment_refund_totals(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION refresh_appointment_refund_totals(uuid) TO service_role;

-- Backfill refund_status for appointments the old charge.refunded handler
-- already touched.
UPDATE appointments
SET refund_status = (
  CASE
    WHEN coalesce(refunded_amount, 0) = 0 THEN 'NONE'
    WHEN refunded_amount >= paid_amount THEN 'FULL'
    ELSE 'PARTIAL'
  END
)::refund_status
WHERE refunded_amount IS NOT NULL;
