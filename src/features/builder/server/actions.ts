'use server'

import { revalidatePath } from 'next/cache'
import { resolveTheme, toBookingTheme } from '@/features/siteBuilder/themes'
import { proViolations } from '../gating'
import { sanitizePage, type StoredPage } from '../page'
import { SECTION_LABELS, type SectionType, type SiteThemeProps } from '../types'
import { ensureRow, ownBusiness, saveDraft, SIGNED_OUT, type Result } from './draft'

/** Saves what the business is editing. Drafts never show on the live site. */
export async function saveBuilderDraftAction(raw: unknown): Promise<Result<{ savedAt: string }>> {
    return saveDraft(raw)
}

/**
 * Publishes the page: it becomes the live site (type BUILDER), the draft is
 * kept in step, and the booking page takes the site's colors and fonts unless
 * the business styled it separately. Starter businesses can't publish new
 * Pro layouts or animations.
 */
export async function publishBuilderPageAction(raw: unknown): Promise<Result<{ publishedAt: string }>> {
    const own = await ownBusiness()
    if (!own) return { ok: false, error: SIGNED_OUT }
    const clean = sanitizePage(raw)
    if (!clean.ok) return clean
    const rowError = await ensureRow(own.supabase, own.business.business_id)
    if (rowError) return { ok: false, error: 'Could not publish. Please try again.' }

    const { data: row } = await own.supabase.from('web_editors').select('builder_data' as any).eq('business_id', own.business.business_id).maybeSingle()
    const published = ((row as any)?.builder_data as StoredPage | null)?.content ?? []
    const blocked = proViolations(clean.page.content as any, published as any, own.plan)
    if (blocked.length) {
        const names = [...new Set(blocked.map(b => SECTION_LABELS[b.type as SectionType] ?? b.type))].join(', ')
        return { ok: false, error: `${names} uses a Growth layout or animation. Upgrade to Growth to publish it, or choose a Basic one.` }
    }

    const theme = { ...(clean.page.root.props as Partial<SiteThemeProps>) }
    const now = new Date().toISOString()
    const fields: Record<string, unknown> = {
        type: 'BUILDER',
        builder_data: clean.page,
        builder_draft: clean.page,
        builder_published_at: now,
    }
    if (theme.bookingMatchesSite !== false && theme.templateId) {
        fields.theme_data = toBookingTheme(resolveTheme(theme.templateId, theme.scheme, theme.customColors, theme.fontPairing))
    }
    const { error } = await own.supabase.from('web_editors').update(fields as any).eq('business_id', own.business.business_id)
    if (error) return { ok: false, error: 'Could not publish. Please try again.' }
    if (!own.business.published_site) {
        await own.supabase.from('business_users').update({ published_site: true }).eq('business_id', own.business.business_id)
    }
    revalidatePath(`/business/${own.business.url_name}`)
    revalidatePath(`/business/${own.business.url_name}/book`)
    revalidatePath('/dashboard/booking-site')
    return { ok: true, data: { publishedAt: now } }
}
