'use server'

import { createClient } from '@/app/utils/supabase/server'

export async function completeOnboarding(
    businessId: string,
    specialty: string,
    city: string,
    serviceName: string,
    servicePrice: number,
    serviceDuration: number
): Promise<{ error: string } | { success: true }> {
    const supabase = await createClient()

    // Find the first service for this business, then update it
    const { data: firstService } = await supabase
        .from('services')
        .select('id')
        .eq('business', businessId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

    if (firstService) {
        const { error: serviceError } = await supabase
            .from('services')
            .update({
                name: serviceName,
                price: Math.round(servicePrice * 100),
                length: serviceDuration,
            })
            .eq('id', firstService.id)

        if (serviceError) {
            return { error: 'Could not save your service. Please try again.' }
        }
    }

    // Merge specialty + city into account_settings and mark onboarding complete
    const { data: existing } = await supabase
        .from('business_users')
        .select('account_settings')
        .eq('business_id', businessId)
        .single()

    const currentSettings = (existing?.account_settings as Record<string, any>) ?? {}
    const updatedSettings = {
        ...currentSettings,
        specialty,
        business_address: {
            ...currentSettings.business_address,
            city,
        },
    }

    const { error: profileError } = await supabase
        .from('business_users')
        .update({
            account_settings: updatedSettings,
            is_onboarded: true,
        })
        .eq('business_id', businessId)

    if (profileError) {
        return { error: 'Could not save your profile. Please try again.' }
    }

    return { success: true }
}
