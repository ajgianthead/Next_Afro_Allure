// Row-level security check — DEV DATABASE ONLY.
//
// Tries to read and write every app table as (1) an anonymous visitor using
// the public key and (2) a signed-in business reaching for another business's
// data, and confirms a business can still use its own data. Creates two
// throwaway test businesses (rls-test-*@example.com) and deletes them after.
//
//   node scripts/check-rls.mjs
//
// Refuses to run unless .env.local points at the dev Supabase project.

import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const DEV_REF = 'jdhvgwerexngonfufcbl'

for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '')
}
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const SERVICE = process.env.SUPABASE_ROLE_SECRET_KEY
if (new URL(URL_).hostname.split('.')[0] !== DEV_REF) {
    console.error(`Refusing to run: .env.local is not the dev project (${DEV_REF}).`)
    process.exit(1)
}

const opts = { auth: { persistSession: false, autoRefreshToken: false } }
const admin = createClient(URL_, SERVICE, opts)
const anon = createClient(URL_, ANON, opts)

let failures = 0
const results = []
const check = (label, ok, detail = '') => {
    results.push(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`)
    if (!ok) failures++
}
const rowsOf = r => (r.error ? 0 : (r.data?.length ?? 0))

const stamp = Date.now()
const made = { users: [], businesses: [], clients: [] }

async function makeBusiness(tag) {
    const email = `rls-test-${tag}-${stamp}@example.com`
    const password = `Rls-${stamp}-${tag}!x`
    const { data: u, error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { account_type: 'business' },
    })
    if (error) throw error
    made.users.push(u.user.id)
    const { data: b, error: be } = await admin.from('business_users').insert({
        business_name: `RLS Test ${tag} ${stamp}`, user_id: u.user.id, email,
        stripe_acc_id: `acct_rlstest_${tag}`, default_availability: '', url_name: `rls-test-${tag}-${stamp}`,
        account_settings: {},
    }).select().single()
    if (be) throw be
    made.businesses.push(b.business_id)
    const must = (r, what) => { if (r.error || !r.data) throw new Error(`${what}: ${r.error?.message ?? 'no row'}`); return r.data }
    const av = must(await admin.from('availabilities').insert({ business_id: b.business_id, availability_data: {} }).select().single(), 'availability')
    const svc = must(await admin.from('services').insert({
        name: 'Test service', price: 5000, length: 60, business: b.business_id, description: '', availability: av.id,
    }).select().single(), 'service')
    const appt = must(await admin.from('appointments').insert({
        business: b.business_id, start: new Date(Date.now() + 864e5).toISOString(),
        end: new Date(Date.now() + 864e5 + 36e5).toISOString(), status: 'CONFIRMED',
        client_metadata: { firstName: 'Private', lastName: tag, email: `client-${tag}-${stamp}@example.com`, phoneNumber: '5550000000' },
        service_data: svc, require_deposit: false, paid_deposit: false, reschedules: 1, selected_addons: [], amount_due: 5000,
    }).select().single(), 'appointment')
    const client = must(await admin.from('client_users').insert({
        first_name: 'Private', last_name: tag, email: `client-${tag}-${stamp}@example.com`, phone_number: `555${tag}${stamp}`,
    }).select().single(), 'client')
    made.clients.push(client.client_id)
    must(await admin.from('business_clients').insert({ business: b.business_id, client: client.client_id, banned: false }).select().single(), 'clientele link')
    must(await admin.from('notifications').insert({ business_id: b.business_id, title: 't', body: 'private', type: 'test', read: false, appointment_id: appt.id }).select().single(), 'notification')
    must(await admin.from('loyalty_programs').insert({ business_id: b.business_id, enabled: true, visits_required: 1 }).select().single(), 'loyalty program')
    const reward = must(await admin.from('loyalty_rewards').insert({
        business_id: b.business_id, client_id: client.client_id, code: `AA-T${tag.toUpperCase()}${String(stamp).slice(-4)}`, reward_type: 'amount_off', value: 1000,
    }).select().single(), 'loyalty reward')

    const session = createClient(URL_, ANON, opts)
    const { error: le } = await session.auth.signInWithPassword({ email, password })
    if (le) throw le
    return { id: b.business_id, client: session, apptId: appt.id, serviceId: svc.id, clientId: client.client_id, availabilityId: av.id, rewardId: reward.id }
}

const TABLES = [
    'admin_logs', 'appointments', 'availabilities', 'banned_clients', 'booking_sessions', 'business_clients',
    'business_policies', 'business_users', 'client_users', 'client_waitlist', 'feedback', 'image_section',
    'marketplace_profile', 'notifications', 'refunds', 'reviews', 'service_addons', 'services',
    'support_tickets', 'user_feedback', 'web_editors', 'loyalty_programs', 'loyalty_rewards', 'loyalty_ledger',
    'booking_waitlist',
]
const PUBLIC_READ = ['categories', 'subcategories', 'feature_flags']

try {
    const A = await makeBusiness('a')
    const B = await makeBusiness('b')

    // ── 1. Anonymous visitor with the public key ──
    for (const t of TABLES) {
        const r = await anon.from(t).select('*').limit(5)
        check(`anon cannot read ${t}`, rowsOf(r) === 0, r.error?.code ?? `${rowsOf(r)} rows`)
    }
    for (const t of PUBLIC_READ) {
        const r = await anon.from(t).select('*').limit(1)
        check(`anon can read reference table ${t}`, !r.error, r.error?.message)
    }
    const ins = await anon.from('business_users').insert({ business_name: 'x', email: 'x@x.co', user_id: made.users[0] })
    check('anon cannot insert business_users', !!ins.error, ins.error?.code)
    const upd = await anon.from('business_users').update({ email: 'hacked@x.co' }).eq('business_id', A.id).select()
    check('anon cannot update business_users', rowsOf(upd) === 0, upd.error?.code)
    const updAppt = await anon.from('appointments').update({ status: 'CANCELLED' }).eq('id', A.apptId).select()
    check('anon cannot update appointments', rowsOf(updAppt) === 0, updAppt.error?.code)
    const delSvc = await anon.from('services').delete().eq('id', A.serviceId).select()
    check('anon cannot delete services', rowsOf(delSvc) === 0, delSvc.error?.code)
    const insAppt = await anon.from('appointments').insert({ business: A.id, start: new Date().toISOString(), end: new Date().toISOString(), status: 'CONFIRMED' })
    check('anon cannot insert appointments', !!insAppt.error, insAppt.error?.code)

    // ── 2. Business A reaching for business B ──
    const a = A.client
    check('A cannot read B business row', rowsOf(await a.from('business_users').select('*').eq('business_id', B.id)) === 0)
    check('A cannot read B appointments', rowsOf(await a.from('appointments').select('*').eq('business', B.id)) === 0)
    check('A cannot read B clients', rowsOf(await a.from('client_users').select('*').eq('client_id', B.clientId)) === 0)
    check('A cannot read B notifications', rowsOf(await a.from('notifications').select('*').eq('business_id', B.id)) === 0)
    check('A cannot update B business', rowsOf(await a.from('business_users').update({ email: 'hacked@x.co' }).eq('business_id', B.id).select()) === 0)
    check('A cannot update B appointment', rowsOf(await a.from('appointments').update({ status: 'CANCELLED' }).eq('id', B.apptId).select()) === 0)
    check('A cannot delete B service', rowsOf(await a.from('services').delete().eq('id', B.serviceId).select()) === 0)
    const aInsB = await a.from('services').insert({ name: 'x', price: 1, length: 30, business: B.id, description: '', availability: B.availabilityId })
    check('A cannot add a service to B', !!aInsB.error, aInsB.error?.code)
    check('A cannot read B loyalty program', rowsOf(await a.from('loyalty_programs').select('*').eq('business_id', B.id)) === 0)
    check('A cannot read B rewards', rowsOf(await a.from('loyalty_rewards').select('*').eq('business_id', B.id)) === 0)
    const aProgB = await a.from('loyalty_programs').update({ enabled: false }).eq('business_id', B.id).select()
    check('A cannot change B loyalty program', rowsOf(aProgB) === 0, aProgB.error?.code)
    const aMint = await a.from('loyalty_rewards').insert({ business_id: A.id, client_id: A.clientId, code: `AA-HACK${String(stamp).slice(-4)}`, reward_type: 'amount_off', value: 99999 })
    check('A cannot mint its own rewards', !!aMint.error, aMint.error?.code)
    const aReuse = await a.from('loyalty_rewards').update({ status: 'available', value: 99999 }).eq('id', A.rewardId).select()
    check('A cannot edit rewards directly', rowsOf(aReuse) === 0, aReuse.error?.code)
    const aLedger = await a.from('loyalty_ledger').insert({ business_id: A.id, client_id: A.clientId, kind: 'adjust', visits: 100 })
    check('A cannot write the loyalty ledger directly', !!aLedger.error, aLedger.error?.code)
    const aStripe = await a.from('business_users').update({ stripe_acc_id: 'acct_attacker' }).eq('business_id', A.id).select()
    check('A cannot change own stripe_acc_id', !!aStripe.error || rowsOf(aStripe) === 0, aStripe.error?.code)
    const aPlan = await a.from('business_users').update({ plan_type: 'GROWTH', completed_stripe_onboarding: true }).eq('business_id', A.id).select()
    check('A cannot change own plan / onboarding flags', !!aPlan.error || rowsOf(aPlan) === 0, aPlan.error?.code)

    // ── 3. Business A using its own data (must still work) ──
    check('A reads own business row', rowsOf(await a.from('business_users').select('*').eq('business_id', A.id)) === 1)
    check('A reads own appointments', rowsOf(await a.from('appointments').select('*').eq('business', A.id)) === 1)
    check('A reads own client via clientele', rowsOf(await a.from('business_clients').select('client_users!inner(email)').eq('business', A.id)) === 1)
    check('A reads own notifications', rowsOf(await a.from('notifications').select('*').eq('business_id', A.id)) === 1)
    const own = await a.from('business_users').update({ account_settings: { ok: true }, email: `rls-test-a-${stamp}@example.com` }).eq('business_id', A.id).select('account_settings')
    check('A updates own settings/email', rowsOf(own) === 1, own.error?.message)
    const ownAppt = await a.from('appointments').update({ status: 'COMPLETED' }).eq('id', A.apptId).select()
    check('A updates own appointment', rowsOf(ownAppt) === 1, ownAppt.error?.message)
    const ledger = await a.from('loyalty_ledger').select('kind, visits').eq('business_id', A.id)
    check('completing a visit records it in the loyalty ledger', (ledger.data ?? []).some(l => l.kind === 'visit'), ledger.error?.message)
    const earned = await a.from('loyalty_rewards').select('id').eq('business_id', A.id)
    check('A reads own rewards (incl. one just earned)', rowsOf(earned) === 2, earned.error?.message ?? `${rowsOf(earned)} rows`)
    const ownProg = await a.from('loyalty_programs').update({ visits_required: 6 }).eq('business_id', A.id).select()
    check('A updates own loyalty program', rowsOf(ownProg) === 1, ownProg.error?.message)
    const ownSvc = await a.from('services').insert({ name: 'Mine', price: 1, length: 30, business: A.id, description: '', availability: A.availabilityId }).select()
    check('A adds own service', rowsOf(ownSvc) === 1, ownSvc.error?.message)
    const rpc = await a.rpc('get_revenue_overview', { p_business_id: B.id })
    check("A's analytics RPC sees nothing of B", !rpc.error && Number(rpc.data?.[0]?.total_this_month ?? 0) === 0, rpc.error?.message)
} catch (e) {
    check('test setup', false, e.message)
} finally {
    for (const id of made.businesses) {
        for (const [t, col] of [['notifications', 'business_id'], ['business_clients', 'business'], ['appointments', 'business'], ['services', 'business'], ['availabilities', 'business_id']]) {
            await admin.from(t).delete().eq(col, id)
        }
        await admin.from('business_users').delete().eq('business_id', id)
    }
    for (const id of made.clients) await admin.from('client_users').delete().eq('client_id', id)
    for (const id of made.users) await admin.auth.admin.deleteUser(id)
}

console.log(results.join('\n'))
console.log(`\n${results.length - failures} passed, ${failures} failed`)
process.exit(failures ? 1 : 0)
