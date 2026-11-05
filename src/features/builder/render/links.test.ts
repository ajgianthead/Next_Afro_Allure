import { describe, expect, it } from 'vitest'
import { resolveHref } from './links'

const bookHref = (id?: string) => `/book${id ? `?service=${id}` : ''}`

describe('resolveHref', () => {
    it('goes to the booking page, optionally with a service', () => {
        expect(resolveHref('book', bookHref)).toBe('/book')
        expect(resolveHref('', bookHref)).toBe('/book')
        expect(resolveHref('book:abc', bookHref)).toBe('/book?service=abc')
    })
    it('keeps section anchors and safe outside links', () => {
        expect(resolveHref('#services', bookHref)).toBe('#services')
        expect(resolveHref('https://instagram.com/kay', bookHref)).toBe('https://instagram.com/kay')
        expect(resolveHref('tel:+15555550123', bookHref)).toBe('tel:+15555550123')
    })
    it('blocks script links', () => {
        expect(resolveHref('javascript:alert(1)', bookHref)).toBe('#')
    })
})
