'use server'

import { DateTime } from 'luxon'
import { stripe } from '@/lib/stripe/stripeClient'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { requireOwnBusinessId } from '@/lib/auth/requireBusinessOwner'
import { toE164 } from '@/lib/sms/phone'
import { SMS_MONTHLY_TEXTS, type BillingInterval } from '../plans'
import { growthItemOf, intervalOf, liveSubscription, smsAddonAvailable, smsItemOf, smsPriceId, syncSmsEnabled } from './sms'

export type SmsAddonStatus = {
    /** Whether the business can add it now. When false, `reason` says why. */
    canAdd: boolean
    reason: 'unavailable' | 'not_growth' | 'trialing' | 'no_subscription' | null
    enabled: boolean
    interval: BillingInterval
    sentThisMonth: number
    limit: number
    smsPhone: string | null
    smsBusinessTexts: boolean
}

type Result = { ok: true } | { ok: false; error: string }

async function ownBusiness() {
    const businessId = await requireOwnBusinessId()
    const { data: biz } = await createAdminClient()
        .from('business_users')
        .select('business_id, plan_type, stripe_customer_id, sms_enabled, sms_phone, sms_business_texts')
        .eq('business_id', businessId)
        .single()
    if (!biz) throw new Error('Business not found')
    return biz
}

export async function getSmsAddonStatus(): Promise<SmsAddonStatus> {
    const biz = await ownBusiness()
    const month = DateTime.utc().startOf('month').toISODate()!
    const { data: usage } = await createAdminClient()
        .from('sms_usage')
        .select('sent')
        .eq('business_id', biz.business_id)
        .eq('month', month)
        .maybeSingle()

    const sub = biz.stripe_customer_id ? await liveSubscription(biz.stripe_customer_id) : undefined
    const growth = sub ? growthItemOf(sub) : undefined
    let reason: SmsAddonStatus['reason'] = null
    if (!smsAddonAvailable()) reason = 'unavailable'
    else if (biz.plan_type !== 'GROWTH') reason = 'not_growth'
    else if (!sub || !growth) reason = 'no_subscription'
    else if (sub.status === 'trialing') reason = 'trialing'

    return {
        canAdd: reason === null,
        reason,
        enabled: !!biz.sms_enabled,
        interval: growth ? intervalOf(growth) : 'month',
        sentThisMonth: usage?.sent ?? 0,
        limit: SMS_MONTHLY_TEXTS,
        smsPhone: biz.sms_phone ?? null,
        smsBusinessTexts: biz.sms_business_texts !== false,
    }
}

/**
 * Adds SMS to the business's active Growth subscription and charges the
 * prorated amount now. Not during the free trial: every text costs real
 * money, so texts start once Growth is paid for.
 */
export async function addSmsAddon(): Promise<Result> {
    const biz = await ownBusiness()
    if (!smsAddonAvailable()) return { ok: false, error: 'SMS Reminders are coming soon.' }
    if (biz.plan_type !== 'GROWTH' || !biz.stripe_customer_id) return { ok: false, error: 'SMS Reminders are part of the Growth plan.' }
    const sub = await liveSubscription(biz.stripe_customer_id)
    const growth = sub ? growthItemOf(sub) : undefined
    if (!sub || !growth) return { ok: false, error: 'Subscribe to Growth to add SMS Reminders.' }
    if (sub.status === 'trialing') return { ok: false, error: 'SMS Reminders can be added once your free trial ends.' }
    if (smsItemOf(sub)) return { ok: true }

    try {
        await stripe.subscriptions.update(sub.id, {
            items: [{ price: smsPriceId(intervalOf(growth)) }],
            proration_behavior: 'always_invoice',
            payment_behavior: 'error_if_incomplete',
        })
    } catch (err: any) {
        return { ok: false, error: err?.message ?? 'Could not add SMS Reminders. Check your payment method and try again.' }
    }
    // The webhook does this too; doing it now means texts start right away.
    await syncSmsEnabled(biz.stripe_customer_id)
    return { ok: true }
}

/** Removes SMS straight away. No refund for the rest of the period: those texts may already be sent. */
export async function removeSmsAddon(): Promise<Result> {
    const biz = await ownBusiness()
    if (!biz.stripe_customer_id) return { ok: true }
    const sub = await liveSubscription(biz.stripe_customer_id)
    const item = sub ? smsItemOf(sub) : undefined
    if (item) {
        try {
            await stripe.subscriptionItems.del(item.id, { proration_behavior: 'none' })
        } catch (err: any) {
            return { ok: false, error: err?.message ?? 'Could not remove SMS Reminders.' }
        }
    }
    await syncSmsEnabled(biz.stripe_customer_id)
    return { ok: true }
}

/** The business's own number for booking texts, and whether to text the business at all. */
export async function updateSmsSettings(input: { smsPhone: string; smsBusinessTexts: boolean }): Promise<Result> {
    const biz = await ownBusiness()
    const trimmed = input.smsPhone.trim()
    const phone = trimmed ? toE164(trimmed) : null
    if (trimmed && !phone) return { ok: false, error: 'Enter a US mobile number, like (404) 555-0123.' }
    const { error } = await createAdminClient()
        .from('business_users')
        .update({ sms_phone: phone, sms_business_texts: input.smsBusinessTexts === true })
        .eq('business_id', biz.business_id)
    if (error) return { ok: false, error: 'Could not save. Please try again.' }
    return { ok: true }
}
