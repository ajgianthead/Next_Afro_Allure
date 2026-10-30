// When an appointment's balance can be paid online (payment link / QR code).
// Pure — used by the payment page, checkout actions and the dashboard.

import { remainingBalance } from '@/features/services/pricing'

/**
 * Statuses where the client can still pay. NO_SHOW and INCOMPLETE are
 * included because the system sets them automatically 15–30 minutes after
 * an unpaid appointment ends — a client paying a little late (or scanning the
 * QR code at checkout) must still be able to. Paying marks it COMPLETED.
 */
export const BALANCE_PAYABLE_STATUSES = ['CONFIRMED', 'NO_SHOW', 'INCOMPLETE'] as const

export function canPayBalance(appt: {
    status: string | null
    service_paid?: boolean | null
    amount_due: number
    deposit_price?: number | null
    paid_deposit?: boolean | null
    substraction?: boolean | null
}): boolean {
    if (appt.service_paid) return false
    if (!BALANCE_PAYABLE_STATUSES.includes(appt.status as any)) return false
    return remainingBalance(appt) >= 50
}

/**
 * The in-person payment QR the business shows a client: only for a confirmed
 * appointment that still owes money. (A payment link sent later can also
 * cover no-shows and incomplete appointments — see canPayBalance.)
 */
export function canShowPaymentQr(appt: Parameters<typeof canPayBalance>[0]): boolean {
    return appt.status === 'CONFIRMED' && canPayBalance(appt)
}
