import 'server-only'

import { createClient } from '@/app/utils/supabase/server'
import { loadSiteInfo } from '@/features/siteBuilder/server/loadSite'
import { parseSiteData, type SiteData } from '@/features/siteBuilder/siteData'
import { sanitizePage, type StoredPage } from '../page'

/**
 * What the editor opens with: the saved draft, else the published page. With
 * neither, `page` is null and the editor builds one in the browser (section
 * definitions are client modules): from the template site in `site`, or the
 * Quickstart starter page.
 */
export async function loadBuilderEditor(businessId: string) {
    const supabase = await createClient()
    const [{ data: row }, info] = await Promise.all([
        supabase.from('web_editors').select('site_data, builder_draft, builder_data, builder_published_at' as '*').eq('business_id', businessId).maybeSingle(),
        loadSiteInfo(businessId),
    ])
    if (!info) return null
    const r = row as unknown as { site_data: unknown; builder_draft: unknown; builder_data: unknown; builder_published_at: string | null } | null

    const saved = [r?.builder_draft, r?.builder_data].map(p => (p ? sanitizePage(p) : null)).find(p => p?.ok)
    // A row that only holds a booking-page look (no template chosen) isn't a site yet.
    const raw = r?.site_data as Record<string, unknown> | null
    const site: SiteData | null = !saved?.ok && raw && typeof raw.templateId === 'string' ? parseSiteData(raw) : null
    return { page: saved?.ok ? saved.page : null as StoredPage | null, site, info, publishedAt: r?.builder_published_at ?? null }
}
