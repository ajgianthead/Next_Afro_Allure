import { createAdminClient } from '@/app/utils/supabase/admin'
import { normalizeReferralCode } from '../referrals'

export interface AttributionResult {
    status: 'attributed' | 'skipped'
    /** Why it was skipped: invalid_code, self_referral, not_new, duplicate, disabled, plan, … */
    reason?: string
    discountCents: number
}

const SKIPPED: AttributionResult = { status: 'skipped', reason: 'no_code', discountCents: 0 }

function parse(raw: any): AttributionResult {
    if (!raw || typeof raw !== 'object') return { ...SKIPPED, reason: 'error' }
    return { status: raw.status === 'attributed' ? 'attributed' : 'skipped', reason: raw.reason, discountCents: Number(raw.discount_cents ?? 0) || 0 }
}

/**
 * Records a referral for a booking that was just created and applies the
 * friend's discount. All checks (new client, no self-referral, one referral
 * per person, program on, Growth plan) run in the database function
 * referral_attribute. Not a server action: only booking code calls this.
 *
 * Pass `pg` (a client inside the booking's own transaction) so the referral
 * commits or rolls back with the appointment; without it the service role is used.
 */
export async function attributeReferral(
    appointmentId: string,
    code: string | null | undefined,
    pg?: { query: (sql: string, params: unknown[]) => Promise<{ rows: any[] }> },
): Promise<AttributionResult> {
    const normalized = normalizeReferralCode(code)
    if (!normalized) return SKIPPED
    try {
        if (pg) {
            // A savepoint, so a failure here can't abort the booking's transaction.
            await pg.query('savepoint referral_attribution', [])
            try {
                const { rows } = await pg.query('select public.referral_attribute($1, $2) as result', [appointmentId, normalized])
                await pg.query('release savepoint referral_attribution', [])
                return parse(rows[0]?.result)
            } catch (err) {
                await pg.query('rollback to savepoint referral_attribution', []).catch(() => { })
                throw err
            }
        }
        const { data, error } = await createAdminClient().rpc('referral_attribute', { p_appointment: appointmentId, p_code: normalized })
        if (error) throw error
        return parse(data)
    } catch (err: any) {
        // A referral problem must never cost the business the booking.
        console.error('Referral attribution failed:', err?.message)
        return { ...SKIPPED, reason: 'error' }
    }
}
