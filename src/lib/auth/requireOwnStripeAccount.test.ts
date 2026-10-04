import { beforeEach, describe, expect, it, vi } from 'vitest'

// Fake Supabase: a signed-in user who owns exactly one Stripe account.
let signedInUser: { id: string } | null = { id: 'user-1' }
const ownedAccounts: Record<string, string> = { 'user-1': 'acct_mine' }

vi.mock('@/app/utils/supabase/server', () => ({
    createClient: async () => ({
        auth: { getUser: async () => ({ data: { user: signedInUser } }) },
        from: () => {
            const filters: Record<string, string> = {}
            const q = {
                select: () => q,
                eq: (col: string, val: string) => { filters[col] = val; return q },
                maybeSingle: async () => ({
                    data: ownedAccounts[filters.user_id] === filters.stripe_acc_id ? { business_id: 'b1' } : null,
                }),
            }
            return q
        },
    }),
}))

const { requireOwnStripeAccount } = await import('./requireOwnStripeAccount')

describe('requireOwnStripeAccount', () => {
    beforeEach(() => { signedInUser = { id: 'user-1' } })

    it("allows the business's own Stripe account", async () => {
        await expect(requireOwnStripeAccount('acct_mine')).resolves.toBeUndefined()
    })
    it("rejects another business's Stripe account", async () => {
        await expect(requireOwnStripeAccount('acct_someone_else')).rejects.toThrow('Unauthorized')
    })
    it('rejects signed-out callers', async () => {
        signedInUser = null
        await expect(requireOwnStripeAccount('acct_mine')).rejects.toThrow('Unauthorized')
    })
    it('rejects an empty account id', async () => {
        await expect(requireOwnStripeAccount('')).rejects.toThrow('Unauthorized')
    })
})
