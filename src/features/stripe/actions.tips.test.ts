import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Fakes ────────────────────────────────────────────────────────────────────
// A tiny in-memory Supabase (appointments + business_users) and a fake
// Stripe PaymentIntents API that behaves like the real one for the fields
// tips touch: amount, application_fee_amount, status and merged metadata.

type Row = Record<string, any>
let appointments: Record<string, Row>
let businesses: Record<string, Row>
let intents: Record<string, Row>
let planType: 'GROWTH' | 'STARTER'
let stripeCalls: { op: string; id?: string; params?: any; opts?: any }[]
let nextIntent = 1

vi.mock('@/app/utils/supabase/admin', () => ({
    createAdminClient: () => ({
        from: (table: string) => {
            const filters: Record<string, any> = {}
            let patch: Row | null = null
            const source = () => (table === 'appointments' ? appointments : businesses)
            const match = () => Object.values(source()).find(r => Object.entries(filters).every(([k, v]) => r[k] === v)) ?? null
            const q: any = {
                select: () => q,
                update: (p: Row) => { patch = p; return q },
                eq: (col: string, val: any) => {
                    filters[col] = val
                    if (patch) { const r = match(); if (r) Object.assign(r, patch) }
                    return q
                },
                maybeSingle: async () => ({ data: match() ? { ...match() } : null }),
                then: (resolve: any) => resolve({ error: null }),
            }
            return q
        },
    }),
}))

vi.mock('@/lib/businessPlan', () => ({ getEffectivePlanType: async () => planType }))
vi.mock('@/lib/auth/requireOwnStripeAccount', () => ({ requireOwnStripeAccount: async () => {} }))

vi.mock('@/lib/stripe/stripeClient', () => ({
    stripe: {
        paymentIntents: {
            retrieve: async (id: string, opts: any) => {
                stripeCalls.push({ op: 'retrieve', id, opts })
                if (!intents[id]) throw new Error('No such payment_intent')
                return structuredClone(intents[id])
            },
            update: async (id: string, params: any, opts: any) => {
                stripeCalls.push({ op: 'update', id, params, opts })
                const pi = intents[id]
                if (!pi) throw new Error('No such payment_intent')
                if (params.amount !== undefined) pi.amount = params.amount
                if (params.application_fee_amount !== undefined) pi.application_fee_amount = params.application_fee_amount
                if (params.metadata) pi.metadata = { ...pi.metadata, ...params.metadata }
                return structuredClone(pi)
            },
            create: async (params: any, opts: any) => {
                stripeCalls.push({ op: 'create', params, opts })
                const id = `pi_new_${nextIntent++}`
                intents[id] = { id, client_secret: `${id}_secret`, status: 'requires_payment_method', ...params, metadata: { ...params.metadata } }
                return structuredClone(intents[id])
            },
        },
    },
}))

const { createCheckoutAction, setBalanceTip } = await import('./actions')

// ── Fixtures ─────────────────────────────────────────────────────────────────
// $100 appointment, $20 deposit paid (not yet subtracted) → $80 balance.
function seed(over: { appt?: Row; pi?: Row | null; biz?: Row } = {}) {
    appointments = {
        a1: {
            id: 'a1', business: 'b1', status: 'CONFIRMED', client_metadata: { email: 'c@example.com' },
            amount_due: 10000, deposit_price: 2000, paid_deposit: true, substraction: false,
            service_paid: false, deposit_charge_id: 'pi_dep', service_charge_id: over.pi === null ? null : 'pi_bal',
            ...over.appt,
        },
    }
    businesses = {
        b1: { business_id: 'b1', stripe_acc_id: 'acct_1', payment_method_config_id: 'pmc_1', completed_stripe_onboarding: true, ...over.biz },
    }
    intents = over.pi === null ? {} : {
        pi_bal: {
            id: 'pi_bal', client_secret: 'pi_bal_secret', status: 'requires_payment_method',
            amount: 8000, application_fee_amount: 262, metadata: { appointment_id: 'a1', purpose: 'EOA', tip_cents: '0' },
            ...over.pi,
        },
    }
}

beforeEach(() => {
    planType = 'GROWTH'
    stripeCalls = []
    seed()
})

// ── setBalanceTip ────────────────────────────────────────────────────────────

describe('setBalanceTip', () => {
    it('adds the tip to the balance payment and records it in metadata', async () => {
        const res = await setBalanceTip('a1', 2000)
        expect(res).toEqual({ ok: true, amountDue: 10000, tipCents: 2000, balanceCents: 8000 })
        expect(intents.pi_bal.amount).toBe(10000)
        expect(intents.pi_bal.metadata.tip_cents).toBe('2000')
        // Existing metadata the webhook relies on is kept.
        expect(intents.pi_bal.metadata.purpose).toBe('EOA')
        expect(intents.pi_bal.metadata.appointment_id).toBe('a1')
    })

    it('updates the payment on the business’s own Stripe account', async () => {
        await setBalanceTip('a1', 2000)
        const update = stripeCalls.find(c => c.op === 'update')!
        expect(update.opts).toEqual({ stripeAccount: 'acct_1' })
    })

    it('takes no platform fee on the tip (Starter: 1% on the balance only)', async () => {
        planType = 'STARTER'
        await setBalanceTip('a1', 2000)
        // Processing on $100 = $3.20, plus 1% of the $80 balance = 80¢.
        expect(intents.pi_bal.application_fee_amount).toBe(400)
    })

    it('Growth pays only processing on the whole charge', async () => {
        await setBalanceTip('a1', 2000)
        expect(intents.pi_bal.application_fee_amount).toBe(320)
    })

    it('can change the tip, and remove it, without drifting the balance', async () => {
        await setBalanceTip('a1', 2000)
        await setBalanceTip('a1', 1500)
        expect(intents.pi_bal.amount).toBe(9500)
        const res = await setBalanceTip('a1', 0)
        expect(res).toMatchObject({ ok: true, amountDue: 8000, tipCents: 0 })
        expect(intents.pi_bal.metadata.tip_cents).toBe('0')
        expect(intents.pi_bal.application_fee_amount).toBe(262)
    })

    it('works out the balance from the database when the deposit was already subtracted', async () => {
        seed({ appt: { amount_due: 8000, substraction: true } })
        const res = await setBalanceTip('a1', 1000)
        expect(res).toMatchObject({ ok: true, amountDue: 9000, balanceCents: 8000 })
    })

    it('includes a late fee added after the page loaded', async () => {
        // Late fee raised amount_due by $15; the payment still says $80.
        seed({ appt: { amount_due: 11500 } })
        const res = await setBalanceTip('a1', 2000)
        expect(res).toMatchObject({ ok: true, amountDue: 11500, balanceCents: 9500 })
    })

    it.each([
        [-100, /negative/],
        [12.5, /valid/],
        [NaN, /valid/],
        ['2000' as any, /valid/],
        [10001, /limited to \$100\.00/],
    ])('rejects an invalid tip (%s) without touching Stripe', async (tip, message) => {
        const res = await setBalanceTip('a1', tip)
        expect(res.ok).toBe(false)
        if (!res.ok) expect(res.error).toMatch(message)
        expect(stripeCalls.filter(c => c.op === 'update')).toHaveLength(0)
        expect(intents.pi_bal.amount).toBe(8000)
    })

    it('allows tips up to the appointment total when that is over $100', async () => {
        seed({ appt: { amount_due: 30000 } })
        expect((await setBalanceTip('a1', 30000)).ok).toBe(true)
        expect((await setBalanceTip('a1', 30001)).ok).toBe(false)
    })

    it('refuses once the payment is processing or paid', async () => {
        seed({ pi: { status: 'processing' } })
        const processing = await setBalanceTip('a1', 2000)
        expect(processing).toMatchObject({ ok: false, error: expect.stringMatching(/already being processed/) })

        seed({ pi: { status: 'succeeded' } })
        const paid = await setBalanceTip('a1', 2000)
        expect(paid).toMatchObject({ ok: false, error: expect.stringMatching(/already paid/) })
        expect(stripeCalls.filter(c => c.op === 'update')).toHaveLength(0)
    })

    it('refuses when the appointment is already paid, cancelled or missing', async () => {
        seed({ appt: { service_paid: true } })
        expect((await setBalanceTip('a1', 2000)).ok).toBe(false)
        seed({ appt: { status: 'CANCELLED' } })
        expect((await setBalanceTip('a1', 2000)).ok).toBe(false)
        expect((await setBalanceTip('nope', 2000)).ok).toBe(false)
        expect(stripeCalls).toHaveLength(0)
    })

    it('refuses when no balance payment has been started yet', async () => {
        seed({ pi: null })
        const res = await setBalanceTip('a1', 2000)
        expect(res).toMatchObject({ ok: false, error: expect.stringMatching(/no longer valid/) })
    })

    it('refuses when the business’s Stripe setup is incomplete', async () => {
        seed({ biz: { completed_stripe_onboarding: false } })
        expect((await setBalanceTip('a1', 2000)).ok).toBe(false)
        expect(stripeCalls).toHaveLength(0)
    })

    it('returns a friendly error when Stripe fails', async () => {
        delete intents.pi_bal
        const res = await setBalanceTip('a1', 2000)
        expect(res).toMatchObject({ ok: false, error: expect.stringMatching(/couldn't update your tip/) })
    })
})

// ── createCheckoutAction with tips ───────────────────────────────────────────

describe('createCheckoutAction (balance) with tips', () => {
    it('keeps a chosen tip when the payment page is reloaded', async () => {
        await setBalanceTip('a1', 2000)
        stripeCalls = []
        const res = await createCheckoutAction({ purpose: 'EOA', appointmentID: 'a1' })
        expect(res).toMatchObject({ amountDue: 10000, tipCents: 2000 })
        expect(stripeCalls.filter(c => c.op === 'update')).toHaveLength(0)
        expect(intents.pi_bal.amount).toBe(10000)
    })

    it('re-prices for a new late fee but keeps the tip and its fee treatment', async () => {
        planType = 'STARTER'
        await setBalanceTip('a1', 2000)
        appointments.a1.amount_due = 11500 // $15 late fee
        const res = await createCheckoutAction({ purpose: 'EOA', appointmentID: 'a1' })
        expect(res).toMatchObject({ amountDue: 11500, tipCents: 2000 })
        // Processing on $115 = 334 + 30 = 364; 1% of the $95 balance = 95.
        expect(intents.pi_bal.application_fee_amount).toBe(364 + 95)
    })

    it('starts new balance payments with no tip', async () => {
        seed({ pi: null })
        const res = await createCheckoutAction({ purpose: 'EOA', appointmentID: 'a1' })
        expect(res).toMatchObject({ amountDue: 8000, tipCents: 0 })
        const create = stripeCalls.find(c => c.op === 'create')!
        expect(create.params.metadata.tip_cents).toBe('0')
        expect(create.params.metadata.purpose).toBe('EOA')
    })

    it('never adds tip metadata to deposits', async () => {
        seed({ appt: { paid_deposit: false, deposit_charge_id: null } })
        const res = await createCheckoutAction({ purpose: 'DEPOSIT', appointmentID: 'a1' })
        expect(res.tipCents).toBe(0)
        const create = stripeCalls.find(c => c.op === 'create')!
        expect(create.params.metadata.tip_cents).toBeUndefined()
    })

    it('reports the paid total (with tip) for an already-paid payment', async () => {
        seed({ pi: { status: 'succeeded', amount: 10000, metadata: { purpose: 'EOA', tip_cents: '2000' } } })
        const res = await createCheckoutAction({ purpose: 'EOA', appointmentID: 'a1' })
        expect(res).toMatchObject({ amountDue: 10000, tipCents: 2000 })
    })
})
