import { stripe } from "@lib/utils";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { account } = await request.json();
    try {
        const accountSession = await stripe.accountSessions.create(
            {
                account: account,
                components: {
                    account_management: {
                        enabled: true,
                        features: {
                            external_account_collection: true,
                        },
                    },
                    tax_settings: {
                        enabled: true
                    },
                    tax_registrations: {
                        enabled: true,
                    },
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
                        features: {
                            instant_payouts: true,
                            standard_payouts: true,
                            edit_payout_schedule: true,
                        }
                    },
                    payouts_list: {
                        enabled: true
                    },
                    reporting_chart: {
                        enabled: true,
                    },
                    // payment_method_settings: {
                    //     enabled: true,
                    // },
                } as any,

            }, {
            apiVersion: '2023-10-16; embedded_connect_beta=v2;'
        }
        )
        return new NextResponse(JSON.stringify({ clientSecret: accountSession.client_secret }), {
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
