'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { requireOwnBusinessId } from '@/lib/auth/requireBusinessOwner'
import { effectivePlanType } from '@/lib/beta'
import { getBusinessPermissions } from '@/lib/permissions'
import { remainingBalance } from '@/features/services/pricing'
import {
    isRewardUsable, normalizeRewardCode, programFromRow, programProblems, programToRow, progressFor,
    rewardDiscountCents, rewardFromRow, type LoyaltyProgram, type LoyaltyReward, type Progress,
} from '../loyalty'

// Every action here is a public endpoint: each one works out the caller's own
// business from their session and only touches rows that belong to it. Writes
// go through the service role because rewards and the ledger aren't writable
// by businesses directly (so nobody can mint rewards from the browser).

/** Appointments that can't take a reward any more. */
const CLOSED_STATUSES = ['CANCELLED', 'COMPLETED', 'NO_SHOW', 'DENIED', 'REFUNDED']

type Result<T = {}> = ({ ok: true } & T) | { ok: false; error: string }
type Admin = ReturnType<typeof createAdminClient>

async function ownBusiness(): Promise<string | null> {
    try { return await requireOwnBusinessId() } catch { return null }
}

async function loyaltyAllowed(supabase: Admin, businessId: string): Promise<boolean> {
    const { data } = await supabase.from('business_users').select('plan_type').eq('business_id', businessId).maybeSingle()
    return getBusinessPermissions(effectivePlanType(data?.plan_type as any)).canUseLoyalty
}

async function loadProgram(supabase: Admin, businessId: string): Promise<LoyaltyProgram> {
    const { data } = await supabase.from('loyalty_programs').select('*').eq('business_id', businessId).maybeSingle()
    return programFromRow(data)
}

/** The client a booking belongs to — matched the same way the database trigger does. */
async function clientIdFor(supabase: Admin, metadata: any): Promise<string | null> {
    const email = String(metadata?.email ?? '').trim().toLowerCase()
    const phone = String(metadata?.phoneNumber ?? '').trim()
    if (email) {
        const pattern = email.replace(/[\\%_]/g, c => `\\${c}`)
        const { data } = await supabase.from('client_users').select('client_id').ilike('email', pattern).limit(1)
        if (data?.[0]) return data[0].client_id
    }
    if (phone) {
        const { data } = await supabase.from('client_users').select('client_id').eq('phone_number', phone).limit(1)
        if (data?.[0]) return data[0].client_id
    }
    return null
}

async function isOwnClient(supabase: Admin, businessId: string, clientId: string): Promise<boolean> {
    const { data } = await supabase.from('business_clients').select('id').eq('business', businessId).eq('client', clientId).limit(1)
    if (data?.length) return true
    // Clients who only show up through the loyalty ledger (e.g. links removed later).
    const { data: ledger } = await supabase.from('loyalty_ledger').select('id').eq('business_id', businessId).eq('client_id', clientId).limit(1)
    return !!ledger?.length
}

// ─── Dashboard overview ─────────────────────────────────────────────────────

export interface LoyaltyMember {
    clientId: string
    name: string
    email: string
    phone: string
    /** Lifetime completed visits counted by the program. */
    visits: number
    /** Lifetime spend counted (cents). */
    spendCents: number
    progress: Progress
    rewards: LoyaltyReward[]
    lastVisit: string | null
}

export interface LoyaltyOverview {
    program: LoyaltyProgram
    allowed: boolean
    members: LoyaltyMember[]
    stats: { members: number; rewardsIssued: number; rewardsRedeemed: number; discountGivenCents: number; returningVisits: number }
}

export async function getLoyaltyOverview(): Promise<Result<{ overview: LoyaltyOverview }>> {
    const businessId = await ownBusiness()
    if (!businessId) return { ok: false, error: 'Please sign in again.' }
    const supabase = createAdminClient()

    const [program, allowed, ledgerRes, rewardsRes] = await Promise.all([
        loadProgram(supabase, businessId),
        loyaltyAllowed(supabase, businessId),
        supabase.from('loyalty_ledger').select('client_id, kind, visits, spend_cents, created_at').eq('business_id', businessId),
        supabase.from('loyalty_rewards').select('*').eq('business_id', businessId).order('issued_at', { ascending: false }),
    ])
    if (ledgerRes.error || rewardsRes.error) return { ok: false, error: 'Could not load your rewards. Please refresh.' }

    const byClient = new Map<string, { bankVisits: number; bankSpend: number; visits: number; spend: number; lastVisit: string | null; rewards: LoyaltyReward[] }>()
    const entry = (id: string) => {
        if (!byClient.has(id)) byClient.set(id, { bankVisits: 0, bankSpend: 0, visits: 0, spend: 0, lastVisit: null, rewards: [] })
        return byClient.get(id)!
    }
    let returningVisits = 0
    for (const row of ledgerRes.data ?? []) {
        const e = entry(row.client_id)
        e.bankVisits += Number(row.visits ?? 0)
        e.bankSpend += Number(row.spend_cents ?? 0)
        if (row.kind === 'visit') {
            e.visits += 1
            e.spend += Number(row.spend_cents ?? 0)
            if (!e.lastVisit || row.created_at > e.lastVisit) e.lastVisit = row.created_at
        }
    }
    for (const e of byClient.values()) if (e.visits > 1) returningVisits += e.visits - 1

    let rewardsRedeemed = 0
    let discountGivenCents = 0
    for (const row of rewardsRes.data ?? []) {
        const reward = rewardFromRow(row)
        // Expired rewards read as expired even before a cleanup job marks them.
        if (reward.status === 'available' && !isRewardUsable(reward)) reward.status = 'expired'
        entry(row.client_id).rewards.push(reward)
        if (reward.status === 'used') {
            rewardsRedeemed += 1
            discountGivenCents += reward.usedAmountCents ?? 0
        }
    }

    const ids = [...byClient.keys()]
    const clients = new Map<string, any>()
    for (let i = 0; i < ids.length; i += 200) {
        const { data } = await supabase.from('client_users').select('client_id, first_name, last_name, email, phone_number').in('client_id', ids.slice(i, i + 200))
        for (const c of data ?? []) clients.set(c.client_id, c)
    }

    const members: LoyaltyMember[] = ids.map(id => {
        const e = byClient.get(id)!
        const c = clients.get(id)
        return {
            clientId: id,
            name: c ? `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || c.email : 'Client',
            email: c?.email ?? '',
            phone: c?.phone_number ?? '',
            visits: e.visits,
            spendCents: e.spend,
            progress: progressFor(program, { visits: e.bankVisits, spendCents: e.bankSpend }),
            rewards: e.rewards,
            lastVisit: e.lastVisit,
        }
    }).sort((a, b) => (b.lastVisit ?? '').localeCompare(a.lastVisit ?? ''))

    return {
        ok: true,
        overview: {
            program,
            allowed,
            members,
            stats: {
                members: members.length,
                rewardsIssued: (rewardsRes.data ?? []).length,
                rewardsRedeemed,
                discountGivenCents,
                returningVisits,
            },
        },
    }
}

// ─── Settings ───────────────────────────────────────────────────────────────

export async function saveLoyaltyProgram(input: LoyaltyProgram): Promise<Result<{ program: LoyaltyProgram }>> {
    const businessId = await ownBusiness()
    if (!businessId) return { ok: false, error: 'Please sign in again.' }
    const program = programFromRow(programToRow(input))
    const problems = programProblems(program)
    if (problems.length) return { ok: false, error: problems[0] }

    const supabase = createAdminClient()
    if (program.enabled && !(await loyaltyAllowed(supabase, businessId)))
        return { ok: false, error: 'Rewards are part of the Growth plan.' }

    const { error } = await supabase
        .from('loyalty_programs')
        .upsert({ business_id: businessId, ...programToRow(program), updated_at: new Date().toISOString() })
    if (error) return { ok: false, error: 'Could not save your rewards settings.' }
    revalidatePath('/dashboard/rewards')
    return { ok: true, program }
}

// ─── Per-client changes ─────────────────────────────────────────────────────

/** Adds (or removes, if negative) visits — or dollars for spend programs — by hand. */
export async function adjustLoyaltyProgress(clientId: string, amount: number, note: string): Promise<Result> {
    const businessId = await ownBusiness()
    if (!businessId) return { ok: false, error: 'Please sign in again.' }
    if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 100000) return { ok: false, error: 'Enter a whole number.' }
    const supabase = createAdminClient()
    if (!(await isOwnClient(supabase, businessId, clientId))) return { ok: false, error: 'Client not found.' }
    const program = await loadProgram(supabase, businessId)

    const { error } = await supabase.from('loyalty_ledger').insert({
        business_id: businessId,
        client_id: clientId,
        kind: 'adjust',
        visits: program.earnType === 'visits' ? amount : 0,
        spend_cents: program.earnType === 'spend' ? amount * 100 : 0,
        note: note.trim().slice(0, 200) || 'Adjusted by business',
    })
    if (error) return { ok: false, error: 'Could not update progress.' }
    await supabase.rpc('loyalty_issue_rewards' as any, { p_business: businessId, p_client: clientId } as any)
    revalidatePath('/dashboard/rewards')
    return { ok: true }
}

/** Gives a client a reward now (a thank-you, a make-good, a birthday). */
export async function giveReward(clientId: string): Promise<Result<{ reward: LoyaltyReward }>> {
    const businessId = await ownBusiness()
    if (!businessId) return { ok: false, error: 'Please sign in again.' }
    const supabase = createAdminClient()
    if (!(await isOwnClient(supabase, businessId, clientId))) return { ok: false, error: 'Client not found.' }
    const program = await loadProgram(supabase, businessId)

    for (let attempt = 0; attempt < 5; attempt++) {
        const { data: code } = await supabase.rpc('loyalty_new_code' as any)
        if (typeof code !== 'string') break
        const { data, error } = await supabase.from('loyalty_rewards').insert({
            business_id: businessId,
            client_id: clientId,
            code,
            reward_type: program.rewardType,
            value: program.rewardValue,
            source: 'manual',
            expires_at: program.rewardExpiryDays ? new Date(Date.now() + program.rewardExpiryDays * 86400000).toISOString() : null,
        }).select('*').single()
        if (!error && data) {
            revalidatePath('/dashboard/rewards')
            return { ok: true, reward: rewardFromRow(data) }
        }
        if (error?.code !== '23505') break // retry only on a code collision
    }
    return { ok: false, error: 'Could not create the reward.' }
}

export async function voidReward(rewardId: string): Promise<Result> {
    const businessId = await ownBusiness()
    if (!businessId) return { ok: false, error: 'Please sign in again.' }
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('loyalty_rewards')
        .update({ status: 'void' })
        .eq('id', rewardId)
        .eq('business_id', businessId)
        .eq('status', 'available')
        .select('id')
    if (error || !data?.length) return { ok: false, error: 'That reward can no longer be cancelled.' }
    revalidatePath('/dashboard/rewards')
    return { ok: true }
}

// ─── Appointments ───────────────────────────────────────────────────────────

export interface AppointmentLoyalty {
    enabled: boolean
    program: LoyaltyProgram
    clientId: string | null
    progress: Progress | null
    available: LoyaltyReward[]
    applied: { reward: LoyaltyReward; discountCents: number } | null
    /** Whether a reward can still be applied (unpaid, not cancelled). */
    canApply: boolean
}

export async function getAppointmentLoyalty(appointmentId: string): Promise<Result<{ loyalty: AppointmentLoyalty }>> {
    const businessId = await ownBusiness()
    if (!businessId) return { ok: false, error: 'Please sign in again.' }
    const supabase = createAdminClient()
    const { data: appt } = await supabase
        .from('appointments')
        .select('id, business, status, client_metadata, service_paid, loyalty_reward_id, discount_cents')
        .eq('id', appointmentId)
        .eq('business', businessId)
        .maybeSingle()
    if (!appt) return { ok: false, error: 'Appointment not found.' }

    const program = await loadProgram(supabase, businessId)
    const clientId = await clientIdFor(supabase, appt.client_metadata)

    let applied: AppointmentLoyalty['applied'] = null
    if (appt.loyalty_reward_id) {
        const { data } = await supabase.from('loyalty_rewards').select('*').eq('id', appt.loyalty_reward_id).maybeSingle()
        if (data) applied = { reward: rewardFromRow(data), discountCents: Number(appt.discount_cents ?? 0) }
    }

    let progress: Progress | null = null
    let available: LoyaltyReward[] = []
    if (clientId) {
        const [ledger, rewards] = await Promise.all([
            supabase.from('loyalty_ledger').select('visits, spend_cents').eq('business_id', businessId).eq('client_id', clientId),
            supabase.from('loyalty_rewards').select('*').eq('business_id', businessId).eq('client_id', clientId).eq('status', 'available'),
        ])
        const bank = (ledger.data ?? []).reduce(
            (acc, r: any) => ({ visits: acc.visits + Number(r.visits ?? 0), spendCents: acc.spendCents + Number(r.spend_cents ?? 0) }),
            { visits: 0, spendCents: 0 }
        )
        progress = progressFor(program, bank)
        available = (rewards.data ?? []).map(rewardFromRow).filter(r => isRewardUsable(r))
    }

    return {
        ok: true,
        loyalty: {
            enabled: program.enabled,
            program,
            clientId,
            progress,
            available,
            applied,
            canApply: !appt.service_paid && !CLOSED_STATUSES.includes(appt.status as string),
        },
    }
}

/**
 * Takes a reward off an appointment's balance. Accepts the reward's id (from
 * the client's list) or a code the client gave. The reward is claimed first,
 * so it can't be used on two appointments at once.
 */
export async function applyRewardToAppointment(appointmentId: string, reward: { id?: string; code?: string }): Promise<Result<{ discountCents: number }>> {
    const businessId = await ownBusiness()
    if (!businessId) return { ok: false, error: 'Please sign in again.' }
    const supabase = createAdminClient()

    const { data: appt } = await supabase
        .from('appointments')
        .select('id, status, amount_due, deposit_price, paid_deposit, substraction, service_paid, loyalty_reward_id')
        .eq('id', appointmentId)
        .eq('business', businessId)
        .maybeSingle()
    if (!appt) return { ok: false, error: 'Appointment not found.' }
    if (appt.loyalty_reward_id) return { ok: false, error: 'A reward is already applied to this appointment.' }
    if (appt.service_paid || CLOSED_STATUSES.includes(appt.status as string))
        return { ok: false, error: 'Rewards can only be applied before the appointment is paid.' }

    let query = supabase.from('loyalty_rewards').select('*').eq('business_id', businessId)
    if (reward.id) query = query.eq('id', reward.id)
    else if (reward.code?.trim()) query = query.eq('code', normalizeRewardCode(reward.code))
    else return { ok: false, error: 'Choose a reward or enter a code.' }
    const { data: row } = await query.maybeSingle()
    if (!row) return { ok: false, error: "That code doesn't match a reward for your business." }
    const found = rewardFromRow(row)
    if (!isRewardUsable(found)) return { ok: false, error: found.status === 'used' ? 'That reward was already used.' : 'That reward has expired.' }

    // Percent rewards are taken off the full price; never more than what's left to pay.
    const balance = remainingBalance(appt as any)
    const fullPrice = Number(appt.amount_due ?? 0) + (appt.paid_deposit && appt.substraction ? Number(appt.deposit_price ?? 0) : 0)
    const discount = Math.min(balance, rewardDiscountCents(found, fullPrice))
    if (discount <= 0) return { ok: false, error: 'There is no balance left to discount.' }

    const now = new Date().toISOString()
    const { data: claimed } = await supabase
        .from('loyalty_rewards')
        .update({ status: 'used', used_at: now, used_appointment_id: appointmentId, used_amount_cents: discount })
        .eq('id', found.id)
        .eq('status', 'available')
        .select('id')
    if (!claimed?.length) return { ok: false, error: 'That reward was just used.' }

    const { data: updated, error } = await supabase
        .from('appointments')
        .update({ amount_due: Number(appt.amount_due) - discount, loyalty_reward_id: found.id, discount_cents: discount })
        .eq('id', appointmentId)
        .is('loyalty_reward_id', null)
        .eq('amount_due', appt.amount_due)
        .select('id')
    if (error || !updated?.length) {
        await supabase.from('loyalty_rewards')
            .update({ status: 'available', used_at: null, used_appointment_id: null, used_amount_cents: null })
            .eq('id', found.id)
        return { ok: false, error: 'The appointment changed — please try again.' }
    }

    const { data: client } = await supabase.from('loyalty_rewards').select('client_id').eq('id', found.id).single()
    if (client) {
        await supabase.from('loyalty_ledger').insert({
            business_id: businessId, client_id: client.client_id, appointment_id: appointmentId,
            kind: 'redeem', reward_id: found.id, note: `Used ${found.code}`,
        })
    }
    revalidatePath('/dashboard/appointments')
    return { ok: true, discountCents: discount }
}

/** Undoes an applied reward (before the appointment is paid) and gives it back to the client. */
export async function removeRewardFromAppointment(appointmentId: string): Promise<Result> {
    const businessId = await ownBusiness()
    if (!businessId) return { ok: false, error: 'Please sign in again.' }
    const supabase = createAdminClient()
    const { data: appt } = await supabase
        .from('appointments')
        .select('id, amount_due, service_paid, loyalty_reward_id, discount_cents')
        .eq('id', appointmentId)
        .eq('business', businessId)
        .maybeSingle()
    if (!appt?.loyalty_reward_id) return { ok: false, error: 'No reward is applied.' }
    if (appt.service_paid) return { ok: false, error: 'This appointment is already paid.' }

    const { data: updated } = await supabase
        .from('appointments')
        .update({ amount_due: Number(appt.amount_due) + Number(appt.discount_cents ?? 0), loyalty_reward_id: null, discount_cents: 0 })
        .eq('id', appointmentId)
        .eq('loyalty_reward_id', appt.loyalty_reward_id)
        .select('id')
    if (!updated?.length) return { ok: false, error: 'The appointment changed — please try again.' }

    await supabase.from('loyalty_rewards')
        .update({ status: 'available', used_at: null, used_appointment_id: null, used_amount_cents: null })
        .eq('id', appt.loyalty_reward_id)
        .eq('business_id', businessId)
    await supabase.from('loyalty_ledger').delete()
        .eq('appointment_id', appointmentId).eq('kind', 'redeem').eq('reward_id', appt.loyalty_reward_id)
    revalidatePath('/dashboard/appointments')
    return { ok: true }
}
