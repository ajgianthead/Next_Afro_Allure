import { Database } from "../../../lib/database.types";

export type RefundRow = Database['public']['Tables']['refunds']['Row']
export type RefundChargeType = RefundRow['charge_type']
export type RefundRowStatus = RefundRow['status']
export type AppointmentRefundStatus = Database['public']['Enums']['refund_status']

/** What the business chose to refund in the dialog. */
export type RefundScope = 'DEPOSIT' | 'FULL' | 'CUSTOM'

export const REFUND_REASONS = [
    { value: 'requested_by_customer', label: 'Requested by client' },
    { value: 'business_cancelled', label: 'I cancelled the appointment' },
    { value: 'service_issue', label: 'Issue with the service' },
    { value: 'duplicate', label: 'Duplicate payment' },
    { value: 'other', label: 'Other' },
] as const

export type RefundReason = typeof REFUND_REASONS[number]['value']

export const REFUND_NOTE_MAX_LENGTH = 500

export interface RefundRecord {
    id: string
    chargeType: RefundChargeType
    amount: number
    status: RefundRowStatus
    reason: string | null
    note: string | null
    failureReason: string | null
    createdAt: string
}

export interface RefundSummary {
    clientName: string
    /** Amounts in cents still refundable on each Stripe payment. */
    depositRefundable: number
    serviceRefundable: number
    totalRefundable: number
    /** Successful + in-flight refunds already recorded for the appointment. */
    totalRefunded: number
    /** Balance paid in cash — can't be refunded through Stripe. */
    cashPaid: number
    /** A payment is under dispute, so Stripe won't allow refunding it. */
    disputed: boolean
    /** Whether the "also cancel this appointment" option applies. */
    canCancel: boolean
    refunds: RefundRecord[]
}

export interface IssueRefundInput {
    appointmentId: string
    scope: RefundScope
    /** Cents; only used when scope is CUSTOM. */
    amount?: number
    reason: RefundReason
    note?: string
    cancelAppointment: boolean
    /**
     * Generated once per refund attempt in the browser and turned into the
     * Stripe idempotency key, so a double-submit or retried request can never
     * refund the client twice.
     */
    requestId: string
}

export type IssueRefundResult =
    | {
        ok: true
        refundedNow: number
        pending: boolean
        refundStatus: AppointmentRefundStatus
        refundedAmount: number
        status: Database['public']['Enums']['status']
        amountDue: number
        cancelled: boolean
        warning?: string
    }
    | { ok: false; error: string }

export function toRefundRecord(row: RefundRow): RefundRecord {
    return {
        id: row.id,
        chargeType: row.charge_type,
        amount: row.amount,
        status: row.status,
        reason: row.reason,
        note: row.note,
        failureReason: row.failure_reason,
        createdAt: row.created_at,
    }
}
