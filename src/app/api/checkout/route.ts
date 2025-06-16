import { stripe } from "@lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { connectedAccountId, price, app_fee, appointmentID } = await request.json();
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true
            },
            metadata: {
                appointment_id: appointmentID
            },
            application_fee_amount: app_fee,
        }, {
            stripeAccount: connectedAccountId
        });
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
