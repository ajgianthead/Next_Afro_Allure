'use server'

import { createClient } from "@/app/utils/supabase/server"

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
