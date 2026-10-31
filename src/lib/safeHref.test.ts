import { describe, expect, it } from 'vitest'
import { safeHref } from './safeHref'

describe('safeHref', () => {
    it('keeps web, email, phone and on-site links', () => {
        expect(safeHref('https://instagram.com/kay')).toBe('https://instagram.com/kay')
        expect(safeHref('http://example.com')).toBe('http://example.com')
        expect(safeHref('mailto:kay@example.com')).toBe('mailto:kay@example.com')
        expect(safeHref('tel:+15555550123')).toBe('tel:+15555550123')
        expect(safeHref('/book')).toBe('/book')
        expect(safeHref('#services')).toBe('#services')
    })
    it('adds https to a bare address', () => {
        expect(safeHref('instagram.com/kay')).toBe('https://instagram.com/kay')
    })
    it('blocks script and data links, however they are disguised', () => {
        for (const bad of ['javascript:alert(1)', 'JavaScript:alert(1)', ' javascript:alert(1)', 'java\tscript:alert(1)',
            'data:text/html,<script>alert(1)</script>', 'vbscript:msgbox(1)', '//evil.com']) {
            expect(safeHref(bad)).toBe('#')
        }
    })
    it('handles empty or missing values', () => {
        expect(safeHref('')).toBe('#')
        expect(safeHref(undefined)).toBe('#')
        expect(safeHref(42)).toBe('#')
    })
})
