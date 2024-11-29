'use server'

import { stripe as SP } from "@lib/utils";
import pool from "@utils/dbPool";
import { DateTime } from "luxon";
import { getSlots, OutputSlot } from "slot-calculator";


// Helper function that checks to see if a certain timeslot if available for booking or rescheduling
 export const checkSlots = async (timeSlot: {
    start?: string;
    end?: string;
    appointmentLength?: number;
}, availability: any, appointments: any) => {    
    const beginDay = DateTime.fromISO(timeSlot.start!).startOf('day').toISO()!
    const endDay = DateTime.fromISO(timeSlot.end!).endOf('day').toISO()!
    const formattedAv = availability.length > 0 ? await getAvailability(beginDay, endDay, availability) : []
    const formattedUnav = await getUnavailability(beginDay, endDay, appointments)
    
    const {availableSlots} = getSlots({
        from: beginDay,
        to: endDay,
        duration: timeSlot.appointmentLength!,
        availability: formattedAv,
        unavailability: formattedUnav
    })        
    return availableSlots
}

export const cancelAppointment = async (appointmentID: string) => {
    // Check if appointment still exists
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(`SELECT * FROM appointments app WHERE app.id = ${appointmentID}`)
        if(result.rowCount === 0){
            throw Error("Appointment doesn't exist")
        }
        const appointment = result.rows[0]
        if(appointment.status === "CANCELLED"){
            throw Error("Already cancelled")
        }
        await client.query(`UPDATE appointments SET status = ${'CANCELLED'} WHERE id = ${appointmentID} RETURNING *`)
        // Handle deposit refund
        await client.query('END')
    } catch (error: any) {
        if(error.message === "Appointment doesn't exist"){
            await client.query("ROLLBACK")
            return -1
        }
        if(error.message === "Already cancelled"){
            await client.query("ROLLBACK")
            return 0
        }
        
    }finally {
        client.release();
    }
    
}

export const rescheduleAppointment = async (appointmentID: string, timeSlot: {
    start: string;
    end: string;
    appointmentLength: number;
}, businessId: string) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN');
        // Check if timeslot is still available
        // 1. Get availability and appointments
        const availability = (await client.query(`SELECT availability FROM business_users bu WHERE bu.business_id = ${businessId}`)).rows[0]
        const appointments = (await client.query(`SELECT * FROM appointments app WHERE app.business = ${businessId}`)).rows[0]
       
        let available: boolean = false
        const availableSlots = await checkSlots(timeSlot, availability, appointments)
        availableSlots.forEach((slot: OutputSlot, index: number) => {
            if(slot.from === timeSlot.start && slot.to === timeSlot.end){
                available = true
            }
        })
        if(!available){
            throw Error("Timeslot is no longer available")
        }
        // UPDATE appointment timeslot
        const appointment = await client.query(`UPDATE appointments SET start = $1, "end" = $2 WHERE id = $3 RETURNING *`, [timeSlot.start, timeSlot.end, appointmentID])
        
        return appointment.rows[0]
    }catch (error) {
        await client.query('ROLLBACK')
    } finally {
        client.release();
    }
}

export const bookAppointment = async (paymentIntentID: string, businessId: string, policyId: string, serviceData: Service, client_metadata: any, timeSlot: {
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
        const availability = availabilities.filter((availability: any, index: number) => availability.id === "e69f4e31-6648-4be5-8577-bb004333a332")[0]        

        // let available: boolean = false
        // const availableSlots = await checkSlots(timeSlot, availability, appointments)

        // availableSlots.forEach((slot: OutputSlot, index: number) => {            
        //     if(DateTime.fromISO(slot.from).equals(DateTime.fromISO(timeSlot.start!))  && DateTime.fromISO(slot.to).equals(DateTime.fromISO(timeSlot.end!))){
        //         available = true
        //     }
        // })      
        // if(!available){
        //     throw Error("Timeslot is no longer available")
        // }

        // 2. 
        // Check if policy and service has changed since the user first loaded the page
        const policy = await client.query(`SELECT booking_policies FROM business_users bu WHERE bu.business_id = $1`, [businessId])        
        if(policy.rows[0].booking_policies !== policyId){
            throw Error("Business data has changed")
        }
        // Charge account if policy requires deposit
        const businessPolicy = await client.query(`SELECT * FROM business_policies bp WHERE bp.id = $1`, [policy.rows[0].booking_policies])        
        
        let appointment;
        if(businessPolicy.rows[0].deposit.enabled){
            appointment = await client.query(`INSERT INTO appointments (start, "end", business, client_metadata, status, service_data, deposit_charge_id) VALUES ($1, $2, $3, $4, 'CONFIRMED', $5, $6) RETURNING *`, [timeSlot.start, timeSlot.end, businessId, client_metadata, serviceData, paymentIntentID])                               
            //TODO: Create charge with Stripe -> LATER!!
            
        }else{
            // Make different INSERT
            appointment = await client.query(`INSERT INTO appointments (start, "end", business, client_metadata, status, service_data) VALUES ($1, $2, $3, $4, 'CONFIRMED', $5) RETURNING *`, [timeSlot.start, timeSlot.end, businessId, client_metadata, serviceData])                               

        }
        await client.query('COMMIT');
        // Send query to supabase confirming the appointment
        return appointment.rows[0]

    } catch (error) {
        console.error(error)
        await client.query('ROLLBACK')

    } finally {
        client.release();
    }
}

export const getAvailability = async (startDate: string, endDate: string, availability: any) => {
    let start = DateTime.fromISO(startDate);
    let end = DateTime.fromISO(endDate);
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
                
                let startDateTimeRef = DateTime.local(curr.get('year'), curr.get('month'), curr.get('day'), startHour, startMin)
                let endDateTimeRef = DateTime.local(curr.get('year'), curr.get('month'), curr.get('day'), endHour, endMin)
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
                
                let startDateTimeRef = DateTime.local(currDate.get('year'), currDate.get('month'), currDate.get('day'), startHour, startMin)
                let endDateTimeRef = DateTime.local(currDate.get('year'), currDate.get('month'), currDate.get('day'), endHour, endMin)
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
        let start = DateTime.fromISO(startDate);
        let end = DateTime.fromISO(endDate);
               
        let curr = start;
        while(curr <= end){
            for(let i = 0; i < appointments.length; i++){
                const unavailableDay = {
                    from: DateTime.fromJSDate(appointments[i].start).toISO()!,
                    to: DateTime.fromJSDate(appointments[i].end).toISO()!
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
