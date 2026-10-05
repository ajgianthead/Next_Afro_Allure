import { describe, expect, it } from 'vitest'
import { openingsCaption, startTimesInWindows } from './openings'

describe('startTimesInWindows', () => {
    it('fits back-to-back appointments in a window', () => {
        const times = startTimesInWindows([['2030-03-05T09:00:00Z', '2030-03-05T19:00:00Z']], 300)
        expect(times.map(t => t.toISOString())).toEqual(['2030-03-05T09:00:00.000Z', '2030-03-05T14:00:00.000Z'])
    })
    it('rounds up to the quarter hour and skips windows that are too short', () => {
        const times = startTimesInWindows([['2030-03-05T09:05:00Z', '2030-03-05T10:00:00Z'], ['2030-03-05T12:10:00Z', '2030-03-05T14:00:00Z']], 60)
        expect(times.map(t => t.toISOString())).toEqual(['2030-03-05T12:15:00.000Z'])
    })
    it('caps the list', () => {
        expect(startTimesInWindows([['2030-03-05T08:00:00Z', '2030-03-05T20:00:00Z']], 30, 3)).toHaveLength(3)
    })
})

describe('openingsCaption', () => {
    it('lists days with times and the link', () => {
        const text = openingsCaption('Kay', [{ label: 'Thu 3/5', times: ['10 AM', '2 PM'] }, { label: 'Fri 3/6', times: [] }], 'kay.afroallure.co')
        expect(text).toContain('Thu 3/5: 10 AM, 2 PM')
        expect(text).not.toContain('Fri')
        expect(text).toContain('Book now: kay.afroallure.co')
    })
})
