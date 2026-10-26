'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/utils/supabase/server'
import type { Database } from '../../../../lib/database.types'
import { effectivePlanType } from '@/lib/beta'
import { importFromSections, parseSiteData, type SiteContent, type SiteData, type SiteInfo } from '../siteData'
import { bookingThemeFromChoice, resolveTheme, toBookingTheme, type BookingThemeChoice } from '../themes'
import { DEFAULT_BOOKING_THEME, type BookingTheme } from '@/features/automatedBooking/types/theme'
import { loadSiteInfo } from './loadSite'

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string }
type Supabase = SupabaseClient<Database>

const SIGNED_OUT = 'You are signed out. Please sign in again.'
const EMPTY_PUCK = JSON.stringify({ content: [], root: {}, zones: {} })

async function ownBusiness(supabase: Supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
        .from('business_users')
        .select('business_id, url_name, plan_type, published_site')
        .eq('user_id', user.id)
        .single()
    return data
}

const themeFor = (site: SiteData) => toBookingTheme(resolveTheme(site.templateId, site.scheme, site.customColors, site.fontPairing))

function revalidateSite(urlName: string) {
    revalidatePath(`/business/${urlName}`)
    revalidatePath('/dashboard/booking-site')
}

/** Public data for the builder preview (the same the live site shows). */
export async function getSitePreviewInfoAction(): Promise<Result<SiteInfo>> {
    const supabase = await createClient()
    const business = await ownBusiness(supabase)
    if (!business) return { ok: false, error: SIGNED_OUT }
    const info = await loadSiteInfo(business.business_id)
    if (!info) return { ok: false, error: 'Business not found.' }
    return { ok: true, data: info }
}

/**
 * Saves the template site's settings and makes it the business's site
 * (creating the web_editors row if needed). The Custom Builder's page and an
 * old Section Editor site are kept in their own columns, so switching back
 * loses nothing. The booking page picks up the same colors and fonts.
 */
export async function saveTemplateSiteAction(siteData: SiteData, options: { publish?: boolean } = {}): Promise<Result<SiteData>> {
    const supabase = await createClient()
    const business = await ownBusiness(supabase)
    if (!business) return { ok: false, error: SIGNED_OUT }

    const site = parseSiteData(siteData)
    // A booking page the business styled on its own keeps its look.
    const fields = { type: 'TEMPLATE' as const, site_data: site as any, ...(site.bookingMatchesSite ? { theme_data: themeFor(site) as any } : {}) }
    const { data: existing } = await supabase.from('web_editors').select('id').eq('business_id', business.business_id).maybeSingle()
    const { error } = existing
        ? await supabase.from('web_editors').update(fields).eq('business_id', business.business_id)
        : await supabase.from('web_editors').insert({ ...fields, business_id: business.business_id, editor_data: EMPTY_PUCK, section_data: [] })
    if (error) {
        console.error('Template site save failed:', error)
        return { ok: false, error: 'Could not save your site. Please try again.' }
    }

    if (options.publish && !business.published_site) {
        await supabase.from('business_users').update({ published_site: true }).eq('business_id', business.business_id)
    }
    revalidateSite(business.url_name)
    return { ok: true, data: site }
}

/**
 * Saves how the booking page (/book) looks: either matching the template
 * site's colors and fonts, or the business's own choices. Works without a
 * site too (a draft, unpublished template site row holds the theme).
 */
export async function saveBookingThemeAction(input: { matchSite: true } | { matchSite: false; choice: BookingThemeChoice }): Promise<Result<{ theme: BookingTheme; matchesSite: boolean }>> {
    const supabase = await createClient()
    const business = await ownBusiness(supabase)
    if (!business) return { ok: false, error: SIGNED_OUT }

    const { data: row } = await supabase.from('web_editors').select('type, site_data, theme_data').eq('business_id', business.business_id).maybeSingle()
    const site = row?.type === 'TEMPLATE' ? parseSiteData(row.site_data) : null

    let theme: BookingTheme
    let error: { message: string } | null = null
    if (input.matchSite) {
        if (!site) return { ok: false, error: 'Make your website first to match its look.' }
        site.bookingMatchesSite = true
        theme = themeFor(site)
        ;({ error } = await supabase.from('web_editors').update({ site_data: site as any, theme_data: theme as any }).eq('business_id', business.business_id))
    } else {
        const base = { ...DEFAULT_BOOKING_THEME, ...((row?.theme_data ?? {}) as Partial<BookingTheme>) }
        theme = bookingThemeFromChoice(input.choice, base)
        if (row) {
            const fields = site ? { theme_data: theme as any, site_data: { ...site, bookingMatchesSite: false } as any } : { theme_data: theme as any }
            ;({ error } = await supabase.from('web_editors').update(fields).eq('business_id', business.business_id))
        } else {
            // No site yet: an unpublished draft holds the booking theme.
            ;({ error } = await supabase.from('web_editors').insert({
                business_id: business.business_id,
                type: 'TEMPLATE',
                editor_data: EMPTY_PUCK,
                section_data: [],
                // No templateId: it's not a website yet, just the booking page's look.
                site_data: { bookingMatchesSite: false } as any,
                theme_data: theme as any,
            }))
        }
    }
    if (error) {
        console.error('Booking theme save failed:', error)
        return { ok: false, error: 'Could not save your booking page. Please try again.' }
    }
    revalidatePath(`/business/${business.url_name}/book`)
    revalidatePath('/dashboard/booking-site')
    return { ok: true, data: { theme, matchesSite: input.matchSite } }
}

/** Shows or hides the site. Booking links keep working either way. */
export async function setSitePublishedAction(published: boolean): Promise<Result> {
    const supabase = await createClient()
    const business = await ownBusiness(supabase)
    if (!business) return { ok: false, error: SIGNED_OUT }
    const { error } = await supabase.from('business_users').update({ published_site: published }).eq('business_id', business.business_id)
    if (error) return { ok: false, error: 'Could not update your site. Please try again.' }
    revalidateSite(business.url_name)
    return { ok: true, data: undefined }
}

/** Removes uploaded files that are no longer used. Only files in the business's own folder. */
export async function deleteSiteMediaAction(paths: string[]): Promise<Result> {
    const supabase = await createClient()
    const business = await ownBusiness(supabase)
    if (!business) return { ok: false, error: SIGNED_OUT }
    const own = paths.filter(p => typeof p === 'string' && p.startsWith(`${business.business_id}/`) && !p.includes('..'))
    if (own.length) await supabase.storage.from('site-media').remove(own)
    return { ok: true, data: undefined }
}

/** Text and photos from the business's old Section Editor site, to start a template site with. */
export async function importSectionContentAction(): Promise<Result<{ content: Partial<SiteContent>; images: string[] }>> {
    const supabase = await createClient()
    const business = await ownBusiness(supabase)
    if (!business) return { ok: false, error: SIGNED_OUT }
    const { data } = await supabase.from('web_editors').select('section_data').eq('business_id', business.business_id).maybeSingle()
    return { ok: true, data: importFromSections(data?.section_data ?? []) }
}

/**
 * Where to open the Custom Builder (Growth). The site isn't switched here: it
 * becomes a custom site when they first save in the Custom Builder, so the
 * live template site stays up until then.
 */
export async function customBuilderLinkAction(templateId: string): Promise<Result<string>> {
    const supabase = await createClient()
    const business = await ownBusiness(supabase)
    if (!business) return { ok: false, error: SIGNED_OUT }
    if (effectivePlanType(business.plan_type) !== 'GROWTH') return { ok: false, error: 'The Custom Builder is part of Growth.' }

    const { data: existing } = await supabase.from('web_editors').select('editor_data').eq('business_id', business.business_id).maybeSingle()
    if (!existing) {
        await supabase.from('web_editors').insert({ business_id: business.business_id, type: 'TEMPLATE', editor_data: EMPTY_PUCK, section_data: [] })
    }
    let hasCustomPage = false
    try {
        hasCustomPage = (JSON.parse(existing?.editor_data ?? '{}')?.content?.length ?? 0) > 0
    } catch { /* unreadable page: start from the template */ }
    const query = hasCustomPage ? '' : `?template=${encodeURIComponent(templateId)}`
    return { ok: true, data: `/business/${business.url_name}/edit${query}` }
}
