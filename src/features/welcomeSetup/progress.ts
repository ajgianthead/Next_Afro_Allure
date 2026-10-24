import type { WeekDay } from '@/features/availability/utils'

/**
 * The welcome setup's steps, in order. Each step that saves something
 * records `welcome_<step>` in business_users.tours_completed, so a business
 * that leaves halfway comes back to the first step it hasn't finished.
 * `welcome: true` is set once they reach the end.
 */
export const WELCOME_STEPS = ['welcome', 'location', 'hours', 'services', 'policies', 'appointment', 'done'] as const
export type WelcomeStep = typeof WELCOME_STEPS[number]

/** Steps whose completion is stored (the others save nothing). */
export const SAVED_STEPS = ['location', 'hours', 'services', 'policies'] as const
export type SavedWelcomeStep = typeof SAVED_STEPS[number]

export const progressKey = (step: SavedWelcomeStep) => `welcome_${step}`

/** Where to open the modal: the intro for a fresh account, else the first unsaved step. */
export function firstUnfinishedStep(toursCompleted: Record<string, boolean> | null | undefined): WelcomeStep {
    const done = toursCompleted ?? {}
    if (done.welcome) return 'done'
    const next = SAVED_STEPS.find(step => !done[progressKey(step)])
    if (!next) return 'appointment'
    return next === 'location' ? 'welcome' : next
}

/**
 * The "Box Braids" placeholder made at signup (Service.createDefault). It's
 * only removed while the business hasn't changed it.
 */
export function isUntouchedExampleService(service: { name: string; categories?: string[] | null; description?: string | null }): boolean {
    const categories = service.categories ?? []
    return service.name === 'Box Braids'
        && service.description === 'This is an example service'
        && categories.length === 3
        && ['test', 'default', 'service'].every(c => categories.includes(c))
}

const minutesOf = (t: { hour: number; minute: number } | null) => (t ? t.hour * 60 + t.minute : null)

/** The first problem with a weekly schedule, or null. */
export function scheduleProblem(schedule: { name: string; week: WeekDay[] }): string | null {
    if (!schedule.name.trim()) return 'Give this schedule a name.'
    if (!schedule.week.some(day => day.isChecked)) return 'Pick at least one day you work.'
    for (const day of schedule.week) {
        if (!day.isChecked) continue
        let previousEnd = -1
        for (const range of day.timeRanges) {
            const start = minutesOf(range.start)
            const end = minutesOf(range.end)
            if (start === null || end === null) return 'Fill in a start and end time for each day you work.'
            if (end <= start) return 'Each end time needs to be after its start time.'
            if (start <= previousEnd) return 'Time ranges on the same day can’t overlap.'
            previousEnd = end
        }
    }
    return null
}

/** Book-ahead choices offered in the welcome setup (stored as "<n> month"). */
export const BOOK_AHEAD_OPTIONS = [
    { value: '1 month', label: '1 month' },
    { value: '2 month', label: '2 months' },
    { value: '3 month', label: '3 months' },
    { value: '6 month', label: '6 months' },
]

/** Accepts the stored book-ahead format: "<n> month|week|day". */
export function isValidBookAhead(value: string): boolean {
    const match = /^(\d{1,3}) (month|week|day)$/.exec(value)
    if (!match) return false
    const n = Number(match[1])
    const min = match[2] === 'month' ? 1 : match[2] === 'week' ? 4 : 28
    return n >= min
}
