'use server'
import pool from "@/app/utils/dbPool";
import { DateTime } from "luxon";
import { Resend } from "resend";
import { getSlots, OutputSlot } from "slot-calculator";
import AppointmentRescheduled from "../../../../emails/appointment-rescheduled";
import RescheduledAppointment from "../../../../emails/rescheduled-appointment";
import { createClient } from "@/app/utils/supabase/server";
import { assignAddons } from "app/api/util/transformServices";
import { trackAppointmentRescheduled } from "../../../../lib/analytics";
import { formatBusinessAddress } from "@/lib/appointmentEmails/AppointmentEmails";

const resend = new Resend(process.env.RESEND_API_KEY);

export const fetchBusinessData = async (businessName: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("business_users").select("*, availabilities(*), services(*), appointments(*), web_editors(*)").eq("url_name", `${businessName}`).single();
    const services = data?.services
    if (error) {
        return error
    }
    return { result: { ...data, services: await assignAddons(supabase, services!) } }
}

export const fetchBusinessPolicies = async (policyId: string) => {
    const supabase = await createClient();
    const { data: policy, error } = await supabase.from('business_policies').select('*').eq('id', policyId).single()
    return policy
}


// Helper function that checks to see if a certain timeslot if available for booking or rescheduling
export const
    checkSlots = async (timeSlot: {
        start?: string;
        end?: string;
        appointmentLength?: number;
    }, availability: any, appointments: any, zone: string = Intl.DateTimeFormat().resolvedOptions().timeZone) => {
        const beginDay = DateTime.fromISO(timeSlot.start!).startOf('day').toISO()!
        const endDay = DateTime.fromISO(timeSlot.end!).endOf('day').toISO()!

        const formattedAv = await getAvailability(beginDay, endDay, availability, zone)
        const formattedUnav = await getUnavailability(beginDay, endDay, appointments, zone)

        const { availableSlots } = getSlots({
            from: beginDay,
            to: endDay,
            duration: timeSlot.appointmentLength!,
            availability: formattedAv,
            unavailability: formattedUnav,
            outputTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
        // Format the slots right
        let result: string[][] = [[availableSlots[0].from]]; // [[9, 12], [3, 6], [7, 9]]
        for (let j = 0; j < availableSlots.length; j++) {
            if (j === availableSlots.length - 1) {
                result[result.length - 1].push(availableSlots[j].to)
                continue
            }
            if (availableSlots[j].to !== availableSlots[j + 1].from) {
                result[result.length - 1].push(availableSlots[j].to)
                result.push([availableSlots[j + 1].from])
            }
            continue;
        }
        // Generate timeslots
        let res = []
        for (let i = 0; i < result.length; i++) {
            let timeStart = DateTime.fromISO(result[i][0])
            let movingTime = DateTime.fromISO(result[i][0])
            let timeEnd = DateTime.fromISO(result[i][result[i].length - 1])
            while (movingTime < timeEnd) {
                movingTime = timeStart
                movingTime = movingTime.plus({ minutes: timeSlot.appointmentLength })
                if (movingTime <= timeEnd) { // length
                    res.push(timeStart.toISO())
                    timeStart = timeStart.plus({ minutes: 10 }) // increment
                } else {
                    break;
                }
            }
        }


        return res

    }


export const rescheduleAppointment = async (appointmentID: string, timeSlot: {
    start: string;
    end: string;
    appointmentLength: number;
}, businessId: string, availability_id: string, zone: string) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN');
        // Check if timeslot is still available
        // 1. Get availability and appointments
        const availability = (await client.query(`SELECT availability_data FROM availabilities av WHERE av.id = $1`, [availability_id])).rows[0].availability_data
        const appointments = (await client.query(`SELECT * FROM appointments app WHERE app.business = $1`, [businessId])).rows
        let available: boolean = false
        const availableSlots = await checkSlots(timeSlot, availability, appointments, zone)
        availableSlots.forEach((slot: string | null, index: number) => {
            if (slot === timeSlot.start!) {
                available = true
            }
        })
        if (!available) {
            throw Error("Timeslot is no longer available")
        }
        const ogAppointment = appointments.filter((appointment: Appointment, index: number) => appointment.id === appointmentID)[0]

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
                        start: DateTime.fromJSDate(appointment.start).toISO()!,
                        end: DateTime.fromJSDate(appointment.end).toISO()!,
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
                        start: DateTime.fromJSDate(appointment.start).toISO()!,
                        end: DateTime.fromJSDate(appointment.end).toISO()!,
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

        return appointment
    } catch (error: any) {
        await client.query('ROLLBACK')
        throw new Error(error.message)
    } finally {
        client.release();
    }
}

export const bookAppointment = async (addons: any, paymentIntentID: string, businessId: string, policyId: string, serviceData: any, client_metadata: any, timeSlot: {
    start?: string;
    end?: string;
    appointmentLength: number;
}, zone: string) => {
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
        const availabilities = (await client.query(`SELECT availability_data FROM availabilities av WHERE av.business_id = $1`, [businessId])).rows
        const appointments = (await client.query(`SELECT * FROM appointments app WHERE app.business = $1 AND app.status != 'CANCELLED'`, [businessId])).rows
        const availabilityRow = availabilities.find((av: any) => av.availability_data.id === serviceData.availability)
        if (!availabilityRow) throw new Error('No availability configuration found for this service')
        const availability = availabilityRow.availability_data

        const availableSlots = await checkSlots(timeSlot, availability, appointments, zone)
        const slotAvailable = availableSlots.some((slot: string | null) => slot === timeSlot.start!)
        if (!slotAvailable) throw new Error('This time slot is no longer available. Please select another time.')

        // Verify policy hasn't changed
        const policy = await client.query(`SELECT booking_policies FROM business_users bu WHERE bu.business_id = $1`, [businessId])
        if (policy.rows[0].booking_policies !== policyId) throw new Error('Business booking settings have changed. Please refresh and try again.')

        const businessPolicy = await client.query(`SELECT * FROM business_policies bp WHERE bp.id = $1`, [policy.rows[0].booking_policies])
        const policyRow = businessPolicy.rows[0]

        // Compute deposit and total amounts (in cents)
        const selectedAddonObjects = (serviceData.addons ?? []).filter((a: any) => (addons as string[]).includes(a.id))
        const addonPriceCents = selectedAddonObjects.reduce((sum: number, a: any) => sum + (a.price ?? 0), 0)
        const totalPriceCents = serviceData.price + addonPriceCents
        const policyDeposit = policyRow?.deposit
        let depositAmountCents = 0
        if (policyDeposit?.settings?.type === 'flat') {
            depositAmountCents = Math.round((policyDeposit.settings.value ?? 0) * 100)
        } else if (policyDeposit?.settings?.type === 'percentage') {
            depositAmountCents = Math.round(totalPriceCents * (policyDeposit.settings.value ?? 0) / 100)
        }
        const rescheduleLimit = policyRow?.reschedule_limit ?? policyRow?.rescheduleLimit ?? 3

        let appointment;
        if (paymentIntentID.length) {
            appointment = await client.query(
                `INSERT INTO appointments (
                    start, "end", business, client_metadata, status, service_data,
                    deposit_charge_id, policy_id, require_deposit, paid_deposit,
                    reschedules, deposit_price, selected_addons, amount_due
                ) VALUES ($1,$2,$3,$4,'PROCESSING',$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
                [
                    timeSlot.start, timeSlot.end, businessId, client_metadata, "PROCESSING", serviceData,
                    paymentIntentID, policyId, true, false,
                    rescheduleLimit, depositAmountCents, selectedAddonObjects, totalPriceCents
                ]
            )
        } else {
            appointment = await client.query(
                `INSERT INTO appointments (
                    start, "end", business, client_metadata, status, service_data,
                    policy_id, require_deposit, paid_deposit, reschedules,
                    selected_addons, amount_due
                ) VALUES ($1,$2,$3,$4,'CONFIRMED',$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
                [
                    timeSlot.start, timeSlot.end, businessId, client_metadata, "CONFIRMED", serviceData,
                    policyId, false, false, rescheduleLimit, selectedAddonObjects, totalPriceCents
                ]
            )
        }

        await client.query('COMMIT');
        return appointment.rows[0]
    } catch (error: any) {
        await client.query('ROLLBACK')
        throw new Error(error.message)
    } finally {
        client.release();
    }
}

export const getAvailability = async (startDate: string, endDate: string, availability: any, zone: string
) => {
    let start = DateTime.fromISO(startDate).setZone(zone);
    let end = DateTime.fromISO(endDate).setZone(zone);
    let slotResult = []
    try {
        let curr = start;
        while (curr <= end) {
            let weekDay = curr.weekday - 1
            if (!availability.week[weekDay].isChecked) {
                curr = curr.plus({ days: 1 })
                continue
            }
            const ranges = availability.week[weekDay].timeRanges;
            // Loop through week availability
            for (let i = 0; i < ranges.length; i++) {
                // Get time
                const startHour = ranges[i].start.hour
                const startMin = ranges[i].start.minute
                const endHour = ranges[i].end.hour
                const endMin = ranges[i].end.minute

                let startDateTimeRef = DateTime.fromObject(
                    { year: curr.year, month: curr.month, day: curr.day, hour: startHour, minute: startMin },
                    { zone }
                );

                let endDateTimeRef = DateTime.fromObject(
                    { year: curr.year, month: curr.month, day: curr.day, hour: endHour, minute: endMin },
                    { zone }
                );

                let newAvailabilityDay = {
                    from: startDateTimeRef.toISO() as any,
                    to: endDateTimeRef.toISO() as any,
                }
                slotResult.push(newAvailabilityDay)
            }
            curr = curr.plus({ days: 1 })
        }
        // Loop through specific dates
        const specificDates = availability.specificDates;
        const dates = Object.keys(specificDates)
        for (let i = 0; i < dates.length; i++) {
            const ranges = specificDates[dates[i]]
            const currDate = DateTime.fromISO(dates[i])
            for (let j = 0; j < ranges.length; j++) {
                const startHour = ranges[j].start.hour
                const startMin = ranges[j].start.minute
                const endHour = ranges[j].end.hour
                const endMin = ranges[j].end.minute

                const currDate = DateTime.fromISO(dates[i]).setZone(zone);

                let startDateTimeRef = DateTime.fromObject(
                    { year: currDate.year, month: currDate.month, day: currDate.day, hour: startHour, minute: startMin },
                    { zone }
                );

                let endDateTimeRef = DateTime.fromObject(
                    { year: currDate.year, month: currDate.month, day: currDate.day, hour: endHour, minute: endMin },
                    { zone }
                );

                const specificDayObj = {
                    from: startDateTimeRef.toISO(),
                    to: endDateTimeRef.toISO(),
                }
                slotResult.push(specificDayObj)
            }
        }
    } catch (error: any) {

    }
    return slotResult

}

export const getUnavailability = async (startDate: string, endDate: string, appointments: Array<any>, zone: string
) => {
    let slotResult: { from: string; to: string }[] = [];

    try {
        for (let i = 0; i < appointments.length; i++) {
            // Only block slots for active appointments; cancelled ones are freed
            if (appointments[i].status === 'CANCELLED') continue;
            slotResult.push({
                from: DateTime.fromISO(appointments[i].start).setZone(zone).toISO()!,
                to: DateTime.fromISO(appointments[i].end).setZone(zone).toISO()!,
            });
        }
    } catch (error: any) {
        console.error(error);
        throw new Error(error.message);
    }

    return slotResult;
}
