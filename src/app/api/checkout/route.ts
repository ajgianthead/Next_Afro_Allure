import { stripe } from "@lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { connectedAccountId } = await request.json();
    try {
        const session = await stripe.checkout.sessions.create(
            {
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Booking Deposit',
                            },
                            unit_amount: 2000,
                        },
                        quantity: 1,
                    },
                ],
                payment_intent_data: {
                    application_fee_amount: 123,
                },
                mode: 'payment',
                ui_mode: 'embedded',
                return_url: 'https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}',
            },
            {
                stripeAccount: connectedAccountId,
            }
        );
        return new NextResponse(JSON.stringify({ clientSecret: session.client_secret }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    } catch (error: any) {
        console.error(
            "An error occurred when calling the Stripe API to create a checkout session",
            error
        );

        return new NextResponse(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
}
