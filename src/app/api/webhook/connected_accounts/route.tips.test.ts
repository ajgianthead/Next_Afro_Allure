import { beforeEach, describe, expect, it, vi } from 'vitest'

// The connected-account webhook's balance (EOA) branch with tips. Postgres is
// faked just enough to run the handler's UPDATE: it applies the same
// "already recorded" guard the SQL has, so redelivered events can be tested.

type Appt = Record<string, any>
let appt: Appt
let queries: { sql: string; params: any[] }[]
let event: any

const sendEOAReceipt = vi.fn(async (_: any) => {})
const notifyLoyalty = vi.fn(async (_: string) => {})
const notificationInserts: any[] = []

vi.mock('@/lib/stripe/stripeClient', () => ({
    stripe: { webhooks: { constructEvent: () => event } },
}))

vi.mock('@/app/utils/dbPool', () => ({
    default: {
        connect: async () => ({
            release: () => {},
            query: async (sql: string, params: any[] = []) => {
                queries.push({ sql, params })
                if (!/UPDATE appointments/.test(sql) || !/service_paid_type = 'PLATFORM'/.test(sql)) return { rows: [], rowCount: 0 }
                const [paid, piId, serviceCents, id, tipCents] = params
                const alreadyRecorded = appt.service_paid && appt.service_paid_type === 'PLATFORM' && appt.service_charge_id === piId
                if (appt.id !== id || alreadyRecorded) return { rows: [], rowCount: 0 }
                Object.assign(appt, {
                    service_paid: paid, service_paid_type: 'PLATFORM', service_charge_id: piId,
                    status: 'COMPLETED', paid_amount: (appt.paid_amount ?? 0) + serviceCents, tip_cents: tipCents,
                })
                return {
                    rows: [{ ...appt, business_name: 'Kayla Braids', email: 'kayla@example.com', account_settings: {} }],
                    rowCount: 1,
                }
            },
        }),
    },
}))

vi.mock('@/lib/appointmentEmails/AppointmentEmails', () => ({
    AppointmentEmails: { sendEOAReceipt, sendConfirmed: vi.fn() },
    formatBusinessAddress: () => '',
}))
vi.mock('@/features/shared/appointments/AppointmentReminders', () => ({ AppointmentReminders: {}, reminderSettingsFrom: () => ({}) }))
vi.mock('../../../../../lib/analytics', () => ({ trackAppointmentBooked: async () => {} }))
vi.mock('@/features/shared/clients/upsertBusinessClient', () => ({ upsertBusinessClientAsAdmin: async () => {} }))
vi.mock('@/features/refunds/server/sync', () => ({ syncStripeRefund: async () => null }))
vi.mock('@/features/loyalty/server/notify', () => ({ notifyLoyaltyForAppointment: notifyLoyalty }))
vi.mock('@/features/shared/appointments/confirmation', () => ({ sendConfirmationTexts: async () => {} }))
vi.mock('@/app/utils/supabase/admin', () => ({
    createAdminClient: () => ({
        from: () => ({ insert: async (row: any) => { notificationInserts.push(row); return { error: null } } }),
    }),
}))

const { POST } = await import('./route')

function balancePaid(amount: number, metadata: Record<string, string>) {
    event = {
        type: 'payment_intent.succeeded',
        account: 'acct_1',
        data: { object: { id: 'pi_bal', amount, metadata: { purpose: 'EOA', appointment_id: 'a1', ...metadata } } },
    }
}

const deliver = () => POST({
    arrayBuffer: async () => new ArrayBuffer(0),
    headers: { get: () => 'sig' },
} as any)

beforeEach(() => {
    queries = []
    notificationInserts.length = 0
    sendEOAReceipt.mockClear()
    notifyLoyalty.mockClear()
    appt = {
        id: 'a1', business: 'b1', status: 'CONFIRMED', service_paid: false, service_paid_type: null,
        service_charge_id: 'pi_bal', paid_amount: 2000, tip_cents: 0,
        client_metadata: { firstName: 'Ada', lastName: 'Obi', email: 'ada@example.com' },
        service_data: { name: 'Knotless braids' },
        start: new Date('2026-10-01T15:00:00Z'), end: new Date('2026-10-01T18:00:00Z'),
    }
})

describe('connected-account webhook: balance payment with a tip', () => {
    it('records the tip separately — paid_amount only counts the balance', async () => {
        balancePaid(10000, { tip_cents: '2000' })
        const res = await deliver()
        expect(res.status).toBe(200)
        expect(appt.paid_amount).toBe(2000 + 8000) // deposit + balance, no tip
        expect(appt.tip_cents).toBe(2000)
        expect(appt.status).toBe('COMPLETED')
        expect(appt.service_paid).toBe(true)
    })

    it('puts the tip in the receipt and the business notification', async () => {
        balancePaid(10000, { tip_cents: '2000' })
        await deliver()
        expect(sendEOAReceipt).toHaveBeenCalledWith(expect.objectContaining({ amountPaid: 10000, tipCents: 2000 }))
        expect(notificationInserts[0].body).toBe('Ada Obi just paid for their Knotless braids appointment and left you a $20.00 tip.')
    })

    it('handles a payment with no tip exactly as before', async () => {
        balancePaid(8000, { tip_cents: '0' })
        await deliver()
        expect(appt.paid_amount).toBe(10000)
        expect(appt.tip_cents).toBe(0)
        expect(sendEOAReceipt).toHaveBeenCalledWith(expect.objectContaining({ amountPaid: 8000, tipCents: 0 }))
        expect(notificationInserts[0].body).toBe('Ada Obi just paid for their Knotless braids appointment.')
    })

    it('handles payments created before tips existed (no tip metadata)', async () => {
        balancePaid(8000, {})
        await deliver()
        expect(appt.paid_amount).toBe(10000)
        expect(appt.tip_cents).toBe(0)
    })

    it('ignores a redelivered event — no double-counted payment, no second receipt', async () => {
        balancePaid(10000, { tip_cents: '2000' })
        await deliver()
        const res = await deliver()
        expect(res.status).toBe(200)
        expect(appt.paid_amount).toBe(10000)
        expect(appt.tip_cents).toBe(2000)
        expect(sendEOAReceipt).toHaveBeenCalledTimes(1)
        expect(notificationInserts).toHaveLength(1)
        expect(notifyLoyalty).toHaveBeenCalledTimes(1)
    })

    it('still records an online payment made after the business marked it paid in cash', async () => {
        Object.assign(appt, { service_paid: true, service_paid_type: 'CASH' })
        balancePaid(10000, { tip_cents: '2000' })
        await deliver()
        expect(appt.service_paid_type).toBe('PLATFORM')
        expect(appt.tip_cents).toBe(2000)
        expect(sendEOAReceipt).toHaveBeenCalledTimes(1)
    })

    it('passes the split amounts to the SQL as parameters', async () => {
        balancePaid(10000, { tip_cents: '2000' })
        await deliver()
        const update = queries.find(q => /UPDATE appointments/.test(q.sql))!
        expect(update.sql).toMatch(/paid_amount = coalesce\(paid_amount, 0\) \+ \$3/)
        expect(update.sql).toMatch(/tip_cents = \$5/)
        expect(update.params).toEqual([true, 'pi_bal', 8000, 'a1', 2000])
    })
})
