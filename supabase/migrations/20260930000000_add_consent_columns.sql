-- Adds ToS/privacy consent tracking and marketing opt-in/unsubscribe support
-- to business_users. Run this in the Supabase SQL editor (or via the CLI) —
-- it is not executed automatically by the application.

ALTER TABLE business_users
  ADD COLUMN IF NOT EXISTS tos_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS tos_ip_address text,
  ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS unsubscribe_token text UNIQUE DEFAULT gen_random_uuid()::text;
