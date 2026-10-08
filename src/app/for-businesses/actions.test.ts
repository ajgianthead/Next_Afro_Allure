import { beforeEach, describe, expect, it, vi } from 'vitest'

const { sessionsCreate } = vi.hoisted(() => {
    process.env.STRIPE_GROWTH_PRICE_ID = 'price_month'
    return { sessionsCreate: vi.fn(async () => ({ url: 'https://checkout.stripe.test/session' })) }
})

vi.mock('@/lib/stripe/stripeClient', () => ({ stripe: { checkout: { sessions: { create: sessionsCreate } } } }))
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
vi.mock('@/features/billing/server/sms', () => ({ growthItemOf: vi.fn(), itemsForInterval: vi.fn(), liveSubscription: vi.fn() }))

import { startGrowthCheckout } from './actions'

beforeEach(() => sessionsCreate.mockClear())

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
