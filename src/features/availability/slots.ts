// Bookable start times — the one place that turns a business's schedule and
// busy times into the times a client can pick. The booking page, reschedule
// page, server-side checks and the openings graphic all use it, so what a
// client is shown is exactly what the server accepts. Pure: runs in the
// browser and on the server.

import { DateTime } from 'luxon'
import type { AvailabilityData, TimeRange } from './utils'

/** Half-open [start, end) in epoch ms. */
export interface Interval {
    start: number
    end: number
}

type Instant = string | Date | number
type Busy = { start: Instant; end: Instant }
type Schedule = Pick<AvailabilityData, 'week' | 'specificDates'> | null | undefined

/** Start times are offered every 10 minutes from the start of each free window. */
export const SLOT_STEP_MINUTES = 10

const MINUTE = 60_000

function toMs(t: Instant): number {
    if (typeof t === 'number') return t
    if (t instanceof Date) return t.getTime()
    return DateTime.fromISO(t, { setZone: true }).toMillis()
}

/** Specific dates are saved as "2026/11/02" by the editor; older data may use "2026-11-02". */
function specificDateRanges(schedule: NonNullable<Schedule>, day: DateTime): TimeRange[] | undefined {
    const dates = schedule.specificDates ?? {}
    return dates[day.toFormat('yyyy/MM/dd')] ?? dates[day.toISODate()!]
}

function mergeIntervals(list: Interval[]): Interval[] {
    const sorted = list.filter(i => i.end > i.start).sort((a, b) => a.start - b.start)
    const out: Interval[] = []
    for (const i of sorted) {
        const last = out[out.length - 1]
        if (last && i.start <= last.end) last.end = Math.max(last.end, i.end)
        else out.push({ ...i })
    }
    return out
}

/**
 * Open hours between `from` and `to`, read in the business's timezone. A
 * specific date replaces the weekly hours for that day (an empty list means
 * closed). Whole windows are returned, even where they extend past
 * from/to, so start times line up the same whatever range is asked for.
 */
export function openWindows(schedule: Schedule, from: Instant, to: Instant, tz: string): Interval[] {
    if (!schedule?.week) return []
    const fromMs = toMs(from)
    const toMsVal = toMs(to)
    const windows: Interval[] = []
    let day = DateTime.fromMillis(fromMs, { zone: tz }).startOf('day').minus({ days: 1 })
    const lastDay = DateTime.fromMillis(toMsVal, { zone: tz }).startOf('day').plus({ days: 1 })
    while (day <= lastDay) {
        const weekDay = schedule.week[day.weekday - 1]
        const ranges = specificDateRanges(schedule, day) ?? (weekDay?.isChecked ? weekDay.timeRanges : [])
        for (const r of ranges ?? []) {
            if (!r?.start || !r?.end) continue
            const start = day.set({ hour: r.start.hour, minute: r.start.minute }).toMillis()
            let end = day.set({ hour: r.end.hour, minute: r.end.minute }).toMillis()
            // "…to 12:00 AM" means midnight at the end of the day.
            if (end <= start && r.end.hour === 0 && r.end.minute === 0) end = day.plus({ days: 1 }).toMillis()
            if (end > fromMs - 86_400_000 && start < toMsVal + 86_400_000) windows.push({ start, end })
        }
        day = day.plus({ days: 1 })
    }
    return mergeIntervals(windows)
}

/** `windows` minus every busy interval. */
export function subtractBusy(windows: Interval[], busy: Busy[]): Interval[] {
    const blocks = mergeIntervals(busy.map(b => ({ start: toMs(b.start), end: toMs(b.end) })))
    const out: Interval[] = []
    for (const w of windows) {
        let cursor = w.start
        for (const b of blocks) {
            if (b.end <= cursor || b.start >= w.end) continue
            if (b.start > cursor) out.push({ start: cursor, end: b.start })
            cursor = Math.max(cursor, b.end)
            if (cursor >= w.end) break
        }
        if (cursor < w.end) out.push({ start: cursor, end: w.end })
    }
    return out
}

/** Free time (open hours minus busy times) overlapping from..to. */
export function freeWindows(schedule: Schedule, busy: Busy[], from: Instant, to: Instant, tz: string): Interval[] {
    const fromMs = toMs(from)
    const toMsVal = toMs(to)
    return subtractBusy(openWindows(schedule, from, to, tz), busy).filter(w => w.end > fromMs && w.start < toMsVal)
}

export interface StartTimesOptions {
    schedule: Schedule
    busy: Busy[]
    from: Instant
    to: Instant
    /** The business's timezone — the one its hours are written in. */
    tz: string
    durationMinutes: number
    /** Nothing earlier than this is offered (default: now). */
    notBefore?: Instant
    stepMinutes?: number
}

/** Every start time in from..to where the whole service fits in free time, ascending (epoch ms). */
export function startTimes(opts: StartTimesOptions): number[] {
    const duration = Math.round(Number(opts.durationMinutes) * MINUTE)
    if (!(duration > 0)) return []
    const step = (opts.stepMinutes ?? SLOT_STEP_MINUTES) * MINUTE
    const fromMs = toMs(opts.from)
    const toMsVal = toMs(opts.to)
    const earliest = Math.max(fromMs, opts.notBefore === undefined ? Date.now() : toMs(opts.notBefore))
    const out: number[] = []
    for (const w of freeWindows(opts.schedule, opts.busy, opts.from, opts.to, opts.tz)) {
        for (let t = w.start; t + duration <= w.end; t += step) {
            if (t >= earliest && t < toMsVal) out.push(t)
        }
    }
    return out
}

/** startTimes grouped by calendar day ("yyyy-MM-dd") in `displayZone`, as ISO strings in that zone. */
export function startTimesByDay(opts: StartTimesOptions & { displayZone: string }): Record<string, string[]> {
    const byDay: Record<string, string[]> = {}
    for (const t of startTimes(opts)) {
        const dt = DateTime.fromMillis(t, { zone: opts.displayZone })
        const key = dt.toISODate()!
        ;(byDay[key] ??= []).push(dt.toISO()!)
    }
    return byDay
}

/** Whether `start` is one of the start times offered for this schedule, busy list and duration. */
export function isBookableStart(opts: Omit<StartTimesOptions, 'from' | 'to'> & { start: Instant }): boolean {
    const start = toMs(opts.start)
    if (!Number.isFinite(start)) return false
    return startTimes({ ...opts, from: start, to: start + MINUTE }).includes(start)
}
