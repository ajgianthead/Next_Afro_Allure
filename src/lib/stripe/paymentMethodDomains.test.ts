import { describe, expect, it, vi } from 'vitest'
import { bookingDomains } from './paymentMethodDomains'

vi.mock('./stripeClient', () => ({ stripe: {} }))

describe('bookingDomains (addresses registered for Apple Pay / Google Pay)', () => {
    it('registers the app domain and the business subdomain in production', () => {
        expect(bookingDomains('kayla', { baseUrl: 'https://beta.afroallure.co', bookingRootDomain: 'afroallure.co' }))
            .toEqual(['beta.afroallure.co', 'kayla.afroallure.co'])
    })

    it('only registers the app domain when subdomains are off (preview deployments)', () => {
        expect(bookingDomains('kayla', { baseUrl: 'https://my-preview.vercel.app' })).toEqual(['my-preview.vercel.app'])
    })

    it('skips localhost, which Stripe rejects', () => {
        expect(bookingDomains('kayla', { baseUrl: 'http://localhost:3000', bookingRootDomain: 'localhost:3000' })).toEqual([])
    })

    it('lower-cases the link name and drops paths and ports', () => {
        expect(bookingDomains(' Kayla ', { baseUrl: 'https://beta.afroallure.co/', bookingRootDomain: 'afroallure.co' }))
            .toEqual(['beta.afroallure.co', 'kayla.afroallure.co'])
    })

    it('has no subdomain without a link name', () => {
        expect(bookingDomains(null, { baseUrl: 'https://beta.afroallure.co', bookingRootDomain: 'afroallure.co' })).toEqual(['beta.afroallure.co'])
    })
})
