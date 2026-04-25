'use server'

import { createClient } from "@/app/utils/supabase/server"
import { Database } from "@/lib/database.types"


export const checkAvailabilityToServices = async (availabilityId: string) => {
    const supabase = await createClient<Database>();
    const { data, error } = await supabase.from('services').select().eq('availability', availabilityId)

    if (error) {
        return error
    }
    if (data?.length) {
        return { attachedServices: true }
    }
    return { attachedServices: false }
}

export const getAvailabilitiesAction = async (businessId: string) => {
    const supabase = await createClient<Database>()
    const { data, error } = await supabase
        .from('availabilities')
        .select('business_users(default_availability), *')
        .eq('business_id', businessId)
    if (error) throw new Error(error.message)
    return {
        availabilities: data,
        defaultAvailability: data[0]?.business_users?.default_availability ?? null,
    }
}

export const createAvailabilityAction = async (businessId: string, availabilityData: any) => {
    const supabase = await createClient<Database>()
    const { data, error } = await supabase
        .from('availabilities')
        .insert([{ availability_data: availabilityData, business_id: businessId, id: availabilityData.id }])
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

export const updateAvailabilityAction = async (
    businessId: string,
    availability: any,
    id: string,
    defaultAvailability: string
) => {
    const supabase = await createClient<Database>()
    const { data: old, error: fetchError } = await supabase
        .from('availabilities')
        .select('id, business_users(default_availability)')
        .eq('id', id)
    if (fetchError) throw new Error(fetchError.message)
    if (!old?.length) throw new Error('Availability not found')

    const { data, error } = await supabase
        .from('availabilities')
        .update({ availability_data: availability })
        .eq('id', id)
        .select('*')
        .single()
    if (error) throw new Error(error.message)

    if (defaultAvailability !== old[0].business_users?.default_availability) {
        await supabase
            .from('business_users')
            .update({ default_availability: defaultAvailability })
            .eq('business_id', businessId)
    }

    return data
}

export const deleteAvailabilityAction = async (businessId: string, availabilityId: string) => {
    const supabase = await createClient<Database>()

    const { data: attached, error: serviceError } = await supabase
        .from('services')
        .select('id')
        .eq('availability', availabilityId)
    if (serviceError) throw new Error(serviceError.message)
    if (attached?.length) throw new Error('Cannot delete availability with attached services')

    const { data, error } = await supabase
        .from('availabilities')
        .delete()
        .eq('id', availabilityId)
        .eq('business_id', businessId)
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}
