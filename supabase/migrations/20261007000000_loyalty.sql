-- Loyalty program: per-business rules, an append-only ledger of visits /
-- rewards, and issued reward codes. Visits are recorded by a trigger when an
-- appointment becomes COMPLETED (cash or online), so every completion path
-- counts and nothing counts twice.

-- ─── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.loyalty_programs (
    business_id uuid primary key references public.business_users (business_id) on delete cascade,
    enabled boolean not null default false,
    -- 'visits': every N completed visits earns a reward; 'spend': every $X paid.
    earn_type text not null default 'visits' check (earn_type in ('visits', 'spend')),
    visits_required integer not null default 5 check (visits_required between 1 and 50),
    spend_threshold_cents integer not null default 50000 check (spend_threshold_cents > 0),
    -- 'amount_off' (cents) or 'percent_off' (1-100)
    reward_type text not null default 'amount_off' check (reward_type in ('amount_off', 'percent_off')),
    reward_value integer not null default 2000 check (reward_value > 0),
    reward_expiry_days integer default 180 check (reward_expiry_days is null or reward_expiry_days > 0),
    -- Bonus visit for coming back within N days of the previous visit (maintenance cycle).
    rebook_bonus_enabled boolean not null default false,
    rebook_within_days integer not null default 42 check (rebook_within_days between 1 and 365),
    -- Referral: both the referrer and the new client get this much off (cents).
    referral_enabled boolean not null default false,
    referral_reward_cents integer not null default 1000 check (referral_reward_cents > 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.loyalty_rewards (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.business_users (business_id) on delete cascade,
    client_id uuid not null references public.client_users (client_id) on delete cascade,
    code text not null unique,
    status text not null default 'available' check (status in ('available', 'used', 'expired', 'void')),
    reward_type text not null check (reward_type in ('amount_off', 'percent_off')),
    value integer not null check (value > 0),
    source text not null default 'program' check (source in ('program', 'referral', 'manual')),
    issued_at timestamptz not null default now(),
    expires_at timestamptz,
    used_at timestamptz,
    used_appointment_id uuid references public.appointments (id) on delete set null,
    -- Discount actually applied, in cents (set when used).
    used_amount_cents integer
);
create index if not exists loyalty_rewards_client_idx on public.loyalty_rewards (business_id, client_id, status);

create table if not exists public.loyalty_ledger (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.business_users (business_id) on delete cascade,
    client_id uuid not null references public.client_users (client_id) on delete cascade,
    appointment_id uuid references public.appointments (id) on delete set null,
    -- visit / bonus: earned; reward: progress converted into a reward (negative);
    -- redeem: reward used; adjust: manual change by the business.
    kind text not null check (kind in ('visit', 'bonus', 'reward', 'redeem', 'adjust', 'referral')),
    visits integer not null default 0,
    spend_cents integer not null default 0,
    reward_id uuid references public.loyalty_rewards (id) on delete set null,
    note text,
    -- Set once the client has been emailed about this visit (sent at most once).
    notified_at timestamptz,
    created_at timestamptz not null default now()
);
create index if not exists loyalty_ledger_client_idx on public.loyalty_ledger (business_id, client_id, created_at desc);
-- One visit / one bonus per appointment, ever.
create unique index if not exists loyalty_ledger_once_per_appointment
    on public.loyalty_ledger (appointment_id, kind)
    where appointment_id is not null and kind in ('visit', 'bonus', 'referral');

-- Appointment-level discount from a reward (cents).
alter table public.appointments
    add column if not exists loyalty_reward_id uuid references public.loyalty_rewards (id) on delete set null,
    add column if not exists discount_cents integer not null default 0;

-- ─── Row-level security ──────────────────────────────────────────────────────

alter table public.loyalty_programs enable row level security;
alter table public.loyalty_rewards enable row level security;
alter table public.loyalty_ledger enable row level security;

drop policy if exists "owner manages loyalty program" on public.loyalty_programs;
create policy "owner manages loyalty program" on public.loyalty_programs
    for all to authenticated using (public.is_business_owner(business_id)) with check (public.is_business_owner(business_id));

drop policy if exists "owner reads rewards" on public.loyalty_rewards;
create policy "owner reads rewards" on public.loyalty_rewards
    for select to authenticated using (public.is_business_owner(business_id));

drop policy if exists "owner reads ledger" on public.loyalty_ledger;
create policy "owner reads ledger" on public.loyalty_ledger
    for select to authenticated using (public.is_business_owner(business_id));
-- Rewards and ledger rows are written by the trigger and by server code
-- (service role) — businesses can't mint rewards or edit history directly.

-- ─── Helpers ─────────────────────────────────────────────────────────────────

create or replace function public.loyalty_new_code()
returns text language sql volatile set search_path = '' as $$
    -- e.g. AA-7F3KQ2 (no 0/O/1/I to avoid confusion)
    select 'AA-' || string_agg(substr('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 1 + floor(random() * 32)::int, 1), '')
    from generate_series(1, 6);
$$;

-- Turns banked progress into rewards for one client. Returns rewards issued.
-- p_appointment (optional) is the visit that tipped them over, for notifications.
drop function if exists public.loyalty_issue_rewards(uuid, uuid);
create or replace function public.loyalty_issue_rewards(p_business uuid, p_client uuid, p_appointment uuid default null)
returns integer language plpgsql security definer set search_path = '' as $$
declare
    prog public.loyalty_programs;
    bank integer;
    step integer;
    issued integer := 0;
    reward_id uuid;
begin
    select * into prog from public.loyalty_programs where business_id = p_business;
    if not found or not prog.enabled then return 0; end if;

    if prog.earn_type = 'visits' then
        step := prog.visits_required;
        select coalesce(sum(visits), 0) into bank from public.loyalty_ledger where business_id = p_business and client_id = p_client;
    else
        step := prog.spend_threshold_cents;
        select coalesce(sum(spend_cents), 0) into bank from public.loyalty_ledger where business_id = p_business and client_id = p_client;
    end if;

    while bank >= step and issued < 10 loop
        loop
            begin
                insert into public.loyalty_rewards (business_id, client_id, code, reward_type, value, source, expires_at)
                values (p_business, p_client, public.loyalty_new_code(), prog.reward_type, prog.reward_value, 'program',
                        case when prog.reward_expiry_days is null then null else now() + make_interval(days => prog.reward_expiry_days) end)
                returning id into reward_id;
                exit;
            exception when unique_violation then
                -- code collision: try another
            end;
        end loop;
        insert into public.loyalty_ledger (business_id, client_id, appointment_id, kind, visits, spend_cents, reward_id, note)
        values (p_business, p_client, p_appointment, 'reward',
                case when prog.earn_type = 'visits' then -step else 0 end,
                case when prog.earn_type = 'spend' then -step else 0 end,
                reward_id, 'Reward earned');
        bank := bank - step;
        issued := issued + 1;
    end loop;
    return issued;
end $$;

-- Matches an appointment to its client record by email, then phone.
-- (appointments.client defaults to a random uuid, so it isn't a reliable link.)
create or replace function public.loyalty_client_for(appt public.appointments)
returns uuid language sql stable security definer set search_path = '' as $$
    select coalesce(
        (select c.client_id from public.client_users c
          where nullif(lower(appt.client_metadata->>'email'), '') is not null
            and lower(c.email) = lower(appt.client_metadata->>'email') limit 1),
        (select c.client_id from public.client_users c
          where nullif(appt.client_metadata->>'phoneNumber', '') is not null
            and c.phone_number = appt.client_metadata->>'phoneNumber' limit 1)
    );
$$;

-- ─── Earning trigger ────────────────────────────────────────────────────────

create or replace function public.loyalty_on_appointment_completed()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
    prog public.loyalty_programs;
    v_client uuid;
    v_inserted integer;
    v_prev_end timestamptz;
    v_spend integer;
begin
    if new.status <> 'COMPLETED' or (tg_op = 'UPDATE' and old.status = 'COMPLETED') then
        return new;
    end if;
    select * into prog from public.loyalty_programs where business_id = new.business;
    if not found or not prog.enabled then return new; end if;

    v_client := public.loyalty_client_for(new);
    if v_client is null then return new; end if;

    -- Spend = what the client actually paid for this visit (cash or online).
    v_spend := greatest(0, coalesce(new.paid_amount, 0) - coalesce(new.refunded_amount, 0)::integer);

    insert into public.loyalty_ledger (business_id, client_id, appointment_id, kind, visits, spend_cents, note)
    values (new.business, v_client, new.id, 'visit', 1, v_spend, 'Completed visit')
    on conflict do nothing;
    get diagnostics v_inserted = row_count;
    if v_inserted = 0 then return new; end if;

    -- Maintenance-cycle bonus: back within N days of their previous visit.
    if prog.rebook_bonus_enabled then
        select max(a.end) into v_prev_end
        from public.appointments a
        where a.business = new.business and a.id <> new.id and a.status = 'COMPLETED'
          and a.start < new.start
          and public.loyalty_client_for(a) = v_client;
        if v_prev_end is not null and new.start <= v_prev_end + make_interval(days => prog.rebook_within_days) then
            insert into public.loyalty_ledger (business_id, client_id, appointment_id, kind, visits, note)
            values (new.business, v_client, new.id, 'bonus', 1, 'Rebooked on time')
            on conflict do nothing;
        end if;
    end if;

    perform public.loyalty_issue_rewards(new.business, v_client, new.id);
    return new;
end $$;

drop trigger if exists loyalty_on_appointment_completed on public.appointments;
create trigger loyalty_on_appointment_completed
    after insert or update of status on public.appointments
    for each row execute function public.loyalty_on_appointment_completed();

revoke all on function public.loyalty_issue_rewards(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.loyalty_client_for(public.appointments) from public, anon, authenticated;
revoke all on function public.loyalty_new_code() from public, anon, authenticated;
grant execute on function public.loyalty_issue_rewards(uuid, uuid, uuid) to service_role;
grant execute on function public.loyalty_new_code() to service_role;
