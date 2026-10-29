-- Two active appointments for the same business can't overlap. The rule
-- existed in the database but was never in a migration, and the dev copy was
-- made without the WHERE, so a cancelled appointment kept blocking its time:
-- the booking page (which skips cancelled ones) offered the time and the
-- insert then failed with no_overlapping_bookings.
--
-- Production already has the right definition; leave it alone there.

create extension if not exists btree_gist;

do $$
declare
    def text;
begin
    select pg_get_constraintdef(oid) into def
    from pg_constraint
    where conrelid = 'public.appointments'::regclass and conname = 'no_overlapping_bookings';

    if def is not null and def ilike '%status <> ''CANCELLED''%' then
        return;
    end if;

    if def is not null then
        alter table public.appointments drop constraint no_overlapping_bookings;
    end if;

    alter table public.appointments add constraint no_overlapping_bookings
        exclude using gist (business with =, time_range with &&)
        where (status <> 'CANCELLED');
end $$;
