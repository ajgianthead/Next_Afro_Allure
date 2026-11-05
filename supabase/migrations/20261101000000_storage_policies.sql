-- Storage rules for the older buckets were made in the dashboard and were far
-- too loose:
--   * editor-media-pool: "allow all" for every role, signed in or not, so anyone
--     with the public key could upload, overwrite or delete files (including
--     the placeholder image shown on business websites);
--   * service-photos, marketplace-profile_photos / -banners / -gallery and
--     web-section-images: any signed-in user could change or delete any
--     business's files, and anyone can sign up.
-- Now each business can only write inside its own folder (the path holds its
-- business id, as the app already uploads), like site-media. Files stay
-- publicly viewable through their public URLs; listing is owner-only.
-- web-section-images is no longer written to by the app, so it becomes read-only.

-- True when `p` is a business id the signed-in user owns. Safe on any text
-- (a path segment that isn't a uuid is simply not owned).
create or replace function public.owns_business_folder(p text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
    if p is null or p !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
        return false;
    end if;
    return public.is_business_owner(p::uuid);
end $$;
revoke all on function public.owns_business_folder(text) from public;
grant execute on function public.owns_business_folder(text) to authenticated, service_role;

-- Drop every existing policy that mentions one of these buckets (dashboard
-- policy names differ between projects, so match on what they cover).
do $$
declare
    pol record;
begin
    for pol in
        select p.polname
          from pg_policy p
         where p.polrelid = 'storage.objects'::regclass
           and (coalesce(pg_get_expr(p.polqual, p.polrelid), '') || coalesce(pg_get_expr(p.polwithcheck, p.polrelid), ''))
               ~ '(editor-media-pool|service-photos|marketplace-profile_photos|marketplace-profile-banners|marketplace-profile-gallery|web-section-images)'
    loop
        execute format('drop policy %I on storage.objects', pol.polname);
    end loop;
end $$;

-- editor-media-pool: editor/<business id>/image/<file>
create policy "owner lists editor media" on storage.objects for select to authenticated
    using (bucket_id = 'editor-media-pool' and public.owns_business_folder((storage.foldername(name))[2]));
create policy "owner uploads editor media" on storage.objects for insert to authenticated
    with check (bucket_id = 'editor-media-pool' and (storage.foldername(name))[1] = 'editor'
                and public.owns_business_folder((storage.foldername(name))[2]));
create policy "owner updates editor media" on storage.objects for update to authenticated
    using (bucket_id = 'editor-media-pool' and public.owns_business_folder((storage.foldername(name))[2]))
    with check (bucket_id = 'editor-media-pool' and (storage.foldername(name))[1] = 'editor'
                and public.owns_business_folder((storage.foldername(name))[2]));
create policy "owner deletes editor media" on storage.objects for delete to authenticated
    using (bucket_id = 'editor-media-pool' and public.owns_business_folder((storage.foldername(name))[2]));

-- service-photos: private/images/<business id>/services/<service id>
create policy "owner lists service photos" on storage.objects for select to authenticated
    using (bucket_id = 'service-photos' and public.owns_business_folder((storage.foldername(name))[3]));
create policy "owner uploads service photos" on storage.objects for insert to authenticated
    with check (bucket_id = 'service-photos' and public.owns_business_folder((storage.foldername(name))[3]));
create policy "owner updates service photos" on storage.objects for update to authenticated
    using (bucket_id = 'service-photos' and public.owns_business_folder((storage.foldername(name))[3]))
    with check (bucket_id = 'service-photos' and public.owns_business_folder((storage.foldername(name))[3]));
create policy "owner deletes service photos" on storage.objects for delete to authenticated
    using (bucket_id = 'service-photos' and public.owns_business_folder((storage.foldername(name))[3]));

-- marketplace buckets: private/<business id>/<file>
create policy "owner lists marketplace media" on storage.objects for select to authenticated
    using (bucket_id in ('marketplace-profile_photos', 'marketplace-profile-banners', 'marketplace-profile-gallery')
           and public.owns_business_folder((storage.foldername(name))[2]));
create policy "owner uploads marketplace media" on storage.objects for insert to authenticated
    with check (bucket_id in ('marketplace-profile_photos', 'marketplace-profile-banners', 'marketplace-profile-gallery')
                and public.owns_business_folder((storage.foldername(name))[2]));
create policy "owner updates marketplace media" on storage.objects for update to authenticated
    using (bucket_id in ('marketplace-profile_photos', 'marketplace-profile-banners', 'marketplace-profile-gallery')
           and public.owns_business_folder((storage.foldername(name))[2]))
    with check (bucket_id in ('marketplace-profile_photos', 'marketplace-profile-banners', 'marketplace-profile-gallery')
                and public.owns_business_folder((storage.foldername(name))[2]));
create policy "owner deletes marketplace media" on storage.objects for delete to authenticated
    using (bucket_id in ('marketplace-profile_photos', 'marketplace-profile-banners', 'marketplace-profile-gallery')
           and public.owns_business_folder((storage.foldername(name))[2]));

-- web-section-images: no writes from the app any more; existing files stay viewable by URL.

-- Size and type limits: images only (no SVG, which can carry scripts), 10 MB.
update storage.buckets
   set file_size_limit = 10485760,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
 where id in ('editor-media-pool', 'service-photos', 'marketplace-profile_photos',
              'marketplace-profile-banners', 'marketplace-profile-gallery', 'web-section-images');
