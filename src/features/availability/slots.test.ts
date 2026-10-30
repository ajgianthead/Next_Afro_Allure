import { describe, expect, it } from 'vitest'
import { DateTime } from 'luxon'
import { isBookableStart, openWindows, startTimes, startTimesByDay } from './slots'
import type { AvailabilityData, WeekDay } from './utils'

const NY = 'America/New_York'
const LA = 'America/Los_Angeles'
const closed: WeekDay = { isChecked: false, timeRanges: [] }
const hours = (sh: number, sm: number, eh: number, em: number): WeekDay =>
    ({ isChecked: true, timeRanges: [{ start: { hour: sh, minute: sm }, end: { hour: eh, minute: em } }] })

/** Open the same hours every day of the week. */
const everyDay = (day: WeekDay, specificDates: AvailabilityData['specificDates'] = {}) =>
    ({ week: [day, day, day, day, day, day, day], specificDates })

// Monday 2 Nov 2026 in New York.
const ny = (h: number, m = 0, d = 2) => DateTime.fromObject({ year: 2026, month: 11, day: d, hour: h, minute: m }, { zone: NY })
const fmt = (ms: number[], zone = NY) => ms.map(t => DateTime.fromMillis(t, { zone }).toFormat('HH:mm'))
const day = (d = 2) => ({ from: ny(0, 0, d).toISO()!, to: ny(0, 0, d).endOf('day').toISO()!, notBefore: 0 })

describe('startTimes', () => {
    it('offers every 10 minutes while the whole service still fits', () => {
        const times = startTimes({ schedule: everyDay(hours(9, 0, 12, 0)), busy: [], tz: NY, durationMinutes: 120, ...day() })
        expect(fmt(times)).toEqual(['09:00', '09:10', '09:20', '09:30', '09:40', '09:50', '10:00'])
    })

    it('uses the whole gap between appointments, even when it does not end on a 10-minute mark', () => {
        const busy = [{ start: ny(9).toISO()!, end: ny(13, 45).toISO()! }, { start: ny(15).toISO()!, end: ny(17).toISO()! }]
        const times = startTimes({ schedule: everyDay(hours(9, 0, 17, 0)), busy, tz: NY, durationMinutes: 75, ...day() })
        expect(fmt(times)).toEqual(['13:45'])
    })

    it('reads hours in the business timezone, not the viewer', () => {
        const times = startTimes({ schedule: everyDay(hours(9, 0, 10, 0)), busy: [], tz: NY, durationMinutes: 60, ...day() })
        // 9 AM in New York is 6 AM in Los Angeles.
        expect(fmt(times, LA)).toEqual(['06:00'])
    })

    it('keeps evening hours that cross midnight UTC', () => {
        const times = startTimes({ schedule: everyDay(hours(18, 0, 22, 0)), busy: [], tz: NY, durationMinutes: 180, ...day() })
        expect(fmt(times)).toEqual(['18:00', '18:10', '18:20', '18:30', '18:40', '18:50', '19:00'])
    })

    it('lets a specific date replace the weekly hours', () => {
        const schedule = everyDay(hours(9, 0, 17, 0), { '2026/11/02': [{ start: { hour: 12, minute: 0 }, end: { hour: 13, minute: 0 } }] })
        expect(fmt(startTimes({ schedule, busy: [], tz: NY, durationMinutes: 60, ...day() }))).toEqual(['12:00'])
        // The next day still uses the weekly hours.
        expect(startTimes({ schedule, busy: [], tz: NY, durationMinutes: 60, ...day(3) })[0]).toBe(ny(9, 0, 3).toMillis())
    })

    it('treats a specific date with no hours as closed, and opens a normally closed day', () => {
        const schedule = { week: [closed, closed, closed, closed, closed, closed, closed], specificDates: { '2026-11-02': [{ start: { hour: 10, minute: 0 }, end: { hour: 11, minute: 0 } }] } }
        expect(fmt(startTimes({ schedule, busy: [], tz: NY, durationMinutes: 60, ...day() }))).toEqual(['10:00'])
        const closedDay = everyDay(hours(9, 0, 17, 0), { '2026/11/02': [] })
        expect(startTimes({ schedule: closedDay, busy: [], tz: NY, durationMinutes: 60, ...day() })).toEqual([])
    })

    it('returns nothing for a full day instead of throwing', () => {
        const busy = [{ start: ny(9).toISO()!, end: ny(17).toISO()! }]
        expect(startTimes({ schedule: everyDay(hours(9, 0, 17, 0)), busy, tz: NY, durationMinutes: 30, ...day() })).toEqual([])
        expect(startTimes({ schedule: null, busy: [], tz: NY, durationMinutes: 30, ...day() })).toEqual([])
    })

    it('never offers a time that has already passed', () => {
        const times = startTimes({ schedule: everyDay(hours(9, 0, 11, 0)), busy: [], tz: NY, durationMinutes: 60, ...day(), notBefore: ny(9, 35).toMillis() })
        expect(fmt(times)).toEqual(['09:40', '09:50', '10:00'])
    })

    it('treats an end of 12:00 AM as midnight', () => {
        const times = startTimes({ schedule: everyDay(hours(22, 0, 0, 0)), busy: [], tz: NY, durationMinutes: 120, ...day() })
        expect(fmt(times)).toEqual(['22:00'])
    })

    it('gives the same times whatever range is asked for', () => {
        const schedule = everyDay(hours(9, 0, 17, 0))
        const busy = [{ start: ny(10, 25).toISO()!, end: ny(11, 5).toISO()! }]
        const wholeDay = startTimes({ schedule, busy, tz: NY, durationMinutes: 45, ...day() })
        const afternoon = startTimes({ schedule, busy, tz: NY, durationMinutes: 45, from: ny(13).toISO()!, to: ny(17).toISO()!, notBefore: 0 })
        expect(afternoon).toEqual(wholeDay.filter(t => t >= ny(13).toMillis()))
    })
})

describe('isBookableStart', () => {
    const schedule = everyDay(hours(9, 0, 17, 0))
    const busy = [{ start: ny(14).toISO()!, end: ny(15).toISO()! }]
    const base = { schedule, busy, tz: NY, durationMinutes: 60, notBefore: 0 }

    it('accepts exactly the offered times, however the ISO string is written', () => {
        expect(isBookableStart({ ...base, start: ny(9).toISO()! })).toBe(true)
        expect(isBookableStart({ ...base, start: ny(9).toUTC().toISO()! })).toBe(true)
        expect(isBookableStart({ ...base, start: ny(9).setZone(LA).toISO()! })).toBe(true)
    })

    it('rejects busy, off-grid, closed and invalid times', () => {
        expect(isBookableStart({ ...base, start: ny(13, 30).toISO()! })).toBe(false)
        expect(isBookableStart({ ...base, start: ny(9, 5).toISO()! })).toBe(false)
        expect(isBookableStart({ ...base, start: ny(16, 30).toISO()! })).toBe(false)
        expect(isBookableStart({ ...base, start: 'not a date' })).toBe(false)
    })

    it('rejects times in the past', () => {
        expect(isBookableStart({ ...base, notBefore: ny(12).toMillis(), start: ny(9).toISO()! })).toBe(false)
    })
})

describe('startTimesByDay', () => {
    it('groups by the viewer’s calendar day', () => {
        const schedule = everyDay(hours(23, 0, 23, 59))
        const byDay = startTimesByDay({ schedule, busy: [], tz: LA, displayZone: NY, durationMinutes: 30, ...day(), from: ny(3).toISO()!, to: ny(0, 0, 3).endOf('day').toISO()! })
        // 11 PM in Los Angeles is 2 AM the next day in New York.
        expect(Object.keys(byDay)[0]).toBe('2026-11-03')
        expect(byDay['2026-11-03'][0]).toBe(ny(2, 0, 3).toISO())
    })
})

describe('openWindows', () => {
    it('merges overlapping ranges on the same day', () => {
        const schedule = { week: Array(7).fill({ isChecked: true, timeRanges: [{ start: { hour: 9, minute: 0 }, end: { hour: 12, minute: 0 } }, { start: { hour: 11, minute: 0 }, end: { hour: 14, minute: 0 } }] }), specificDates: {} }
        const w = openWindows(schedule, ny(0).toISO()!, ny(0).endOf('day').toISO()!, NY).filter(i => i.start >= ny(0).toMillis() && i.start < ny(0, 0, 3).toMillis())
        expect(w).toEqual([{ start: ny(9).toMillis(), end: ny(14).toMillis() }])
    })
})
