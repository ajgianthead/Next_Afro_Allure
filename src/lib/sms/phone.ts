// Phone numbers in the form Twilio needs. Texts go out from a US toll-free
// number, so only US and Canadian (+1) numbers are accepted.
// Pure module: used by the app and inside Trigger.dev tasks.

/** "(404) 555-0123", "404.555.0123", "+1 404 555 0123" → "+14045550123". Null when it isn't a +1 number. */
export function toE164(raw: string | null | undefined): string | null {
    if (!raw) return null
    const digits = String(raw).replace(/\D/g, '')
    const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
    if (national.length !== 10) return null
    // North American numbers never start with 0 or 1 in the area code or exchange.
    if (national[0] === '0' || national[0] === '1' || national[3] === '0' || national[3] === '1') return null
    return `+1${national}`
}
