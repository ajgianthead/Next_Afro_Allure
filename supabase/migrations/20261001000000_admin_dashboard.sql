-- Admin founder-dashboard support: feedback + support ticket tables, plus a
-- few new business_users columns. Run this in the Supabase SQL editor (or
-- via the CLI) — it is not executed automatically by the application.

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES business_users(business_id),
  business_name text,
  email text,
  type text NOT NULL CHECK (type IN ('bug', 'feature_request', 'general', 'complaint', 'praise')),
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  founder_notes text
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES business_users(business_id),
  business_name text,
  email text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  founder_reply text
);

-- business_users additions for the dashboard's revenue/health tracking.
-- NOTE: these are populated by the Stripe subscription webhook handler
-- (src/app/api/webhook/subscriptions/route.ts), parallel to the existing
-- plan_type column — plan_type stays STARTER/GROWTH (what the rest of the
-- app gates features on); subscription_status additionally tracks
-- trialing/active/canceled/paused so the dashboard can bucket businesses
-- without re-deriving that from plan_type + had_trial.
ALTER TABLE business_users
  ADD COLUMN IF NOT EXISTS last_checkin_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS total_booking_volume numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subscription_plan text,
  ADD COLUMN IF NOT EXISTS subscription_status text;

-- RLS: the application talks to these two new tables two ways —
-- (1) any signed-in business inserting their own feedback/ticket
--     (src/app/feedback/actions.ts, src/app/support/actions.ts), and
-- (2) the founder-only /admin dashboard reading/updating everything via the
--     service-role key (src/app/admin/data.ts, src/app/admin/actions.ts),
--     which bypasses RLS entirely. These policies only need to cover (1) —
--     without them the tables are wide open to any anon/authenticated
--     client under the publishable key, which is not what we want.
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can submit feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can submit support tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (true);
