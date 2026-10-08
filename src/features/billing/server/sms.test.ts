import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/stripe/stripeClient', () => ({ stripe: {} }))
vi.mock('@/app/utils/supabase/admin', () => ({ createAdminClient: () => ({}) }))

import { smsAddonAvailable } from './sms'

const FULL = {
    TWILIO_ACCOUNT_SID: 'AC123',
    TWILIO_AUTH_TOKEN: 'token',
    TWILIO_FROM_NUMBER: '+18005550123',
    STRIPE_SMS_PRICE_ID: 'price_month',
    STRIPE_SMS_YEARLY_PRICE_ID: 'price_year',
}

afterEach(() => vi.unstubAllEnvs())

function setEnv(env: Partial<typeof FULL>) {
    for (const key of Object.keys(FULL) as (keyof typeof FULL)[]) vi.stubEnv(key, env[key] ?? '')
}

describe('smsAddonAvailable (SMS Reminders can only be sold once texting is set up)', () => {
    it('is available when Twilio and both SMS prices are set', () => {
        setEnv(FULL)
        expect(smsAddonAvailable()).toBe(true)
    })

    it.each(Object.keys(FULL))('is unavailable while %s is unset', key => {
        setEnv({ ...FULL, [key]: '' })
        expect(smsAddonAvailable()).toBe(false)
    })
})
