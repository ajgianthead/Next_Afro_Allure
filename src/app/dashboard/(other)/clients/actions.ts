'use server'

import { createClient } from "@/app/utils/supabase/server"

export interface Client {
    client_id?: string
    created_at?: string
    email: string
    first_name: string
    last_name: string
    phone_number: string
    updated_at?: string | null
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
    const supabase = await createClient()

    // Look up existing client_users by email or phone
    const { data: existingUser } = await supabase
        .from('client_users')
        .select('client_id')
        .or(`email.eq.${client.email},phone_number.eq.${client.phone_number}`)
        .maybeSingle()

    if (existingUser) {
        // Check if banned from this business
        const { data: bannedEntry } = await supabase
            .from('banned_clients')
            .select('id')
            .eq('business_id', businessId)
            .eq('client_id', existingUser.client_id)
            .maybeSingle()
        if (bannedEntry) return "Client is banned from this business"

        // Check if already linked to this business
        const { data: alreadyLinked } = await supabase
            .from('business_clients')
            .select('id')
            .eq('business', businessId)
            .eq('client', existingUser.client_id)
            .maybeSingle()
        if (alreadyLinked) return "Client already exists for this business"

        // Link to business
        const { error: linkError } = await supabase
            .from('business_clients')
            .insert({ business: businessId, client: existingUser.client_id, banned: false })
        if (linkError) return linkError

        const { data: full, error: fetchError } = await supabase
            .from('client_users')
            .select('*')
            .eq('client_id', existingUser.client_id)
            .single()
        if (fetchError) return fetchError
        return full
    } else {
        // Create new client_users record
        const { data: newUser, error: insertError } = await supabase
            .from('client_users')
            .insert({
                first_name: client.first_name,
                last_name: client.last_name,
                email: client.email,
                phone_number: client.phone_number,
            })
            .select()
            .single()
        if (insertError) return insertError

        // Link to business
        const { error: linkError } = await supabase
            .from('business_clients')
            .insert({ business: businessId, client: newUser.client_id, banned: false })
        if (linkError) return linkError

        return newUser
    }
}

export const updateClientInfo = async (
    client: { client_id: string; first_name: string; last_name: string; email: string; phone_number: string },
    businessId: string
) => {
    const supabase = await createClient()

    // Check if another client_users record has the same email/phone
    const { data: conflict } = await supabase
        .from('client_users')
        .select('client_id')
        .or(`email.eq.${client.email},phone_number.eq.${client.phone_number}`)
        .neq('client_id', client.client_id)
        .maybeSingle()

    if (conflict) {
        // Only a conflict if that other client is also in this business
        const { data: linked } = await supabase
            .from('business_clients')
            .select('id')
            .eq('business', businessId)
            .eq('client', conflict.client_id)
            .maybeSingle()
        if (linked) return "Client already exists for this business"
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
    const supabase = await createClient()

    let query = supabase.from('client_users').select('client_id')
    if (email) query = (query as any).eq('email', email)
    else if (phone_number) query = (query as any).eq('phone_number', phone_number)

    const { data: clientUser } = await (query as any).maybeSingle()
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
    const supabase = await createClient()
    const { error } = await supabase
        .from('banned_clients')
        .delete()
        .eq('id', bannedClientId)
    if (error) return error
    return { id: bannedClientId }
}
