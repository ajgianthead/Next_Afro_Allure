'use server'

import { createClient } from "@/app/utils/supabase/server"
import { AddressErrors, BusinessAddress, normalizeBusinessAddress, validateBusinessAddress } from "@/lib/businessAddress"
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

export type CompleteWelcomeResult = { ok: true } | { ok: false; error: string; fieldErrors?: AddressErrors }

/**
 * Finishes the first-run welcome modal: saves the business address (or the
 * "no fixed location" choice) and the business's timezone, then marks the
 * welcome as seen so the dashboard tour can start.
 */
export async function completeWelcomeAction(address: BusinessAddress, timezone: string): Promise<CompleteWelcomeResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'You are signed out. Please sign in again.' }

    const fieldErrors = validateBusinessAddress(address, { required: true })
    if (Object.keys(fieldErrors).length > 0) {
        return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors }
    }

    const { data: business } = await supabase
        .from('business_users')
        .select('business_id, account_settings, tours_completed')
        .eq('user_id', user.id)
        .single()
    if (!business) return { ok: false, error: 'Business not found.' }

    const settings = (business.account_settings ?? {}) as Record<string, any>
    const { error } = await supabase
        .from('business_users')
        .update({
            account_settings: {
                ...settings,
                business_address: normalizeBusinessAddress(address),
                ...(isValidTimezone(timezone) ? { timezone } : {}),
            } as any,
            tours_completed: { ...((business.tours_completed as Record<string, boolean>) ?? {}), welcome: true },
        })
        .eq('business_id', business.business_id)
    if (error) return { ok: false, error: 'Could not save your address. Please try again.' }
    return { ok: true }
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
