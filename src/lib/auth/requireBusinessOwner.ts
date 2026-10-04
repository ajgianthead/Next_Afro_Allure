import { cache } from 'react'
import { createClient } from '@/app/utils/supabase/server'

/**
 * Server actions are public HTTP endpoints — anyone can call them with any
 * arguments. Every dashboard action that takes a businessId must confirm the
 * signed-in user owns that business before reading or changing its data.
 * Cached per request, so calling it from several actions in one render costs
 * one lookup.
 */
const ownedBusinessId = cache(async (): Promise<string | null> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
        .from('business_users')
        .select('business_id')
        .eq('user_id', user.id)
        .maybeSingle()
    return data?.business_id ?? null
})

export async function requireBusinessOwner(businessId: string): Promise<void> {
    const owned = await ownedBusinessId()
    if (!owned || owned !== businessId) throw new Error('Unauthorized')
}

/** The signed-in user's business id, or throws. For actions that don't take one. */
export async function requireOwnBusinessId(): Promise<string> {
    const owned = await ownedBusinessId()
    if (!owned) throw new Error('Unauthorized')
    return owned
}
