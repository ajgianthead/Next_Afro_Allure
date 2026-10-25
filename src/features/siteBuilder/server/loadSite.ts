import { createAdminClient } from '@/app/utils/supabase/admin'
import { fallbackBio, formatHours, parseSiteData, priceLabel, ratingSummary, type SiteData, type SiteInfo, type SiteReview } from '../siteData'

/**
 * Public data for a template site. Deliberately NOT a server action (server
 * actions are public endpoints): it runs with the service role, so it only
 * returns what's shown on the public page. The full street address is never
 * included; clients get it once a booking is confirmed.
 */
export async function loadSiteInfo(businessId: string): Promise<SiteInfo | null> {
    const db = createAdminClient()
    const { data: business } = await db
        .from('business_users')
        .select('business_name, url_name, account_settings, default_availability, booking_policies')
        .eq('business_id', businessId)
        .maybeSingle()
    if (!business) return null

    const [servicesRes, scheduleRes, policyRes, reviewsRes, profileRes] = await Promise.all([
        db.from('services').select('id, name, description, price, length, style_options').eq('business', businessId).order('created_at', { ascending: true }),
        business.default_availability
            ? db.from('availabilities').select('availability_data').eq('id', business.default_availability).eq('business_id', businessId).maybeSingle()
            : db.from('availabilities').select('availability_data').eq('business_id', businessId).order('created_at', { ascending: true }).limit(1).maybeSingle(),
        business.booking_policies
            ? db.from('business_policies').select('cancel_day_limit, reschedule_day_limit, read_before_booking').eq('id', business.booking_policies).maybeSingle()
            : db.from('business_policies').select('cancel_day_limit, reschedule_day_limit, read_before_booking').eq('business', businessId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        db.from('reviews').select('name, rating, details, created_at').eq('business_id', businessId).order('created_at', { ascending: false }).limit(30),
        db.from('marketplace_profile').select('business_bio').eq('business_id', businessId).maybeSingle(),
    ])

    const address = ((business.account_settings ?? {}) as Record<string, any>).business_address ?? {}
    const travels = !!address.no_address
    const city = typeof address.city === 'string' ? address.city.trim() : ''
    const state = typeof address.state === 'string' ? address.state.trim().toUpperCase() : ''
    const place = !travels && city ? (state ? `${city}, ${state}` : city) : null

    const services = (servicesRes.data ?? []).map(s => ({
        id: s.id,
        name: s.name,
        description: s.description ?? '',
        ...priceLabel({ price: s.price, length: s.length, style_options: s.style_options }),
    }))

    const reviews: SiteReview[] = (reviewsRes.data ?? [])
        .filter(r => (r.details ?? '').trim())
        .map(r => ({ name: (r.name ?? '').trim() || 'Client', rating: Math.max(0, Math.min(5, Math.round(Number(r.rating ?? 0)))), text: (r.details ?? '').trim().slice(0, 600) }))

    const policy = policyRes.data
    const marketplaceBio = (profileRes.data?.business_bio ?? '').trim()

    return {
        businessName: business.business_name,
        urlName: business.url_name,
        place,
        travels,
        services,
        hours: formatHours((scheduleRes.data?.availability_data as any)?.week),
        policies: {
            cancelDays: Number(policy?.cancel_day_limit ?? 0) || 0,
            rescheduleDays: Number(policy?.reschedule_day_limit ?? 0) || 0,
            readBeforeBooking: (policy?.read_before_booking ?? '').trim(),
        },
        reviews: reviews.slice(0, 12),
        rating: ratingSummary(reviews),
        fallbackBio: marketplaceBio || fallbackBio(business.business_name, services.map(s => s.name), place),
    }
}

/** The business's template site settings, or null when it has no template site. */
export async function loadSiteData(businessId: string): Promise<{ siteData: SiteData; type: string | null } | null> {
    const db = createAdminClient()
    const { data } = await db.from('web_editors').select('type, site_data').eq('business_id', businessId).maybeSingle()
    if (!data) return null
    return { siteData: parseSiteData(data.site_data), type: data.type }
}
