-- Maintenance-cycle rebooking: a service can say "clients usually come back
-- every N weeks"; a daily job emails clients who are due and haven't rebooked.

alter table public.services
    add column if not exists rebook_weeks integer check (rebook_weeks is null or rebook_weeks between 1 and 52);

-- Set when the client was sent a "time to rebook" email for this visit.
alter table public.appointments
    add column if not exists rebook_nudged_at timestamptz;

create index if not exists appointments_rebook_due_idx
    on public.appointments ("end")
    where status = 'COMPLETED' and rebook_nudged_at is null;
