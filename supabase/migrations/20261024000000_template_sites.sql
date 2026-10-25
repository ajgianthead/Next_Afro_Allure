-- Simple Site Builder: template sites filled from the business's own data.
--
-- web_editors.type gains 'TEMPLATE'. Its settings (chosen template, color
-- scheme, font, uploaded media, about/contact text) live in site_data. The
-- older 'SECTIONS' sites keep rendering until the business picks a template;
-- 'CUSTOM' (Puck) sites are untouched.

alter type public.web_editor add value if not exists 'TEMPLATE';

alter table public.web_editors
    add column if not exists site_data jsonb not null default '{}'::jsonb;

-- Logos, cover photos/videos, about photos and gallery media for template
-- sites. Public read (they're shown on public booking sites); a business can
-- only write inside its own <business_id>/ folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'site-media',
    'site-media',
    true,
    52428800, -- 50 MB, for short videos
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "site media is public"
    on storage.objects for select
    using (bucket_id = 'site-media');

create policy "owner uploads site media"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'site-media' and public.is_business_owner(((storage.foldername(name))[1])::uuid));

create policy "owner updates site media"
    on storage.objects for update to authenticated
    using (bucket_id = 'site-media' and public.is_business_owner(((storage.foldername(name))[1])::uuid))
    with check (bucket_id = 'site-media' and public.is_business_owner(((storage.foldername(name))[1])::uuid));

create policy "owner deletes site media"
    on storage.objects for delete to authenticated
    using (bucket_id = 'site-media' and public.is_business_owner(((storage.foldername(name))[1])::uuid));
