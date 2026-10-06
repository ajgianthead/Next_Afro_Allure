import type { SupabaseClient } from '@supabase/supabase-js'
import { quoteBooking, QuoteError, type AddonLike, type Quote, type StyleSelection } from '../pricing'

export interface QuoteRequest {
    businessId: string
    serviceId: string
    addonIds?: unknown
    selection?: StyleSelection | null
}

/**
 * Prices a booking from the database: the service must belong to the
 * business, and only add-ons attached to that service count. Nothing about
 * price or duration is taken from the browser.
 *
 * Server-only (not a server action). Pass a client that can read the
 * business's services — the service role on public booking paths.
 */
export async function quoteFromDb(
    supabase: SupabaseClient<any, any, any>,
    req: QuoteRequest
): Promise<{ service: Record<string, any>; quote: Quote }> {
    const { data: service, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', req.serviceId)
        .eq('business', req.businessId)
        .maybeSingle()
    if (error) throw new Error(error.message)
    if (!service) throw new QuoteError('Service not found.')

    // services.addons holds the ids of add-ons offered with this service.
    const offered = new Set(
        (Array.isArray(service.addons) ? service.addons : [])
            .map((a: any) => (typeof a === 'string' ? a : a?.id))
            .filter(Boolean)
    )
    const requested = (Array.isArray(req.addonIds) ? req.addonIds : [])
        .map((a: any) => (typeof a === 'string' ? a : a?.id))
        .filter((id: unknown): id is string => typeof id === 'string' && offered.has(id))
    const uniqueIds = [...new Set(requested)]

    let addons: AddonLike[] = []
    if (uniqueIds.length) {
        const { data, error: addonError } = await supabase
            .from('service_addons')
            .select('id, name, price')
            .in('id', uniqueIds)
            .eq('business_id', req.businessId)
        if (addonError) throw new Error(addonError.message)
        addons = (data ?? []) as AddonLike[]
    }

    return { service, quote: quoteBooking(service as any, req.selection ?? null, addons) }
}
