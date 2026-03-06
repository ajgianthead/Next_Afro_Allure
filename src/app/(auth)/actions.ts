'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../../../utils/supabase/server'
import { Database } from '../../../lib/database.types'
import { Time } from '@internationalized/date'
import { stripe } from '../../lib/utils'
import { createSubscriptionCheckout } from 'app/for-businesses/actions'
import Stripe from 'stripe'


const defaultAvailability: any = {
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
}

export async function login(cred: { email: string; password: string }) {
    const supabase = createClient<Database>()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: cred.email,
        password: cred.password,
    }

    const { data: user, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return error
    }

    return user
}

export async function register(cred: { name: string; email: string; password: string; }, subscription: boolean) {
    const supabase = createClient<Database>()
    const credentials = {
        businessName: cred.name,
        email: cred.email,
        password: cred.password
    }
    const { data, error: nameError } = await supabase.from('business_users').select().or(`email.eq.${credentials.email},business_name.eq.${credentials.businessName}`).single()
    if (data && data.business_name === credentials.businessName) {
        return "Business name is already taken"
    }
    if (data && data.email === credentials.email) {
        return "Email is already in use"
    }
    let sessionUrl = "";

    const { data: user, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
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
            const customer = await stripe.customers.create({
                email: data.data.user?.email
            })

            if (subscription) {
                sessionUrl = (await createSubscriptionCheckout(true, undefined, customer.id)).url!
            }
            return await supabase.from('business_users').insert(
                {
                    business_name: credentials.businessName,
                    user_id: data.data.user?.id,
                    email: data.data.user?.email!,
                    stripe_acc_id: account.id,
                    default_availability: defaultAvailability.id,
                    stripe_customer_id: customer.id,
                    url_name: credentials.businessName.split(" ").join("").toLowerCase(),
                    account_settings: {
                        "app_reminders": {
                            "email_1": false,
                            "email_24": true
                        },
                        "notifications": {
                            "email": true,
                            "email_1": false,
                            "email_24": true
                        },
                        "business_address": {
                            "city": "",
                            "state": "",
                            "line_1": "",
                            "line_2": "",
                            "zip_code": "",
                            "no_address": false
                        }
                    }
                }
            ).select().single().then(async (res) => {
                const business = res.data
                // Create

                // Create policy
                await supabase.from('business_policies').insert([
                    {
                        business: business?.business_id,
                        deposit: {
                            enabled: false,
                            settings: {
                                type: 'percent',
                                value: 20
                            }
                        },
                        late_fee: {
                            enabled: false
                        },
                        no_show: {
                            enabled: false,
                            level: "strict"
                        }
                    }
                ]).select().single().then(async (res) => {
                    await supabase.from('business_users').update({
                        booking_policies: res.data?.id
                    }).eq('business_id', business?.business_id!)
                })
                return await supabase.from('availabilities').insert([
                    {
                        id: defaultAvailability.id,
                        business_id: res.data?.business_id,
                        availability_data: defaultAvailability
                    }
                ]).select(`*`).single().then(async (res) => {
                    return await supabase.from('services').insert([
                        {
                            name: "Box Braids",
                            business: business?.business_id!,
                            description: "This is an example service",
                            length: 180,
                            price: 8000,
                            photo_url: "",
                            imagePath: "",
                            addons: [],
                            categories: ["test", "default", "service"],
                            availability: res.data?.id

                        }
                    ]).select(`*, business_users(*)`).single()

                })

            })

        })

    if (error) {
        return error
    }
    return { user, sessionUrl }

}


