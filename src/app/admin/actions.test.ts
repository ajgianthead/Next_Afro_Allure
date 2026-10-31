import { beforeEach, describe, expect, it, vi } from 'vitest'

// Who's signed in for each test, and what the admin actions tried to do.
let signedInEmail: string | null = null
const sent: unknown[] = []
const writes: unknown[] = []

vi.mock('@/app/utils/supabase/server', () => ({
    createClient: async () => ({
        auth: { getUser: async () => ({ data: { user: signedInEmail ? { email: signedInEmail } : null } }) },
    }),
}))

vi.mock('@/app/utils/supabase/admin', () => ({
    createAdminClient: () => {
        const chain: any = {
            select: () => chain,
            eq: () => chain,
            single: async () => ({ data: { email: 'client@example.com', business_name: 'Biz', subject: 'Help' } }),
            update: (row: unknown) => { writes.push(row); return chain },
            then: (resolve: (v: unknown) => void) => resolve({ error: null }),
        }
        return { from: () => chain }
    },
}))

vi.mock('resend', () => ({
    Resend: class { emails = { send: async (msg: unknown) => { sent.push(msg); return { data: { id: 'x' } } } } },
}))

const actions = await import('./actions')

const calls = {
    replyToTicket: () => actions.replyToTicket('t1', 'Click here to verify your account'),
    sendAtRiskEmail: () => actions.sendAtRiskEmail('b1'),
    updateFeedbackStatus: () => actions.updateFeedbackStatus('f1', 'resolved', 'note'),
    updateTicketPriority: () => actions.updateTicketPriority('t1', 'high'),
    updateTicketStatus: () => actions.updateTicketStatus('t1', 'closed'),
}

describe('admin actions', () => {
    beforeEach(() => {
        process.env.FOUNDER_EMAIL = 'founder@afroallure.co'
        sent.length = 0
        writes.length = 0
    })

    for (const [name, call] of Object.entries(calls)) {
        it(`${name} refuses anyone who isn't signed in`, async () => {
            signedInEmail = null
            expect(await call()).toEqual({ error: 'Not allowed.' })
            expect(sent).toHaveLength(0)
            expect(writes).toHaveLength(0)
        })
        it(`${name} refuses a signed-in business that isn't the founder`, async () => {
            signedInEmail = 'someone@example.com'
            expect(await call()).toEqual({ error: 'Not allowed.' })
            expect(sent).toHaveLength(0)
            expect(writes).toHaveLength(0)
        })
    }

    it('refuses everyone when FOUNDER_EMAIL is not set', async () => {
        delete process.env.FOUNDER_EMAIL
        signedInEmail = 'founder@afroallure.co'
        expect(await calls.replyToTicket()).toEqual({ error: 'Not allowed.' })
        expect(sent).toHaveLength(0)
    })

    it('lets the founder reply (any letter case)', async () => {
        signedInEmail = 'Founder@AfroAllure.co'
        expect(await calls.replyToTicket()).toEqual({ success: true })
        expect(sent).toHaveLength(1)
    })
})
