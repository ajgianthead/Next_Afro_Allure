import { describe, expect, it } from 'vitest'
import { fitsOneSegment, gsmLength, isGsm, toGsm } from './gsm'
import { toE164 } from './phone'
import { formatWhen, payLink, smsTemplates } from './templates'

describe('toGsm', () => {
    it('turns smart punctuation into plain characters', () => {
        expect(toGsm('Kayla’s Braids — “knotless”…')).toBe('Kayla\'s Braids - "knotless"...')
    })
    it('drops emoji and accents the alphabet lacks, keeps the ones it has', () => {
        expect(toGsm('Silk press ✨ at José & Renée')).toBe('Silk press at José & Renée')
        expect(toGsm('Anaïs á')).toBe('Anais a')
    })
    it('produces text that is entirely GSM-7', () => {
        expect(isGsm(toGsm('💇‍♀️ Hair by Mária → today'))).toBe(true)
    })
})

describe('gsmLength', () => {
    it('counts extended characters twice', () => {
        expect(gsmLength('a[b]')).toBe(6)
        expect(gsmLength('€5')).toBe(3)
    })
})

describe('toE164', () => {
    it.each([
        ['(404) 555-0123', '+14045550123'],
        ['404.555.0123', '+14045550123'],
        ['+1 404 555 0123', '+14045550123'],
        ['14045550123', '+14045550123'],
    ])('%s → %s', (raw, out) => expect(toE164(raw)).toBe(out))

    it.each(['', '555-0123', '+44 20 7946 0958', '(104) 555-0123', '(404) 155-0123', null, undefined])(
        'rejects %s', raw => expect(toE164(raw as any)).toBeNull()
    )
})

describe('smsTemplates', () => {
    const when = formatWhen('2026-10-10T18:00:00Z', 'America/New_York')
    const url = payLink('https://beta.afroallure.co/', '4561ec13-2406-4823-86fd-db3a188f7aa8')

    it('formats the time in the business timezone', () => {
        expect(when).toBe('Sat, Oct 10 at 2:00 PM')
    })

    it('builds a short pay link', () => {
        expect(url).toBe('https://beta.afroallure.co/p/4561ec13-2406-4823-86fd-db3a188f7aa8')
    })

    const longBusiness = 'The Most Wonderful Natural Hair & Protective Styles Studio of Southwest Atlanta'
    const longService = 'Small Knotless Box Braids — Waist Length with Curly Ends and Boho Pieces'

    const texts = {
        confirmation: smsTemplates.clientConfirmation({ business: longBusiness, service: longService, when }),
        reminder: smsTemplates.clientReminder({ business: longBusiness, service: longService, when, kind: 'day' }),
        payment: smsTemplates.clientPaymentLink({ business: longBusiness, service: longService, url }),
        newBooking: smsTemplates.businessNewBooking({ client: 'Anastasia-Marie Montgomery-Whitfield', service: longService, when }),
        businessReminder: smsTemplates.businessReminder({ client: 'Anastasia-Marie Montgomery-Whitfield', service: longService, when, kind: 'hour' }),
    }

    it.each(Object.entries(texts))('%s fits one segment even with long names', (_name, text) => {
        expect(fitsOneSegment(text)).toBe(true)
        expect(text).toContain('Reply STOP to opt out.')
    })

    it('never shortens the time or the link', () => {
        expect(texts.confirmation).toContain(when)
        expect(texts.payment).toContain(url)
    })

    it('leaves short texts untouched', () => {
        expect(smsTemplates.clientReminder({ business: "Kayla's Braids", service: 'Silk press', when, kind: 'hour' }))
            .toBe("Kayla's Braids: Reminder, your Silk press is in 1 hour, Sat, Oct 10 at 2:00 PM. Reply STOP to opt out.")
    })
})
