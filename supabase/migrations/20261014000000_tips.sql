-- Tips on end-of-appointment (balance) payments.
--
-- The tip is charged on the same Stripe payment as the balance. paid_amount
-- keeps meaning "paid toward the appointment" (revenue, loyalty spend, refund
-- status) and never includes the tip; the tip is kept here instead. Only the
-- connected-account webhook (service role) writes it.

alter table public.appointments
    add column if not exists tip_cents integer not null default 0 check (tip_cents >= 0);
