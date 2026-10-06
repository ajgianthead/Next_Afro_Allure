import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe/stripeClient'
import { META, noShowFeeCents, parseNoShowFee } from '../noShowFee'

export interface CardOnFile {
    customer: string
    feeCents: number
}

/**
 * When the business has a no-show fee, the deposit payment saves the client's
 * card: returns the Stripe customer (on the connected account) to attach and
 * the fee to record on the payment. Null when there's no fee.
 */
export async function cardOnFileFor(opts: {
    stripeAccount: string
    noShowFee: unknown
    totalCents: number
    email: string | null | undefined
    name?: string
}): Promise<CardOnFile | null> {
    const feeCents = noShowFeeCents(parseNoShowFee(opts.noShowFee), opts.totalCents)
    const email = opts.email?.trim()
    if (!feeCents || !email) return null

    const existing = await stripe.customers.list({ email, limit: 1 }, { stripeAccount: opts.stripeAccount })
    const customer = existing.data[0]
        ?? await stripe.customers.create(
            { email, name: opts.name?.trim() || undefined, metadata: { source: 'afroallure' } },
            { stripeAccount: opts.stripeAccount }
        )
    return { customer: customer.id, feeCents }
}

/** PaymentIntent params that save the card and record the agreed fee. */
export function cardOnFileParams(card: CardOnFile | null): Pick<Stripe.PaymentIntentCreateParams, 'customer' | 'setup_future_usage'> & { metadata: Record<string, string> } {
    if (!card) return { metadata: {} }
    return {
        customer: card.customer,
        setup_future_usage: 'off_session',
        metadata: { [META.feeCents]: String(card.feeCents) },
    }
}

/** Brings an unpaid PaymentIntent in line with the current card-on-file terms (or leaves it). */
export function cardOnFileUpdate(existing: Stripe.PaymentIntent, card: CardOnFile | null): Stripe.PaymentIntentUpdateParams | null {
    const unpaid = ['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(existing.status)
    if (!unpaid || !card) return null
    if (existing.setup_future_usage === 'off_session' && existing.metadata?.[META.feeCents] === String(card.feeCents)) return null
    return {
        customer: card.customer,
        setup_future_usage: 'off_session',
        metadata: { ...existing.metadata, [META.feeCents]: String(card.feeCents) },
    }
}
