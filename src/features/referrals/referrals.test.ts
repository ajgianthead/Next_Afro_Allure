import { describe, expect, it } from 'vitest'
import {
    decodeStoredReferral, describeOffer, encodeStoredReferral, friendDiscountCents, normalizeReferralCode,
    referralProgramFromRow, referralProgramProblems, referralStats, startsNewVisit, DEFAULT_REFERRAL_PROGRAM,
    type ReferralRecord, type RewardRecord,
} from './referrals'

describe('program settings', () => {
    it('reads stored rows and falls back to safe defaults', () => {
        expect(referralProgramFromRow(null)).toEqual(DEFAULT_REFERRAL_PROGRAM)
        expect(referralProgramFromRow({ enabled: true, reward_type: 'percent_off', reward_value: 15, recipients: 'weird', reward_expiry_days: null, max_rewards_per_referrer: 3 }))
            .toEqual({ enabled: true, rewardType: 'percent_off', rewardValue: 15, recipients: 'both', rewardExpiryDays: null, maxRewardsPerReferrer: 3 })
    })

    it('catches bad values before saving', () => {
        expect(referralProgramProblems(DEFAULT_REFERRAL_PROGRAM)).toEqual([])
        expect(referralProgramProblems({ ...DEFAULT_REFERRAL_PROGRAM, rewardValue: 0 })[0]).toMatch(/amount/)
        expect(referralProgramProblems({ ...DEFAULT_REFERRAL_PROGRAM, rewardType: 'percent_off', rewardValue: 150 })[0]).toMatch(/100%/)
        expect(referralProgramProblems({ ...DEFAULT_REFERRAL_PROGRAM, maxRewardsPerReferrer: 0 })[0]).toMatch(/limit/)
    })

    it('describes the offer for clients', () => {
        expect(describeOffer({ ...DEFAULT_REFERRAL_PROGRAM, rewardValue: 1000 })).toBe('Give $10 off, get $10 off')
        expect(describeOffer({ ...DEFAULT_REFERRAL_PROGRAM, recipients: 'referrer', rewardType: 'percent_off', rewardValue: 15 })).toBe('Get 15% off for every friend who books')
        expect(describeOffer({ ...DEFAULT_REFERRAL_PROGRAM, recipients: 'friend', rewardValue: 2500 })).toBe('Give friends $25 off their first visit')
    })
})

describe('referral codes', () => {
    it('accepts the BRI-7F3K format only', () => {
        expect(normalizeReferralCode(' bria-7f3k ')).toBe('BRIA-7F3K')
        expect(normalizeReferralCode('REF-ABCD')).toBe('REF-ABCD')
        expect(normalizeReferralCode('')).toBe('')
        expect(normalizeReferralCode('<script>')).toBe('')
        expect(normalizeReferralCode('ABCDEFGHIJ-1234')).toBe('')
    })

    it('remembers a code for one visit, never days later', () => {
        const saved = encodeStoredReferral('BRIA-7F3K', new Date('2026-10-01T12:00:00Z'))
        expect(decodeStoredReferral(saved, new Date('2026-10-01T13:30:00Z'))).toBe('BRIA-7F3K')
        expect(decodeStoredReferral(saved, new Date('2026-10-01T19:00:00Z'))).toBe('')
        expect(decodeStoredReferral(saved, new Date('2026-10-20T00:00:00Z'))).toBe('')
        expect(decodeStoredReferral('not json')).toBe('')
        expect(decodeStoredReferral(null)).toBe('')
    })
})

describe('startsNewVisit', () => {
    const origin = 'https://kayla.afroallure.co'
    it('continues the visit when moving around the same site, reloading or going back', () => {
        expect(startsNewVisit({ referrer: 'https://kayla.afroallure.co/', origin, navigationType: 'navigate' })).toBe(false)
        expect(startsNewVisit({ referrer: '', origin, navigationType: 'reload' })).toBe(false)
        expect(startsNewVisit({ referrer: 'https://instagram.com/', origin, navigationType: 'back_forward' })).toBe(false)
    })
    it('starts a new visit when arriving from elsewhere or typing the address', () => {
        expect(startsNewVisit({ referrer: '', origin, navigationType: 'navigate' })).toBe(true)
        expect(startsNewVisit({ referrer: 'https://www.instagram.com/', origin, navigationType: 'navigate' })).toBe(true)
        expect(startsNewVisit({ referrer: 'https://beta.afroallure.co/business/kayla', origin })).toBe(true)
        expect(startsNewVisit({ referrer: 'not a url', origin })).toBe(true)
    })
})

describe('friend discount at checkout', () => {
    const appt = { amountDueCents: 10000, requireDeposit: false, subtraction: false, depositCents: 0 }

    it('takes a flat or percent amount off', () => {
        expect(friendDiscountCents({ rewardType: 'amount_off', rewardValue: 1000 }, appt)).toBe(1000)
        expect(friendDiscountCents({ rewardType: 'percent_off', rewardValue: 15 }, appt)).toBe(1500)
    })

    it('never discounts more than is left after the deposit', () => {
        const withDeposit = { amountDueCents: 10000, requireDeposit: true, subtraction: true, depositCents: 9500 }
        expect(friendDiscountCents({ rewardType: 'amount_off', rewardValue: 1000 }, withDeposit)).toBe(500)
        expect(friendDiscountCents({ rewardType: 'amount_off', rewardValue: 50000 }, appt)).toBe(10000)
    })

    it('leaves room for the deposit in either deposit mode', () => {
        expect(friendDiscountCents({ rewardType: 'amount_off', rewardValue: 1000 }, { amountDueCents: 10000, requireDeposit: true, subtraction: false, depositCents: 9500 })).toBe(500)
    })
})

describe('referralStats', () => {
    const appt = (status: string, paid: number, refunded = 0) => ({ status, paidCents: paid, refundedCents: refunded })
    const referrals: ReferralRecord[] = [
        { id: '1', status: 'completed', referrerClientId: 'bri', referrerName: 'Brianna', referredKey: 'maya@x.com', appointment: appt('COMPLETED', 18000) },
        { id: '2', status: 'completed', referrerClientId: 'bri', referrerName: 'Brianna', referredKey: 'tasha@x.com', appointment: appt('COMPLETED', 9000, 2000) },
        { id: '3', status: 'completed', referrerClientId: 'kel', referrerName: 'Kelly', referredKey: 'ana@x.com', appointment: appt('COMPLETED', 12000) },
        { id: '4', status: 'booked', referrerClientId: 'kel', referrerName: 'Kelly', referredKey: 'joy@x.com', appointment: appt('CONFIRMED', 0) },
        { id: '5', status: 'void', referrerClientId: 'bri', referrerName: 'Brianna', referredKey: 'dee@x.com', appointment: appt('CANCELLED', 0) },
    ]
    const rewards: RewardRecord[] = [
        { recipient: 'friend', status: 'redeemed', redeemedAmountCents: 1000 },
        { recipient: 'friend', status: 'redeemed', redeemedAmountCents: 1000 },
        { recipient: 'friend', status: 'redeemed', redeemedAmountCents: 1000 },
        { recipient: 'friend', status: 'pending', redeemedAmountCents: 1000 },
        { recipient: 'friend', status: 'void', redeemedAmountCents: 1000 },
        { recipient: 'referrer', status: 'redeemed', redeemedAmountCents: 1000 },
        { recipient: 'referrer', status: 'available', redeemedAmountCents: null },
        { recipient: 'referrer', status: 'expired', redeemedAmountCents: null },
        { recipient: 'referrer', status: 'pending', redeemedAmountCents: null },
        { recipient: 'referrer', status: 'void', redeemedAmountCents: null },
    ]
    const stats = referralStats(referrals, rewards)

    it('counts clients, bookings and conversion from real records', () => {
        expect(stats.referredClients).toBe(4) // void referrals don't count
        expect(stats.referredBookings).toBe(5)
        expect(stats.completedReferrals).toBe(3)
        expect(stats.conversionRate).toBeCloseTo(3 / 5)
    })

    it('counts revenue from completed referred visits, net of refunds', () => {
        expect(stats.revenueCents).toBe(18000 + 7000 + 12000)
    })

    it('counts only rewards actually earned and used', () => {
        expect(stats.rewardsEarned).toBe(6) // 4 redeemed + 1 available + 1 expired
        expect(stats.rewardsRedeemed).toBe(4)
        expect(stats.redeemedValueCents).toBe(4000) // pending and void discounts don't count
        expect(stats.roiCents).toBe(37000 - 4000)
    })

    it('ranks top referrers by completed referrals, then revenue', () => {
        expect(stats.topReferrers.map(t => [t.name, t.completed, t.revenueCents])).toEqual([['Brianna', 2, 25000], ['Kelly', 1, 12000]])
    })

    it('handles no data', () => {
        expect(referralStats([], [])).toMatchObject({ referredBookings: 0, conversionRate: 0, revenueCents: 0, roiCents: 0, topReferrers: [] })
    })
})
