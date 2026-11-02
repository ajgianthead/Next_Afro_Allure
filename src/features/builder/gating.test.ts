import { describe, expect, it } from 'vitest'
import { proViolations } from './gating'
import { DEFAULT_ANIMATION } from './types'

const sec = (id: string, layout: number, animation = DEFAULT_ANIMATION) => ({ type: 'Hero', props: { id, layout, animation } })

describe('proViolations', () => {
    it('lets Growth use anything', () => {
        expect(proViolations([sec('a', 20, { ...DEFAULT_ANIMATION, entrance: 'words' })], [], 'GROWTH')).toEqual([])
    })
    it('lets Starter use layouts 1–8 and basic animations', () => {
        expect(proViolations([sec('a', 8), sec('b', 1, { ...DEFAULT_ANIMATION, hover: 'lift' })], [], 'STARTER')).toEqual([])
    })
    it('refuses a new Pro layout or animation on Starter', () => {
        expect(proViolations([sec('a', 9)], [], 'STARTER')).toEqual([{ id: 'a', type: 'Hero', what: 'layout' }])
        expect(proViolations([sec('a', 2, { ...DEFAULT_ANIMATION, entrance: 'blur-in' })], [], 'STARTER')).toEqual([{ id: 'a', type: 'Hero', what: 'animation' }])
        expect(proViolations([sec('a', 2, { ...DEFAULT_ANIMATION, countUp: true })], [], 'STARTER')).toHaveLength(1)
    })
    it('keeps Pro choices a Starter business already published', () => {
        const pro = { ...DEFAULT_ANIMATION, scroll: 'parallax-slow' as const }
        expect(proViolations([sec('a', 14, pro)], [sec('a', 14, pro)], 'STARTER')).toEqual([])
        // …but changing to a different Pro layout counts as new
        expect(proViolations([sec('a', 15)], [sec('a', 14)], 'STARTER')).toEqual([{ id: 'a', type: 'Hero', what: 'layout' }])
    })
})
