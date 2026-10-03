import { createAdminClient } from '@/app/utils/supabase/admin'
import { resolveTimezone } from './timezone'

/** Server-only: looks up the business's saved timezone (falls back to the default). */
export async function getBusinessTimezone(businessId: string): Promise<string> {
    try {
        const supabase = createAdminClient()
        const { data } = await supabase
            .from('business_users')
            .select('account_settings')
            .eq('business_id', businessId)
            .maybeSingle()
        return resolveTimezone((data?.account_settings as any)?.timezone)
    } catch {
        return resolveTimezone(null)
    }
}
