import { stripe } from "../../../lib/utils";
import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../lib/database.types";

export async function POST(request: NextRequest) {
    const { account } = await request.json();
    try {
        const accountLink = await stripe.accountLinks.create({
            account: account,
            refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/${account}`,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/${account}/return`,
            type: 'account_onboarding',
            collection_options: {
                fields: "eventually_due"
            }
        })
        // Saving onboarding link
        const supabase = createClient<Database>();
        const { data } = await supabase.from('business_users').update({
            current_onboarding_link: accountLink.url
        }).eq('stripe_acc_id', account).select().single();

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
