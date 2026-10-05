-- No-show fees charged to the card saved with the deposit.
-- The fee agreed at booking is stored on the Stripe deposit payment itself
-- (metadata), so later policy changes never change what a client agreed to.

alter table public.business_policies
    add column if not exists no_show_fee jsonb not null default '{"enabled": false, "type": "flat", "value": 0}'::jsonb;

alter table public.appointments
    -- null → not charged; 'processing' while the charge is in flight (guards
    -- against double charging); 'succeeded' / 'failed' afterwards.
    add column if not exists no_show_fee_status text check (no_show_fee_status in ('processing', 'succeeded', 'failed')),
    add column if not exists no_show_fee_cents integer,
    add column if not exists no_show_fee_charge_id text,
    add column if not exists no_show_fee_error text,
    add column if not exists no_show_fee_charged_at timestamptz;
