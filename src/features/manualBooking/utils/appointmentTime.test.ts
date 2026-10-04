import { describe, expect, it } from 'vitest'
import { DateTime, Settings } from 'luxon'
import { addMinutesToTime, minStartTimeFor, validateAppointmentTimes } from './appointmentTime'
import { toZonedISO } from '../../../lib/timezone'
import { validateBusinessAddress, EMPTY_ADDRESS } from '../../../lib/businessAddress'

const now = DateTime.fromISO('2026-10-03T14:30:00')
const today = now.toJSDate()
const tomorrow = now.plus({ days: 1 }).toJSDate()
const yesterday = now.minus({ days: 1 }).toJSDate()

describe('validateAppointmentTimes', () => {
    it('allows a later time today', () => {
        expect(validateAppointmentTimes(today, '17:00', '18:00', now)).toBeNull()
    })
    it('rejects a start time earlier today', () => {
        expect(validateAppointmentTimes(today, '13:00', '18:00', now)).toMatch(/already passed/)
    })
    it('rejects a past date', () => {
        expect(validateAppointmentTimes(yesterday, '17:00', '18:00', now)).toMatch(/past date/)
    })
    it('rejects an end before (or equal to) the start', () => {
        expect(validateAppointmentTimes(tomorrow, '17:00', '16:00', now)).toMatch(/after the start/)
        expect(validateAppointmentTimes(tomorrow, '17:00', '17:00', now)).toMatch(/after the start/)
    })
    it('allows any time on a future day', () => {
        expect(validateAppointmentTimes(tomorrow, '08:00', '09:00', now)).toBeNull()
    })
})

describe('addMinutesToTime', () => {
    it('adds the service length', () => {
        expect(addMinutesToTime('17:00', 90)).toBe('18:30')
    })
    it('caps at the end of the day', () => {
        expect(addMinutesToTime('23:00', 180)).toBe('23:59')
    })
})

describe('minStartTimeFor', () => {
    it('limits today to after now', () => {
        expect(minStartTimeFor(today, now)).toBe('14:31')
    })
    it('has no limit on other days', () => {
        expect(minStartTimeFor(tomorrow, now)).toBeUndefined()
    })
})

describe('toZonedISO', () => {
    it('shows a UTC instant in the business timezone', () => {
        const prev = Settings.defaultZone
        Settings.defaultZone = 'utc' // the server runs in UTC
        const iso = toZonedISO('2026-10-03T21:00:00+00:00', 'America/New_York')
        expect(DateTime.fromISO(iso, { setZone: true }).toFormat('h:mm a')).toBe('5:00 PM')
        Settings.defaultZone = prev
    })
    it('falls back to the default zone for junk input', () => {
        expect(toZonedISO('2026-10-03T21:00:00Z', 'Not/AZone')).toContain('-04:00')
    })
})

describe('validateBusinessAddress', () => {
    it('requires an address unless "no fixed location" is checked', () => {
        expect(Object.keys(validateBusinessAddress(EMPTY_ADDRESS, { required: true }))).toEqual(['line_1', 'city', 'state', 'zip_code'])
        expect(validateBusinessAddress({ ...EMPTY_ADDRESS, no_address: true }, { required: true })).toEqual({})
    })
    it('accepts a complete address', () => {
        expect(validateBusinessAddress({ no_address: false, line_1: '123 Main St', line_2: '', city: 'Houston', state: 'tx', zip_code: '77002' }, { required: true })).toEqual({})
    })
    it('allows an untouched address in settings', () => {
        expect(validateBusinessAddress(EMPTY_ADDRESS)).toEqual({})
    })
})
