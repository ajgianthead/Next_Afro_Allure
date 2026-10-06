'use server'
import { requireBusinessOwner } from "@/lib/auth/requireBusinessOwner"

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/app/utils/supabase/server";
import { Database, Enums } from "../../../../../lib/database.types";
import { Service } from "@/lib/service/Service";
import { ServiceData } from "@/features/services/types";
import { remainingBalance } from "@/features/services/pricing";
import { notifyLoyaltyForAppointment } from "@/features/loyalty/server/notify";





//TODO: Fix this to update when a user changes status from PAID WITH CASH to something else
// `amount_due` is accepted for compatibility but the balance is read from the
// database — the dashboard's copy can be stale (e.g. after a reward was applied).
export const markAppointmentAs = async (businessId: string, status: Enums<'status'>, _amount_due: number, id: string) => {
    await requireBusinessOwner(businessId)
    const supabase = await createClient()

    const { data: current, error: fetchError } = await supabase
        .from('appointments')
        .select('paid_amount, amount_due, deposit_price, paid_deposit, substraction, service_paid')
        .eq('id', id)
        .eq('business', businessId)
        .single()
    if (fetchError) throw new Error(fetchError.message)
    // What's actually left to collect (the deposit isn't owed twice).
    const balance = current.service_paid ? 0 : remainingBalance(current)

    if (status === 'COMPLETED' && balance > 0) {
        const { data, error } = await supabase
            .from('appointments')
            .update({
                status,
                service_paid: true,
                service_paid_type: 'CASH',
                amount_due: 0,
                paid_amount: (current?.paid_amount ?? 0) + balance,
            })
            .eq('id', id)
            .eq('business', businessId)
            .select('id, status, amount_due, paid_amount')
            .single()
        if (error) throw new Error(error.message)
        await notifyLoyaltyForAppointment(id)
        return data
    }

    const { data, error } = await supabase
        .from('appointments')
        .update({
            status,
            service_paid: status === 'COMPLETED' || !!current.service_paid,
            ...(status === 'COMPLETED' && !current.service_paid ? { service_paid_type: 'CASH' as const } : {}),
            amount_due: status === 'COMPLETED' ? 0 : current.amount_due,
        })
        .eq('id', id)
        .eq('business', businessId)
        .select('id, status, amount_due, paid_amount')
        .single()
    if (error) throw new Error(error.message)
    if (status === 'COMPLETED') await notifyLoyaltyForAppointment(id)
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
    // Full appointment records (client contact + payment info) — owner only.
    // This used to be callable by anyone with a business id.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    const { data: owned } = await supabase
        .from('business_users')
        .select('business_id')
        .eq('business_id', businessId)
        .eq('user_id', user.id)
        .maybeSingle()
    if (!owned) throw new Error('Unauthorized')
    let query = supabase.from('appointments').select('*').eq('business', businessId)
    if (status) {
        query = query.eq('status', status).order('start', { ascending: true }).limit(5) as any
    }
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
}

