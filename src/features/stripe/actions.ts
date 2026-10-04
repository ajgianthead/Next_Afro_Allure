'use server'

import { stripe } from "@/lib/stripe/stripeClient"
import { createAdminClient } from '@/app/utils/supabase/admin'
import { calculatePlatformFee } from "@/lib/fees"
import { requireOwnStripeAccount } from "@/lib/auth/requireOwnStripeAccount"

export const createCheckoutAction = async (params: {
    connectedAccountId: string
    price: number
    appointmentID: string
    purpose: string
    client_email: string
    paymentIntent?: string
    appointmentType?: string
}) => {
    const { connectedAccountId, price, appointmentID, purpose, client_email, paymentIntent, appointmentType } = params

    if (paymentIntent && paymentIntent.length > 0) {
        const intent = await stripe.paymentIntents.retrieve(paymentIntent, {
            stripeAccount: connectedAccountId,
        })
        return { clientSecret: intent.client_secret, id: intent.id }
    }

    const supabase = createAdminClient()
    const { data } = await supabase
        .from('business_users')
        .select('payment_method_config_id, account_settings, completed_stripe_onboarding')
        .eq('stripe_acc_id', connectedAccountId)
        .maybeSingle()

    // Without this, a business can publish and accept bookings before Stripe
    // Connect is actually finished, and the client only finds out when the
    // PaymentIntent create call below fails with an opaque Stripe error.
    if (!data?.completed_stripe_onboarding) {
        throw new Error('This business hasn\'t finished setting up payments yet. Please check back soon or contact them directly.')
    }

    const intent = await stripe.paymentIntents.create({
        amount: price,
        currency: 'usd',
        receipt_email: client_email,
        metadata: {
            appointment_id: appointmentID,
            purpose,
            type: appointmentType ?? '',
        },
        payment_method_configuration: data?.payment_method_config_id ?? undefined,
        application_fee_amount: calculatePlatformFee(price),
    }, { stripeAccount: connectedAccountId })

    if (purpose === 'EOA') {
        await supabase.from('appointments').update({ service_charge_id: intent.id }).eq('id', appointmentID)
    } else {
        await supabase.from('appointments').update({ deposit_charge_id: intent.id }).eq('id', appointmentID)
    }

    return { clientSecret: intent.client_secret, id: intent.id, amountDue: intent.amount }
}

export const createAccountLinkAction = async (accountId: string) => {
    await requireOwnStripeAccount(accountId)
    const base = process.env.NEXT_PUBLIC_BASE_URL

    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${base}/onboarding/${accountId}`,
        return_url: `${base}/onboarding/${accountId}/return`,
        type: 'account_onboarding',
        collection_options: { fields: 'eventually_due' },
    })

    const supabase = createAdminClient()
    await supabase
        .from('business_users')
        .update({ current_onboarding_link: accountLink.url })
        .eq('stripe_acc_id', accountId)

    return accountLink.url
}

export const createAccountSessionAction = async (accountId: string) => {
    await requireOwnStripeAccount(accountId)
    const accountSession = await stripe.accountSessions.create({
        account: accountId,
        components: {
            account_management: { enabled: true, features: { external_account_collection: true } },
            payments: {
                enabled: true,
                features: {
                    // Refunds are only issued from the appointment detail
                    // modal (src/features/refunds) so they stay tied to the
                    // appointment record, client email and refund history.
                    refund_management: false,
                    dispute_management: true,
                    capture_payments: true,
                    destination_on_behalf_of_charge_management: false,
                },
            },
            balances: {
                enabled: true,
                features: { instant_payouts: true, standard_payouts: true, edit_payout_schedule: true },
            },
            payouts_list: { enabled: true },
            reporting_chart: { enabled: true },
        } as any,
    }, { apiVersion: '2023-10-16; embedded_connect_beta=v2;' })

    return accountSession.client_secret
}
