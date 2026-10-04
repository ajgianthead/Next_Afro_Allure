-- Row-level security for every app table.
--
-- Before this, RLS was off on 20 of 24 tables and the public (anon) key —
-- which ships in the site's JavaScript — had full read/write access to
-- them, and the 4 tables with RLS had policies like `USING (true)`.
--
-- Model after this migration:
--   * anon (the public key):  no access to app tables, except read-only
--     reference data (categories, subcategories, feature_flags). Public pages
--     read through server code using the service role, selecting only what
--     the page needs.
--   * authenticated (a signed-in business): full access to rows belonging to
--     its own business, nothing else. Stripe / billing / plan columns on
--     business_users can't be changed by the business itself.
--   * service_role (server code with SUPABASE_ROLE_SECRET_KEY) and the direct
--     Postgres pool bypass RLS, as before.
--
-- Deploy the matching app code BEFORE running this on production — the code
-- moves every public/no-session database call to the service role first.

-- ─── Helper ──────────────────────────────────────────────────────────────────

-- SECURITY DEFINER so it can read business_users without recursing into
-- business_users' own policies. Fixed search_path so it can't be hijacked.
create or replace function public.is_business_owner(bid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.business_users bu
        where bu.business_id = bid and bu.user_id = auth.uid()
    );
$$;

revoke all on function public.is_business_owner(uuid) from public;
grant execute on function public.is_business_owner(uuid) to authenticated, service_role;

-- ─── Turn RLS on everywhere ─────────────────────────────────────────────────

alter table public.admin_logs          enable row level security;
alter table public.appointments        enable row level security;
alter table public.availabilities      enable row level security;
alter table public.banned_clients      enable row level security;
alter table public.booking_sessions    enable row level security;
alter table public.business_clients    enable row level security;
alter table public.business_policies   enable row level security;
alter table public.business_users      enable row level security;
alter table public.categories          enable row level security;
alter table public.client_users        enable row level security;
alter table public.client_waitlist     enable row level security;
alter table public.feature_flags       enable row level security;
alter table public.feedback            enable row level security;
alter table public.image_section       enable row level security;
alter table public.marketplace_profile enable row level security;
alter table public.notifications       enable row level security;
alter table public.refunds             enable row level security;
alter table public.reviews             enable row level security;
alter table public.service_addons      enable row level security;
alter table public.services            enable row level security;
alter table public.subcategories       enable row level security;
alter table public.support_tickets     enable row level security;
alter table public.user_feedback       enable row level security;
alter table public.web_editors         enable row level security;

-- ─── Drop the old wide-open policies ────────────────────────────────────────

do $$
declare p record;
begin
    for p in
        select policyname, tablename from pg_policies
        where schemaname = 'public'
          and tablename in ('appointments', 'business_users', 'refunds', 'feedback', 'support_tickets')
    loop
        execute format('drop policy %I on public.%I', p.policyname, p.tablename);
    end loop;
end $$;

-- ─── business_users ─────────────────────────────────────────────────────────

create policy "owner reads own business" on public.business_users
    for select to authenticated using (user_id = auth.uid());

create policy "owner updates own business" on public.business_users
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- No insert/delete for businesses: signup and deletion run server-side.
-- Column-level: a business may only change its own profile/settings, never
-- its Stripe account, billing, plan, founding-member status or identity.
revoke insert, update, delete on public.business_users from anon, authenticated;
grant update (
    email, account_settings, booking_policies, url_name, default_availability,
    has_marketplace_profile, latitude, longitude, location, published_site,
    upgrade_prompt_dismissed_at, tours_completed, brand_color, is_onboarded,
    marketing_opt_in, updated_at
) on public.business_users to authenticated;

-- legacy_url_names exists once the business-subdomain migration has run.
do $$
begin
    if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'business_users' and column_name = 'legacy_url_names'
    ) then
        execute 'grant update (legacy_url_names) on public.business_users to authenticated';
    end if;
end $$;

-- ─── Tables owned through a business id column ──────────────────────────────

create policy "owner manages appointments" on public.appointments
    for all to authenticated using (public.is_business_owner(business)) with check (public.is_business_owner(business));

create policy "owner manages availabilities" on public.availabilities
    for all to authenticated using (public.is_business_owner(business_id)) with check (public.is_business_owner(business_id));

create policy "owner manages banned clients" on public.banned_clients
    for all to authenticated using (public.is_business_owner(business_id)) with check (public.is_business_owner(business_id));

create policy "owner manages booking sessions" on public.booking_sessions
    for all to authenticated using (public.is_business_owner(business_id)) with check (public.is_business_owner(business_id));

create policy "owner manages business clients" on public.business_clients
    for all to authenticated using (public.is_business_owner(business)) with check (public.is_business_owner(business));

create policy "owner manages policies" on public.business_policies
    for all to authenticated using (public.is_business_owner(business)) with check (public.is_business_owner(business));

create policy "owner manages marketplace profile" on public.marketplace_profile
    for all to authenticated using (public.is_business_owner(business_id)) with check (public.is_business_owner(business_id));

create policy "owner manages notifications" on public.notifications
    for all to authenticated using (public.is_business_owner(business_id)) with check (public.is_business_owner(business_id));

create policy "owner manages service addons" on public.service_addons
    for all to authenticated using (public.is_business_owner(business_id)) with check (public.is_business_owner(business_id));

create policy "owner manages services" on public.services
    for all to authenticated using (public.is_business_owner(business)) with check (public.is_business_owner(business));

create policy "owner manages web editor" on public.web_editors
    for all to authenticated using (public.is_business_owner(business_id)) with check (public.is_business_owner(business_id));

create policy "owner manages editor images" on public.image_section
    for all to authenticated
    using (exists (select 1 from public.web_editors we where we.id = editor_id and public.is_business_owner(we.business_id)))
    with check (exists (select 1 from public.web_editors we where we.id = editor_id and public.is_business_owner(we.business_id)));

-- Refunds are written by the server (service role); businesses can read theirs.
-- (The old policy compared business_id to the auth user id, which never matched.)
create policy "owner reads refunds" on public.refunds
    for select to authenticated using (public.is_business_owner(business_id));

create policy "owner reads reviews" on public.reviews
    for select to authenticated using (public.is_business_owner(business_id));

-- Feedback / support: a business can file and read its own.
-- business_id can be null for a signed-in user whose business doesn't exist yet
-- (the old policy allowed any insert); it can never name another business.
create policy "owner files feedback" on public.feedback
    for insert to authenticated with check (business_id is null or public.is_business_owner(business_id));
create policy "owner reads feedback" on public.feedback
    for select to authenticated using (public.is_business_owner(business_id));

create policy "owner files support tickets" on public.support_tickets
    for insert to authenticated with check (business_id is null or public.is_business_owner(business_id));
create policy "owner reads support tickets" on public.support_tickets
    for select to authenticated using (public.is_business_owner(business_id));

create policy "owner files user feedback" on public.user_feedback
    for insert to authenticated with check (public.is_business_owner(business_id));
create policy "owner reads user feedback" on public.user_feedback
    for select to authenticated using (public.is_business_owner(business_id));

-- ─── Clients (shared across businesses) ─────────────────────────────────────

-- A client record is visible/editable to a business only if that business
-- has the client in its clientele, banned list, or appointments. Creating
-- and matching clients across businesses happens server-side.
create policy "business reads its clients" on public.client_users
    for select to authenticated using (
        exists (select 1 from public.business_clients bc where bc.client = client_id and public.is_business_owner(bc.business))
        or exists (select 1 from public.banned_clients b where b.client_id = client_users.client_id and public.is_business_owner(b.business_id))
    );

create policy "business updates its clients" on public.client_users
    for update to authenticated
    using (exists (select 1 from public.business_clients bc where bc.client = client_id and public.is_business_owner(bc.business)))
    with check (exists (select 1 from public.business_clients bc where bc.client = client_id and public.is_business_owner(bc.business)));

-- ─── Public reference data (read-only) ──────────────────────────────────────

create policy "anyone reads categories" on public.categories
    for select to anon, authenticated using (true);

create policy "anyone reads subcategories" on public.subcategories
    for select to anon, authenticated using (true);

create policy "anyone reads feature flags" on public.feature_flags
    for select to anon, authenticated using (true);

-- admin_logs and client_waitlist: no policies — service role only.
