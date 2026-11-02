'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/utils/supabase/server'
import { effectivePlanType } from '@/lib/beta'
import { resolveTheme, toBookingTheme } from '@/features/siteBuilder/themes'
import { proViolations, type PlanType } from '../gating'
import { sanitizePage, type StoredPage } from '../page'
import { SECTION_LABELS, type SectionType, type SiteThemeProps } from '../types'

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string }

const SIGNED_OUT = 'You are signed out. Please sign in again.'
const EMPTY_PUCK = JSON.stringify({ content: [], root: {}, zones: {} })

// builder_draft / builder_data / builder_published_at and the BUILDER type
// come from migration 20261102000000; the generated database types catch up
// after it runs in production, hence the loose casts on those columns.
async function ownBusiness() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
        .from('business_users')
        .select('business_id, url_name, plan_type, published_site')
        .eq('user_id', user.id)
        .single()
    return data ? { supabase, business: data, plan: effectivePlanType(data.plan_type) as PlanType } : null
}

async function ensureRow(supabase: Awaited<ReturnType<typeof createClient>>, businessId: string) {
    const { data } = await supabase.from('web_editors').select('id').eq('business_id', businessId).maybeSingle()
    if (data) return null
    const { error } = await supabase.from('web_editors').insert({ business_id: businessId, type: 'TEMPLATE', editor_data: EMPTY_PUCK, section_data: [] })
    return error?.message ?? null
}

/** Saves what the business is editing. Drafts never show on the live site. */
export async function saveBuilderDraftAction(raw: unknown): Promise<Result<{ savedAt: string }>> {
    const own = await ownBusiness()
    if (!own) return { ok: false, error: SIGNED_OUT }
    const clean = sanitizePage(raw)
    if (!clean.ok) return clean
    const rowError = await ensureRow(own.supabase, own.business.business_id)
    if (rowError) return { ok: false, error: 'Could not save. Please try again.' }
    const { error } = await own.supabase.from('web_editors').update({ builder_draft: clean.page } as any).eq('business_id', own.business.business_id)
    if (error) return { ok: false, error: 'Could not save. Please try again.' }
    return { ok: true, data: { savedAt: new Date().toISOString() } }
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
