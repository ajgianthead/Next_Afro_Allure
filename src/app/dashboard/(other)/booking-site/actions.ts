'use server'

import { createClient } from "@/app/utils/supabase/server"
import { validateSlug } from "@/lib/businessSlug"

export type UpdateUrlResult = { ok: true; urlName: string } | { ok: false; error: string }

/**
 * Changes the business's booking URL (which is also its subdomain). The old
 * name is kept in legacy_url_names so links already shared still redirect.
 */
export const updateBusinessURL = async (businessId: string, urlName: string): Promise<UpdateUrlResult> => {
    const slug = urlName.trim().toLowerCase()
    const invalid = validateSlug(slug)
    if (invalid) return { ok: false, error: invalid }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'You are signed out. Please sign in again.' }

    const { data: business } = await supabase
        .from('business_users')
        .select('business_id, url_name, legacy_url_names')
        .eq('business_id', businessId)
        .eq('user_id', user.id)
        .single()
    if (!business) return { ok: false, error: 'Business not found.' }
    if (business.url_name === slug) return { ok: true, urlName: slug }

    if (!(await isURLNameAvailable(slug, businessId))) return { ok: false, error: 'This URL name is already taken' }

    const legacy = new Set<string>((business.legacy_url_names as string[] | null) ?? [])
    if (business.url_name) legacy.add(business.url_name.toLowerCase())
    legacy.delete(slug)

    const { error: updateError } = await supabase
        .from("business_users")
        .update({ url_name: slug, legacy_url_names: [...legacy] })
        .eq("business_id", business.business_id);
    if (updateError) {
        // Unique index violation — someone claimed it between check and update.
        if (updateError.code === '23505') return { ok: false, error: 'This URL name is already taken' }
        return { ok: false, error: 'Something went wrong. Please try again.' }
    }
    return { ok: true, urlName: slug }
}

/** True if no other business uses (or used to use) this name and it's not reserved. */
export const isURLNameAvailable = async (urlName: string, ownBusinessId?: string) => {
    const slug = urlName.trim().toLowerCase()
    if (validateSlug(slug)) return false
    const supabase = await createClient();
    let current = supabase.from('business_users').select("business_id").eq('url_name', slug)
    if (ownBusinessId) current = current.neq('business_id', ownBusinessId)
    const { data, error } = await current.limit(1)
    if (error) throw error
    if (data && data.length > 0) return false

    let legacy = supabase.from('business_users').select("business_id").contains('legacy_url_names', [slug])
    if (ownBusinessId) legacy = legacy.neq('business_id', ownBusinessId)
    const { data: legacyData } = await legacy.limit(1)
    return !legacyData || legacyData.length === 0
}
