import { describe, expect, it } from 'vitest'
import { contentBox, edgeColor, removeBackground } from './removeBackground'

/** A w×h image filled with `bg`, with `fg` painted where paint(x, y) is true. */
function image(w: number, h: number, bg: number[], fg: number[], paint: (x: number, y: number) => boolean) {
    const d = new Uint8ClampedArray(w * h * 4)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) d.set([...(paint(x, y) ? fg : bg), 255], (y * w + x) * 4)
    return d
}
const alpha = (d: Uint8ClampedArray, w: number, x: number, y: number) => d[(y * w + x) * 4 + 3]

// A 9×9 white image with a black ring (x/y 2..6) and a white hole in the middle (4,4).
const ring = (x: number, y: number) => x >= 2 && x <= 6 && y >= 2 && y <= 6 && !(x === 4 && y === 4)
const WHITE = [255, 255, 255], BLACK = [0, 0, 0]

describe('edgeColor', () => {
    it('finds the background color from the border', () => {
        expect(edgeColor(image(9, 9, WHITE, BLACK, ring), 9, 9)).toEqual([255, 255, 255])
    })
    it('is null when the border is already transparent', () => {
        expect(edgeColor(new Uint8ClampedArray(4 * 4 * 4), 4, 4)).toBeNull()
    })
})

describe('removeBackground', () => {
    it('clears the background around the logo but keeps holes inside it', () => {
        const out = removeBackground(image(9, 9, WHITE, BLACK, ring), 9, 9, { tolerance: 10 })
        expect(alpha(out, 9, 0, 0)).toBe(0)
        expect(alpha(out, 9, 3, 3)).toBe(255) // the ring
        expect(alpha(out, 9, 4, 4)).toBe(255) // the hole, not connected to the edge
    })
    it('clears the color everywhere when asked', () => {
        const out = removeBackground(image(9, 9, WHITE, BLACK, ring), 9, 9, { tolerance: 10, everywhere: true })
        expect(alpha(out, 9, 4, 4)).toBe(0)
        expect(alpha(out, 9, 3, 3)).toBe(255)
    })
    it('treats near colors as background up to the tolerance', () => {
        const offWhite = image(5, 5, [245, 245, 245], BLACK, (x, y) => x === 2 && y === 2)
        expect(alpha(removeBackground(offWhite, 5, 5, { target: [255, 255, 255], tolerance: 2 }), 5, 0, 0)).toBe(255)
        expect(alpha(removeBackground(offWhite, 5, 5, { target: [255, 255, 255], tolerance: 10 }), 5, 0, 0)).toBe(0)
    })
    it('does not change the original pixels', () => {
        const src = image(9, 9, WHITE, BLACK, ring)
        removeBackground(src, 9, 9, { tolerance: 10 })
        expect(alpha(src, 9, 0, 0)).toBe(255)
    })
})

describe('contentBox', () => {
    it('trims transparent margins (with padding)', () => {
        const out = removeBackground(image(9, 9, WHITE, BLACK, ring), 9, 9, { tolerance: 10 })
        expect(contentBox(out, 9, 9, 0)).toEqual({ x: 2, y: 2, w: 5, h: 5 })
        expect(contentBox(out, 9, 9, 1)).toEqual({ x: 1, y: 1, w: 7, h: 7 })
    })
    it('is null for a fully transparent image', () => {
        expect(contentBox(new Uint8ClampedArray(16), 2, 2)).toBeNull()
    })
})
