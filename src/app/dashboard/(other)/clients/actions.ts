'use server'

import { createClient } from "@/app/utils/supabase/server"
import { Database } from "../../../../../lib/database.types"

export interface Client {
    business_id: string;
    client_id?: string;
    created_at?: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    updated_at?: string | null;
}

export interface BannedClient {
    business_id: string | null;
    created_at: string;
    email: string | null;
    id: string;
    phone_number: string | null;
}

export const getBusinessClients = async (businessId: string) => {
    const supabase = await createClient<Database>();
    const { data, error } = await supabase.from('client_users').select('*').eq('business_id', businessId)
    if (error) {
        return error
    }
    return data
}

export const getBannedClients = async (businessId: string) => {
    const supabase = await createClient<Database>();
    const { data, error } = await supabase.from('banned_clients').select('*').eq('business_id', businessId)
    if (error) {
        return error
    }
    return data
}

export const addCreateNewClient = async (client: Client) => {
    const supabase = await createClient<Database>()
    // Check if client is on business banned list before adding
    const { data: bannedClient, error: bannedListError } = await supabase
        .from('banned_clients')
        .select("*")
        .eq("business_id", client.business_id) // check within this business
        .or(`email.eq.${client.email},phone_number.eq.${client.phone_number}`);
    if (bannedListError) return bannedListError
    if (bannedClient.length) return "Client is banned from this business"
    // Check if client already exists with business via email and/or phone number
    const { data: clientRes, error: errorClientRes } = await supabase
        .from('client_users')
        .select("*")
        .eq("business_id", client.business_id) // check within this business
        .or(`email.eq.${client.email},phone_number.eq.${client.phone_number}`);
    if (clientRes?.length) {
        return "Client already exists for this business"
    }
    const { data, error } = await supabase.from('client_users').insert({
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        business_id: client.business_id,
        phone_number: client.phone_number
    }).select().single()
    if (error) {
        return error
    }
    return data
}

export const updateClientInfo = async (client: Client) => {
    const supabase = await createClient<Database>()
    // Check if client already exists with business via email and/or phone number
    const { data: clientRes, error: errorClientRes } = await supabase
        .from('client_users')
        .select("*")
        .eq("business_id", client.business_id).neq("client_id", client.client_id!) // check within this business
        .or(`email.eq.${client.email},phone_number.eq.${client.phone_number}`).single();
    if (clientRes) {
        return "Client already exists for this business"
    }
    const { data, error } = await supabase.from('client_users').update({
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        business_id: client.business_id,
        phone_number: client.phone_number
    }).eq('client_id', client.client_id!).select().single()

    if (error) {
        return error
    }
    return data
}

export const deleteClient = async (clientId: string) => {
    const supabase = await createClient<Database>()
    // Check if client already exists with business via email and/or phone number
    const { data, error } = await supabase.from('client_users').delete().eq('client_id', clientId).select('business_id').single()
    if (error) {
        return error
    }
    return data
}

export const banClientFromList = async (clientId: string) => {
    const supabase = await createClient<Database>()


    const { data, error } = await supabase.from('client_users').delete().eq('client_id', clientId).select().single()
    if (error) return error
    const { data: bannedClient, error: bannedClientError } = await supabase.from('banned_clients').insert({
        id: data?.client_id,
        email: data?.email,
        phone_number: data?.phone_number,
        business_id: data.business_id
    }).select().single()
    if (bannedClientError) return bannedClientError

    return bannedClient
}

export const banClient = async (bannedClient: BannedClient) => {
    const supabase = await createClient<Database>()
    const { data, error } = await supabase.from('banned_clients').insert({
        email: bannedClient.email,
        phone_number: bannedClient.phone_number
    }).select().single()
    if (error) return error

    return data
}

export const unbanClient = async (bannedClient: BannedClient) => {
    const supabase = await createClient<Database>()
    // Delete from ban list, add to client list
    const { data, error } = await supabase.from('banned_clients').delete().eq('id', bannedClient.id).select().single()
    if (error) return error
    return data
}

