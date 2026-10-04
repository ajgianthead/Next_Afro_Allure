import { DateTime } from 'luxon'

/**
 * Appointment date/time inputs are wall-clock values in the business's
 * browser. They must be turned into instants *in the browser* — the server
 * runs in UTC, so combining them there shifted every appointment by the
 * business's UTC offset.
 */
export function combineDateAndTime(date: Date, hhmm: string): DateTime {
    const [h, m] = hhmm.split(':').map(Number)
    return DateTime.fromJSDate(date).set({ hour: h, minute: m, second: 0, millisecond: 0 })
}

/** Returns an error message, or null when the date/start/end are bookable. */
export function validateAppointmentTimes(date: Date | undefined, start: string, end: string, now: DateTime = DateTime.now()): string | null {
    if (!date) return 'Please pick a date'
    if (!start || !end) return 'Please enter a start and end time'
    const startDt = combineDateAndTime(date, start)
    const endDt = combineDateAndTime(date, end)
    if (!startDt.isValid || !endDt.isValid) return 'Please enter a valid start and end time'
    if (startDt.startOf('day') < now.startOf('day')) return "Appointments can't be booked on a past date"
    if (startDt < now.startOf('minute')) return 'That start time has already passed. Pick a later time today or another day.'
    if (endDt <= startDt) return 'End time must be after the start time'
    return null
}

/** Adds minutes to an "HH:mm" time, capped at 23:59 so the end stays on the same day. */
export function addMinutesToTime(hhmm: string, minutes: number): string {
    const [h, m] = hhmm.split(':').map(Number)
    if (Number.isNaN(h) || Number.isNaN(m)) return ''
    const total = Math.min(h * 60 + m + Math.max(0, minutes), 23 * 60 + 59)
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** Earliest selectable "HH:mm" for the given date: now (rounded up to the minute) if it's today, otherwise midnight. */
export function minStartTimeFor(date: Date | undefined, now: DateTime = DateTime.now()): string | undefined {
    if (!date) return undefined
    if (!DateTime.fromJSDate(date).hasSame(now, 'day')) return undefined
    return now.plus({ minutes: 1 }).toFormat('HH:mm')
}
