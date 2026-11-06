// Talks to the sections inside the editor's canvas (an iframe): play one
// section's animation, or switch the whole canvas to live animations.

/** The canvas document (Puck's preview iframe), or this document when there is no iframe. */
function canvasDocument(): Document {
    const frame = document.querySelector<HTMLIFrameElement>('#preview-frame') ?? document.querySelector<HTMLIFrameElement>('.bld iframe')
    return frame?.contentDocument ?? document
}

/** Plays a section's entrance now. */
export function previewAnimation(id: string) {
    canvasDocument().dispatchEvent(new CustomEvent('aa-preview', { detail: { id } }))
}

/**
 * Live animations: sections animate as the canvas scrolls, as on the live
 * site. The flag stays on the canvas document, so sections added later pick
 * it up too.
 */
export function setLivePreview(on: boolean) {
    const doc = canvasDocument()
    if (on) doc.documentElement.dataset.aaLive = '1'
    else delete doc.documentElement.dataset.aaLive
    doc.dispatchEvent(new CustomEvent('aa-live-preview', { detail: { on } }))
}
