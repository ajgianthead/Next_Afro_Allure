import { describe, expect, it } from 'vitest'
import { firstUnfinishedStep, isUntouchedExampleService, isValidBookAhead, scheduleProblem } from './progress'

describe('firstUnfinishedStep', () => {
    it('starts a new account at the intro', () => {
        expect(firstUnfinishedStep({})).toBe('welcome')
        expect(firstUnfinishedStep(null)).toBe('welcome')
    })

    it('resumes at the first unsaved step', () => {
        expect(firstUnfinishedStep({ welcome_location: true })).toBe('hours')
        expect(firstUnfinishedStep({ welcome_location: true, welcome_hours: true })).toBe('services')
        expect(firstUnfinishedStep({ welcome_location: true, welcome_hours: true, welcome_services: true })).toBe('policies')
    })

    it('goes to the optional appointment once everything is saved', () => {
        expect(firstUnfinishedStep({ welcome_location: true, welcome_hours: true, welcome_services: true, welcome_policies: true })).toBe('appointment')
    })

    it('is done once the welcome is finished', () => {
        expect(firstUnfinishedStep({ welcome: true })).toBe('done')
    })
})

describe('isUntouchedExampleService', () => {
    const example = { name: 'Box Braids', description: 'This is an example service', categories: ['test', 'default', 'service'] }

    it('matches the signup placeholder', () => {
        expect(isUntouchedExampleService(example)).toBe(true)
    })

    it('leaves it alone once the business has changed it', () => {
        expect(isUntouchedExampleService({ ...example, name: 'Box braids (medium)' })).toBe(false)
        expect(isUntouchedExampleService({ ...example, description: 'My braids' })).toBe(false)
        expect(isUntouchedExampleService({ ...example, categories: ['braids'] })).toBe(false)
    })
})

describe('scheduleProblem', () => {
    const range = (sh: number, eh: number) => ({ start: { hour: sh, minute: 0 }, end: { hour: eh, minute: 0 } })
    const day = (isChecked: boolean, ranges = [range(9, 17)]) => ({ isChecked, timeRanges: ranges })
    const week = (first = day(true)) => [first, ...Array.from({ length: 6 }, () => day(false))]

    it('accepts a normal week', () => {
        expect(scheduleProblem({ name: 'Regular hours', week: week() })).toBeNull()
    })

    it('needs a name and at least one day', () => {
        expect(scheduleProblem({ name: ' ', week: week() })).toBe('Give this schedule a name.')
        expect(scheduleProblem({ name: 'Hours', week: week(day(false)) })).toBe('Pick at least one day you work.')
    })

    it('rejects missing, backwards and overlapping times', () => {
        expect(scheduleProblem({ name: 'Hours', week: week(day(true, [{ start: null, end: null }])) })).toMatch(/start and end/)
        expect(scheduleProblem({ name: 'Hours', week: week(day(true, [range(17, 9)])) })).toMatch(/after its start/)
        expect(scheduleProblem({ name: 'Hours', week: week(day(true, [range(9, 13), range(12, 17)])) })).toMatch(/overlap/)
    })
})

describe('isValidBookAhead', () => {
    it('accepts the stored formats with their minimums', () => {
        expect(isValidBookAhead('1 month')).toBe(true)
        expect(isValidBookAhead('4 week')).toBe(true)
        expect(isValidBookAhead('28 day')).toBe(true)
        expect(isValidBookAhead('2 week')).toBe(false)
        expect(isValidBookAhead('soon')).toBe(false)
    })
})
