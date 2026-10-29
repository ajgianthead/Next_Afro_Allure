'use server'
import pool from "@/app/utils/dbPool";
import type { PoolClient } from "pg";
import { DateTime } from "luxon";
import { after } from "next/server";
import { Resend } from "resend";
import AppointmentRescheduled from "../../../../emails/appointment-rescheduled";
import RescheduledAppointment from "../../../../emails/rescheduled-appointment";
import { createAdminClient } from '@/app/utils/supabase/admin'
import { assignAddons } from "app/api/util/transformServices";
import { trackAppointmentRescheduled } from "../../../../lib/analytics";
import { NotificationType } from "@/lib/notifications/Notification";
import { formatBusinessAddress } from "@/lib/appointmentEmails/AppointmentEmails";
import { scheduleAndStoreReminders } from "@/features/shared/appointments/confirmation";
import { resolveTimezone, toZonedISO } from "@/lib/timezone";
import { isBookableStart } from "@/features/availability/slots";
import { AppointmentReminders } from "@/features/shared/appointments/AppointmentReminders";
import { quoteFromDb } from "@/features/services/server/quote";
import { calculateDeposit, parsePrep, QuoteError, type StyleSelection } from "@/features/services/pricing";
import { stripe } from "@/lib/stripe/stripeClient";
import { attributeReferral } from '@/features/referrals/server/attribute'
import { applyRewardCore } from '@/features/loyalty/server/applyReward'

const resend = new Resend(process.env.RESEND_API_KEY);

export const fetchBusinessPolicies = async (policyId: string) => {
    const supabase = createAdminClient();
    const { data: policy, error } = await supabase.from('business_policies').select('*').eq('id', policyId).single()
    return policy
}


const SLOT_TAKEN = 'This time slot is no longer available. Please select another time.'

// Whether `start` is one of the times the booking/reschedule page offers for
// this schedule — same rules, read in the business's own timezone (never the
// browser's). Only appointments near that time are loaded.
async function isSlotOpen(client: PoolClient, opts: {
    businessId: string
    availability: any
    start: string
    durationMinutes: number
    /** The appointment being moved, so it doesn't block itself. */
    excludeAppointmentId?: string
}): Promise<boolean> {
    const start = DateTime.fromISO(opts.start, { setZone: true })
    if (!start.isValid) return false
    const { rows: [biz] } = await client.query(`SELECT account_settings FROM business_users WHERE business_id = $1`, [opts.businessId])
    const tz = resolveTimezone(biz?.account_settings?.timezone)
    const { rows: busy } = await client.query(
        `SELECT start, "end" FROM appointments
         WHERE business = $1 AND status != 'CANCELLED' AND "end" > $2 AND start < $3
           AND ($4::text IS NULL OR id::text <> $4)`,
        [opts.businessId, start.minus({ days: 2 }).toISO(), start.plus({ minutes: opts.durationMinutes, days: 2 }).toISO(), opts.excludeAppointmentId ?? null]
    )
    return isBookableStart({ schedule: opts.availability, busy, tz, durationMinutes: opts.durationMinutes, start: opts.start })
}

/** A race lost to another booking hits the no_overlapping_bookings rule; tell the client plainly. */
function slotTakenMessage(error: any): string {
    return error?.code === '23P01' ? SLOT_TAKEN : error?.message
}


export const rescheduleAppointment = async (appointmentID: string, timeSlot: {
    start: string;
    end: string;
    appointmentLength: number;
}, businessId: string, availability_id: string, _zone?: string) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN');
        const ogAppointment = (await client.query(`SELECT * FROM appointments WHERE id = $1 AND business = $2`, [appointmentID, businessId])).rows[0]
        if (!ogAppointment) throw new Error('Appointment not found.')
        if (ogAppointment.status === 'CANCELLED') throw new Error('This appointment was cancelled.')
        if (!(Number(ogAppointment.reschedules) > 0)) throw new Error('You have reached the maximum number of reschedules for this booking.')

        // The new time keeps the appointment's own length; the browser's end
        // time and length aren't trusted.
        const durationMinutes = Math.round((new Date(ogAppointment.end).getTime() - new Date(ogAppointment.start).getTime()) / 60000)
        const start = DateTime.fromISO(timeSlot.start, { setZone: true })
        if (!start.isValid || !(durationMinutes > 0)) throw new Error('Please pick a valid time.')
        timeSlot = { start: start.toISO()!, end: start.plus({ minutes: durationMinutes }).toISO()!, appointmentLength: durationMinutes }

        const availabilityId = ogAppointment.service_data?.availability ?? availability_id
        const availability = (await client.query(`SELECT availability_data FROM availabilities av WHERE av.id = $1 AND av.business_id = $2`, [availabilityId, businessId])).rows[0]?.availability_data
        if (!availability) throw new Error('No availability configuration found for this service')
        const open = await isSlotOpen(client, { businessId, availability, start: timeSlot.start, durationMinutes, excludeAppointmentId: appointmentID })
        if (!open) throw new Error(SLOT_TAKEN)

        // Enforce reschedule_day_limit
        if (ogAppointment.policy_id) {
            const policyRes = await client.query(
                `SELECT reschedule_day_limit FROM business_policies WHERE id = $1`,
                [ogAppointment.policy_id]
            )
            const rescheduleDayLimit = policyRes.rows[0]?.reschedule_day_limit ?? 0
            if (rescheduleDayLimit > 0) {
                const daysUntil = DateTime.fromJSDate(ogAppointment.start).diff(DateTime.now(), 'days').days
                if (daysUntil < rescheduleDayLimit) {
                    throw new Error(
                        `Rescheduling is not allowed within ${rescheduleDayLimit} day${rescheduleDayLimit !== 1 ? 's' : ''} of the appointment.`
                    )
                }
            }
        }

        // UPDATE appointment timeslot
        // FIXME: Update "updated_at" timestamp
        const appointment = (await client.query(`UPDATE appointments SET start = $1, "end" = $2, reschedules = $3 WHERE id = $4 RETURNING *`, [timeSlot.start, timeSlot.end, parseInt(ogAppointment.reschedules) - 1, appointmentID])).rows[0]
        const business = (await client.query(`SELECT * FROM business_users WHERE business_id = $1`, [appointment.business])).rows[0]
        await client.query('COMMIT')
        const businessAddress = formatBusinessAddress(business.account_settings?.business_address ?? {})
        try {
            await resend.emails.send({
                from: 'appointment-confirmed <noreply@reminder.afroallure.co>',
                to: appointment.client_metadata?.email,
                subject: "Appointment Rescheduled",
                react: AppointmentRescheduled({
                    socials: { instagram: "" },
                    clientData: {
                        firstName: appointment.client_metadata.firstName,
                        lastName: appointment.client_metadata.lastName,
                    },
                    businessData: {
                        id: business.business_id,
                        name: business.business_name,
                        businessAddress,
                    },
                    appointmentData: {
                        id: appointment.id,
                        start: toZonedISO(DateTime.fromJSDate(appointment.start).toISO()!, business.account_settings?.timezone),
                        end: toZonedISO(DateTime.fromJSDate(appointment.end).toISO()!, business.account_settings?.timezone),
                    },
                    serviceName: appointment.service_data.name,
                }),
            })
            await resend.emails.send({
                from: 'appointment-confirmed <noreply@reminder.afroallure.co>',
                to: business?.email!,
                subject: "Booking Alert",
                react: RescheduledAppointment({
                    socials: { instagram: "" },
                    clientData: {
                        firstName: appointment.client_metadata.firstName,
                        lastName: appointment.client_metadata.lastName,
                    },
                    businessData: {
                        id: business.business_id,
                        name: business.business_name,
                        businessAddress,
                    },
                    appointmentData: {
                        id: appointment.id,
                        start: toZonedISO(DateTime.fromJSDate(appointment.start).toISO()!, business.account_settings?.timezone),
                        end: toZonedISO(DateTime.fromJSDate(appointment.end).toISO()!, business.account_settings?.timezone),
                    },
                    serviceName: appointment.service_data.name,
                }),
            })
        } catch (emailErr) {
            console.error('Failed to send reschedule emails:', emailErr)
        }

        trackAppointmentRescheduled({
            businessId: appointment.business,
            serviceId: appointment.service_data.id,
            serviceName: appointment.service_data.name,
            servicePrice: appointment.service_data.price,
            appointmentType: "",
        }).catch(console.error)

        // rescheduled-booking notification — non-critical
        ;(async () => {
            try {
                const supabase = createAdminClient()
                await supabase.from('notifications').insert({
                    body: `${appointment.client_metadata.firstName} ${appointment.client_metadata.lastName} rescheduled their ${appointment.service_data.name} appointment to ${DateTime.fromJSDate(appointment.start).setZone(resolveTimezone(business.account_settings?.timezone)).toFormat('LLLL dd, yyyy')} at ${DateTime.fromJSDate(appointment.start).setZone(resolveTimezone(business.account_settings?.timezone)).toLocaleString(DateTime.TIME_SIMPLE)}.`,
                    title: 'Appointment Rescheduled',
                    read: false,
                    business_id: appointment.business,
                    type: NotificationType.RescheduledBooking,
                    appointment_id: appointment.id,
                })
            } catch (notifErr) {
                console.error('Failed to insert rescheduled-booking notification:', notifErr)
            }
        })()

        // Cancel old reminder jobs and schedule new ones — non-critical, so it
        // runs after the response; after() keeps the function alive until done.
        after(async () => {
            try {
                await AppointmentReminders.cancelAll(ogAppointment.reminder_ids, ogAppointment.payment_link_id)

                const supabase = createAdminClient()
                await scheduleAndStoreReminders(supabase, {
                    id: appointment.id,
                    start: DateTime.fromJSDate(appointment.start).toISO()!,
                    end: DateTime.fromJSDate(appointment.end).toISO()!,
                    serviceName: appointment.service_data.name,
                    clientMetadata: {
                        firstName: appointment.client_metadata.firstName,
                        lastName: appointment.client_metadata.lastName,
                        email: appointment.client_metadata.email,
                        phoneNumber: appointment.client_metadata.phoneNumber,
                    },
                }, {
                    id: business.business_id,
                    name: business.business_name,
                    email: business.email,
                    accountSettings: business.account_settings,
                    completedStripeOnboarding: !!business.completed_stripe_onboarding,
                })
            } catch (err) {
                console.error('Failed to manage reminders after public reschedule:', err)
            }
        })

        return appointment
    } catch (error: any) {
        await client.query('ROLLBACK')
        throw new Error(slotTakenMessage(error))
    } finally {
        client.release();
    }
}

export const bookAppointment = async (addons: any, paymentIntentID: string, businessId: string, policyId: string, serviceData: any, client_metadata: any, timeSlot: {
    start?: string;
    end?: string;
    appointmentLength: number;
}, _zone: string | undefined, styleSelection?: StyleSelection | null, acknowledged?: boolean, referralCode?: string | null, rewardCode?: string | null) => {
    // Price, duration, add-ons and the deposit come from the database. The
    // service object and amounts sent by the browser are not trusted.
    let priced: Awaited<ReturnType<typeof quoteFromDb>>
    try {
        priced = await quoteFromDb(createAdminClient(), {
            businessId,
            serviceId: serviceData?.id,
            addonIds: addons,
            selection: styleSelection,
        })
    } catch (err) {
        if (err instanceof QuoteError) throw new Error(err.message)
        throw err
    }
    const { service: dbService, quote } = priced
    if (parsePrep(dbService.prep)?.requireAgreement && !acknowledged) {
        throw new Error('Please confirm you have read the prep instructions and policies.')
    }
    if (!timeSlot.start || !DateTime.fromISO(timeSlot.start).isValid) throw new Error('Please pick a valid time.')
    timeSlot = {
        start: timeSlot.start,
        end: DateTime.fromISO(timeSlot.start).plus({ minutes: quote.durationMinutes }).toISO()!,
        appointmentLength: quote.durationMinutes,
    }

    const client = await pool.connect()
    try {
        await client.query('BEGIN');

        // Idempotency: if a PROCESSING appointment already exists for this PI, reuse it
        if (paymentIntentID.length) {
            const existing = await client.query(
                `SELECT * FROM appointments WHERE deposit_charge_id = $1 AND status = 'PROCESSING' LIMIT 1`,
                [paymentIntentID]
            )
            if (existing.rowCount && existing.rowCount > 0) {
                await client.query('COMMIT');
                return existing.rows[0]
            }
        }

        // Check slot availability
        const availabilities = (await client.query(`SELECT id, availability_data FROM availabilities av WHERE av.business_id = $1`, [businessId])).rows
        const availabilityRow = availabilities.find((av: any) => av.id === dbService.availability)
        if (!availabilityRow) throw new Error('No availability configuration found for this service')
        const availability = availabilityRow.availability_data

        const open = await isSlotOpen(client, { businessId, availability, start: timeSlot.start!, durationMinutes: quote.durationMinutes })
        if (!open) throw new Error(SLOT_TAKEN)

        // Verify policy hasn't changed
        const policy = await client.query(`SELECT booking_policies FROM business_users bu WHERE bu.business_id = $1`, [businessId])
        if (policy.rows[0].booking_policies !== policyId) throw new Error('Business booking settings have changed. Please refresh and try again.')

        const businessPolicy = await client.query(`SELECT * FROM business_policies bp WHERE bp.id = $1`, [policy.rows[0].booking_policies])
        const policyRow = businessPolicy.rows[0]

        // Totals in cents, from the shared pricing module. The deposit check
        // used to look for 'percentage' while settings save 'percent', so
        // percentage deposits were recorded as $0.
        const selectedAddonObjects = quote.addons
        const totalPriceCents = quote.totalCents
        const depositAmountCents = calculateDeposit(policyRow?.deposit, totalPriceCents)
        const rescheduleLimit = policyRow?.reschedule_limit ?? policyRow?.rescheduleLimit ?? 3

        // The client must have paid exactly the deposit owed for this booking.
        if (paymentIntentID.length) {
            const { rows: [biz] } = await client.query(`SELECT stripe_acc_id FROM business_users WHERE business_id = $1`, [businessId])
            const intent = await stripe.paymentIntents.retrieve(paymentIntentID, { stripeAccount: biz?.stripe_acc_id })
            if (intent.amount !== depositAmountCents) {
                throw new Error('The deposit amount has changed. Please refresh the page and try again.')
            }
        }
        const acknowledgedAt = acknowledged ? DateTime.now().toUTC().toISO() : null

        // Optional columns (style options / agreement) are only written when
        // used, so this works whether or not their migration has run yet.
        const extra: Record<string, unknown> = {}
        if (quote.selectedOptions) extra.selected_options = JSON.stringify(quote.selectedOptions)
        if (acknowledgedAt) extra.acknowledged_at = acknowledgedAt
        const insertAppointment = (fields: Record<string, unknown>) => {
            const all = { ...fields, ...extra }
            const cols = Object.keys(all)
            const sql = `INSERT INTO appointments (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`
            return client.query(sql, Object.values(all))
        }

        let appointment;
        if (paymentIntentID.length) {
            appointment = await insertAppointment({
                start: timeSlot.start, end: timeSlot.end, business: businessId, client_metadata,
                status: 'PROCESSING', service_data: dbService, deposit_charge_id: paymentIntentID,
                policy_id: policyId, require_deposit: true, paid_deposit: false, reschedules: rescheduleLimit,
                deposit_price: depositAmountCents, selected_addons: selectedAddonObjects, amount_due: totalPriceCents,
            })
        } else {
            appointment = await insertAppointment({
                start: timeSlot.start, end: timeSlot.end, business: businessId, client_metadata,
                status: 'CONFIRMED', service_data: dbService, policy_id: policyId, require_deposit: false,
                paid_deposit: false, reschedules: rescheduleLimit, selected_addons: selectedAddonObjects,
                amount_due: totalPriceCents,
            })
        }

        // A referral link takes the friend's discount off this booking; it's
        // checked and recorded in the same transaction as the appointment.
        let booked = appointment.rows[0]
        const referral = await attributeReferral(booked.id, referralCode, client)
        if (referral.discountCents > 0) {
            booked = (await client.query(`SELECT * FROM appointments WHERE id = $1`, [booked.id])).rows[0]
        }

        await client.query('COMMIT');

        // A reward code from the client (checked again here, and only for the
        // person it was issued to). Never blocks the booking.
        if (rewardCode?.trim() && referral.discountCents === 0) {
            const applied = await applyRewardCore(createAdminClient(), businessId, booked.id, { code: rewardCode },
                { email: String(client_metadata?.email ?? ''), phone: String(client_metadata?.phoneNumber ?? '') })
            if (applied.ok) booked = { ...booked, amount_due: Number(booked.amount_due) - applied.discountCents, discount_cents: applied.discountCents }
            else console.warn('Reward code not applied at booking:', applied.error)
        }
        return booked
    } catch (error: any) {
        await client.query('ROLLBACK')
        throw new Error(slotTakenMessage(error))
    } finally {
        client.release();
    }
}
