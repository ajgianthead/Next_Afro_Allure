import { stripe } from "../../../../lib/utils";
import pool from "@utils/dbPool";
import { NextRequest, NextResponse } from "next/server";
import mailchimp from '@mailchimp/mailchimp_transactional'
import { checkAppointmentStatus, reminderTask, sendPaymentLink } from "trigger/reminder";
import { DateTime } from "luxon";
import NewAppointment from "../../../../../emails/new-appointment";
import { Resend } from "resend";
import AppointmentConfirmed from "../../../../../emails/appointment-confirmed";
import Stripe from "stripe";
import { createClient } from "@utils/supabase/server";
import { Database } from "../../../../../lib/database.types";
import PausedSubscription from "../../../../../emails/subscription-paused";
import CancelledSubscription from "../../../../../emails/subscription-cancelled";
import NewSubscription from "../../../../../emails/subscription-welcome";



export async function POST(request: NextRequest) {

    const endpointSecret = process.env.NEXT_PUBLIC_SUB_WEBHOOK_SECRET!;
    const rawBody = await request.arrayBuffer(); // ⬅️ equivalent to express.raw()
    const bodyBuffer = Buffer.from(rawBody);
    const sig = request.headers.get('stripe-signature');
    const supabase = createClient<Database>()

    let event;

    try {
        event = stripe.webhooks.constructEvent(bodyBuffer, sig!, endpointSecret);
    } catch (err: any) {
        return new NextResponse(JSON.stringify({ message: `Webhook Error: ${err.message}` }), {
            status: 400
        })
    }

    const data = event.data.object as any;
    const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

    // Handle the event
    switch (event.type) {
        case 'customer.subscription.created':
            // If subscription is created without trial
            if (data.status === 'active') {
                // Change value in database and notify user
                const { data: businessDataSub } = await supabase.from('business_users').update({
                    'plan_type': 'GROWTH',
                }).eq('stripe_customer_id', event.data.object.customer.toString()).select().maybeSingle()
                await resend.emails.send({
                    from: 'AfroAllure <noreply@reminder.afroallure.co>',
                    to: businessDataSub?.email!,
                    subject: 'Your AfroAllure Growth Plan is Paused ⏸️',
                    react: NewSubscription({
                        socials: {
                            instagram: "https://instagram.com/afroallure_",
                        },
                        businessData: {
                            id: businessDataSub?.business_id!,
                            name: businessDataSub?.business_name!
                        }
                    })

                })
            }
            // If subscription is created with a trial
            else if (event.data.object.status === 'trialing') {
                // Change had_trial value in database to TRUE, and notify user that trial is active
                await supabase.from('business_users').update({
                    'plan_type': 'GROWTH',
                    'had_trial': true
                }).eq('stripe_customer_id', event.data.object.customer.toString())
            }
            break;
        case 'customer.subscription.paused':
            // Update business plan from GROWTH to starter
            const { data: businessDataPaused } = await supabase.from('business_users').update({
                'plan_type': 'STARTER',
            }).eq('stripe_customer_id', event.data.object.customer.toString()).select().maybeSingle()
            // Notify the user
            await resend.emails.send({
                from: 'AfroAllure <noreply@reminder.afroallure.co>',
                to: businessDataPaused?.email!,
                subject: 'Your AfroAllure Growth Plan is Paused ⏸️',
                react: PausedSubscription({
                    socials: {
                        instagram: "https://instagram.com/afroallure_",
                    },
                    businessData: {
                        id: businessDataPaused?.business_id!,
                        name: businessDataPaused?.business_name!
                    }
                })

            })
            break;

        case 'customer.subscription.deleted':
            // Hate to see you go, sad face
            const { data: businessDataCancelled } = await supabase.from('business_users').update({
                'plan_type': 'STARTER',
            }).eq('stripe_customer_id', event.data.object.customer.toString()).select().maybeSingle()
            // Notify the user
            await resend.emails.send({
                from: 'AfroAllure <noreply@reminder.afroallure.co>',
                to: businessDataCancelled?.email!,
                subject: 'Your AfroAllure Growth Plan is Paused ⏸️',
                react: CancelledSubscription({
                    socials: {
                        instagram: "https://instagram.com/afroallure_",
                    },
                    customerID: businessDataCancelled?.stripe_customer_id!,
                    businessData: {
                        id: businessDataCancelled?.business_id!,
                        name: businessDataCancelled?.business_name!
                    }
                })

            })
            break;
        default:

    }
    // Return a 200 response to acknowledge receipt of the event
    return new NextResponse(null, {
        status: 200
    })
}
