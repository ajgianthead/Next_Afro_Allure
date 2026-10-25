'use server'

import { createClient } from "@/app/utils/supabase/server"
import { isValidTimezone } from "@/lib/timezone"

export async function markTourComplete(businessId: string, tourName: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('business_users')
        .select('tours_completed')
        .eq('business_id', businessId)
        .single()
    const existing = (data?.tours_completed as Record<string, boolean>) ?? {}
    const merged = { ...existing, [tourName]: true }
    await supabase
        .from('business_users')
        .update({ tours_completed: merged })
        .eq('business_id', businessId)
}

export async function isTourComplete(
    toursCompleted: Record<string, boolean> | null | undefined,
    tourName: string
): Promise<boolean> {
    return !!(toursCompleted?.[tourName])
}

/** Stores the business's browser timezone if none is saved yet (used to show correct times in emails). */
export async function ensureTimezoneAction(timezone: string) {
    if (!isValidTimezone(timezone)) return
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: business } = await supabase
        .from('business_users')
        .select('business_id, account_settings')
        .eq('user_id', user.id)
        .single()
    const settings = (business?.account_settings ?? {}) as Record<string, any>
    if (!business || isValidTimezone(settings.timezone)) return
    await supabase
        .from('business_users')
        .update({ account_settings: { ...settings, timezone } })
        .eq('business_id', business.business_id)
}
