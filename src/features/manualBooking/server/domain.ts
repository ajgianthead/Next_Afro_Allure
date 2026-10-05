import { createClient } from "@/app/utils/supabase/server"
import { Resend } from "resend"
import { DateTime } from "luxon"
import { Appointment } from "./models/Appointment"
import { Service } from "@/lib/service/Service"
import { BusinessPolicy } from "@/lib/businessPolicy/BusinessPolicy"
import { BusinessUser } from "@/lib/businessUser/BusinessUser"
import { stripe } from "@/lib/stripe/stripeClient"
import { AppointmentEvent, CreateAppointmentPayload } from "../types"
import { quoteFromDb } from "@/features/services/server/quote"
import { calculateDeposit, QuoteError } from "@/features/services/pricing"
import { AppointmentReminders } from "@/features/shared/appointments/AppointmentReminders"
import { runConfirmationSideEffects, scheduleAndStoreReminders } from "@/features/shared/appointments/confirmation"
import { AppointmentEmails, formatBusinessAddress } from "@/lib/appointmentEmails/AppointmentEmails"
import { isValidTimezone } from "@/lib/timezone"
import { after } from "next/server"
import { notifyWaitlistOfOpening } from "@/features/waitlist/server/notify"

// Small grace window so a time picked "right now" isn't rejected by clock skew.
const PAST_GRACE_MINUTES = 2

/** The signed-in user's business row. Every dashboard action is scoped to it. */
async function requireOwnBusiness(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    const { data: business } = await supabase
        .from('business_users')
        .select('business_id, account_settings, completed_stripe_onboarding')
        .eq('user_id', user.id)
        .single()
    if (!business) throw new Error('Unauthorized')
    return business
}

function assertBookableTimes(startISO: string, endISO: string) {
    const start = DateTime.fromISO(startISO)
    const end = DateTime.fromISO(endISO)
    if (!start.isValid || !end.isValid) throw new Error('Please enter a valid start and end time.')
    if (end <= start) throw new Error('End time must be after the start time.')
    if (start < DateTime.now().minus({ minutes: PAST_GRACE_MINUTES })) {
        throw new Error('That start time has already passed. Pick a later time.')
    }
}

async function assertNoConflict(
    supabase: Awaited<ReturnType<typeof createClient>>,
    businessId: string,
    startISO: string,
    endISO: string,
    ignoreId?: string
) {
    let query = supabase
        .from('appointments')
        .select('id')
        .eq('business', businessId)
        .in('status', ['CONFIRMED', 'PENDING'])
        .lt('start', endISO)
        .gt('end', startISO)
    if (ignoreId) query = query.neq('id', ignoreId)
    const { data: conflicts, error } = await query
    if (error) throw new Error(error.message)
    if (conflicts && conflicts.length > 0) throw new Error('This time slot conflicts with an existing appointment.')
}

/** Remembers the business's timezone (used to show correct times in emails) the first time we see it. */
async function rememberTimezone(
    supabase: Awaited<ReturnType<typeof createClient>>,
    business: { business_id: string; account_settings: any },
    timezone?: string
) {
    if (!isValidTimezone(timezone) || business.account_settings?.timezone) return
    await supabase
        .from('business_users')
        .update({ account_settings: { ...(business.account_settings ?? {}), timezone } })
        .eq('business_id', business.business_id)
}

export const rescheduleAppointment = async (data: {
    appointmentId: string
    startISO: string
    endISO: string
}): Promise<{ id: string; start: string; end: string }> => {
    const supabase = await createClient()
    const ownBusiness = await requireOwnBusiness(supabase)
    const resend = new Resend(process.env.RESEND_API_KEY)
    assertBookableTimes(data.startISO, data.endISO)

    const appointment = await Appointment.fetchById(supabase, data.appointmentId)
    if (Array.isArray(appointment)) throw new Error('Appointment not found')
    if (appointment.businessId !== ownBusiness.business_id) throw new Error('Unauthorized')

    const startISO = DateTime.fromISO(data.startISO).toUTC().toISO()!
    const endISO = DateTime.fromISO(data.endISO).toUTC().toISO()!
    await assertNoConflict(supabase, appointment.businessId, startISO, endISO, appointment.id)

    // Fetch job ids before rescheduling (not stored in the Appointment model)
    const { data: apptMeta } = await supabase
        .from('appointments')
        .select('reminder_ids, payment_link_id')
        .eq('id', appointment.id)
        .single()

    const rescheduled = await appointment.reschedule(supabase, { start: startISO, end: endISO })
    if (Array.isArray(rescheduled)) throw new Error('Failed to reschedule appointment')

    try {
        await rescheduled.sendBusinessRescheduleEmail(resend, supabase)
        await rescheduled.sendClientRescheduleEmail(resend, supabase)
    } catch (emailErr) {
        console.error('Failed to send reschedule emails:', emailErr)
    }

    // Replace the old time's jobs with ones for the new time — non-critical.
    // Only confirmed appointments have jobs; pending ones get them on confirm.
    await AppointmentReminders.cancelAll(apptMeta?.reminder_ids, apptMeta?.payment_link_id)
    if (rescheduled.status === 'CONFIRMED') {
        try {
            const business = await BusinessUser.fetch(supabase, rescheduled.businessId)
            await scheduleAndStoreReminders(supabase, {
                id: rescheduled.id,
                start: rescheduled.start,
                end: rescheduled.end,
                serviceName: rescheduled.serviceData.name,
                clientMetadata: rescheduled.clientMetadata,
            }, {
                id: business.id,
                name: business.name,
                email: business.email,
                accountSettings: business.accountSettings,
                completedStripeOnboarding: business.completedStripeOnboarding,
            })
        } catch (err) {
            console.error('Failed to manage reminders after manual reschedule:', err)
        }
    }

    // Plain object — class instances can't cross the server-action boundary.
    return { id: rescheduled.id, start: rescheduled.start, end: rescheduled.end }
}

export const confirmAppointment = async (appointmentId: string, depositChargeId: string): Promise<{ id: string; status: string }> => {
    const supabase = await createClient()
    const ownBusiness = await requireOwnBusiness(supabase)
    const appointment = await Appointment.fetchById(supabase, appointmentId)
    if (Array.isArray(appointment)) throw new Error('Appointment not found')
    if (appointment.businessId !== ownBusiness.business_id) throw new Error('Unauthorized')
    if (appointment.status !== 'PENDING') throw new Error('Only pending appointments can be confirmed')

    const business = await BusinessUser.fetch(supabase, appointment.businessId)

    if (!appointment.requireDeposit) {
        await appointment.changeStatus(supabase, 'CONFIRMED')
    } else {
        const paymentData = await stripe.paymentIntents.retrieve(depositChargeId, {
            stripeAccount: business.stripeAccountId
        })
        await appointment.confirmAppointment(supabase, paymentData.amount)
    }

    await runConfirmationSideEffects({
        id: appointment.id,
        start: appointment.start,
        end: appointment.end,
        serviceName: appointment.serviceData.name,
        clientMetadata: appointment.clientMetadata,
    }, {
        id: business.id,
        name: business.name,
        email: business.email,
        accountSettings: business.accountSettings,
        completedStripeOnboarding: business.completedStripeOnboarding,
    })

    return { id: appointment.id, status: 'CONFIRMED' }
}

export const sendPaymentLink = async (appointmentId: string) => {
    const supabase = await createClient()
    const ownBusiness = await requireOwnBusiness(supabase)
    if (!ownBusiness.completed_stripe_onboarding) {
        throw new Error('Set up Monetization to send payment links to clients.')
    }
    const resend = new Resend(process.env.RESEND_API_KEY)
    const appointment = await Appointment.fetchById(supabase, appointmentId)
    if (Array.isArray(appointment)) throw new Error('Appointment not found')
    if (appointment.businessId !== ownBusiness.business_id) throw new Error('Unauthorized')
    if (appointment.status !== 'CONFIRMED') throw new Error('Only confirmed appointments can have a payment link sent')

    const business = await BusinessUser.fetch(supabase, appointment.businessId)

    const PaymentLinkEmail = (await import('../../../../emails/payment-link')).default
    const { error } = await resend.emails.send({
        from: 'payment <noreply@reminder.afroallure.co>',
        to: appointment.clientMetadata.email,
        subject: `Payment Due — ${appointment.serviceData.name}`,
        react: PaymentLinkEmail({
            clientData: {
                firstName: appointment.clientMetadata.firstName,
                lastName: appointment.clientMetadata.lastName,
                email: appointment.clientMetadata.email,
                phoneNumber: appointment.clientMetadata.phoneNumber,
            },
            businessData: {
                id: business.id,
                name: business.name,
                email: business.email,
            },
            serviceName: appointment.serviceData.name,
            appointmentID: appointment.id,
        } as any),
    })
    if (error) throw new Error('Failed to send payment link. Please try again.')
}

export const sendConfirmationLink = async (appointmentId: string) => {
    const supabase = await createClient()
    const ownBusiness = await requireOwnBusiness(supabase)
    const appointment = await Appointment.fetchById(supabase, appointmentId)
    if (Array.isArray(appointment)) throw new Error('Appointment not found')
    if (appointment.businessId !== ownBusiness.business_id) throw new Error('Unauthorized')
    if (appointment.status !== 'PENDING') throw new Error('Only pending appointments can have a confirmation link sent')

    const business = await BusinessUser.fetch(supabase, appointment.businessId)

    await AppointmentEmails.sendPendingConfirmation({
        clientMetadata: {
            firstName: appointment.clientMetadata.firstName,
            lastName: appointment.clientMetadata.lastName,
            email: appointment.clientMetadata.email,
        },
        businessData: {
            id: business.id,
            name: business.name,
            email: business.email,
            address: formatBusinessAddress(business.accountSettings?.business_address),
        },
        appointmentData: {
            id: appointment.id,
            start: appointment.start,
            end: appointment.end,
        },
        serviceName: appointment.serviceData.name,
        notifyBusiness: false,
    })
}


export const createNewManualAppointment = async (payload: CreateAppointmentPayload): Promise<AppointmentEvent> => {
    const supabase = await createClient()
    const ownBusiness = await requireOwnBusiness(supabase)
    const resend = new Resend(process.env.RESEND_API_KEY)

    assertBookableTimes(payload.startISO, payload.endISO)
    const c = payload.clientData
    if (!c?.firstName?.trim() || !c?.lastName?.trim() || !c?.email?.trim() || !c?.phoneNumber?.trim()) {
        throw new Error('Please enter client information')
    }

    try {
        // Same pricing as online booking (size/length/hair options, add-ons).
        // The business still picks its own end time on manual bookings.
        let priced: Awaited<ReturnType<typeof quoteFromDb>>
        try {
            priced = await quoteFromDb(supabase, {
                businessId: ownBusiness.business_id,
                serviceId: payload.serviceId,
                addonIds: payload.selectedAddons,
                selection: payload.styleSelection,
            })
        } catch (err) {
            if (err instanceof QuoteError) throw new Error(err.message)
            throw err
        }
        const { quote } = priced
        const selectedService = Service.fromRow(priced.service as any) as Service
        const addOns = quote.addons
        const totalPrice = quote.totalCents

        const policy = await BusinessPolicy.fetch(supabase, selectedService.business)
        // A deposit can only be collected once Stripe onboarding is complete.
        // Flat deposits are in dollars (they used to be saved here as cents).
        const requireDeposit = payload.deposit && policy.deposit.enabled && ownBusiness.completed_stripe_onboarding
        const depositPrice = requireDeposit ? calculateDeposit(policy.deposit as any, totalPrice) : 0

        const startISO = DateTime.fromISO(payload.startISO).toUTC().toISO()!
        const endISO = DateTime.fromISO(payload.endISO).toUTC().toISO()!
        await assertNoConflict(supabase, selectedService.business, startISO, endISO)

        const appointment = await Appointment.create(supabase, selectedService.business, {
            client_metadata: {
                firstName: c.firstName.trim(),
                lastName: c.lastName.trim(),
                email: c.email.trim(),
                phoneNumber: c.phoneNumber.trim(),
            },
            start: startISO,
            end: endISO,
            service_data: selectedService,
            status: 'PENDING',
            require_deposit: requireDeposit,
            paid_deposit: false,
            deposit_charge_id: "",
            reschedules: policy.rescheduleLimit,
            deposit_price: depositPrice,
            selected_addons: addOns,
            substraction: policy.deposit.settings.subtraction,
            amount_due: totalPrice,
            selected_options: quote.selectedOptions,
        })
        if (Array.isArray(appointment)) throw new Error('Unexpected: appointment creation returned multiple results')

        rememberTimezone(supabase, ownBusiness, payload.timezone).catch(console.error)

        try {
            await appointment.sendConfirmAppointmentEmail(resend, supabase)
        } catch (emailErr) {
            console.error('Failed to send new appointment email:', emailErr)
        }
        return {
            id: appointment.id,
            start: new Date(appointment.start),
            title: `${appointment.serviceData.name} with ${appointment.clientMetadata.firstName}`,
            end: new Date(appointment.end),
            clientData: { ...appointment.clientMetadata },
            serviceData: {
                id: appointment.serviceData.id,
                name: appointment.serviceData.name,
                business: appointment.businessId,
                description: appointment.serviceData.description,
                length: appointment.serviceData.length,
                price: appointment.serviceData.price,
                photo_url: appointment.serviceData.photo_url,
                imagePath: appointment.serviceData.imagePath,
                addons: appointment.serviceData.addons,
                categories: appointment.serviceData.categories,
                availability: appointment.serviceData.availability,
            },
            status: appointment.status,
            depositPrice: appointment.depositPrice,
            paidDeposit: appointment.paidDeposit,
            amountDue: appointment.amountDue,
            requiresDeposit: appointment.requireDeposit,
            paidAmount: appointment.paidAmount ?? 0,
            servicePaid: appointment.servicePaid ?? false,
            servicePaidType: appointment.servicePaidType ?? null,
            selectedAddons: addOns,
            refundStatus: 'NONE',
            refundedAmount: 0,
            hasOnlinePayment: false,
            selectedOptions: quote.selectedOptions,
        }
    } catch (error: any) {
        throw Error(error.message)
    }
}

export const cancelAppointment = async (appointmentId: string): Promise<{ id: string; status: string }> => {
    const supabase = await createClient()
    // business_users.business_id is its own uuid, not the auth user id, so the
    // old `appointment.businessId !== user.id` check rejected every cancel.
    const ownBusiness = await requireOwnBusiness(supabase)
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Fetch job ids before cancelling so we can stop scheduled jobs
    const { data: apptMeta } = await supabase
        .from('appointments')
        .select('reminder_ids, payment_link_id')
        .eq('id', appointmentId)
        .single()

    const appointment = await Appointment.fetchById(supabase, appointmentId)
    if (Array.isArray(appointment)) throw new Error('Appointment not found')
    if (appointment.businessId !== ownBusiness.business_id) throw new Error('Unauthorized')

    const cancelled = await appointment.cancel(supabase)
    if (Array.isArray(cancelled)) throw new Error('Failed to cancel appointment')

    try {
        await cancelled.sendBusinessCancellationEmail(resend, supabase)
        await cancelled.sendClientCancellationEmail(resend, supabase)
    } catch (emailErr) {
        console.error('Failed to send cancellation emails:', emailErr)
    }

    await AppointmentReminders.cancelAll(apptMeta?.reminder_ids, apptMeta?.payment_link_id)
    // Tell waitlisted clients the time is free (after the response is sent).
    after(() => notifyWaitlistOfOpening(cancelled.id))

    return { id: cancelled.id, status: cancelled.status }
}
