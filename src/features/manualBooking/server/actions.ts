'use server'

import { CreateAppointmentPayload } from "../types"
import { cancelAppointment, confirmAppointment, createNewManualAppointment, rescheduleAppointment, sendConfirmationLink, sendPaymentLink } from "./domain"

// Server actions return { ok, data | error } instead of throwing: in
// production Next.js replaces thrown error messages with a generic one, so
// the validation messages never reached the business.
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

async function run<T>(fn: () => Promise<T>, fallback: string): Promise<ActionResult<T>> {
    try {
        return { ok: true, data: await fn() }
    } catch (err: any) {
        console.error(fallback, err)
        return { ok: false, error: err?.message || fallback }
    }
}

export const createManualAppointmentAction = async (data: CreateAppointmentPayload) =>
    run(() => createNewManualAppointment(data), 'Failed to create appointment. Please try again.')

export const rescheduleAppointmentAction = async (data: { appointmentId: string; startISO: string; endISO: string }) =>
    run(() => rescheduleAppointment(data), 'Failed to reschedule. Please try again.')

export const confirmAppointmentAction = async (appointmentId: string, depositChargeId: string) =>
    run(() => confirmAppointment(appointmentId, depositChargeId), 'Failed to confirm appointment.')

export const cancelAppointmentAction = async (appointmentId: string) =>
    run(() => cancelAppointment(appointmentId), 'Failed to cancel appointment.')

export const sendConfirmationLinkAction = async (appointmentId: string) =>
    run(() => sendConfirmationLink(appointmentId), 'Failed to send link.')

export const sendPaymentLinkAction = async (appointmentId: string) =>
    run(() => sendPaymentLink(appointmentId), 'Failed to send payment link.')
