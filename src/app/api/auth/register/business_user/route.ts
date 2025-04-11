import { corsHeaders } from "@utils/cors_headers";
import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database, Json } from "../../../../../../lib/database.types";
import { stripe } from "@lib/utils";
import { Time } from "@internationalized/date";

const defaultAvailability : any = [{
        id: crypto.randomUUID(),
        name: "Default",
        week: [{
            isChecked: true,
            timeRanges: [{
                start: new Time(9),
                end: new Time(17)
            }]
        },
        {
            isChecked: true,
            timeRanges: [{
                start: new Time(9),
                end: new Time(17)
            }]
        },
        {
            isChecked: true,
            timeRanges: [{
                start: new Time(9),
                end: new Time(17)
            }]
        },
        {
            isChecked: true,
            timeRanges: [{
                start: new Time(9),
                end: new Time(17)
            }]
        },
        {
            isChecked: true,
            timeRanges: [{
                start: new Time(9),
                end: new Time(17)
            }]
        },
        {
            isChecked: false,
            timeRanges: [{
                start: new Time(9),
                end: new Time(17)
            }]
        },
        {
            isChecked: false,
            timeRanges: [{
                start: new Time(9),
                end: new Time(17)
            }]
        }],
        specificDates: {}
    }]

// Register a business user
export async function POST(request: NextRequest) {
    const supabase = createClient<Database>();
    const { name, email, password } = await request.json();
    // Register user and put user in business_users table
    const { data: user, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                account_type: 'business'
            }
        }
    })
        .then(async (data) => {
            // Create stripe account
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

           return await supabase.from('business_users').insert([
                {
                    business_name: name,
                    user_id: data.data.user?.id,
                    email: data.data.user?.email!,
                    stripe_acc_id: account.id,
                    availabilities: defaultAvailability
                }
            ]).select().single().then(async (res) => {
                const business = res.data
                 // Create policy
                await supabase.from('business_policies').insert([
                    {
                        business: business?.business_id,
                        deposit: {
                            enabled: true,
                            settings: {
                                type: 'percent',
                                value: 20
                            }
                        },
                        late_fee: {
                            enabled: false
                        },
                        no_show: {
                            enabled: true,
                            level: "strict"
                        }
                    }
                ]).select().single().then(async (res) => {
                    await supabase.from('business_users').update({
                        booking_policies: res.data?.id
                    }).eq('business_id', business?.business_id!)
                })
                return await supabase.from('services').insert([
                    {
                        name: "Test Service",
                        business: business?.business_id!,
                        description: "This is a test service",
                        length: 180,
                        price: 100,
                        photo_url: "",
                        imagePath: "",
                        addons: null,
                        categories: ["test", "default", "service"],

                    }
                ]).select(`business_users(*)`).single()
            })

        })
        
    if (error) {
        return new Response(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    return new Response(JSON.stringify({ data: user }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
