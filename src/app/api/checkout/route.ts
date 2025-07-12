import { stripe } from "@lib/utils";
import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../lib/database.types";

export async function POST(request: NextRequest) {
    const { connectedAccountId, price, app_fee, appointmentID, purpose, paymentIntent, client_email, } = await request.json();
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
        const taxCalc = await stripe.tax.calculations.create({
            currency: 'usd',
            line_items: [
                {
                    amount: price,
                    reference: "Appointment Payment"
                }
            ]
        }, { stripeAccount: connectedAccountId })

        const paymentIntent = await stripe.paymentIntents.create({
            amount: taxCalc.amount_total,
            currency: 'usd',
            receipt_email: client_email,
            automatic_payment_methods: {
                enabled: true
            },
            metadata: {
                appointment_id: appointmentID,
                purpose: purpose,
                tax_calculation: taxCalc.id
            },
            application_fee_amount: app_fee,
        }, {
            stripeAccount: connectedAccountId
        });
        await supabase.from('appointments').update({
            service_charge_id: paymentIntent.id
        }).eq('id', appointmentID)
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
