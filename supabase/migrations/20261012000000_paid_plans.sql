-- Paid plans replace the free beta.
--
-- Every business that signed up during the beta and has no live
-- subscription keeps full (Growth) access for 30 days from when this runs,
-- marked subscription_status = 'complimentary'. A daily job
-- (src/trigger/complimentary.ts) moves them to Starter once
-- complimentary_until passes, unless the subscription webhook has since
-- recorded a real subscription (trialing/active), which replaces the
-- 'complimentary' status.
--
-- had_trial is set so these 30 days count as their trial: subscribing later
-- charges straight away instead of stacking another free month on top.

alter table public.business_users
    add column if not exists complimentary_until timestamptz;

update public.business_users
set plan_type = 'GROWTH',
    subscription_plan = 'GROWTH',
    subscription_status = 'complimentary',
    complimentary_until = now() + interval '30 days',
    had_trial = true
where coalesce(subscription_status, 'beta') not in ('trialing', 'active', 'past_due');

create index if not exists business_users_complimentary_idx
    on public.business_users (complimentary_until)
    where subscription_status = 'complimentary';
