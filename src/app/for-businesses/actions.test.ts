import { beforeEach, describe, expect, it, vi } from 'vitest'

const { sessionsCreate, subRetrieve, subUpdate } = vi.hoisted(() => {
    process.env.STRIPE_GROWTH_PRICE_ID = 'price_month'
    return {
        sessionsCreate: vi.fn(async () => ({ url: 'https://checkout.stripe.test/session' })),
        subRetrieve: vi.fn(),
        subUpdate: vi.fn(async () => ({})),
    }
})

vi.mock('@/lib/stripe/stripeClient', () => ({
    stripe: {
        checkout: { sessions: { create: sessionsCreate } },
        subscriptions: { retrieve: subRetrieve, update: subUpdate },
    },
}))
vi.mock('@/app/utils/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/auth/requireBusinessOwner', () => ({ requireOwnBusinessId: async () => 'biz_1' }))
vi.mock('@/app/utils/supabase/admin', () => ({
    createAdminClient: () => ({
        from: () => ({
            select: () => ({
                eq: () => ({ single: async () => ({ data: { had_trial: true, stripe_customer_id: 'cus_1' } }) }),
            }),
        }),
    }),
}))
vi.mock('@/features/billing/server/trial', () => ({
    hasLiveSubscription: async () => false,
    clearStaleSubscriptions: async () => {},
    growthPriceId: (interval: string) => (interval === 'year' ? 'price_year' : 'price_month'),
}))
vi.mock('@/features/billing/server/sms', () => ({
    liveSubscription: async () => ({ id: 'sub_1', status: 'active' }),
    growthItemOf: () => ({ id: 'si_1', price: { id: 'price_month' } }),
    itemsForInterval: () => [{ id: 'si_1', price: 'price_year' }],
}))

import { startGrowthCheckout, switchGrowthInterval } from './actions'

beforeEach(() => {
    sessionsCreate.mockClear()
    subRetrieve.mockReset()
    subUpdate.mockClear()
})

describe('Growth checkout promotion codes', () => {
    it('accepts promotion codes on the monthly plan', async () => {
        await startGrowthCheckout('month')
        expect(sessionsCreate).toHaveBeenCalledWith(expect.objectContaining({
            allow_promotion_codes: true,
            line_items: [{ price: 'price_month', quantity: 1 }],
        }))
    })

    it('does not accept promotion codes on the yearly plan', async () => {
        await startGrowthCheckout('year')
        expect(sessionsCreate).toHaveBeenCalledWith(expect.objectContaining({
            allow_promotion_codes: false,
            line_items: [{ price: 'price_year', quantity: 1 }],
        }))
    })
})

describe('switching to yearly with a monthly promo', () => {
    const promo = { id: 'di_1', coupon: { duration: 'repeating', duration_in_months: 3, amount_off: 2500 } }

    it('switches straight away when there is no promo', async () => {
        subRetrieve.mockResolvedValue({ id: 'sub_1', discounts: [] })
        expect(await switchGrowthInterval('year')).toEqual({ ok: true })
        expect(subUpdate).toHaveBeenCalledWith('sub_1', expect.not.objectContaining({ discounts: expect.anything() }))
    })

    it('asks first, and changes nothing, when the switch would end a promo', async () => {
        subRetrieve.mockResolvedValue({ id: 'sub_1', discounts: [promo] })
        const res = await switchGrowthInterval('year')
        expect(res).toMatchObject({ ok: false, confirmDropPromo: expect.stringContaining('$25 off') })
        expect(subUpdate).not.toHaveBeenCalled()
    })

    it('removes the promo along with the switch once confirmed', async () => {
        subRetrieve.mockResolvedValue({ id: 'sub_1', discounts: [promo] })
        expect(await switchGrowthInterval('year', { dropPromo: true })).toEqual({ ok: true })
        expect(subUpdate).toHaveBeenCalledWith('sub_1', expect.objectContaining({
            items: [{ id: 'si_1', price: 'price_year' }],
            discounts: '',
        }))
    })
})
