import { describe, expect, it } from 'vitest'
import { canPayBalance } from './balance'

const base = { status: 'CONFIRMED', service_paid: false, amount_due: 15000, deposit_price: 3000, paid_deposit: true, substraction: true }

describe('canPayBalance', () => {
    it('allows confirmed, unpaid appointments with a balance', () => {
        expect(canPayBalance(base)).toBe(true)
    })
    it('still allows payment after the automatic no-show / incomplete flags', () => {
        expect(canPayBalance({ ...base, status: 'NO_SHOW' })).toBe(true)
        expect(canPayBalance({ ...base, status: 'INCOMPLETE' })).toBe(true)
    })
    it('refuses paid, cancelled, pending or zero-balance appointments', () => {
        expect(canPayBalance({ ...base, service_paid: true })).toBe(false)
        expect(canPayBalance({ ...base, status: 'CANCELLED' })).toBe(false)
        expect(canPayBalance({ ...base, status: 'PENDING' })).toBe(false)
        expect(canPayBalance({ ...base, status: 'COMPLETED' })).toBe(false)
        // Deposit not subtracted from amount_due yet and equal to it → nothing left.
        expect(canPayBalance({ ...base, amount_due: 3000, substraction: false })).toBe(false)
    })
})
