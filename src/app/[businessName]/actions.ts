'use server'

import { DateTime } from "luxon";

export const getAvailability = async (startDate: string, endDate: string, availability: any) => {
    let start = DateTime.fromISO(startDate).toUTC();
    let end = DateTime.fromISO(endDate).toUTC();
    try {
        let slotResult = []
        let curr = start;
        while(curr <= end){
            let weekDay = curr.weekday - 1
            const ranges = availability.week[weekDay].timeRanges;
            for(let i = 0; i < ranges.length; i++){
                // Get time
                const startHour = ranges[i].start.hour
                const startMin = ranges[i].start.minute
                const endHour = ranges[i].end.hour
                const endMin = ranges[i].end.minute
                
                let startDateTimeRef = DateTime.utc(curr.get('year'), curr.get('month'), curr.get('day'), startHour, startMin)
                let endDateTimeRef = DateTime.utc(curr.get('year'), curr.get('month'), curr.get('day'), endHour, endMin)
                let newAvailabilityDay = {
                    from: startDateTimeRef.toISO(),
                    to: endDateTimeRef.toISO()
                }
                slotResult.push(newAvailabilityDay)

            }
            curr = curr.plus({days: 1})
        }
        return slotResult
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message)
    }
}

const getUnavailability = async (startDate: string, endDate: string, appointments: Array<any>) => {
    try {
        let start = DateTime.fromISO(startDate).toUTC();
        let end = DateTime.fromISO(endDate).toUTC();
        const filterAppointments = appointments.filter((date) => DateTime.fromISO(date) >= start && DateTime.fromISO(date) <= end)
        let slotResult = []
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
        return slotResult
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message)
    }
}
