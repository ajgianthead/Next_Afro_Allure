'use server'

import { createAdminClient } from '@/app/utils/supabase/admin'
import { describeSelectedOptions, remainingBalance, type SelectedOptions } from '@/features/services/pricing'
import { canPayBalance } from './balance'

export interface BalanceSummary {
    state: 'payable' | 'paid' | 'invalid'
    businessName: string
    stripeAccountId: string | null
    serviceName: string
    optionsText: string
    start: string
    end: string
    clientName: string
    clientEmail: string
    lines: { label: string; cents: number }[]
    /** What the client pays now (cents). */
    dueNowCents: number
}

/**
 * What the end-of-appointment payment page (payment link / QR code) shows.
 * Public — the appointment id is the only key — so it returns just the
 * summary, never payment ids or other bookings' data.
 */
export async function getBalanceSummary(appointmentId: string): Promise<BalanceSummary | null> {
    const supabase = createAdminClient()
    const { data: appt } = await supabase
        .from('appointments')
        .select('*, business_users(business_name, stripe_acc_id, completed_stripe_onboarding)')
        .eq('id', appointmentId)
        .maybeSingle()
    if (!appt) return null

    const biz = appt.business_users as any
    const options = (appt.selected_options ?? null) as SelectedOptions | null
    const service = (appt.service_data ?? {}) as any
    const cm = (appt.client_metadata ?? {}) as any
    const row = appt as any

    const lines: BalanceSummary['lines'] = []
    lines.push({ label: service.name ?? 'Service', cents: Math.round(Number(options?.priceCents ?? service.price ?? 0)) })
    if (options?.hair?.added && options.hair.price) lines.push({ label: 'Braiding hair', cents: options.hair.price })
    for (const addon of (appt.selected_addons as any[]) ?? []) {
        if (addon?.name) lines.push({ label: addon.name, cents: Math.round(Number(addon.price ?? 0)) })
    }
    if (Number(row.late_fee_cents ?? 0) > 0) lines.push({ label: 'Late fee', cents: Number(row.late_fee_cents) })
    if (Number(row.discount_cents ?? 0) > 0) lines.push({ label: 'Reward', cents: -Number(row.discount_cents) })
    if (appt.paid_deposit && Number(appt.deposit_price ?? 0) > 0) lines.push({ label: 'Deposit paid', cents: -Number(appt.deposit_price) })

    const payable = !!biz?.completed_stripe_onboarding && !!biz?.stripe_acc_id && canPayBalance(appt as any)
    return {
        state: appt.service_paid ? 'paid' : payable ? 'payable' : 'invalid',
        businessName: biz?.business_name ?? '',
        stripeAccountId: payable ? biz.stripe_acc_id : null,
        serviceName: service.name ?? 'Appointment',
        optionsText: describeSelectedOptions(options),
        start: appt.start,
        end: appt.end,
        clientName: `${cm.firstName ?? ''} ${cm.lastName ?? ''}`.trim(),
        clientEmail: cm.email ?? '',
        lines,
        dueNowCents: appt.service_paid ? 0 : remainingBalance(appt as any),
    }
}
