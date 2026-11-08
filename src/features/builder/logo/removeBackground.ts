// Removes a logo's solid background in the browser. Pure: works on RGBA
// pixel arrays, so it's testable without a canvas.
//
// It takes the background color from the image's edges (or one the owner
// picks), then clears it: by default only the area connected to the edges
// (so a white "O" inside a dark logo stays), or that color everywhere. Pixels
// just past the cut-off fade out so the edge isn't jagged.

export type RGB = [number, number, number]

/** How different two colors are, 0 (same) to 100 (black vs white). */
export function colorDistance(a: RGB, r: number, g: number, b: number): number {
    return Math.sqrt((a[0] - r) ** 2 + (a[1] - g) ** 2 + (a[2] - b) ** 2) / 4.4167
}

/** The most common color around the image's border (opaque pixels), in coarse buckets; null when the border is transparent. */
export function edgeColor(data: Uint8ClampedArray, w: number, h: number): RGB | null {
    const counts = new Map<number, { n: number; r: number; g: number; b: number }>()
    const add = (x: number, y: number) => {
        const i = (y * w + x) * 4
        if (data[i + 3] < 128) return
        const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4)
        const c = counts.get(key) ?? { n: 0, r: 0, g: 0, b: 0 }
        c.n++; c.r += data[i]; c.g += data[i + 1]; c.b += data[i + 2]
        counts.set(key, c)
    }
    for (let x = 0; x < w; x++) { add(x, 0); add(x, h - 1) }
    for (let y = 1; y < h - 1; y++) { add(0, y); add(w - 1, y) }
    let best: { n: number; r: number; g: number; b: number } | null = null
    for (const c of counts.values()) if (!best || c.n > best.n) best = c
    return best ? [Math.round(best.r / best.n), Math.round(best.g / best.n), Math.round(best.b / best.n)] : null
}

export interface RemoveOptions {
    /** The color to remove; default: the edge color. */
    target?: RGB | null
    /** 0–100: how far from the target color still counts as background. */
    tolerance: number
    /** Remove the color everywhere, not only where it touches the edges. */
    everywhere?: boolean
}

const SOFT = 10

/** A copy of the pixels with the background made transparent. */
export function removeBackground(data: Uint8ClampedArray, w: number, h: number, opts: RemoveOptions): Uint8ClampedArray<ArrayBuffer> {
    const out = new Uint8ClampedArray(data)
    const target = opts.target ?? edgeColor(data, w, h)
    if (!target) return out
    const tol = Math.max(0, Math.min(100, opts.tolerance))
    const dist = new Float32Array(w * h)
    for (let p = 0; p < w * h; p++) dist[p] = colorDistance(target, data[p * 4], data[p * 4 + 1], data[p * 4 + 2])
    const isBg = (p: number) => data[p * 4 + 3] < 10 || dist[p] <= tol

    const removed = new Uint8Array(w * h)
    if (opts.everywhere) {
        for (let p = 0; p < w * h; p++) if (isBg(p)) removed[p] = 1
    } else {
        // Flood fill from every edge pixel that is background.
        const stack: number[] = []
        const push = (p: number) => { if (!removed[p] && isBg(p)) { removed[p] = 1; stack.push(p) } }
        for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x) }
        for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1) }
        while (stack.length) {
            const p = stack.pop()!
            const x = p % w, y = (p - x) / w
            if (x > 0) push(p - 1)
            if (x < w - 1) push(p + 1)
            if (y > 0) push(p - w)
            if (y < h - 1) push(p + w)
        }
    }

    for (let p = 0; p < w * h; p++) {
        if (removed[p]) { out[p * 4 + 3] = 0; continue }
        // Soft edge: pixels next to removed ones and only a little past the cut-off fade.
        const d = dist[p]
        if (d > tol + SOFT) continue
        const x = p % w, y = (p - x) / w
        const touches = (x > 0 && removed[p - 1]) || (x < w - 1 && removed[p + 1]) || (y > 0 && removed[p - w]) || (y < h - 1 && removed[p + w])
        if (touches) out[p * 4 + 3] = Math.round(out[p * 4 + 3] * Math.min(1, (d - tol) / SOFT))
    }
    return out
}

/** The smallest box holding every visible pixel, with a little padding; null when nothing is visible. */
export function contentBox(data: Uint8ClampedArray, w: number, h: number, pad = 2): { x: number; y: number; w: number; h: number } | null {
    let minX = w, minY = h, maxX = -1, maxY = -1
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (data[(y * w + x) * 4 + 3] > 8) {
                if (x < minX) minX = x
                if (x > maxX) maxX = x
                if (y < minY) minY = y
                if (y > maxY) maxY = y
            }
        }
    }
    if (maxX < 0) return null
    const x0 = Math.max(0, minX - pad), y0 = Math.max(0, minY - pad)
    return { x: x0, y: y0, w: Math.min(w, maxX + pad + 1) - x0, h: Math.min(h, maxY + pad + 1) - y0 }
}
