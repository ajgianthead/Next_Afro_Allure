'use server'
import { requireBusinessOwner, requireOwnBusinessId } from "@/lib/auth/requireBusinessOwner"

import { createClient } from "@/app/utils/supabase/server"
import { createAdminClient } from "@/app/utils/supabase/admin"
import { upsertBusinessClient } from "@/features/shared/clients/upsertBusinessClient"

export interface Client {
    client_id?: string
    created_at?: string
    email: string
    first_name: string
    last_name: string
    phone_number: string
    updated_at?: string | null
}

// Checks the live ban mechanism (banned_clients, keyed by client_id) by
// resolving the submitted email/phone to a client_users row first — public
// bookers aren't authenticated, so there's no client_id on the request
// itself. Call this before creating any appointment from client-submitted
// contact info. Previously nothing in the booking-creation paths checked
// this at all, so a banned client could simply re-book.
export const isClientBannedFromBusiness = async (
    email: string | null | undefined,
    phoneNumber: string | null | undefined,
    businessId: string
): Promise<boolean> => {
    if (!email && !phoneNumber) return false
    // Called from public booking flows (no session) — service role, returns a boolean only.
    const supabase = createAdminClient()

    // Exact matches only: the email and phone come from the public booking form,
    // and pasting them into an .or() filter string let a crafted value change the
    // query. Every matching client counts — the email may belong to one record and
    // the phone to another (that used to error and read as "not banned").
    const lookups = await Promise.all([
        email ? supabase.from('client_users').select('client_id').eq('email', email) : null,
        phoneNumber ? supabase.from('client_users').select('client_id').eq('phone_number', phoneNumber) : null,
    ])
    const clientIds = [...new Set(lookups.flatMap(r => r?.data ?? []).map(r => r.client_id))]
    if (!clientIds.length) return false

    const { data: bannedEntries } = await supabase
        .from('banned_clients')
        .select('id')
        .eq('business_id', businessId)
        .in('client_id', clientIds)
        .limit(1)

    return !!bannedEntries?.length
}

export interface BannedClientDisplay {
    id: string
    business_id: string | null
    client_id: string
    created_at: string
    email: string
    phone_number: string
    first_name: string
    last_name: string
}

export const getBusinessClients = async (businessId: string) => {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('business_clients')
        .select(`client_users!inner(client_id, email, first_name, last_name, phone_number, created_at, updated_at)`)
        .eq('business', businessId)
        .eq('banned', false)
    if (error) return error
    return data.map(d => d.client_users) as Client[]
}

export const getBannedClients = async (businessId: string) => {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('banned_clients')
        .select(`id, business_id, client_id, created_at, client_users!inner(email, phone_number, first_name, last_name)`)
        .eq('business_id', businessId)
    if (error) return error
    return data.map(b => ({
        id: b.id,
        business_id: b.business_id,
        client_id: b.client_id,
        created_at: b.created_at,
        email: (b.client_users as any).email as string,
        phone_number: (b.client_users as any).phone_number as string,
        first_name: (b.client_users as any).first_name as string,
        last_name: (b.client_users as any).last_name as string,
    })) as BannedClientDisplay[]
}

export const addCreateNewClient = async (
    client: { first_name: string; last_name: string; email: string; phone_number: string },
    businessId: string
) => {
    await requireBusinessOwner(businessId)
    // Matching an existing client record (possibly created by another
    // business's booking) needs the service role; ownership is checked above.
    const supabase = createAdminClient()
    const result = await upsertBusinessClient(supabase, client, businessId)
    // Errors come back as strings: a PostgrestError loses its prototype when it
    // crosses the server-action boundary, so `instanceof` checks never matched.
    if (!result.ok) {
        if (result.reason === 'banned') return "Client is banned from this business"
        if (result.reason === 'missing-contact') return "Please enter an email or phone number"
        return result.message ?? "Failed to add client"
    }
    if (!result.linked) return "Client already exists for this business"

    const { data: full, error: fetchError } = await supabase
        .from('client_users')
        .select('*')
        .eq('client_id', result.clientId)
        .single()
    if (fetchError) return fetchError.message
    return full
}

export const updateClientInfo = async (
    client: { client_id: string; first_name: string; last_name: string; email: string; phone_number: string },
    businessId: string
) => {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()

    // Check if another client_users record has the same email/phone
    // Exact matches (no values pasted into a filter string); several other
    // clients can share the email or the phone.
    const lookups = await Promise.all([
        client.email ? supabase.from('client_users').select('client_id').eq('email', client.email).neq('client_id', client.client_id) : null,
        client.phone_number ? supabase.from('client_users').select('client_id').eq('phone_number', client.phone_number).neq('client_id', client.client_id) : null,
    ])
    const conflicts = [...new Set(lookups.flatMap(r => r?.data ?? []).map(r => r.client_id))]

    if (conflicts.length) {
        // Only a conflict if that other client is also in this business
        const { data: linked } = await supabase
            .from('business_clients')
            .select('id')
            .eq('business', businessId)
            .in('client', conflicts)
            .limit(1)
        if (linked?.length) return "Client already exists for this business"
    }

    const { data, error } = await supabase
        .from('client_users')
        .update({
            first_name: client.first_name,
            last_name: client.last_name,
            email: client.email,
            phone_number: client.phone_number,
        })
        .eq('client_id', client.client_id)
        .select()
        .single()
    if (error) return error
    return data
}

export const deleteClient = async (clientId: string, businessId: string) => {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()
    const { error } = await supabase
        .from('business_clients')
        .delete()
        .eq('business', businessId)
        .eq('client', clientId)
    if (error) return error
    return { client_id: clientId }
}

export const banClientFromList = async (clientId: string, businessId: string) => {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()

    // Remove from active clients
    const { error: deleteError } = await supabase
        .from('business_clients')
        .delete()
        .eq('business', businessId)
        .eq('client', clientId)
    if (deleteError) return deleteError

    // Add to banned list
    const { data, error } = await supabase
        .from('banned_clients')
        .insert({ business_id: businessId, client_id: clientId })
        .select()
        .single()
    if (error) return error
    return data
}

export const banClient = async (
    email: string | null,
    phone_number: string | null,
    businessId: string
) => {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()

    // The client may only exist through another business's booking, which
    // this business can't see under row-level security — look up with the
    // service role (ownership checked above), then write as the business.
    let query = createAdminClient().from('client_users').select('client_id')
    if (email) query = query.eq('email', email)
    else if (phone_number) query = query.eq('phone_number', phone_number)
    else return "Client not found"

    const { data: matches } = await query.limit(1)
    const clientUser = matches?.[0]
    if (!clientUser) return "Client not found"

    const { data, error } = await supabase
        .from('banned_clients')
        .insert({ business_id: businessId, client_id: clientUser.client_id })
        .select()
        .single()
    if (error) return error
    return data
}

export const unbanClient = async (bannedClientId: string) => {
    const businessId = await requireOwnBusinessId()
    const supabase = await createClient()
    const { error } = await supabase
        .from('banned_clients')
        .delete()
        .eq('id', bannedClientId)
        .eq('business_id', businessId)
    if (error) return error
    return { id: bannedClientId }
}
