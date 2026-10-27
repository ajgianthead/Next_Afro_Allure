-- Client-to-client referrals (Growth).
--
-- A client shares a link with their personal code (kayla.afroallure.co/book?ref=BRI-7F3K).
-- When someone new books through it, referral_attribute() records the
-- referral and takes the friend's discount off that first booking. When the
-- referred appointment is completed, the referrer's reward becomes an
-- ordinary loyalty_rewards code, so it's redeemed through the existing
-- reward-on-appointment path (no second discount system). Cancelled,
-- no-show, denied or fully refunded referred appointments earn nothing.
--
-- All writes happen in security-definer functions and server code (service
-- role). Businesses can read their own referral data; clients have no
-- logins, so they see their rewards through a private link (access_token).

-- ─── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.referral_programs (
    business_id uuid primary key references public.business_users (business_id) on delete cascade,
    enabled boolean not null default false,
    -- 'amount_off' (cents) or 'percent_off' (1-100), same meaning as loyalty rewards.
    reward_type text not null default 'amount_off' check (reward_type in ('amount_off', 'percent_off')),
    reward_value integer not null default 1000 check (reward_value > 0),
    -- Who gets the reward: the client who shared the link, the friend, or both.
    recipients text not null default 'both' check (recipients in ('both', 'referrer', 'friend')),
    -- Days the referrer's reward code stays valid (null = never expires).
    reward_expiry_days integer default 180 check (reward_expiry_days is null or reward_expiry_days > 0),
    -- Most rewards one referrer can earn (null = no limit).
    max_rewards_per_referrer integer check (max_rewards_per_referrer is null or max_rewards_per_referrer between 1 and 100),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint referral_percent_range check (reward_type <> 'percent_off' or reward_value between 1 and 100)
);

-- One personal code per client per business.
create table if not exists public.referral_codes (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.business_users (business_id) on delete cascade,
    client_id uuid not null references public.client_users (client_id) on delete cascade,
    code text not null,
    -- Private link for the client's "My rewards" page (clients have no logins).
    access_token uuid not null default gen_random_uuid() unique,
    created_at timestamptz not null default now(),
    unique (business_id, client_id),
    unique (business_id, code)
);

create table if not exists public.referrals (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.business_users (business_id) on delete cascade,
    code_id uuid not null references public.referral_codes (id) on delete cascade,
    referrer_client_id uuid not null references public.client_users (client_id) on delete cascade,
    -- Known once the referred appointment is completed (the friend may be brand new).
    referred_client_id uuid references public.client_users (client_id) on delete set null,
    referred_email text not null default '',
    -- Digits only, for matching.
    referred_phone text not null default '',
    -- The referred booking. A deposit booking that never gets paid is deleted, and its referral with it.
    appointment_id uuid not null unique references public.appointments (id) on delete cascade,
    status text not null default 'booked' check (status in ('booked', 'completed', 'void')),
    void_reason text,
    created_at timestamptz not null default now(),
    completed_at timestamptz
);
create index if not exists referrals_business_idx on public.referrals (business_id, created_at desc);
create index if not exists referrals_referrer_idx on public.referrals (business_id, referrer_client_id);
-- A person can only be referred once per business (a void referral doesn't count).
create unique index if not exists referrals_once_per_email
    on public.referrals (business_id, referred_email) where referred_email <> '' and status <> 'void';
create unique index if not exists referrals_once_per_phone
    on public.referrals (business_id, referred_phone) where referred_phone <> '' and status <> 'void';

create table if not exists public.referral_rewards (
    id uuid primary key default gen_random_uuid(),
    referral_id uuid not null references public.referrals (id) on delete cascade,
    business_id uuid not null references public.business_users (business_id) on delete cascade,
    recipient text not null check (recipient in ('referrer', 'friend')),
    client_id uuid references public.client_users (client_id) on delete set null,
    reward_type text not null check (reward_type in ('amount_off', 'percent_off')),
    value integer not null check (value > 0),
    -- pending: waiting for the referred visit. available: the referrer's code can be used.
    -- redeemed: discount taken. expired / void: nothing to use.
    status text not null default 'pending' check (status in ('pending', 'available', 'redeemed', 'expired', 'void')),
    -- The referrer's reward code, once issued.
    loyalty_reward_id uuid references public.loyalty_rewards (id) on delete set null,
    redeemed_appointment_id uuid references public.appointments (id) on delete set null,
    redeemed_amount_cents integer,
    available_at timestamptz,
    redeemed_at timestamptz,
    -- Set once the referrer has been emailed about this reward.
    notified_at timestamptz,
    created_at timestamptz not null default now(),
    unique (referral_id, recipient)
);
create index if not exists referral_rewards_business_idx on public.referral_rewards (business_id, status);
create index if not exists referral_rewards_loyalty_idx on public.referral_rewards (loyalty_reward_id);

-- Carry over the unused referral switch from the loyalty program.
insert into public.referral_programs (business_id, enabled, reward_type, reward_value, recipients)
select business_id, true, 'amount_off', referral_reward_cents, 'both'
from public.loyalty_programs
where referral_enabled
on conflict (business_id) do nothing;
comment on column public.loyalty_programs.referral_enabled is 'Deprecated: replaced by referral_programs.';
comment on column public.loyalty_programs.referral_reward_cents is 'Deprecated: replaced by referral_programs.';

-- ─── Row-level security ──────────────────────────────────────────────────────

alter table public.referral_programs enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_rewards enable row level security;

drop policy if exists "owner manages referral program" on public.referral_programs;
create policy "owner manages referral program" on public.referral_programs
    for all to authenticated using (public.is_business_owner(business_id)) with check (public.is_business_owner(business_id));

drop policy if exists "owner reads referral codes" on public.referral_codes;
create policy "owner reads referral codes" on public.referral_codes
    for select to authenticated using (public.is_business_owner(business_id));

drop policy if exists "owner reads referrals" on public.referrals;
create policy "owner reads referrals" on public.referrals
    for select to authenticated using (public.is_business_owner(business_id));

drop policy if exists "owner reads referral rewards" on public.referral_rewards;
create policy "owner reads referral rewards" on public.referral_rewards
    for select to authenticated using (public.is_business_owner(business_id));
-- No insert/update/delete policies: codes, referrals and rewards are written
-- only by the functions below and server code, never from a browser.

-- ─── Helpers ─────────────────────────────────────────────────────────────────

create or replace function public.referral_digits(p text)
returns text language sql immutable set search_path = '' as $$
    select regexp_replace(coalesce(p, ''), '\D', '', 'g');
$$;

-- Personal code for a client at a business, made on first use: first letters
-- of their name + 4 characters, e.g. BRI-7F3K (no 0/O/1/I).
create or replace function public.referral_code_for(p_business uuid, p_client uuid)
returns public.referral_codes language plpgsql security definer set search_path = '' as $$
declare
    row public.referral_codes;
    prefix text;
begin
    select * into row from public.referral_codes where business_id = p_business and client_id = p_client;
    if found then return row; end if;

    select coalesce(nullif(upper(regexp_replace(c.first_name, '[^A-Za-z]', '', 'g')), ''), 'REF')
      into prefix from public.client_users c where c.client_id = p_client;
    if prefix is null then raise exception 'Client not found'; end if;
    prefix := left(prefix, 4);

    loop
        begin
            insert into public.referral_codes (business_id, client_id, code)
            values (p_business, p_client, prefix || '-' || (
                select string_agg(substr('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 1 + floor(random() * 32)::int, 1), '')
                from generate_series(1, 4)))
            returning * into row;
            return row;
        exception when unique_violation then
            -- Code taken, or another request made this client's code first.
            select * into row from public.referral_codes where business_id = p_business and client_id = p_client;
            if found then return row; end if;
        end;
    end loop;
end $$;

-- True when nobody with this email/phone has been a client of the business:
-- no earlier appointment there (cancelled and denied ones don't count) and
-- not in its clientele (e.g. imported clients).
create or replace function public.referral_is_new_client(p_business uuid, p_email text, p_phone text, p_exclude_appointment uuid)
returns boolean language sql stable security definer set search_path = '' as $$
    select not exists (
        select 1 from public.appointments a
        where a.business = p_business
          and a.id <> p_exclude_appointment
          and a.status not in ('CANCELLED', 'DENIED')
          and ((p_email <> '' and lower(a.client_metadata->>'email') = p_email)
            or (p_phone <> '' and public.referral_digits(a.client_metadata->>'phoneNumber') = p_phone))
    ) and not exists (
        select 1 from public.business_clients bc
        join public.client_users c on c.client_id = bc.client
        where bc.business = p_business
          and ((p_email <> '' and lower(c.email) = p_email)
            or (p_phone <> '' and public.referral_digits(c.phone_number) = p_phone))
    );
$$;

-- ─── Attribution ─────────────────────────────────────────────────────────────

-- Records a referral for a just-created booking and applies the friend's
-- discount. Every rule is checked here, on the server. Returns
-- {status: 'attributed' | 'skipped', reason?, discount_cents?}.
create or replace function public.referral_attribute(p_appointment uuid, p_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
    appt public.appointments;
    prog public.referral_programs;
    code_row public.referral_codes;
    referrer public.client_users;
    v_code text := upper(trim(coalesce(p_code, '')));
    v_email text;
    v_phone text;
    v_plan text;
    v_referral uuid;
    v_discount integer := 0;
    v_cap integer;
begin
    if v_code = '' then return jsonb_build_object('status', 'skipped', 'reason', 'no_code'); end if;

    select * into appt from public.appointments where id = p_appointment for update;
    if not found then return jsonb_build_object('status', 'skipped', 'reason', 'no_appointment'); end if;

    select * into prog from public.referral_programs where business_id = appt.business;
    if not found or not prog.enabled then return jsonb_build_object('status', 'skipped', 'reason', 'disabled'); end if;

    select plan_type::text into v_plan from public.business_users where business_id = appt.business;
    if coalesce(v_plan, 'STARTER') <> 'GROWTH' then return jsonb_build_object('status', 'skipped', 'reason', 'plan'); end if;

    select * into code_row from public.referral_codes where business_id = appt.business and code = v_code;
    if not found then return jsonb_build_object('status', 'skipped', 'reason', 'invalid_code'); end if;
    select * into referrer from public.client_users where client_id = code_row.client_id;

    v_email := lower(trim(coalesce(appt.client_metadata->>'email', '')));
    v_phone := public.referral_digits(appt.client_metadata->>'phoneNumber');
    if v_email = '' and v_phone = '' then return jsonb_build_object('status', 'skipped', 'reason', 'no_contact'); end if;

    -- Nobody can refer themselves.
    if (v_email <> '' and lower(trim(referrer.email)) = v_email)
       or (v_phone <> '' and public.referral_digits(referrer.phone_number) = v_phone) then
        return jsonb_build_object('status', 'skipped', 'reason', 'self_referral');
    end if;

    if not public.referral_is_new_client(appt.business, v_email, v_phone, appt.id) then
        return jsonb_build_object('status', 'skipped', 'reason', 'not_new');
    end if;

    -- One referral per person per business (the unique indexes enforce this too).
    if exists (
        select 1 from public.referrals r
        where r.business_id = appt.business and r.status <> 'void'
          and ((v_email <> '' and r.referred_email = v_email) or (v_phone <> '' and r.referred_phone = v_phone))
    ) then
        return jsonb_build_object('status', 'skipped', 'reason', 'duplicate');
    end if;

    begin
        insert into public.referrals (business_id, code_id, referrer_client_id, referred_email, referred_phone, appointment_id)
        values (appt.business, code_row.id, code_row.client_id, v_email, v_phone, appt.id)
        returning id into v_referral;
    exception when unique_violation then
        return jsonb_build_object('status', 'skipped', 'reason', 'duplicate');
    end;

    if prog.recipients in ('both', 'referrer') then
        insert into public.referral_rewards (referral_id, business_id, recipient, client_id, reward_type, value)
        values (v_referral, appt.business, 'referrer', code_row.client_id, prog.reward_type, prog.reward_value);
    end if;

    -- The friend's discount comes off this first booking, before anything is paid.
    -- Never more than what's left after the deposit, and never stacked on another reward.
    if prog.recipients in ('both', 'friend')
       and appt.loyalty_reward_id is null and coalesce(appt.discount_cents, 0) = 0 then
        v_discount := case when prog.reward_type = 'amount_off' then prog.reward_value
                           else round(coalesce(appt.amount_due, 0) * prog.reward_value / 100.0)::integer end;
        v_cap := coalesce(appt.amount_due, 0)
                 - case when appt.require_deposit and appt.substraction then coalesce(appt.deposit_price, 0)::integer else 0 end;
        v_discount := greatest(0, least(v_discount, v_cap));
        if v_discount > 0 then
            update public.appointments
               set amount_due = amount_due - v_discount, discount_cents = v_discount
             where id = appt.id;
            insert into public.referral_rewards (referral_id, business_id, recipient, reward_type, value,
                                                 redeemed_appointment_id, redeemed_amount_cents)
            values (v_referral, appt.business, 'friend', prog.reward_type, prog.reward_value, appt.id, v_discount);
        end if;
    end if;

    return jsonb_build_object('status', 'attributed', 'referral_id', v_referral, 'discount_cents', v_discount);
end $$;

-- ─── Reward lifecycle ────────────────────────────────────────────────────────

-- Runs when a referred appointment changes:
--   completed (and not fully refunded) → referral completed, friend's discount
--     counts as redeemed, referrer's reward becomes an available code;
--   cancelled / denied / no-show / refunded → nothing earned (pending rewards void);
--   fully refunded after completion → an unused referrer code is voided.
create or replace function public.referral_on_appointment_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
    r public.referrals;
    prog public.referral_programs;
    rw public.referral_rewards;
    v_bad boolean;
    v_reward uuid;
    v_count integer;
begin
    select * into r from public.referrals where appointment_id = new.id;
    if not found or r.status = 'void' then return new; end if;

    v_bad := new.status in ('CANCELLED', 'DENIED', 'NO_SHOW', 'REFUNDED')
             or coalesce(new.refund_status::text, 'NONE') = 'FULL';

    if r.status = 'booked' and v_bad then
        update public.referrals set status = 'void', void_reason = lower(new.status::text) where id = r.id;
        update public.referral_rewards set status = 'void' where referral_id = r.id and status = 'pending';
        return new;
    end if;

    if r.status = 'completed' and v_bad then
        -- Refunded after the visit: take back the referrer's code if it hasn't been used.
        for rw in select * from public.referral_rewards where referral_id = r.id and recipient = 'referrer' and status = 'available' loop
            update public.loyalty_rewards set status = 'void' where id = rw.loyalty_reward_id and status = 'available';
            update public.referral_rewards set status = 'void' where id = rw.id;
        end loop;
        update public.referrals set status = 'void', void_reason = 'refunded' where id = r.id;
        return new;
    end if;

    if r.status = 'booked' and new.status = 'COMPLETED' then
        update public.referrals
           set status = 'completed', completed_at = now(), referred_client_id = public.loyalty_client_for(new)
         where id = r.id;
        update public.referral_rewards
           set status = 'redeemed', redeemed_at = now(), client_id = public.loyalty_client_for(new)
         where referral_id = r.id and recipient = 'friend' and status = 'pending';

        select * into prog from public.referral_programs where business_id = new.business;
        for rw in select * from public.referral_rewards where referral_id = r.id and recipient = 'referrer' and status = 'pending' loop
            if prog.max_rewards_per_referrer is not null then
                select count(*) into v_count from public.referral_rewards
                 where business_id = new.business and recipient = 'referrer' and client_id = rw.client_id
                   and status in ('available', 'redeemed', 'expired');
                if v_count >= prog.max_rewards_per_referrer then
                    update public.referral_rewards set status = 'void' where id = rw.id;
                    continue;
                end if;
            end if;
            loop
                begin
                    insert into public.loyalty_rewards (business_id, client_id, code, reward_type, value, source, expires_at)
                    values (new.business, rw.client_id, public.loyalty_new_code(), rw.reward_type, rw.value, 'referral',
                            case when prog.reward_expiry_days is null then null else now() + make_interval(days => prog.reward_expiry_days) end)
                    returning id into v_reward;
                    exit;
                exception when unique_violation then
                    -- code collision: try another
                end;
            end loop;
            update public.referral_rewards
               set status = 'available', available_at = now(), loyalty_reward_id = v_reward
             where id = rw.id;
        end loop;
    end if;
    return new;
end $$;

drop trigger if exists referral_on_appointment_change on public.appointments;
create trigger referral_on_appointment_change
    after update of status, refund_status on public.appointments
    for each row execute function public.referral_on_appointment_change();

-- Keeps a referrer's reward in step with its code: used on an appointment,
-- given back, expired or voided by the business.
create or replace function public.referral_on_loyalty_reward_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    if new.source <> 'referral' or new.status = old.status then return new; end if;
    update public.referral_rewards
       set status = case new.status when 'used' then 'redeemed' when 'available' then 'available'
                                    when 'expired' then 'expired' else 'void' end,
           redeemed_appointment_id = case when new.status = 'used' then new.used_appointment_id end,
           redeemed_amount_cents = case when new.status = 'used' then new.used_amount_cents end,
           redeemed_at = case when new.status = 'used' then coalesce(new.used_at, now()) end
     where loyalty_reward_id = new.id;
    return new;
end $$;

drop trigger if exists referral_on_loyalty_reward_change on public.loyalty_rewards;
create trigger referral_on_loyalty_reward_change
    after update of status on public.loyalty_rewards
    for each row execute function public.referral_on_loyalty_reward_change();

revoke all on function public.referral_code_for(uuid, uuid) from public, anon, authenticated;
revoke all on function public.referral_attribute(uuid, text) from public, anon, authenticated;
revoke all on function public.referral_is_new_client(uuid, text, text, uuid) from public, anon, authenticated;
grant execute on function public.referral_code_for(uuid, uuid) to service_role;
grant execute on function public.referral_attribute(uuid, text) to service_role;
grant execute on function public.referral_is_new_client(uuid, text, text, uuid) to service_role;
