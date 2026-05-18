export type TimePoint = { hour: number; minute: number }
export type TimeRange = { start: TimePoint | null; end: TimePoint | null }
export type WeekDay = { isChecked: boolean; timeRanges: TimeRange[] }
export type AvailabilityData = {
    id: string
    name: string
    week: WeekDay[]
    specificDates: Record<string, TimeRange[]>
}

export function toTimeString(t: TimePoint | null | undefined): string {
    if (!t) return ''
    return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`
}

export function addMinute(timeStr: string): string {
    if (!timeStr) return '00:01'
    const [h, m] = timeStr.split(':').map(Number)
    const total = h * 60 + m + 1
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

const DEFAULT_SLOT: TimeRange = { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } }

export function createDefaultAvailability(): AvailabilityData {
    return {
        id: crypto.randomUUID(),
        name: '',
        week: [
            { isChecked: true, timeRanges: [{ ...DEFAULT_SLOT }] },
            { isChecked: true, timeRanges: [{ ...DEFAULT_SLOT }] },
            { isChecked: true, timeRanges: [{ ...DEFAULT_SLOT }] },
            { isChecked: true, timeRanges: [{ ...DEFAULT_SLOT }] },
            { isChecked: true, timeRanges: [{ ...DEFAULT_SLOT }] },
            { isChecked: false, timeRanges: [{ ...DEFAULT_SLOT }] },
            { isChecked: false, timeRanges: [{ ...DEFAULT_SLOT }] },
        ],
        specificDates: {},
    }
}
