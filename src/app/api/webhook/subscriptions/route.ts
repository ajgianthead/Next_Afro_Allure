import { stripe } from "@/lib/stripe/stripeClient";
import { NextRequest } from "next/server";
import { apiError, webhookAck } from "@/lib/api/response";
import { Resend } from "resend";
import Stripe from "stripe";
import { createClient } from "@/app/utils/supabase/server";
import { Database } from "../../../../../lib/database.types";
import PausedSubscription from "../../../../../emails/subscription-paused";
import CancelledSubscription from "../../../../../emails/subscription-cancelled";
import NewSubscription from "../../../../../emails/subscription-welcome";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'AfroAllure <noreply@reminder.afroallure.co>';
const SOCIALS = { instagram: 'https://instagram.com/afroallure_' };

export async function POST(request: NextRequest) {
    const endpointSecret = process.env.SUB_WEBHOOK_SECRET!;
    const rawBody = await request.arrayBuffer();
    const bodyBuffer = Buffer.from(rawBody);
    const sig = request.headers.get('stripe-signature');

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(bodyBuffer, sig!, endpointSecret);
    } catch (err: any) {
        return apiError(`Webhook Error: ${err.message}`, 400);
    }

    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer.toString();

    try {
        switch (event.type) {
            case 'customer.subscription.created':
                await handleSubscriptionCreated(customerId, subscription.status);
                break;
            case 'customer.subscription.paused':
                await handleSubscriptionPaused(customerId);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(customerId);
                break;
        }
    } catch (error: any) {
        return apiError(error.message ?? 'Webhook handler failed', 500);
    }

    return webhookAck();
}

async function handleSubscriptionCreated(customerId: string, status: string) {
    if (status === 'active') {
        const supabase = await createClient();
        const { data: business, error } = await supabase
            .from('business_users')
            .update({ plan_type: 'GROWTH' })
            .eq('stripe_customer_id', customerId)
            .select()
            .maybeSingle();
        if (error) throw error;

        try {
            await resend.emails.send({
                from: FROM,
                to: business?.email!,
                subject: 'Welcome to AfroAllure Growth! 🎉',
                react: NewSubscription({
                    socials: SOCIALS,
                    businessData: { id: business?.business_id!, name: business?.business_name! },
                }),
            });
        } catch (e) {
            console.error('Failed to send subscription welcome email:', e);
        }
    } else if (status === 'trialing') {
        const supabase = await createClient();
        const { error } = await supabase
            .from('business_users')
            .update({ plan_type: 'GROWTH', had_trial: true })
            .eq('stripe_customer_id', customerId);
        if (error) throw error;
    }
}

async function handleSubscriptionPaused(customerId: string) {
    const supabase = await createClient();
    const { data: business, error } = await supabase
        .from('business_users')
        .update({ plan_type: 'STARTER' })
        .eq('stripe_customer_id', customerId)
        .select()
        .maybeSingle();
    if (error) throw error;

    try {
        await resend.emails.send({
            from: FROM,
            to: business?.email!,
            subject: 'Your AfroAllure Growth Plan is Paused ⏸️',
            react: PausedSubscription({
                socials: SOCIALS,
                businessData: { id: business?.business_id!, name: business?.business_name! },
            }),
        });
    } catch (e) {
        console.error('Failed to send subscription paused email:', e);
    }
}

async function handleSubscriptionDeleted(customerId: string) {
    const supabase = await createClient();
    const { data: business, error } = await supabase
        .from('business_users')
        .update({ plan_type: 'STARTER' })
        .eq('stripe_customer_id', customerId)
        .select()
        .maybeSingle();
    if (error) throw error;

    try {
        await resend.emails.send({
            from: FROM,
            to: business?.email!,
            subject: 'Your AfroAllure Growth Plan has been Cancelled',
            react: CancelledSubscription({
                socials: SOCIALS,
                customerID: business?.stripe_customer_id!,
                businessData: { id: business?.business_id!, name: business?.business_name! },
            }),
        });
    } catch (e) {
        console.error('Failed to send subscription cancelled email:', e);
    }
}
