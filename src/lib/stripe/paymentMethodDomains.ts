import { stripe } from "./stripeClient";

/**
 * Apple Pay (and Google Pay) only show in checkout on web addresses that are
 * registered on the Stripe account taking the payment. Bookings are direct
 * charges on each business's own connected account, so every address a
 * client can pay on must be registered there:
 *   - the app domain (beta.afroallure.co/business/<name>/book, payment links)
 *   - the business's own subdomain (<name>.afroallure.co)
 * Stripe has no wildcards, so a new link name needs registering too.
 */
export function bookingDomains(urlName: string | null | undefined, env: {
    baseUrl?: string
    bookingRootDomain?: string
} = {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    bookingRootDomain: process.env.NEXT_PUBLIC_BOOKING_ROOT_DOMAIN,
}): string[] {
    const hosts = new Set<string>()
    const add = (host: string | undefined) => {
        const h = host?.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/[/:].*$/, '')
        // Stripe only accepts public domain names (no localhost, no IPs).
        if (!h || !h.includes('.') || h.endsWith('localhost') || /^[\d.]+$/.test(h)) return
        hosts.add(h)
    }
    add(env.baseUrl)
    if (env.bookingRootDomain && urlName) add(`${urlName.trim().toLowerCase()}.${env.bookingRootDomain}`)
    return [...hosts]
}

/**
 * Each address must also serve Stripe's Apple Pay file at
 * /.well-known/apple-developer-merchantid-domain-association (in /public;
 * middleware lets it through on subdomains).
 *
 * Registers the business's booking addresses on its Stripe account so Apple
 * Pay and Google Pay can appear in checkout. Safe to call repeatedly: an
 * address already registered is re-validated, never duplicated. Never
 * throws; a failure only means the wallet buttons stay hidden for now.
 */
export async function registerPaymentMethodDomains(stripeAccountId: string | null | undefined, urlName: string | null | undefined): Promise<void> {
    if (!stripeAccountId) return
    for (const domain_name of bookingDomains(urlName)) {
        try {
            const existing = await stripe.paymentMethodDomains.list({ domain_name, limit: 1 }, { stripeAccount: stripeAccountId })
            const found = existing.data[0]
            if (!found) {
                await stripe.paymentMethodDomains.create({ domain_name, enabled: true }, { stripeAccount: stripeAccountId })
            } else if (!found.enabled || found.apple_pay.status !== 'active') {
                if (!found.enabled) await stripe.paymentMethodDomains.update(found.id, { enabled: true }, { stripeAccount: stripeAccountId })
                await stripe.paymentMethodDomains.validate(found.id, {}, { stripeAccount: stripeAccountId })
            }
        } catch (err) {
            console.error(`Could not register ${domain_name} for wallet payments on ${stripeAccountId}:`, err)
        }
    }
}
