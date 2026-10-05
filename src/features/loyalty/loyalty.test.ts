import { describe, expect, it } from 'vitest'
import {
    DEFAULT_PROGRAM, describeEarning, describeRemaining, describeReward, isRewardUsable, normalizeRewardCode,
    programFromRow, programProblems, programToRow, progressFor, rewardDiscountCents,
} from './loyalty'

describe('rewardDiscountCents', () => {
    it('takes a flat amount off, never more than the bill', () => {
        expect(rewardDiscountCents({ rewardType: 'amount_off', value: 2000 }, 15000)).toBe(2000)
        expect(rewardDiscountCents({ rewardType: 'amount_off', value: 2000 }, 1500)).toBe(1500)
        expect(rewardDiscountCents({ rewardType: 'amount_off', value: 2000 }, 0)).toBe(0)
    })
    it('takes a percent off', () => {
        expect(rewardDiscountCents({ rewardType: 'percent_off', value: 15 }, 20000)).toBe(3000)
        expect(rewardDiscountCents({ rewardType: 'percent_off', value: 150 }, 20000)).toBe(20000)
    })
})

describe('progressFor', () => {
    it('counts visits toward the target', () => {
        const p = { ...DEFAULT_PROGRAM, visitsRequired: 5 }
        const progress = progressFor(p, { visits: 3, spendCents: 99999 })
        expect(progress).toEqual({ banked: 3, target: 5, remaining: 2, fraction: 0.6 })
        expect(describeRemaining(p, progress)).toBe('2 more visits')
    })
    it('counts spend for spend programs', () => {
        const p = { ...DEFAULT_PROGRAM, earnType: 'spend' as const, spendThresholdCents: 50000 }
        const progress = progressFor(p, { visits: 3, spendCents: 38000 })
        expect(progress.remaining).toBe(12000)
        expect(describeRemaining(p, progress)).toBe('$120 more')
    })
})

describe('program settings', () => {
    it('round-trips through a database row', () => {
        const p = { ...DEFAULT_PROGRAM, enabled: true, rewardType: 'percent_off' as const, rewardValue: 10, rewardExpiryDays: null }
        expect(programFromRow(programToRow(p))).toEqual(p)
    })
    it('defaults when there is no row', () => {
        expect(programFromRow(null)).toEqual(DEFAULT_PROGRAM)
    })
    it('flags bad settings', () => {
        expect(programProblems(DEFAULT_PROGRAM)).toEqual([])
        expect(programProblems({ ...DEFAULT_PROGRAM, visitsRequired: 0 })).toHaveLength(1)
        expect(programProblems({ ...DEFAULT_PROGRAM, rewardType: 'percent_off', rewardValue: 120 })).toHaveLength(1)
        expect(programProblems({ ...DEFAULT_PROGRAM, rewardValue: 50 })).toHaveLength(1)
    })
    it('describes the program', () => {
        expect(describeEarning(DEFAULT_PROGRAM)).toBe('every 5 visits')
        expect(describeReward(DEFAULT_PROGRAM)).toBe('$20 off')
        expect(describeReward({ rewardType: 'percent_off', value: 15 })).toBe('15% off')
    })
})

describe('rewards', () => {
    it('is usable only while available and unexpired', () => {
        const now = new Date('2030-01-10T00:00:00Z')
        expect(isRewardUsable({ status: 'available', expiresAt: null }, now)).toBe(true)
        expect(isRewardUsable({ status: 'available', expiresAt: '2030-01-11T00:00:00Z' }, now)).toBe(true)
        expect(isRewardUsable({ status: 'available', expiresAt: '2030-01-09T00:00:00Z' }, now)).toBe(false)
        expect(isRewardUsable({ status: 'used', expiresAt: null }, now)).toBe(false)
    })
    it('normalises typed codes', () => {
        expect(normalizeRewardCode(' aa-7f3kq2 ')).toBe('AA-7F3KQ2')
        expect(normalizeRewardCode('7f3kq2')).toBe('AA-7F3KQ2')
        expect(normalizeRewardCode('AA7F3KQ2')).toBe('AA-7F3KQ2')
    })
})
