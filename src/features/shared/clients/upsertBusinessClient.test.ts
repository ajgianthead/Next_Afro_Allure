import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/utils/supabase/admin', () => ({ createAdminClient: () => { throw new Error('not used') } }))
import { upsertBusinessClient } from './upsertBusinessClient'

type Row = Record<string, any>

/** Just enough of the Supabase query builder for upsertBusinessClient, over in-memory tables. */
function fakeDb(tables: Record<string, Row[]>) {
    const from = (table: string) => {
        const rows = () => (tables[table] ??= [])
        const filters: ((r: Row) => boolean)[] = []
        let patch: Row | null = null
        let inserted: Row | null = null
        const q: any = {
            select: () => q,
            ilike: (col: string, pattern: string) => { const v = pattern.replace(/\\(.)/g, '$1').toLowerCase(); filters.push(r => String(r[col]).toLowerCase() === v); return q },
            eq: (col: string, v: unknown) => { filters.push(r => r[col] === v); return q },
            limit: () => q,
            insert: (row: Row) => { inserted = { client_id: `c${rows().length + 1}`, id: `l${rows().length + 1}`, ...row }; rows().push(inserted); return q },
            update: (p: Row) => { patch = p; return q },
            single: () => Promise.resolve({ data: inserted, error: null }),
            then: (resolve: (v: unknown) => unknown) => {
                const matched = rows().filter(r => filters.every(f => f(r)))
                if (patch) matched.forEach(r => Object.assign(r, patch))
                return Promise.resolve({ data: inserted ? [inserted] : matched, error: null }).then(resolve)
            },
        }
        return q
    }
    return { from } as any
}

const BIZ = 'biz-1'
const brianna = () => ({ client_users: [{ client_id: 'c1', first_name: 'Bri', last_name: 'Smith', email: 'bri@example.com', phone_number: '4045550100' }], business_clients: [], banned_clients: [] as Row[] })

describe('upsertBusinessClient: names', () => {
    it('updates the name when the same email books with a new one', async () => {
        const t = brianna()
        const res = await upsertBusinessClient(fakeDb(t), { first_name: 'Brianna', last_name: 'Jones', email: 'BRI@example.com', phone_number: '' }, BIZ)
        expect(res).toMatchObject({ ok: true, clientId: 'c1', created: false })
        expect(t.client_users[0]).toMatchObject({ first_name: 'Brianna', last_name: 'Jones' })
    })

    it('leaves the name alone on a phone-only match (could be a family member)', async () => {
        const t = brianna()
        await upsertBusinessClient(fakeDb(t), { first_name: 'Maya', last_name: 'Smith', email: 'maya@example.com', phone_number: '4045550100' }, BIZ)
        expect(t.client_users[0]).toMatchObject({ first_name: 'Bri', last_name: 'Smith' })
    })

    it('leaves the name alone on CSV import', async () => {
        const t = brianna()
        await upsertBusinessClient(fakeDb(t), { first_name: 'Brianna', last_name: 'Jones', email: 'bri@example.com', phone_number: '' }, BIZ, { updateName: false })
        expect(t.client_users[0]).toMatchObject({ first_name: 'Bri', last_name: 'Smith' })
    })

    it('does not rename a banned client', async () => {
        const t = brianna()
        t.banned_clients.push({ id: 'b1', business_id: BIZ, client_id: 'c1' })
        const res = await upsertBusinessClient(fakeDb(t), { first_name: 'Brianna', last_name: 'Jones', email: 'bri@example.com', phone_number: '' }, BIZ)
        expect(res).toMatchObject({ ok: false, reason: 'banned' })
        expect(t.client_users[0]).toMatchObject({ first_name: 'Bri' })
    })

    it('needs both names before renaming', async () => {
        const t = brianna()
        await upsertBusinessClient(fakeDb(t), { first_name: 'Brianna', last_name: '', email: 'bri@example.com', phone_number: '' }, BIZ)
        expect(t.client_users[0]).toMatchObject({ first_name: 'Bri', last_name: 'Smith' })
    })
})
