'use server'

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/app/utils/supabase/server";
import { Database, Enums } from "../../../../../lib/database.types";
import { Service } from "@/lib/service/Service";
import { ServiceData } from "@/features/services/types";





//TODO: Fix this to update when a user changes status from PAID WITH CASH to something else
export const markAppointmentAs = async (status: Enums<'status'>, amount_due: number, id: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('appointments').update({
        status: status,
        service_paid_type: status === 'COMPLETED' ? 'CASH' : null,
        amount_due: status === 'COMPLETED' ? 0 : amount_due
    }).eq('id', id).select("id, status, amount_due").single()
    return data
}

export const assignAddons = async (supabase: SupabaseClient, services: ServiceData[]) => {
    const uniqueAddonIds = [...new Set(services?.flatMap(service => service.addons))]
    const { data: addons, error } = await supabase.from('service_addons').select("*").in('id', uniqueAddonIds)
    const addonsById = Object.fromEntries((addons ?? []).map(addon => [addon.id, addon]))
    const servicesWithAddons = services?.map(service => ({
        ...service,
        addons: service.addons!.map((id: any) => addonsById[id]).filter(Boolean)
    }));
    return servicesWithAddons
}


export const getBusinessAppointmentsAction = async (businessId: string, status?: Database['public']['Enums']['status']) => {
    const supabase = await createClient()
    let query = supabase.from('appointments').select('*').eq('business', businessId)
    if (status) {
        query = query.eq('status', status).order('start', { ascending: true }).limit(5) as any
    }
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
}

