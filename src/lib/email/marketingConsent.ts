import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../../lib/database.types'

// Call before sending any marketing/promotional email. Transactional emails
// (booking confirmations, receipts, password resets, billing notices) do not
// need this check — only send-based-on-opt-in marketing campaigns do.
export async function canSendMarketingEmail(
    supabase: SupabaseClient<Database, any>,
    businessId: string
): Promise<{ canSend: boolean; unsubscribeToken: string | null }> {
    const { data } = await supabase
        .from('business_users')
        .select('marketing_opt_in, unsubscribe_token')
        .eq('business_id', businessId)
        .maybeSingle()

    if (!data || data.marketing_opt_in === false) {
        return { canSend: false, unsubscribeToken: null }
    }
    return { canSend: true, unsubscribeToken: data.unsubscribe_token ?? null }
}
