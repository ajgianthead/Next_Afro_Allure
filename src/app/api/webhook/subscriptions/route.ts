import { stripe } from "@/lib/stripe/stripeClient";
import { NextRequest } from "next/server";
import { apiError, webhookAck } from "@/lib/api/response";
import { Resend } from "resend";
import Stripe from "stripe";
import { createAdminClient } from '@/app/utils/supabase/admin'
import { Database } from "../../../../../lib/database.types";
import PausedSubscription from "../../../../../emails/subscription-paused";
import CancelledSubscription from "../../../../../emails/subscription-cancelled";
import NewSubscription from "../../../../../emails/subscription-welcome";
import FounderNotification from "../../../../../emails/FounderNotification";
import { hasLiveSubscription } from "@/features/billing/server/trial";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'AfroAllure <noreply@reminder.afroallure.co>';
const NOTIFY_FROM = 'AfroAllure <notifications@beta.afroallure.co>';
const SOCIALS = { instagram: 'https://instagram.com/afroallure_' };

async function notifyFounder(subject: string, props: Parameters<typeof FounderNotification>[0]) {
    if (!process.env.FOUNDER_EMAIL) return
    try {
        await resend.emails.send({
            from: NOTIFY_FROM,
            to: process.env.FOUNDER_EMAIL,
            subject,
            react: FounderNotification(props),
        })
    } catch (e) {
        console.error('Failed to send founder notification:', e)
    }
}

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

    // Invoice events have a different data.object shape — handle before the subscription cast below.
    if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object as Stripe.Invoice;
        const failedCustomerId = invoice.customer?.toString();
        console.warn(`invoice.payment_failed: customer=${failedCustomerId} invoice=${invoice.id}`);
        if (failedCustomerId) {
            const supabase = createAdminClient();
            const { data: business } = await supabase
                .from('business_users')
                .select('business_name, email')
                .eq('stripe_customer_id', failedCustomerId)
                .maybeSingle();
            if (business) {
                await notifyFounder(`Payment failed: ${business.business_name}`, {
                    eventType: 'payment_failed',
                    businessName: business.business_name,
                    email: business.email,
                    amount: invoice.amount_due,
                    timestamp: new Date().toISOString(),
                });
            }
        }
        return webhookAck();
    }

    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer.toString();

    try {
        switch (event.type) {
            case 'customer.subscription.created':
                await handleSubscriptionCreated(customerId, subscription.status, subscription.items.data[0]?.price.unit_amount ?? undefined);
                break;
            case 'customer.subscription.updated':
                // Handles trial→active (trial ends with payment), paused→active (payment added),
                // and any other status transitions not covered by dedicated events.
                if (subscription.status === 'active') {
                    await handleSubscriptionActivated(customerId);
                } else if (subscription.status === 'paused') {
                    await handleSubscriptionPaused(customerId);
                }
                break;
            case 'customer.subscription.resumed':
                // Fires when a paused subscription is explicitly resumed
                await handleSubscriptionActivated(customerId);
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

async function handleSubscriptionActivated(customerId: string) {
    const supabase = createAdminClient();
    const { error } = await supabase
        .from('business_users')
        .update({ plan_type: 'GROWTH', subscription_plan: 'GROWTH', subscription_status: 'active' })
        .eq('stripe_customer_id', customerId);
    if (error) throw error;
}

async function handleSubscriptionCreated(customerId: string, status: string, amount?: number) {
    if (status === 'active') {
        const supabase = createAdminClient();
        const { data: business, error } = await supabase
            .from('business_users')
            .update({ plan_type: 'GROWTH', subscription_plan: 'GROWTH', subscription_status: 'active' })
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

        if (business) {
            await notifyFounder(`New subscriber: ${business.business_name} → GROWTH`, {
                eventType: 'new_subscriber',
                businessName: business.business_name,
                email: business.email,
                plan: 'GROWTH',
                amount,
                timestamp: new Date().toISOString(),
            });
        }
    } else if (status === 'trialing') {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from('business_users')
            .update({ plan_type: 'GROWTH', had_trial: true, subscription_plan: 'GROWTH', subscription_status: 'trialing' })
            .eq('stripe_customer_id', customerId);
        if (error) throw error;
    }
}

async function handleSubscriptionPaused(customerId: string) {
    // A stale trial being paused or cancelled while the business starts a new
    // subscription must not downgrade them — events can arrive in any order.
    if (await hasLiveSubscription(customerId)) return;
    const supabase = createAdminClient();
    const { data: business, error } = await supabase
        .from('business_users')
        .update({ plan_type: 'STARTER', subscription_status: 'paused' })
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
    if (await hasLiveSubscription(customerId)) return;
    const supabase = createAdminClient();
    const { data: business, error } = await supabase
        .from('business_users')
        .update({ plan_type: 'STARTER', subscription_status: 'canceled' })
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

    if (business) {
        await notifyFounder(`Cancellation: ${business.business_name}`, {
            eventType: 'cancellation',
            businessName: business.business_name,
            email: business.email,
            plan: 'GROWTH',
            timestamp: new Date().toISOString(),
        });
    }
}
