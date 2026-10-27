-- The friend's first-visit discount was capped at "price minus deposit" only
-- when the deposit is subtracted from amount_due on payment. The deposit is
-- credited against the balance in the other mode too, so a large deposit
-- could swallow part of the discount. Same function, corrected cap.

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

revoke all on function public.referral_attribute(uuid, text) from public, anon, authenticated;
grant execute on function public.referral_attribute(uuid, text) to service_role;
