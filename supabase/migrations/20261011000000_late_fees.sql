-- Late fees: the business adds one to an appointment and it becomes part of
-- the balance the client pays at the end. (The fee setting itself lives in
-- the existing business_policies.late_fee json.)

alter table public.appointments
    add column if not exists late_fee_cents integer not null default 0 check (late_fee_cents >= 0),
    add column if not exists late_fee_added_at timestamptz;
