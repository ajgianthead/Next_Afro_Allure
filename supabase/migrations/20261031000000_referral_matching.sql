-- Self-referral (and the "new client" / once-per-person checks) compared
-- email and phone too literally, so small changes got around them:
--   * "+1 (555) 555-0123" and "555-555-0123" were different numbers;
--   * "me+1@gmail.com" or "m.e@gmail.com" was a different person from "me@gmail.com".
-- Both are now normalized the same way everywhere these checks run.

-- Digits only, without a leading US country code: +1 555 555 0123 → 5555550123.
create or replace function public.referral_digits(p text)
returns text language sql immutable set search_path = '' as $$
    select case when length(d) = 11 and left(d, 1) = '1' then substr(d, 2) else d end
      from (select regexp_replace(coalesce(p, ''), '\D', '', 'g') as d) s;
$$;

-- Lowercased, trimmed, without a "+tag"; Gmail also ignores dots and googlemail.com.
create or replace function public.referral_email(p text)
returns text language sql immutable set search_path = '' as $$
    select case
        when e = '' or position('@' in e) = 0 then e
        else (
            select case when dom in ('gmail.com', 'googlemail.com')
                        then replace(loc, '.', '') || '@gmail.com'
                        else loc || '@' || dom end
              from (select split_part(split_part(e, '@', 1), '+', 1) as loc,
                           split_part(e, '@', 2) as dom) parts
        ) end
      from (select lower(trim(coalesce(p, ''))) as e) s;
$$;

create or replace function public.referral_is_new_client(p_business uuid, p_email text, p_phone text, p_exclude_appointment uuid)
returns boolean language sql stable security definer set search_path = '' as $$
    select not exists (
        select 1 from public.appointments a
        where a.business = p_business
          and a.id <> p_exclude_appointment
          and a.status not in ('CANCELLED', 'DENIED')
          and ((p_email <> '' and public.referral_email(a.client_metadata->>'email') = p_email)
            or (p_phone <> '' and public.referral_digits(a.client_metadata->>'phoneNumber') = p_phone))
    ) and not exists (
        select 1 from public.business_clients bc
        join public.client_users c on c.client_id = bc.client
        where bc.business = p_business
          and ((p_email <> '' and public.referral_email(c.email) = p_email)
            or (p_phone <> '' and public.referral_digits(c.phone_number) = p_phone))
    );
$$;

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

    v_email := public.referral_email(appt.client_metadata->>'email');
    v_phone := public.referral_digits(appt.client_metadata->>'phoneNumber');
    if v_email = '' and v_phone = '' then return jsonb_build_object('status', 'skipped', 'reason', 'no_contact'); end if;

    -- Nobody can refer themselves.
    if (v_email <> '' and public.referral_email(referrer.email) = v_email)
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
        -- The deposit is credited against the balance in both deposit modes
        -- (taken off amount_due when paid, or subtracted at checkout).
        v_cap := coalesce(appt.amount_due, 0)
                 - case when appt.require_deposit then coalesce(appt.deposit_price, 0)::integer else 0 end;
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

-- Referrals already recorded keep matching under the new rules. A row that
-- would now collide with an earlier one for the same person is left as it is.
update public.referrals r
   set referred_email = public.referral_email(r.referred_email)
 where r.referred_email <> public.referral_email(r.referred_email)
   and not exists (
       select 1 from public.referrals o
        where o.business_id = r.business_id and o.id <> r.id and o.status <> 'void'
          and o.referred_email = public.referral_email(r.referred_email));

update public.referrals r
   set referred_phone = public.referral_digits(r.referred_phone)
 where r.referred_phone <> public.referral_digits(r.referred_phone)
   and not exists (
       select 1 from public.referrals o
        where o.business_id = r.business_id and o.id <> r.id and o.status <> 'void'
          and o.referred_phone = public.referral_digits(r.referred_phone));
