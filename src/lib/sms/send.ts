// The one way the app sends a text. Runs in the app and inside Trigger.dev
// tasks (relative imports only). Never throws: a text is always extra to the
// email that goes out anyway, so a failure here must not break anything.
//
// A text is sent only when all of these hold:
//   - Twilio is configured
//   - the business is on Growth with the SMS add-on (sms_enabled)
//   - client texts: the client ticked the consent box when booking
//     business texts: the business set its number and left texts on
//   - the number is a valid +1 number that hasn't replied STOP
//   - the business is under its monthly limit (claimed atomically)

import type { SupabaseClient } from '@supabase/supabase-js'
import { SMS_MONTHLY_TEXTS } from '../../features/billing/plans'
import { toE164 } from './phone'
import { TWILIO_UNSUBSCRIBED, twilioConfigured, twilioSend } from './twilio'

export type SmsAudience = 'client' | 'business'
export type SmsResult = 'sent' | 'skipped' | 'failed'

export interface SendSmsOptions {
    businessId: string
    audience: SmsAudience
    body: string
    /** Client texts: the client's number and their consent from booking. Ignored for business texts. */
    to?: string | null
    clientConsent?: boolean
}

/** Whether a client agreed to texts, read from appointments.client_metadata. */
export function clientConsentedToSms(clientMetadata: unknown): boolean {
    return (clientMetadata as any)?.smsConsent === true
}

export async function sendSms(supabase: SupabaseClient<any, any, any>, opts: SendSmsOptions): Promise<SmsResult> {
    try {
        if (!twilioConfigured()) return 'skipped'

        const { data: business } = await supabase
            .from('business_users')
            .select('plan_type, sms_enabled, sms_phone, sms_business_texts')
            .eq('business_id', opts.businessId)
            .maybeSingle()
        if (!business || business.plan_type !== 'GROWTH' || business.sms_enabled !== true) return 'skipped'

        let to: string | null
        if (opts.audience === 'business') {
            if (business.sms_business_texts === false) return 'skipped'
            to = toE164(business.sms_phone)
        } else {
            if (opts.clientConsent !== true) return 'skipped'
            to = toE164(opts.to)
        }
        if (!to) return 'skipped'

        const { data: optedOut } = await supabase.from('sms_opt_outs').select('phone').eq('phone', to).maybeSingle()
        if (optedOut) return 'skipped'

        const { data: claimed, error: claimError } = await supabase.rpc('claim_sms_slot', {
            p_business: opts.businessId,
            p_limit: SMS_MONTHLY_TEXTS,
        })
        if (claimError) {
            console.error('claim_sms_slot failed:', claimError.message)
            return 'failed'
        }
        if (claimed !== true) return 'skipped' // monthly limit reached; the email still went out

        const result = await twilioSend(to, opts.body)
        if (result.ok) return 'sent'

        await supabase.rpc('release_sms_slot', { p_business: opts.businessId })
        if (result.code === TWILIO_UNSUBSCRIBED) {
            await supabase.from('sms_opt_outs').upsert({ phone: to }, { onConflict: 'phone' })
        } else {
            console.error(`SMS to ${opts.audience} failed:`, result.code, result.message)
        }
        return 'failed'
    } catch (err) {
        console.error('sendSms error:', err)
        return 'failed'
    }
}
