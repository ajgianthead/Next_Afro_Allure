import { describe, expect, it } from 'vitest'
import { ENTRANCE_KEYFRAMES } from './presets'
import { cssFrame } from './run'

describe('cssFrame', () => {
    it('turns x/y/scale into a CSS transform', () => {
        expect(cssFrame(ENTRANCE_KEYFRAMES['fade-up'], 0)).toEqual({ transform: 'translate(0px, 24px)', opacity: 0 })
        expect(cssFrame(ENTRANCE_KEYFRAMES['fade-up'], 1)).toEqual({ transform: 'translate(0px, 0px)', opacity: 1 })
        expect(cssFrame(ENTRANCE_KEYFRAMES['zoom-in'], 0)).toEqual({ transform: 'scale(0.92)', opacity: 0 })
    })
    it('keeps units and puts perspective first', () => {
        expect(cssFrame(ENTRANCE_KEYFRAMES.words, 0).transform).toBe('translate(0px, 0.4em)')
        expect(cssFrame(ENTRANCE_KEYFRAMES['flip-in'], 0).transform).toBe('perspective(800px) rotateX(35deg)')
    })
    it('passes filter and clip-path through', () => {
        expect(cssFrame(ENTRANCE_KEYFRAMES['blur-in'], 0)).toEqual({ opacity: 0, filter: 'blur(12px)' })
        expect(cssFrame(ENTRANCE_KEYFRAMES['reveal-up'], 0)).toEqual({ opacity: 1, clipPath: 'inset(100% 0% 0% 0%)' })
    })
    it('has a frame for every entrance', () => {
        for (const kf of Object.values(ENTRANCE_KEYFRAMES)) {
            expect(Object.keys(cssFrame(kf, 0)).length).toBeGreaterThan(0)
            expect(Object.keys(cssFrame(kf, 1)).length).toBeGreaterThan(0)
        }
    })
})
