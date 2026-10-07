// SMS character handling. A text in the GSM-7 alphabet fits 160 characters
// in one segment; a single character outside it (an emoji, a curly quote)
// switches the whole text to UCS-2 and cuts a segment to 70. Every segment
// is billed, so texts are kept to plain GSM-7 and one segment.
//
// Pure module with no imports: used by the app and inside Trigger.dev tasks.

export const SEGMENT_CHARS = 160

const GSM_BASIC =
    '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?' +
    '¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà'
/** Allowed, but each takes two characters' room (an escape plus the character). */
const GSM_EXTENDED = '^{}\\[~]|€'

const BASIC = new Set(GSM_BASIC)
const EXTENDED = new Set(GSM_EXTENDED)

const REPLACEMENTS: Record<string, string> = {
    '‘': "'", '’': "'", '‚': "'", '′': "'",
    '“': '"', '”': '"', '„': '"', '″': '"',
    '–': '-', '—': '-', '−': '-',
    '…': '...',
    ' ': ' ', ' ': ' ', ' ': ' ',
    '•': '-', '·': '-',
}

/** Rewrites text into GSM-7: smart punctuation to plain, accents dropped where GSM lacks them, emoji removed. */
export function toGsm(text: string): string {
    let out = ''
    for (const ch of text) {
        if (BASIC.has(ch) || EXTENDED.has(ch)) { out += ch; continue }
        const replaced = REPLACEMENTS[ch]
        if (replaced !== undefined) { out += replaced; continue }
        // á → a, ç → c: the base letter, when it is in the alphabet.
        const base = ch.normalize('NFD')[0]
        if (base && base !== ch && BASIC.has(base)) out += base
        // Anything else (emoji, symbols) is dropped.
    }
    return out.replace(/ {2,}/g, ' ').trim()
}

/** Length in GSM-7 septets: extended characters count twice. */
export function gsmLength(text: string): number {
    let n = 0
    for (const ch of text) n += EXTENDED.has(ch) ? 2 : 1
    return n
}

export function isGsm(text: string): boolean {
    for (const ch of text) if (!BASIC.has(ch) && !EXTENDED.has(ch)) return false
    return true
}

export function fitsOneSegment(text: string): boolean {
    return isGsm(text) && gsmLength(text) <= SEGMENT_CHARS
}
