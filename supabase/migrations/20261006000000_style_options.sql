-- Braid / loc style options and prep instructions.
--
-- services.style_options: size × length price/time grid and hair setting
--   (shape validated in src/features/services/pricing.ts — parseStyleOptions).
-- services.prep: prep instructions, checklist, and whether the client must
--   agree before booking (parsePrep).
-- appointments.selected_options: snapshot of what the client chose and what it
--   cost, so editing a service later doesn't change past bookings.
-- appointments.acknowledged_at: when the client agreed to the prep/policies.
--
-- All nullable — existing services and appointments are unaffected. Row-level
-- security on both tables already covers the new columns.

alter table public.services
    add column if not exists style_options jsonb,
    add column if not exists prep jsonb;

alter table public.appointments
    add column if not exists selected_options jsonb,
    add column if not exists acknowledged_at timestamptz;
