import type { SupabaseClient } from '@supabase/supabase-js'
import { effectivePlanType, type PlanType } from './beta'

/** The plan a business is billed on right now, for fee calculation and feature gates. */
export async function getEffectivePlanType(
    supabase: SupabaseClient<any, any, any>,
    businessId: string
): Promise<PlanType> {
    const { data } = await supabase
        .from('business_users')
        .select('plan_type')
        .eq('business_id', businessId)
        .maybeSingle()
    return effectivePlanType(data?.plan_type as PlanType | null | undefined)
}
