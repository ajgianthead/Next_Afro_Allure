import { stripe } from "@lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { account } = await request.json();
    try {
        const accountLink = await stripe.accountLinks.create({
            account: account,
            refresh_url: `http://localhost:3000/onboarding/${account}`,
            return_url: `http://localhost:3000/dashboard`,
            type: 'account_onboarding',
            collection_options: {
                fields: "eventually_due"
            }
        })
        return new NextResponse(JSON.stringify({ link: accountLink.url }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    } catch (error: any) {
        console.error(
            "An error occurred when calling the Stripe API to create an account session",
            error
        );

        return new NextResponse(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
}
