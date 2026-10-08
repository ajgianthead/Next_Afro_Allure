// Text message wording. Every template fits one 160-character GSM-7 segment:
// long business, client or service names are shortened to make room, never
// the time or the link. Pure module: used by the app and inside Trigger.dev.

import { DateTime } from 'luxon'
import { SEGMENT_CHARS, gsmLength, toGsm } from './gsm'

const STOP = 'Reply STOP to opt out.'

/** "Fri, Oct 10 at 2:00 PM" in the business's timezone. */
export function formatWhen(iso: string, timezone: string): string {
    const dt = DateTime.fromISO(iso, { setZone: true }).setZone(timezone)
    return dt.isValid ? dt.toFormat("ccc, LLL d 'at' h:mm a") : ''
}

/** The short pay link texted to clients; /p/<id> redirects to the full payment page. */
export function payLink(baseUrl: string, appointmentId: string): string {
    return `${baseUrl.replace(/\/+$/, '')}/p/${appointmentId}`
}

/**
 * Builds the text, then shortens the named fields, in the order given, until
 * it fits one segment. The first pass keeps at least 20 characters of each
 * (so the sender's name stays recognisable); a second pass goes shorter only
 * if it still doesn't fit. Fields not named (times, links) are never cut.
 */
function fit<F extends Record<string, string>>(build: (f: F) => string, fields: F, shrinkInOrder: (keyof F & string)[]): string {
    const f: Record<string, string> = { ...fields }
    for (const k of Object.keys(f)) f[k] = toGsm(f[k])
    let text = toGsm(build(f as F))
    for (const floor of [20, 6]) {
        for (const k of shrinkInOrder) {
            const over = gsmLength(text) - SEGMENT_CHARS
            if (over <= 0) return text
            if (f[k].length <= floor) continue
            const keep = Math.max(floor - 3, f[k].length - over - 3)
            f[k] = `${f[k].slice(0, keep).trimEnd()}...`
            text = toGsm(build(f as F))
        }
    }
    return gsmLength(text) > SEGMENT_CHARS ? text.slice(0, SEGMENT_CHARS) : text
}

const dayWord = (kind: 'day' | 'hour') => (kind === 'day' ? 'tomorrow' : 'in 1 hour')

export const smsTemplates = {
    clientConfirmation: (p: { business: string; service: string; when: string }) =>
        fit(f => `${f.business}: You're booked for ${f.service} on ${f.when}. ${STOP}`, p, ['service', 'business']),

    clientReminder: (p: { business: string; service: string; when: string; kind: 'day' | 'hour' }) =>
        fit(f => `${f.business}: Reminder, your ${f.service} is ${dayWord(p.kind)}, ${f.when}. ${STOP}`,
            { business: p.business, service: p.service, when: p.when }, ['service', 'business']),

    clientPaymentLink: (p: { business: string; service: string; url: string }) =>
        fit(f => `${f.business}: Pay for your ${f.service} here: ${f.url} ${STOP}`, p, ['service', 'business']),

    businessNewBooking: (p: { client: string; service: string; when: string }) =>
        fit(f => `AfroAllure: New booking. ${f.client}, ${f.service}, ${f.when}. ${STOP}`, p, ['service', 'client']),

    businessReminder: (p: { client: string; service: string; when: string; kind: 'day' | 'hour' }) =>
        fit(f => `AfroAllure: Reminder, ${f.client}'s ${f.service} is ${dayWord(p.kind)}, ${f.when}. ${STOP}`,
            { client: p.client, service: p.service, when: p.when }, ['service', 'client']),
}
