'use server'

import { SupabaseClient } from "@supabase/supabase-js";
import pool from "@utils/dbPool";
import { checkSlots } from "app/[businessName]/actions";
import { sendCancelledEmails } from "app/api/appointments/route";
import { DateTime } from "luxon";
import { OutputSlot } from "slot-calculator";

export const assignAddons = async (supabase: SupabaseClient, services: Service[]) => {
    const uniqueAddonIds = [...new Set(services?.flatMap(service => service.addons))]
    const { data: addons, error } = await supabase.from('service_addons').select("*").in('id', uniqueAddonIds)
    const addonsById = Object.fromEntries((addons ?? []).map(addon => [addon.id, addon]))
    const servicesWithAddons = services?.map(service => ({
        ...service,
        addonDetails: service.addons!.map((id: any) => addonsById[id]).filter(Boolean)
    }));
    return servicesWithAddons
}

export const manuallyCancel = async (businessId: string, appointmentID: string) => {
    // Make sure appointment exists and isn't CANCELLED
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const appointments = (await client.query(`SELECT * FROM appointments app WHERE app.business = $1`, [businessId])).rows
        const appointment: Appointment = appointments.find((value: Appointment, index: number) => value.id === appointmentID)
        if (!appointment) {
            throw new Error("Appointment doesn't exist")
        }
        if (appointment.status === "CANCELLED") {
            throw new Error("Appointment has already been cancelled")
        }
        const res = await client.query(`UPDATE appointments SET status = 'CANCELLED' WHERE id = $1 RETURNING *`, [appointmentID])
        await client.query('COMMIT');
        return res.rows[0]
    } catch (error: any) {
        console.error(error)
        await client.query('ROLLBACK')
    } finally {
        client.release()
    }

}

export const bookingManual = async (businessId: string, client_metadata: any, serviceData: Service, timeSlot: {
    start?: string;
    end?: string;
    appointmentLength: number;
}
) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN');
        // Check if timeslot is still available
        // 1. Get availability and appointments
        const availabilities = (await client.query(`SELECT availabilities FROM business_users bu WHERE bu.business_id = $1`, [businessId])).rows[0].availabilities
        const appointments = (await client.query(`SELECT * FROM appointments app WHERE app.business = $1`, [businessId])).rows
        const availability = availabilities.filter((availability: any, index: number) => availability.id === "4fe7f32b-246e-4214-bccf-8fd898317363")[0]

        let available: boolean = false
        const availableSlots = await checkSlots(timeSlot, availability, appointments)
        availableSlots.forEach((slot: string | null, index: number) => {
            if (slot === timeSlot.start!) {
                available = true
            }
        })
        if (!available) {
            throw Error("Timeslot is no longer available")
        }
        // Send query to supabase confirming the appointment
        const appointment = await client.query(`INSERT INTO appointments (start, "end", business, client_metadata, status, service_data) VALUES ($1, $2, $3, $4, 'PENDING', $5) RETURNING *`, [timeSlot.start, timeSlot.end, businessId, client_metadata, serviceData])
        await client.query('COMMIT');
        return appointment.rows[0]

    } catch (error) {
        console.error(error)
        await client.query('ROLLBACK')

    } finally {
        client.release();
    }
}


export const businessRescheduling = async (businessId: string, service_data: Service, client_metadata: any, appointmentID: string, timeSlot: {
    start?: string;
    end?: string;
    appointmentLength: number;
}, resolved: boolean) => {
    // Check if appointment still exists, meaning not cancelled or denied and is confirmed
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const availabilities = (await client.query(`SELECT availabilities FROM business_users bu WHERE bu.business_id = $1`, [businessId])).rows[0].availabilities
        const appointments = (await client.query(`SELECT * FROM appointments app WHERE app.business = $1`, [businessId])).rows
        const availability = availabilities.filter((availability: any, index: number) => availability.id === "4fe7f32b-246e-4214-bccf-8fd898317363")[0]
        const appointment: Appointment = appointments.find((value: Appointment, index: number) => value.id === appointmentID)
        if (!appointment) {
            throw new Error("Appointment doesn't exist")
        }
        if (appointment.status !== "CONFIRMED") {
            if (appointment.status === "PENDING") {
                throw Error("Appointment is pending confirmation from client")
            } else {
                throw Error(`Appointment has been ${appointment.status}`)
            }
        }
        // Run through appointments and to see if they're any conflicts
        for (let i = 0; i < appointments.length; i++) {
            if (appointments[i].id === appointmentID) {
                continue;
            }
            //    [-------]
            // [------]  
            let conflictOne = DateTime.fromISO(timeSlot.start!) < DateTime.fromISO(appointments[i].start) && DateTime.fromISO(timeSlot.end!) > DateTime.fromISO(appointments[i].start)
            // [--------]
            //     [-------]
            let conflictTwo = DateTime.fromISO(timeSlot.start!) > DateTime.fromISO(appointments[i].start) && DateTime.fromISO(timeSlot.start!) < DateTime.fromISO(appointments[i].end)
            let conflictThree = DateTime.fromISO(timeSlot.start!).equals(DateTime.fromISO(appointments[i].start)) && DateTime.fromISO(timeSlot.end!).equals(DateTime.fromISO(appointments[i].end))
            if (conflictOne || conflictTwo || conflictThree) {
                throw Error("Conflict")
            }
        }
        // Send query to supabase confirming the appointment
        const res = await client.query(`UPDATE appointments SET start = $1, "end" = $2, updated_at = $3, service_data = $4, client_metadata = $5 WHERE id = $6 RETURNING *`, [timeSlot.start, timeSlot.end, new Date().toISOString(), service_data, client_metadata, appointmentID])
        await client.query('COMMIT');
        return res.rows[0]
    } catch (error: any) {
        console.error(error)
        await client.query('ROLLBACK')
    } finally {
        client.release()
    }
}
