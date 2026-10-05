import { describe, expect, it } from 'vitest'
import { matchesOpening, partOfDay, waitlistProblem, type WaitlistInput } from './waitlist'

const base: WaitlistInput = {
    businessId: 'b', firstName: 'Ama', lastName: 'K', email: 'ama@example.com', phone: '',
    fromDate: '2030-03-01', toDate: '2030-03-07', timeOfDay: 'any',
}

describe('waitlistProblem', () => {
    it('accepts a normal sign-up', () => {
        expect(waitlistProblem(base, '2030-02-20')).toBeNull()
    })
    it('rejects bad input', () => {
        expect(waitlistProblem({ ...base, email: 'nope' }, '2030-02-20')).toMatch(/email/)
        expect(waitlistProblem({ ...base, toDate: '2030-02-28' }, '2030-02-20')).toMatch(/after/)
        expect(waitlistProblem(base, '2030-03-08')).toMatch(/passed/)
        expect(waitlistProblem({ ...base, toDate: '2030-12-01' }, '2030-02-20')).toMatch(/within/)
        expect(waitlistProblem({ ...base, fromDate: 'soon' }, '2030-02-20')).toMatch(/dates/)
    })
})

describe('matchesOpening', () => {
    const entry = { fromDate: '2030-03-01', toDate: '2030-03-07', timeOfDay: 'any' as const, serviceId: null, status: 'waiting' as const }

    it('matches inside the dates', () => {
        expect(matchesOpening(entry, { date: '2030-03-03', hour: 10, serviceId: 's1' })).toBe(true)
        expect(matchesOpening(entry, { date: '2030-03-08', hour: 10, serviceId: 's1' })).toBe(false)
    })
    it('respects time of day', () => {
        expect(matchesOpening({ ...entry, timeOfDay: 'evening' }, { date: '2030-03-03', hour: 18, serviceId: null })).toBe(true)
        expect(matchesOpening({ ...entry, timeOfDay: 'evening' }, { date: '2030-03-03', hour: 9, serviceId: null })).toBe(false)
    })
    it('respects a chosen service', () => {
        expect(matchesOpening({ ...entry, serviceId: 's1' }, { date: '2030-03-03', hour: 10, serviceId: 's2' })).toBe(false)
        expect(matchesOpening({ ...entry, serviceId: 's1' }, { date: '2030-03-03', hour: 10, serviceId: 's1' })).toBe(true)
    })
    it('skips clients no longer waiting', () => {
        expect(matchesOpening({ ...entry, status: 'booked' }, { date: '2030-03-03', hour: 10, serviceId: null })).toBe(false)
    })
    it('buckets hours', () => {
        expect([partOfDay(8), partOfDay(12), partOfDay(16), partOfDay(17)]).toEqual(['morning', 'afternoon', 'afternoon', 'evening'])
    })
})
