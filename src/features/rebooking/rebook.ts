// Maintenance-cycle rebooking: when to remind a client to book their next
// visit. Pure, no imports — also used by the Trigger.dev job.

/** Remind this many days before the client is due, so they can still get a slot. */
export const LEAD_DAYS = 5
/** Don't send a reminder that's more than this many days late (e.g. the setting was just turned on). */
export const GRACE_DAYS = 14

const DAY = 86400000

/** When the reminder should go out for a visit that ended at `visitEnd`. */
export function rebookReminderDate(visitEnd: Date, weeks: number): Date {
    return new Date(visitEnd.getTime() + (weeks * 7 - LEAD_DAYS) * DAY)
}

/** Whether a reminder for this visit is due today. */
export function isRebookReminderDue(visitEnd: Date, weeks: number | null | undefined, now: Date): boolean {
    if (!weeks || weeks < 1) return false
    const due = rebookReminderDate(visitEnd, weeks).getTime()
    return now.getTime() >= due && now.getTime() <= due + GRACE_DAYS * DAY
}

/** Oldest visit end worth looking at for a given longest cycle (weeks). */
export function oldestVisitToCheck(now: Date, maxWeeks = 52): Date {
    return new Date(now.getTime() - (maxWeeks * 7 + GRACE_DAYS) * DAY)
}
