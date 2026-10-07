-- SMS Reminders add-on (Growth only, $10/month for 400 texts).
--
-- sms_enabled mirrors whether the SMS price is on the business's Stripe
-- subscription; only the subscription webhook (service role) sets it.
-- Every text — to a client or to the business — counts toward the monthly
-- limit, claimed atomically through claim_sms_slot before sending.

alter table public.business_users
    add column if not exists sms_enabled boolean not null default false,
    -- The business's own mobile number for booking texts (E.164, +1...).
    add column if not exists sms_phone text,
    -- Businesses can keep client texts but turn off texts to themselves.
    add column if not exists sms_business_texts boolean not null default true;

-- A business may set its own number and texts-to-me switch, never sms_enabled
-- (column grants from the row-level security migration keep it server-only).
grant update (sms_phone, sms_business_texts) on public.business_users to authenticated;

-- Texts sent per business per calendar month (UTC).
create table if not exists public.sms_usage (
    business_id uuid not null references public.business_users (business_id) on delete cascade,
    month date not null,
    sent integer not null default 0,
    primary key (business_id, month)
);

alter table public.sms_usage enable row level security;

create policy "owner reads own sms usage" on public.sms_usage
    for select to authenticated using (public.is_business_owner(business_id));

-- Numbers that replied STOP. Twilio blocks them too; this stops the app trying.
create table if not exists public.sms_opt_outs (
    phone text primary key,
    opted_out_at timestamptz not null default now()
);

alter table public.sms_opt_outs enable row level security;
-- No policies: service role only.

-- Takes one text from this month's allowance. Returns false once the limit
-- is reached, so two sends racing for the last slot can't both get it.
create or replace function public.claim_sms_slot(p_business uuid, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    claimed boolean;
begin
    insert into public.sms_usage as u (business_id, month, sent)
    values (p_business, date_trunc('month', now() at time zone 'utc')::date, 1)
    on conflict (business_id, month) do update
        set sent = u.sent + 1
        where u.sent < p_limit
    returning true into claimed;
    return coalesce(claimed, false);
end;
$$;

-- Gives a slot back when Twilio rejects the text.
create or replace function public.release_sms_slot(p_business uuid)
returns void
language sql
security definer
set search_path = ''
as $$
    update public.sms_usage
    set sent = greatest(sent - 1, 0)
    where business_id = p_business
      and month = date_trunc('month', now() at time zone 'utc')::date;
$$;

revoke all on function public.claim_sms_slot(uuid, integer) from public;
revoke all on function public.release_sms_slot(uuid) from public;
grant execute on function public.claim_sms_slot(uuid, integer) to service_role;
grant execute on function public.release_sms_slot(uuid) to service_role;
