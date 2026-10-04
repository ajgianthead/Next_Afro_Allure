import { afterEach, describe, expect, it } from 'vitest'
import { slugify, validateSlug } from './businessSlug'
import { businessSitePath, businessSubdomainFromHost } from './businessHost'
import { bookingUrl } from './bookingUrl'

describe('slugify', () => {
    it('makes names subdomain-safe', () => {
        expect(slugify("Kayla's Braids & Co.")).toBe('kaylas-braids-and-co')
        expect(slugify('  Crème   Brûlée Beauty ')).toBe('creme-brulee-beauty')
        expect(slugify('x'.repeat(80))).toHaveLength(63)
    })
})

describe('validateSlug', () => {
    it('accepts DNS-safe names', () => {
        expect(validateSlug('kaylas-braids')).toBeNull()
        expect(validateSlug('studio24')).toBeNull()
    })
    it('rejects bad or reserved names', () => {
        expect(validateSlug('ab')).not.toBeNull()
        expect(validateSlug('-kayla')).not.toBeNull()
        expect(validateSlug('kayla--braids')).not.toBeNull()
        expect(validateSlug('Kayla')).not.toBeNull()
        expect(validateSlug('beta')).toMatch(/reserved/)
        expect(validateSlug('reminder')).toMatch(/reserved/)
        expect(validateSlug('bounce')).toMatch(/reserved/)
    })
})

describe('businessSubdomainFromHost', () => {
    it('finds the business on its subdomain', () => {
        expect(businessSubdomainFromHost('kayla.afroallure.co', 'afroallure.co')).toBe('kayla')
        expect(businessSubdomainFromHost('KAYLA.afroallure.co', 'afroallure.co')).toBe('kayla')
    })
    it('treats the app and reserved hosts as not-a-business', () => {
        expect(businessSubdomainFromHost('beta.afroallure.co', 'afroallure.co')).toBeNull()
        expect(businessSubdomainFromHost('www.afroallure.co', 'afroallure.co')).toBeNull()
        expect(businessSubdomainFromHost('afroallure.co', 'afroallure.co')).toBeNull()
        expect(businessSubdomainFromHost('a.b.afroallure.co', 'afroallure.co')).toBeNull()
        expect(businessSubdomainFromHost('kayla.afroallure.co', undefined)).toBeNull()
    })
})

describe('links', () => {
    const env = { ...process.env }
    afterEach(() => { process.env = { ...env } })

    it('uses the subdomain when the root domain is configured', () => {
        process.env.NEXT_PUBLIC_BOOKING_ROOT_DOMAIN = 'afroallure.co'
        expect(bookingUrl('kayla')).toBe('https://kayla.afroallure.co')
        expect(bookingUrl('kayla', '/book')).toBe('https://kayla.afroallure.co/book')
        expect(businessSitePath('kayla', '/book', 'kayla.afroallure.co')).toBe('/book')
        expect(businessSitePath('kayla', '/book', 'beta.afroallure.co')).toBe('/business/kayla/book')
    })
    it('falls back to the app path when it is not', () => {
        delete process.env.NEXT_PUBLIC_BOOKING_ROOT_DOMAIN
        process.env.NEXT_PUBLIC_BASE_URL = 'https://beta.afroallure.co'
        expect(bookingUrl('kayla', '/book')).toBe('https://beta.afroallure.co/business/kayla/book')
        expect(businessSitePath('kayla', '/book', 'kayla.afroallure.co')).toBe('/business/kayla/book')
    })
})
