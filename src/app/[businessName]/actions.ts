'use server'

import { DateTime } from "luxon";

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
                    from: startDateTimeRef.toISO(),
                    to: endDateTimeRef.toISO()
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
