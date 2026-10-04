-- Business URL names become subdomains (kayla.afroallure.co), so they must be
-- valid DNS labels: lowercase a-z, 0-9 and single hyphens, no leading/trailing
-- hyphen, 3–63 characters, and not one of AfroAllure's reserved subdomains.
--
-- Signup used to build url_name by just removing spaces from the business
-- name, so names like "kayla'sbraids&co." exist. This migration rewrites only
-- the invalid ones and keeps the old value in legacy_url_names so links that
-- were already shared keep working (src/app/business/[businessName]/layout.tsx
-- redirects them).
--
-- Keep the reserved list in sync with RESERVED_SUBDOMAINS in src/lib/businessSlug.ts.

alter table public.business_users
    add column if not exists legacy_url_names text[] not null default '{}';

do $$
declare
    r record;
    base text;
    candidate text;
    n int;
    reserved text[] := array[
        'beta', 'www', 'app', 'api', 'admin', 'reminder', 'reminders', 'mail', 'email', 'notifications',
        'dashboard', 'support', 'help', 'status', 'blog', 'book', 'booking', 'send', 'smtp', 'ftp',
        'dev', 'staging', 'preview', 'test', 'demo', 'docs', 'cdn', 'assets', 'static', 'images',
        'login', 'register', 'auth', 'account', 'billing', 'pay', 'payments', 'stripe', 'marketplace',
        'afroallure', 'aa', 'business', 'businesses', 'for-businesses', 'founding-members', 'waitlist'
    ];
begin
    -- Oldest accounts keep their name when two businesses would collide.
    for r in
        select business_id, url_name, business_name
        from public.business_users
        order by created_at asc
    loop
        if r.url_name ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$'
            and r.url_name !~ '--'
            and length(r.url_name) >= 3
            and not (r.url_name = any(reserved))
            and not exists (
                select 1 from public.business_users o
                where o.url_name = r.url_name and o.business_id <> r.business_id
                  and o.created_at < (select created_at from public.business_users where business_id = r.business_id)
            )
        then
            continue;
        end if;

        base := lower(coalesce(nullif(r.url_name, ''), r.business_name, ''));
        base := regexp_replace(base, '[''’]', '', 'g');
        base := regexp_replace(base, '&', '-and-', 'g');
        base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
        base := regexp_replace(base, '(^-+|-+$)', '', 'g');
        base := regexp_replace(left(base, 56), '-+$', '');
        if length(base) < 3 then
            base := 'business';
        end if;
        if base = any(reserved) then
            base := base || '-beauty';
        end if;

        candidate := base;
        n := 1;
        while candidate = any(reserved) or exists (
            select 1 from public.business_users
            where url_name = candidate and business_id <> r.business_id
        ) loop
            n := n + 1;
            candidate := base || '-' || n;
        end loop;

        update public.business_users
        set url_name = candidate,
            legacy_url_names = case
                when coalesce(r.url_name, '') = '' or lower(r.url_name) = any(legacy_url_names) then legacy_url_names
                else array_append(legacy_url_names, lower(r.url_name))
            end
        where business_id = r.business_id;
    end loop;
end $$;

-- Every url_name is now unique, so enforce it from here on.
create unique index if not exists business_users_url_name_key
    on public.business_users (url_name);

create index if not exists business_users_legacy_url_names_idx
    on public.business_users using gin (legacy_url_names);

-- Businesses update this column themselves when they change their URL. If the
-- row-level-security migration (column-level update grants) has already run,
-- this column needs its own grant; harmless otherwise.
grant update (legacy_url_names) on public.business_users to authenticated;
