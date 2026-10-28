// One-time backfill: registers each business's booking addresses on its own
// Stripe account so Apple Pay / Google Pay can show in checkout. New
// businesses get this automatically (Stripe onboarding, link changes and
// Booking Settings saves); this covers the ones set up before that existed.
//
// Reads the environment you give it, so run it with the environment you mean
// to change (production values come from Vercel, never .env.local):
//
//   vercel env pull .env.production.local --environment=production
//   node --env-file=.env.production.local scripts/register-payment-domains.mjs            # dry run: lists what it would do
//   node --env-file=.env.production.local scripts/register-payment-domains.mjs --apply    # registers the addresses
//   ... --apply --wallets-on   also switches Apple Pay and Google Pay on for Growth businesses
//                              (they're Growth features; Starter businesses are never changed)
//
// Delete .env.production.local afterwards. Safe to re-run: registered
// addresses are skipped.
//
// Needs: STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ROLE_SECRET_KEY,
// NEXT_PUBLIC_BASE_URL, NEXT_PUBLIC_BOOKING_ROOT_DOMAIN (optional).

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const WALLETS_ON = process.argv.includes('--wallets-on')
const { STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ROLE_SECRET_KEY, NEXT_PUBLIC_BASE_URL, NEXT_PUBLIC_BOOKING_ROOT_DOMAIN } = process.env
for (const [k, v] of Object.entries({ STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ROLE_SECRET_KEY, NEXT_PUBLIC_BASE_URL })) {
    if (!v) { console.error(`Missing ${k}`); process.exit(1) }
}

// Same rules as bookingDomains() in src/lib/stripe/paymentMethodDomains.ts.
function bookingDomains(urlName) {
    const hosts = new Set()
    const add = (host) => {
        const h = host?.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/[/:].*$/, '')
        if (!h || !h.includes('.') || h.endsWith('localhost') || /^[\d.]+$/.test(h)) return
        hosts.add(h)
    }
    add(NEXT_PUBLIC_BASE_URL)
    if (NEXT_PUBLIC_BOOKING_ROOT_DOMAIN && urlName) add(`${urlName.trim().toLowerCase()}.${NEXT_PUBLIC_BOOKING_ROOT_DOMAIN}`)
    return [...hosts]
}

const stripe = new Stripe(STRIPE_SECRET_KEY)
const db = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ROLE_SECRET_KEY, { auth: { persistSession: false } })

console.log(`${APPLY ? 'APPLYING' : 'DRY RUN (add --apply to make changes)'} · Stripe ${STRIPE_SECRET_KEY.startsWith('sk_live') ? 'LIVE' : 'test'} · ${new URL(NEXT_PUBLIC_SUPABASE_URL).hostname}`)

const { data: businesses, error } = await db.from('business_users')
    .select('business_name, url_name, stripe_acc_id, payment_method_config_id, plan_type')
    .eq('completed_stripe_onboarding', true)
    .not('stripe_acc_id', 'is', null)
if (error) { console.error(error.message); process.exit(1) }

let registered = 0, skipped = 0, failed = 0
for (const b of businesses) {
    const account = { stripeAccount: b.stripe_acc_id }
    for (const domain_name of bookingDomains(b.url_name)) {
        try {
            const { data: [found] } = await stripe.paymentMethodDomains.list({ domain_name, limit: 1 }, account)
            if (found?.enabled && found.apple_pay.status === 'active') { skipped++; continue }
            console.log(`${b.business_name}: ${found ? 're-validate' : 'register'} ${domain_name}`)
            if (APPLY) {
                if (!found) await stripe.paymentMethodDomains.create({ domain_name, enabled: true }, account)
                else {
                    if (!found.enabled) await stripe.paymentMethodDomains.update(found.id, { enabled: true }, account)
                    await stripe.paymentMethodDomains.validate(found.id, {}, account)
                }
            }
            registered++
        } catch (err) {
            failed++
            console.error(`${b.business_name}: ${domain_name} failed — ${err.message}`)
        }
    }
    if (WALLETS_ON && b.payment_method_config_id && b.plan_type === 'GROWTH') {
        console.log(`${b.business_name}: switch Apple Pay + Google Pay on`)
        if (APPLY) {
            try {
                await stripe.paymentMethodConfigurations.update(b.payment_method_config_id.replace(/"/g, ''), {
                    apple_pay: { display_preference: { preference: 'on' } },
                    google_pay: { display_preference: { preference: 'on' } },
                }, account)
            } catch (err) {
                failed++
                console.error(`${b.business_name}: wallets failed — ${err.message}`)
            }
        }
    }
}
console.log(`${businesses.length} businesses · ${registered} ${APPLY ? 'registered' : 'to register'} · ${skipped} already set · ${failed} failed`)
