import { createStripeAccount } from "@/lib/stripe/createStripeAccount";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const account = await createStripeAccount()
        return new NextResponse(JSON.stringify({ account: account.id }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    } catch (error: any) {
        console.error('An error occurred when calling the Stripe API to create an account:', error);
        return new NextResponse(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
}
