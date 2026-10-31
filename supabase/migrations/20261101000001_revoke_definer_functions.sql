-- These functions run with elevated rights (SECURITY DEFINER) and are only
-- meant for server code using the service role. Earlier migrations revoked
-- them from PUBLIC, but Supabase also grants EXECUTE to anon and authenticated
-- directly, so anyone could call them through the public API:
--   * claim_sms_slot(business, limit) — use up a business's monthly texts;
--   * release_sms_slot(business) — wind the counter back past the paid cap.
-- The trigger functions can't be called over the API, but don't need the grant either.

revoke execute on function public.claim_sms_slot(uuid, integer) from anon, authenticated;
revoke execute on function public.release_sms_slot(uuid) from anon, authenticated;
grant execute on function public.claim_sms_slot(uuid, integer) to service_role;
grant execute on function public.release_sms_slot(uuid) to service_role;

revoke execute on function public.loyalty_on_appointment_completed() from anon, authenticated;
revoke execute on function public.referral_on_appointment_change() from anon, authenticated;
revoke execute on function public.referral_on_loyalty_reward_change() from anon, authenticated;
