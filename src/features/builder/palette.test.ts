import { describe, expect, it } from 'vitest'
import { resolveTheme } from '@/features/siteBuilder/themes'
import { lowContrast, sectionPalette } from './palette'

const theme = resolveTheme('maison-tresse', 'cream-gold', null, undefined) // bg #f4ede2, fg #1a1410, accent #a8803f

describe('sectionPalette', () => {
    it('follows the theme by default', () => {
        const p = sectionPalette(theme, { useTheme: true, invert: false, colors: { bg: '#000000' } })
        expect(p.bg).toBe(theme.bg)
        expect(p.fg).toBe(theme.fg)
        expect(p.accent).toBe(theme.accent)
    })
    it('uses the section colors when not following the theme, ignoring bad values', () => {
        const p = sectionPalette(theme, { useTheme: false, invert: false, colors: { bg: '#112233', fg: 'red', accent: '#ff6600' } })
        expect(p.bg).toBe('#112233')
        expect(p.fg).toBe(theme.fg)
        expect(p.accent).toBe('#ff6600')
    })
    it('invert swaps background and text and keeps the accent', () => {
        const p = sectionPalette(theme, { useTheme: true, invert: true, colors: {} })
        expect(p.bg).toBe(theme.fg)
        expect(p.fg).toBe(theme.bg)
        expect(p.accent).toBe(theme.accent)
        expect(p.dark).toBe(true)
    })
    it('picks readable button text', () => {
        expect(sectionPalette(theme, { useTheme: false, invert: false, colors: { accent: '#ffffff' } }).accentFg).toBe('#111111')
        expect(sectionPalette(theme, { useTheme: false, invert: false, colors: { accent: '#111111' } }).accentFg).toBe('#ffffff')
    })
    it('warns about hard-to-read colors', () => {
        expect(lowContrast(sectionPalette(theme, { useTheme: true, invert: false, colors: {} }))).toBeNull()
        expect(lowContrast(sectionPalette(theme, { useTheme: false, invert: false, colors: { bg: '#777777', fg: '#888888' } }))).toMatch(/hard to read/)
    })
})
