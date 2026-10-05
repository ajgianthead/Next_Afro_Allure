// "Openings this week" — turning free time into a short list of bookable
// start times for a shareable graphic. Pure.

export interface OpeningDay {
    /** yyyy-mm-dd (business timezone) */
    date: string
    /** e.g. "10:00 AM" */
    times: string[]
}

/**
 * Non-overlapping start times that fit a service of `minutes` inside free
 * windows (ISO pairs, already in the business timezone), at most `cap`.
 * Starts are rounded up to the next quarter hour.
 */
export function startTimesInWindows(windows: [string, string][], minutes: number, cap = 4): Date[] {
    if (!(minutes > 0)) return []
    const quarter = 15 * 60000
    const out: Date[] = []
    for (const [from, to] of windows) {
        let start = Math.ceil(Date.parse(from) / quarter) * quarter
        const end = Date.parse(to)
        while (start + minutes * 60000 <= end && out.length < cap) {
            out.push(new Date(start))
            start += Math.max(minutes, 60) * 60000
        }
        if (out.length >= cap) break
    }
    return out
}

/** "Mon 3/4" style labels with a few times each, for the caption. */
export function openingsCaption(businessName: string, days: { label: string; times: string[] }[], link: string): string {
    const lines = days.filter(d => d.times.length).map(d => `${d.label}: ${d.times.join(', ')}`)
    if (!lines.length) return `${businessName} is fully booked right now — join the waitlist at ${link}`
    return [`Openings this week ✨`, '', ...lines, '', `Book now: ${link}`].join('\n')
}
