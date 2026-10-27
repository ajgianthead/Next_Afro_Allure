-- Referral program database tests.
--
-- Run against the DEV project after applying 20261026000000_referrals.sql:
--   paste into the Supabase SQL editor, or  psql "$DEV_DB_URL" -f supabase/db-tests/referrals_test.sql
-- Everything runs in one transaction and is ROLLED BACK at the end, so it
-- leaves no data behind. Each check raises an exception on failure; success
-- prints "ALL REFERRAL TESTS PASSED".
--
-- Covers: attribution (valid, self-referral, existing client, duplicate,
-- bad code, program off, Starter plan), the friend's discount, the reward
-- lifecycle (completed / cancelled / refunded / per-client limit / code
-- used), and row-level security between businesses.

begin;

create function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin
    if ok is distinct from true then raise exception 'FAILED: %', what; end if;
    raise notice 'ok - %', what;
end $$;

-- Each test booking gets its own 2-hour slot (the database blocks overlapping bookings).
create temporary sequence referral_test_slot;

create function pg_temp.book(p_business uuid, p_email text, p_phone text, p_amount int, p_first text default 'Friend')
returns uuid language plpgsql as $$
declare
    v_id uuid;
    v_start timestamptz := date_trunc('hour', now()) + interval '30 days' + nextval('referral_test_slot') * interval '3 hours';
begin
    insert into public.appointments (business, start, "end", status, client_metadata, amount_due, require_deposit, substraction)
    values (p_business, v_start, v_start + interval '2 hours', 'CONFIRMED',
            jsonb_build_object('firstName', p_first, 'lastName', 'Test', 'email', p_email, 'phoneNumber', p_phone),
            p_amount, false, false)
    returning id into v_id;
    return v_id;
end $$;

do $$
declare
    owner_a uuid := gen_random_uuid();
    owner_b uuid := gen_random_uuid();
    biz_a uuid;
    biz_b uuid;
    bri uuid;
    old_client uuid;
    code public.referral_codes;
    res jsonb;
    a1 uuid; a2 uuid; a3 uuid; a4 uuid;
    n int;
    v_reward uuid;
begin
    -- ── Fixtures ────────────────────────────────────────────────────────────
    -- Foreign-key checks off while making bare-bones fixtures (a real business
    -- has policies, schedules, Stripe ids…), back on before any test runs.
    set local session_replication_role = replica;
    insert into auth.users (id, email, aud, role) values
        (owner_a, 'owner-a@referral.test', 'authenticated', 'authenticated'),
        (owner_b, 'owner-b@referral.test', 'authenticated', 'authenticated');
    insert into public.business_users (business_name, email, user_id, plan_type, url_name)
    values ('Referral Test A', 'owner-a@referral.test', owner_a, 'GROWTH', 'referral-test-a-' || substr(md5(random()::text), 1, 6))
    returning business_id into biz_a;
    insert into public.business_users (business_name, email, user_id, plan_type, url_name)
    values ('Referral Test B', 'owner-b@referral.test', owner_b, 'STARTER', 'referral-test-b-' || substr(md5(random()::text), 1, 6))
    returning business_id into biz_b;

    insert into public.referral_programs (business_id, enabled, reward_type, reward_value, recipients, reward_expiry_days)
    values (biz_a, true, 'amount_off', 1000, 'both', 90);

    insert into public.client_users (first_name, last_name, email, phone_number)
    values ('Brianna', 'Test', 'bri@referral.test', '(555) 000-0001') returning client_id into bri;
    insert into public.client_users (first_name, last_name, email, phone_number)
    values ('Olivia', 'Test', 'old@referral.test', '5550000099') returning client_id into old_client;
    insert into public.business_clients (business, client) values (biz_a, bri), (biz_a, old_client);
    set local session_replication_role = origin;

    code := public.referral_code_for(biz_a, bri);
    perform pg_temp.check(code.code ~ '^BRIA-[2-9A-HJ-NP-Z]{4}$', 'code looks like BRIA-XXXX');
    perform pg_temp.check((public.referral_code_for(biz_a, bri)).code = code.code, 'a client keeps the same code');

    -- ── Attribution ─────────────────────────────────────────────────────────
    a1 := pg_temp.book(biz_a, 'maya@referral.test', '555-000-0002', 10000, 'Maya');
    res := public.referral_attribute(a1, lower(code.code));
    perform pg_temp.check(res->>'status' = 'attributed', 'new client booking through a link is attributed');
    perform pg_temp.check((res->>'discount_cents')::int = 1000, 'friend gets $10 off');
    perform pg_temp.check((select amount_due from public.appointments where id = a1) = 9000, 'discount comes off the appointment');
    perform pg_temp.check((select discount_cents from public.appointments where id = a1) = 1000, 'discount is recorded on the appointment');
    perform pg_temp.check((select count(*) from public.referral_rewards r join public.referrals f on f.id = r.referral_id where f.appointment_id = a1 and r.status = 'pending') = 2, 'referrer and friend rewards start pending');

    a2 := pg_temp.book(biz_a, 'BRI@referral.test', '', 10000, 'Brianna');
    res := public.referral_attribute(a2, code.code);
    perform pg_temp.check(res->>'reason' = 'self_referral', 'self-referral by email is blocked');
    a2 := pg_temp.book(biz_a, 'other@referral.test', '5550000001', 10000);
    res := public.referral_attribute(a2, code.code);
    perform pg_temp.check(res->>'reason' = 'self_referral', 'self-referral by phone is blocked');

    a3 := pg_temp.book(biz_a, 'maya@referral.test', '', 10000, 'Maya');
    res := public.referral_attribute(a3, code.code);
    perform pg_temp.check(res->>'status' = 'skipped', 'the same friend can''t be referred twice');
    perform pg_temp.check((select count(*) from public.referrals where business_id = biz_a and referred_email = 'maya@referral.test') = 1, 'only one referral exists for that friend');
    perform pg_temp.check((select amount_due from public.appointments where id = a3) = 10000, 'no second discount');

    a3 := pg_temp.book(biz_a, 'old@referral.test', '', 10000);
    res := public.referral_attribute(a3, code.code);
    perform pg_temp.check(res->>'reason' = 'not_new', 'existing (imported) clients don''t count as referrals');

    a3 := pg_temp.book(biz_a, 'nobody@referral.test', '', 10000);
    res := public.referral_attribute(a3, 'ZZZZ-9999');
    perform pg_temp.check(res->>'reason' = 'invalid_code', 'unknown codes are ignored');

    a3 := pg_temp.book(biz_b, 'nobody2@referral.test', '', 10000);
    res := public.referral_attribute(a3, code.code);
    perform pg_temp.check(res->>'status' = 'skipped', 'a code only works at its own business');

    update public.referral_programs set enabled = false where business_id = biz_a;
    a3 := pg_temp.book(biz_a, 'paused@referral.test', '', 10000);
    res := public.referral_attribute(a3, code.code);
    perform pg_temp.check(res->>'reason' = 'disabled', 'nothing is attributed while the program is off');
    update public.referral_programs set enabled = true where business_id = biz_a;

    update public.business_users set plan_type = 'STARTER' where business_id = biz_a;
    res := public.referral_attribute(a3, code.code);
    perform pg_temp.check(res->>'reason' = 'plan', 'Starter businesses don''t get referrals');
    update public.business_users set plan_type = 'GROWTH' where business_id = biz_a;

    -- ── Lifecycle: completed ────────────────────────────────────────────────
    update public.appointments set status = 'COMPLETED', paid_amount = 9000 where id = a1;
    perform pg_temp.check((select status from public.referrals where appointment_id = a1) = 'completed', 'referral completes with the visit');
    perform pg_temp.check((select r.status from public.referral_rewards r join public.referrals f on f.id = r.referral_id where f.appointment_id = a1 and r.recipient = 'friend') = 'redeemed', 'friend''s discount counts as used');
    select r.loyalty_reward_id into v_reward from public.referral_rewards r join public.referrals f on f.id = r.referral_id
     where f.appointment_id = a1 and r.recipient = 'referrer' and r.status = 'available';
    perform pg_temp.check(v_reward is not null, 'referrer''s reward becomes available');
    perform pg_temp.check((select source = 'referral' and status = 'available' and client_id = bri and value = 1000 and expires_at > now() + interval '89 days'
                           from public.loyalty_rewards where id = v_reward), 'referrer gets a $10 reward code that lasts 90 days');

    -- Code used on the referrer's next appointment → reward redeemed.
    update public.loyalty_rewards set status = 'used', used_amount_cents = 1000, used_at = now() where id = v_reward;
    perform pg_temp.check((select status from public.referral_rewards where loyalty_reward_id = v_reward) = 'redeemed', 'using the code marks the reward redeemed');
    update public.loyalty_rewards set status = 'available', used_amount_cents = null, used_at = null where id = v_reward;
    perform pg_temp.check((select status from public.referral_rewards where loyalty_reward_id = v_reward) = 'available', 'giving the code back makes it available again');

    -- Full refund after the visit → unused code is taken back.
    update public.appointments set refund_status = 'FULL' where id = a1;
    perform pg_temp.check((select status from public.loyalty_rewards where id = v_reward) = 'void', 'a full refund voids the unused code');
    perform pg_temp.check((select status from public.referrals where appointment_id = a1) = 'void', 'a refunded referral doesn''t count');

    -- ── Lifecycle: cancelled ────────────────────────────────────────────────
    a4 := pg_temp.book(biz_a, 'joy@referral.test', '', 8000, 'Joy');
    res := public.referral_attribute(a4, code.code);
    perform pg_temp.check(res->>'status' = 'attributed', 'second friend attributed');
    update public.appointments set status = 'CANCELLED' where id = a4;
    perform pg_temp.check((select status from public.referrals where appointment_id = a4) = 'void', 'a cancelled referral doesn''t count');
    select count(*) into n from public.referral_rewards r join public.referrals f on f.id = r.referral_id where f.appointment_id = a4 and r.status <> 'void';
    perform pg_temp.check(n = 0, 'a cancelled referral earns nothing');
    -- After cancelling, the same friend can still be referred and earn later.
    a4 := pg_temp.book(biz_a, 'joy@referral.test', '', 8000, 'Joy');
    res := public.referral_attribute(a4, code.code);
    perform pg_temp.check(res->>'status' = 'attributed', 'a friend whose referred booking was cancelled can book through the link again');

    -- ── Per-client limit ────────────────────────────────────────────────────
    update public.referral_programs set max_rewards_per_referrer = 1 where business_id = biz_a;
    update public.appointments set status = 'COMPLETED' where id = a4;
    perform pg_temp.check((select count(*) from public.referral_rewards where business_id = biz_a and recipient = 'referrer' and client_id = bri and status = 'available') = 1, 'reward issued under the limit');
    a3 := pg_temp.book(biz_a, 'kim@referral.test', '', 8000, 'Kim');
    perform public.referral_attribute(a3, code.code);
    update public.appointments set status = 'COMPLETED' where id = a3;
    perform pg_temp.check((select r.status from public.referral_rewards r join public.referrals f on f.id = r.referral_id where f.appointment_id = a3 and r.recipient = 'referrer') = 'void', 'no reward past the per-client limit');

    -- ── Row-level security ──────────────────────────────────────────────────
    perform set_config('request.jwt.claims', json_build_object('sub', owner_b, 'role', 'authenticated')::text, true);
    set local role authenticated;
    perform pg_temp.check((select count(*) from public.referrals) = 0, 'another business sees none of these referrals');
    perform pg_temp.check((select count(*) from public.referral_rewards) = 0, 'another business sees none of these rewards');
    perform pg_temp.check((select count(*) from public.referral_codes) = 0, 'another business sees none of these codes');
    perform pg_temp.check((select count(*) from public.referral_programs where business_id = biz_a) = 0, 'another business can''t read this program');
    begin
        insert into public.referral_rewards (referral_id, business_id, recipient, reward_type, value)
        select id, business_id, 'referrer', 'amount_off', 99999 from public.referrals limit 1;
        raise exception 'FAILED: a business could insert a reward';
    exception when insufficient_privilege or others then
        if sqlerrm like 'FAILED:%' then raise; end if;
        raise notice 'ok - businesses can''t mint rewards';
    end;
    reset role;

    perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
    set local role authenticated;
    perform pg_temp.check((select count(*) from public.referrals) >= 4, 'the owner sees their own referrals');
    begin
        perform public.referral_attribute(a3, code.code);
        raise exception 'FAILED: a signed-in user could call referral_attribute';
    exception when insufficient_privilege or others then
        if sqlerrm like 'FAILED:%' then raise; end if;
        raise notice 'ok - attribution can only run on the server';
    end;
    reset role;

    raise notice 'ALL REFERRAL TESTS PASSED';
end $$;

rollback;
