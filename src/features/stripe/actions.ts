'use server'

import { stripe } from "@/lib/stripe/stripeClient"
import { createClient } from "@/app/utils/supabase/server"
import { buildTaxAddress, calculateTax } from "@/lib/stripe/calculateTax"

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

    const supabase = await createClient()
    const { data } = await supabase
        .from('business_users')
        .select('payment_method_config_id, account_settings')
        .eq('stripe_acc_id', connectedAccountId)
        .maybeSingle()

    const taxCalc = await calculateTax(
        connectedAccountId,
        price,
        buildTaxAddress((data?.account_settings as any)?.business_address)
    )

    const intent = await stripe.paymentIntents.create({
        amount: taxCalc.amount_total,
        currency: 'usd',
        receipt_email: client_email,
        metadata: {
            appointment_id: appointmentID,
            purpose,
            type: appointmentType ?? '',
            tax_calculation: taxCalc.id,
        },
        payment_method_configuration: data?.payment_method_config_id ?? undefined,
        application_fee_amount: Math.round(0.03 * taxCalc.amount_total),
    }, { stripeAccount: connectedAccountId })

    if (purpose === 'EOA') {
        await supabase.from('appointments').update({ service_charge_id: intent.id }).eq('id', appointmentID)
    } else {
        await supabase.from('appointments').update({ deposit_charge_id: intent.id }).eq('id', appointmentID)
    }

    return { clientSecret: intent.client_secret, id: intent.id, amountDue: intent.amount }
}

export const createAccountLinkAction = async (accountId: string) => {
    const base = process.env.NEXT_PUBLIC_BASE_URL

    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${base}/onboarding/${accountId}`,
        return_url: `${base}/onboarding/${accountId}/return`,
        type: 'account_onboarding',
        collection_options: { fields: 'eventually_due' },
    })

    const supabase = await createClient()
    await supabase
        .from('business_users')
        .update({ current_onboarding_link: accountLink.url })
        .eq('stripe_acc_id', accountId)

    return accountLink.url
}

export const createAccountSessionAction = async (accountId: string) => {
    const accountSession = await stripe.accountSessions.create({
        account: accountId,
        components: {
            account_management: { enabled: true, features: { external_account_collection: true } },
            tax_settings: { enabled: true },
            tax_registrations: { enabled: true },
            payments: {
                enabled: true,
                features: {
                    refund_management: true,
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
