import { createClient } from '@/app/utils/supabase/server'

interface Business {
    business_id: string
    early_access?: boolean
}

export async function canAccessFeature(featureName: string, business: Business): Promise<boolean> {
    if (business.early_access) return true

    const supabase = await createClient()
    // The table has feature_name / is_public; this used to query name /
    // enabled, which don't exist, so every flag read as off.
    const { data } = await supabase
        .from('feature_flags')
        .select('is_public, early_access_only')
        .eq('feature_name', featureName)
        .maybeSingle()

    if (!data) return false
    if (data.is_public) return true
    if (data.early_access_only) return business.early_access ?? false
    return false
}

export function useFeatureFlag(featureName: string, earlyAccess: boolean): boolean {
    return earlyAccess
}
