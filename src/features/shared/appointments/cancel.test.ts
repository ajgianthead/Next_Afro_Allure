import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DateTime } from 'luxon'

// The stored appointment, and whether the action got as far as cancelling it.
let storedStart = ''
let cancelled = false

vi.mock('@/app/utils/supabase/admin', () => ({
    createAdminClient: () => ({
        from: (table: string) => {
            const chain: any = {
                select: () => chain,
                eq: () => chain,
                update: () => { cancelled = true; return chain },
                insert: async () => ({ error: null }),
                single: async () => {
                    if (table === 'business_policies') return { data: { cancel_day_limit: 3 } }
                    if (cancelled) throw new Error('stop after the cancel (side effects not under test)')
                    return { data: { status: 'CONFIRMED', policy_id: 'p1', start: storedStart } }
                },
            }
            return chain
        },
    }),
}))
vi.mock('@/lib/appointmentEmails/AppointmentEmails', () => ({ AppointmentEmails: {}, formatBusinessAddress: () => '' }))
vi.mock('@/features/shared/appointments/AppointmentReminders', () => ({ AppointmentReminders: { cancelAll: async () => {} } }))
vi.mock('@/features/shared/appointments/confirmation', () => ({ scheduleAndStoreReminders: async () => {}, sendConfirmationTexts: async () => {} }))
vi.mock('@/features/waitlist/server/notify', () => ({ notifyWaitlistOfOpening: async () => {} }))
vi.mock('../../../../lib/analytics', () => ({ trackAppointmentBooked: async () => {}, trackAppointmentCancelled: async () => {} }))

const { cancelClientAppointmentAction } = await import('./actions')

describe('client cancellation deadline', () => {
    beforeEach(() => { cancelled = false })

    it('uses the stored time, not the one the browser sends', async () => {
        storedStart = DateTime.now().plus({ days: 1 }).toISO()!
        const faked = DateTime.now().plus({ months: 6 }).toISO()!
        await expect(cancelClientAppointmentAction('a1', faked, faked, [])).rejects.toThrow(/not allowed within 3 days/)
        expect(cancelled).toBe(false)
    })

    it('still lets a client cancel outside the limit', async () => {
        storedStart = DateTime.now().plus({ days: 10 }).toISO()!
        await cancelClientAppointmentAction('a1', storedStart, storedStart, []).catch(() => {})
        expect(cancelled).toBe(true)
    })
})
