import { describe, expect, it } from 'vitest'
import { safeNext } from './safeNext'

describe('safeNext', () => {
    it('keeps a path on this site', () => {
        expect(safeNext('/set-password')).toBe('/set-password')
        expect(safeNext('/dashboard?welcome=1')).toBe('/dashboard?welcome=1')
    })

    it.each(['//evil.com', '/\\evil.com', '@evil.com', 'https://evil.com', 'evil.com', ''])('refuses %j', next => {
        expect(safeNext(next)).toBe('/dashboard')
    })

    it('uses the fallback when there is no next', () => {
        expect(safeNext(null, '/set-password')).toBe('/set-password')
    })
})
