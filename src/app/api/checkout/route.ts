import { stripe } from "../../../lib/utils";
import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../lib/database.types";

export async function POST(request: NextRequest) {
    const { connectedAccountId, price, app_fee, appointmentID, purpose, paymentIntent, client_email, appointmentType } = await request.json();
    if (paymentIntent && paymentIntent.length > 0) {
        const intent = await stripe.paymentIntents.retrieve(paymentIntent, {
            stripeAccount: connectedAccountId
        })
        return new NextResponse(JSON.stringify({ clientSecret: intent.client_secret, id: intent.id }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    try {
        const supabase = createClient<Database>()
        const account = await stripe.accounts.retrieve(connectedAccountId);
        const taxCalc = await stripe.tax.calculations.create({
            currency: 'usd',
            line_items: [
                {
                    amount: price,
                    reference: "Appointment Payment"
                }
            ],
            customer_details: {
                address: {
                    line1: ' 2800 Post Oak Blvd',
                    state: 'TX',
                    city: 'Houston',
                    country: 'US',
                    postal_code: '77056'
                },
                address_source: 'billing'
            }
        }, { stripeAccount: connectedAccountId })

        const { data, error } = await supabase.from('business_users').select('payment_method_config_id').eq('stripe_acc_id', connectedAccountId).maybeSingle()
        const paymentIntent = await stripe.paymentIntents.create({
            amount: taxCalc.amount_total,
            currency: 'usd',
            receipt_email: client_email,
            metadata: {
                appointment_id: appointmentID,
                purpose: purpose,
                type: appointmentType,
                tax_calculation: taxCalc.id
            },
            payment_method_configuration: data?.payment_method_config_id,
            application_fee_amount: Math.round(0.03 * taxCalc.amount_total),
        }, {
            stripeAccount: connectedAccountId,
        });
        if (purpose === 'EOA') {
            await supabase.from('appointments').update({
                service_charge_id: paymentIntent.id
            }).eq('id', appointmentID)
        } else {
            await supabase.from('appointments').update({
                deposit_charge_id: paymentIntent.id
            }).eq('id', appointmentID)
        }

        return new NextResponse(JSON.stringify({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id, amountDue: paymentIntent.amount }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    } catch (error: any) {

        console.log(error);

        return new NextResponse(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
}
