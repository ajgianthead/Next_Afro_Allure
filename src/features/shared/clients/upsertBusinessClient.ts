import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/app/utils/supabase/admin'

export interface ClientInput {
    first_name: string
    last_name: string
    email: string
    phone_number: string
}

export type UpsertClientResult =
    | { ok: true; clientId: string; created: boolean; linked: boolean }
    | { ok: false; reason: 'banned' | 'missing-contact' | 'error'; message?: string }

/**
 * Finds (or creates) the client_users row for this person and links it to
 * the business's clientele. Lookups are done by email first, then phone,
 * each as its own query — the previous single `.or(email.eq.X,phone.eq.Y)`
 * lookup broke whenever the phone was blank (matching every phoneless client)
 * or when email and phone belonged to two different rows.
 *
 * Not a server action: callers decide which client to pass. Confirmation
 * paths that run without a business session (client confirm page, Stripe
 * webhook) use the service-role client via `upsertBusinessClientAsAdmin`.
 */
export async function upsertBusinessClient(
    supabase: SupabaseClient<any, any, any>,
    client: ClientInput,
    businessId: string
): Promise<UpsertClientResult> {
    const email = client.email?.trim().toLowerCase() ?? ''
    const phone = client.phone_number?.trim() ?? ''
    if (!email && !phone) return { ok: false, reason: 'missing-contact' }

    try {
        let clientId: string | null = null
        if (email) {
            // Case-insensitive exact match; escape LIKE wildcards (`_` is common in emails).
            const pattern = email.replace(/[\\%_]/g, c => `\\${c}`)
            const { data } = await supabase.from('client_users').select('client_id').ilike('email', pattern).limit(1)
            clientId = data?.[0]?.client_id ?? null
        }
        if (!clientId && phone) {
            const { data } = await supabase.from('client_users').select('client_id').eq('phone_number', phone).limit(1)
            clientId = data?.[0]?.client_id ?? null
        }

        let created = false
        if (!clientId) {
            const { data: newUser, error } = await supabase
                .from('client_users')
                .insert({
                    first_name: client.first_name?.trim() ?? '',
                    last_name: client.last_name?.trim() ?? '',
                    email,
                    phone_number: phone,
                })
                .select('client_id')
                .single()
            if (error) return { ok: false, reason: 'error', message: error.message }
            clientId = newUser.client_id as string
            created = true
        }

        const { data: banned } = await supabase
            .from('banned_clients')
            .select('id')
            .eq('business_id', businessId)
            .eq('client_id', clientId)
            .limit(1)
        if (banned && banned.length > 0) return { ok: false, reason: 'banned' }

        const { data: existingLink } = await supabase
            .from('business_clients')
            .select('id')
            .eq('business', businessId)
            .eq('client', clientId)
            .limit(1)
        if (existingLink && existingLink.length > 0) return { ok: true, clientId, created, linked: false }

        const { error: linkError } = await supabase
            .from('business_clients')
            .insert({ business: businessId, client: clientId, banned: false })
        if (linkError) return { ok: false, reason: 'error', message: linkError.message }

        return { ok: true, clientId, created, linked: true }
    } catch (err: any) {
        return { ok: false, reason: 'error', message: err?.message }
    }
}

/** Adds a client to a business's clientele from a trusted server path (no business session needed). Never throws. */
export async function upsertBusinessClientAsAdmin(client: ClientInput, businessId: string): Promise<UpsertClientResult> {
    const result = await upsertBusinessClient(createAdminClient(), client, businessId)
    if (!result.ok && result.reason === 'error') console.error('Failed to add client to clientele:', result.message)
    return result
}
