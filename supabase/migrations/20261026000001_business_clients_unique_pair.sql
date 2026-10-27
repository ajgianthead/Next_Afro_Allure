-- business_clients links a client to a business's clientele: one row per
-- (business, client). The table had a unique constraint on `business`
-- alone, so each business could only ever link ONE client. Every later link
-- failed (upsertBusinessClient logs "Failed to add client to clientele" and
-- carries on), leaving clients out of the client list, loyalty and referrals.
--
-- Replace it with uniqueness on the pair. A unique constraint on `client`
-- alone would be the same bug the other way round (a client could only
-- belong to one business), so it's dropped too if it exists.

alter table public.business_clients drop constraint if exists business_clients_business_key;
alter table public.business_clients drop constraint if exists business_clients_client_key;
drop index if exists public.business_clients_business_key;
drop index if exists public.business_clients_client_key;

-- Keep the oldest link if the same pair was ever stored twice.
delete from public.business_clients a
using public.business_clients b
where a.business = b.business and a.client = b.client and a.id > b.id;

create unique index if not exists business_clients_business_client_key
    on public.business_clients (business, client);
