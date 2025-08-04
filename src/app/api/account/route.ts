import { stripe } from "../../../lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const account = await stripe.accounts.create({
            controller: {
                stripe_dashboard: {
                    type: "express",
                },
                fees: {
                    payer: "application"
                },
                losses: {
                    payments: "application"
                },
            },
        })
        return new NextResponse(JSON.stringify({ account: account.id }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    } catch (error: any) {
        console.error('An error occurred when calling the Stripe API to create an account:', error);
        new NextResponse(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
}
