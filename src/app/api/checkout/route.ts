import { stripe } from "@lib/utils";
import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../lib/database.types";

export async function POST(request: NextRequest) {
    const { connectedAccountId, price, app_fee, appointmentID, paymentIntent } = await request.json();
    console.log(paymentIntent);

    if (paymentIntent && paymentIntent.length > 0) {
        const intent = await stripe.paymentIntents.retrieve(paymentIntent)
        return new NextResponse(JSON.stringify({ clientSecret: intent.client_secret, id: intent.id }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    try {
        const supabase = createClient<Database>()
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true
            },
            metadata: {
                appointment_id: appointmentID,
            },
            application_fee_amount: app_fee,
        }, {
            stripeAccount: connectedAccountId
        });
        if (appointmentID.length) {
            await supabase.from('appointments').update({
                deposit_charge_id: paymentIntent.id
            }).eq('id', appointmentID)
        }
        return new NextResponse(JSON.stringify({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    } catch (error: any) {
        return new NextResponse(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
}
