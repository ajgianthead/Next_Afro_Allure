-- The section builder that replaces the Simple Builder (template sites) and
-- the Custom Builder (free-form Puck pages). Its pages live in their own
-- columns, so the old ones stay untouched and any business can be rolled back:
--   builder_draft — what the business is editing (autosaved)
--   builder_data  — what's published (copied from the draft on Publish)
-- web_editors.type becomes 'BUILDER' on the first publish.
-- Row-level security already limits web_editors to the owning business.

alter type public.web_editor add value if not exists 'BUILDER';

alter table public.web_editors add column if not exists builder_draft jsonb;
alter table public.web_editors add column if not exists builder_data jsonb;
alter table public.web_editors add column if not exists builder_published_at timestamptz;
