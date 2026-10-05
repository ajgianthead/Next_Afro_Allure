-- Cancellation waitlist: clients ask to be told when a time opens up; when an
-- appointment is cancelled the matching clients are emailed a link to book it.
-- (client_waitlist is the AfroAllure launch mailing list — unrelated.)

create table if not exists public.booking_waitlist (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.business_users (business_id) on delete cascade,
    service_id uuid references public.services (id) on delete set null,
    first_name text not null,
    last_name text not null default '',
    email text not null,
    phone text not null default '',
    -- Days the client can come in (business-local dates).
    from_date date not null,
    to_date date not null,
    time_of_day text not null default 'any' check (time_of_day in ('any', 'morning', 'afternoon', 'evening')),
    note text,
    status text not null default 'waiting' check (status in ('waiting', 'booked', 'removed')),
    notified_count integer not null default 0,
    last_notified_at timestamptz,
    created_at timestamptz not null default now(),
    check (to_date >= from_date)
);
create index if not exists booking_waitlist_open_idx on public.booking_waitlist (business_id, status, from_date, to_date);

alter table public.booking_waitlist enable row level security;

drop policy if exists "owner reads waitlist" on public.booking_waitlist;
create policy "owner reads waitlist" on public.booking_waitlist
    for select to authenticated using (public.is_business_owner(business_id));
drop policy if exists "owner updates waitlist" on public.booking_waitlist;
create policy "owner updates waitlist" on public.booking_waitlist
    for update to authenticated using (public.is_business_owner(business_id)) with check (public.is_business_owner(business_id));
drop policy if exists "owner deletes waitlist" on public.booking_waitlist;
create policy "owner deletes waitlist" on public.booking_waitlist
    for delete to authenticated using (public.is_business_owner(business_id));
-- Clients join through a server action (service role); no public insert.

-- Business switch (on by default).
alter table public.business_users
    add column if not exists waitlist_enabled boolean not null default true;
grant update (waitlist_enabled) on public.business_users to authenticated;

-- Set once the waitlist has been told about this appointment's freed-up time.
alter table public.appointments
    add column if not exists waitlist_notified_at timestamptz;
