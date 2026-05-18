import { createClient } from '@/app/utils/supabase/server'

interface Business {
    business_id: string
    early_access?: boolean
}

export async function canAccessFeature(featureName: string, business: Business): Promise<boolean> {
    if (business.early_access) return true

    const supabase = await createClient()
    const { data } = await supabase
        .from('feature_flags')
        .select('enabled, early_access_only')
        .eq('name', featureName)
        .single()

    if (!data) return false
    if (!data.enabled) return false
    if (data.early_access_only) return business.early_access ?? false
    return true
}

export function useFeatureFlag(featureName: string, earlyAccess: boolean): boolean {
    return earlyAccess
}
