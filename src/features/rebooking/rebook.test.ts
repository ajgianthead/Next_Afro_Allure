import { describe, expect, it } from 'vitest'
import { isRebookReminderDue, rebookReminderDate } from './rebook'

const visit = new Date('2030-01-01T18:00:00Z')

describe('rebook reminders', () => {
    it('goes out a few days before the client is due', () => {
        // 6 weeks = 42 days, minus 5 days lead
        expect(rebookReminderDate(visit, 6).toISOString()).toBe('2030-02-07T18:00:00.000Z')
    })
    it('is due from the reminder date for two weeks', () => {
        expect(isRebookReminderDue(visit, 6, new Date('2030-02-07T17:00:00Z'))).toBe(false)
        expect(isRebookReminderDue(visit, 6, new Date('2030-02-07T19:00:00Z'))).toBe(true)
        expect(isRebookReminderDue(visit, 6, new Date('2030-02-20T19:00:00Z'))).toBe(true)
        expect(isRebookReminderDue(visit, 6, new Date('2030-02-22T19:00:00Z'))).toBe(false)
    })
    it('is never due when the service has no cycle', () => {
        expect(isRebookReminderDue(visit, null, new Date('2030-02-10T00:00:00Z'))).toBe(false)
    })
})
