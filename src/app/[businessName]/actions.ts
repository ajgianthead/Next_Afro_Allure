'use server'

import pool from "@utils/dbPool";
import { DateTime } from "luxon";
import { getSlots, OutputSlot } from "slot-calculator";

const checkSlots = async (timeSlot: {
    start: string;
    end: string;
    appointmentLength: number;
}, availability: any, appointments: any) => {
    const beginDay = DateTime.fromISO(timeSlot.start).startOf('day').toUTC().toISO()!
    const endDay = DateTime.fromISO(timeSlot.end).endOf('day').toUTC().toISO()!
    const formattedAv = await getAvailability(beginDay, endDay, availability)
    const formattedUnav = await getUnavailability(beginDay, endDay, appointments)
    const {availableSlots} = getSlots({
        from: beginDay,
        to: endDay,
        duration: timeSlot.appointmentLength,
        availability: formattedAv,
        unavailability: formattedUnav
    })
    return availableSlots
}

export const bookAppointment = async (businessId: string, policyId: string, serviceId: string, lastServiceUpdate: string, client_metadata: any, timeSlot: {
    start: string;
    end: string;
    appointmentLength: number;
}) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN');
        // Check if timeslot is still available
        // 1. Get availability and appointments
        const availability = (await client.query(`SELECT availability FROM business_users bu WHERE bu.business_id = ${businessId}`)).rows[0]
        const appointments = (await client.query(`SELECT * FROM appointments app WHERE app.business = ${businessId}`)).rows[0]
       
        let available: boolean = false
        availableSlots.forEach((slot: OutputSlot, index: number) => {
            if(slot.from === timeSlot.start && slot.to === timeSlot.end){
                available = true
            }
        })
        if(!available){
            throw Error("Timeslot is no longer available")
        }
        // 2. 
        // Check if policy and service has changed since the user first loaded the page
        const policy = await client.query(`SELECT booking_policies FROM business_users bu WHERE bu.business_id = ${businessId}`)
        const service = await client.query(`SELECT updated_at FROM services WHERE id = ${serviceId}`)
        if(policy.rows[0] !== policyId || service.rows[0] !== lastServiceUpdate){
            throw Error("Business data has changed")
        }
        // Charge account if policy requires deposit
        const businessPolicy = await client.query(`SELECT * FROM business_policies bp WHERE bp.id = ${policy.rows[0]}`)
        if(businessPolicy.rows[0].deposit.enabled){
            //TODO: Create charge with Stripe -> LATER!!
        }
        // Send query to supabase confirming the appointment
        const appointment = await client.query(`INSERT INTO appointments (start, end, business, client_metadata, status, service) VALUES (${timeSlot.start}, ${timeSlot.end}, ${businessId}, ${client_metadata}, "ACCEPTED", ${serviceId}) RETURNING *`)

        return appointment.rows[0]

    } catch (error) {
        await client.query('ROLLBACK')
    } finally {
        client.release();
    }
}

export const getAvailability = async (startDate: string, endDate: string, availability: any) => {
    let start = DateTime.fromISO(startDate).toUTC();
    let end = DateTime.fromISO(endDate).toUTC();
    let slotResult = []
    try {
        let curr = start;
        while(curr <= end){
            let weekDay = curr.weekday - 1
            if(!availability.week[weekDay].isChecked){
                curr = curr.plus({days: 1})
                continue
            }
            const ranges = availability.week[weekDay].timeRanges;
            // Loop through week availability
            for(let i = 0; i < ranges.length; i++){
                // Get time
                const startHour = ranges[i].start.hour
                const startMin = ranges[i].start.minute
                const endHour = ranges[i].end.hour
                const endMin = ranges[i].end.minute
                
                let startDateTimeRef = DateTime.utc(curr.get('year'), curr.get('month'), curr.get('day'), startHour, startMin)
                let endDateTimeRef = DateTime.utc(curr.get('year'), curr.get('month'), curr.get('day'), endHour, endMin)
                let newAvailabilityDay = {
                    from: startDateTimeRef.toISO() as any,
                    to: endDateTimeRef.toISO() as any
                }
                slotResult.push(newAvailabilityDay)
            }
            curr = curr.plus({days: 1})
        }
        // Loop through specific dates
        const specificDates = availability.specificDates;
        const dates = Object.keys(specificDates)
        for(let i = 0; i < dates.length; i++){
            const ranges = specificDates[dates[i]]
            const currDate = DateTime.fromISO(dates[i])
            for(let j = 0; j < ranges.length; j++){
                const startHour = ranges[j].start.hour
                const startMin = ranges[j].start.minute
                const endHour = ranges[j].end.hour
                const endMin = ranges[j].end.minute
                
                let startDateTimeRef = DateTime.utc(currDate.get('year'), currDate.get('month'), currDate.get('day'), startHour, startMin)
                let endDateTimeRef = DateTime.utc(currDate.get('year'), currDate.get('month'), currDate.get('day'), endHour, endMin)
                const specificDayObj = {
                    from: startDateTimeRef.toISO(),
                    to: endDateTimeRef.toISO()
                }
                slotResult.push(specificDayObj)
            }
        }        
    } catch (error: any) {
        console.log(error)
    }    
    return slotResult

}

export const getUnavailability = async (startDate: string, endDate: string, appointments: Array<any>) => {
    let slotResult = []
    try {
        let start = DateTime.fromISO(startDate).toUTC();
        let end = DateTime.fromISO(endDate).toUTC();
        const filterAppointments = appointments.filter((date) => DateTime.fromISO(date) >= start && DateTime.fromISO(date) <= end)
        let curr = start;
        while(curr <= end){
            for(let i = 0; i < filterAppointments.length; i++){
                const unavailableDay = {
                    from: appointments[i].start,
                    to: appointments[i].end
                }
                slotResult.push(unavailableDay)
            }
            curr = curr.plus({days: 1})
        }
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message)
    }
    
    return slotResult

}
