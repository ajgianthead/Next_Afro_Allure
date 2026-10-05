/**
 * Booking prices, durations and deposits — one implementation used by every
 * booking path (online booking, deposits, payment links, manual booking) on
 * the server, and by the booking screens in the browser for display only.
 * The server always recomputes from the database; amounts sent by a browser
 * are never trusted.
 *
 * Pure module: no database or framework imports, safe on server and client.
 * All money is in cents, all durations in minutes.
 */

// ─── Style options (size × length grid, hair) ───────────────────────────────

export interface StyleOption {
    id: string
    label: string
}

/** One size × length combination. `price` is the full style price (replaces the service's base price). */
export interface StyleCell {
    price: number
    extraMinutes: number
    available: boolean
}

export type HairMode = 'none' | 'included' | 'optional' | 'client_brings'

export interface HairSetting {
    mode: HairMode
    /** Cents added when mode is 'optional' and the client asks the stylist to supply hair. */
    price: number
    /** What to bring / what's included, e.g. "6 packs of 1B pre-stretched". */
    note: string
}

export interface StyleOptions {
    enabled: boolean
    sizes: StyleOption[]
    lengths: StyleOption[]
    /** Keyed by gridKey(sizeId, lengthId). */
    grid: Record<string, StyleCell>
    hair: HairSetting
}

export interface ServicePrep {
    instructions: string
    checklist: string[]
    /** Client must tick "I agree" to the prep and policies before booking. */
    requireAgreement: boolean
}

/** What the client chose. */
export interface StyleSelection {
    sizeId?: string | null
    lengthId?: string | null
    /** For hair mode 'optional': client wants the stylist to supply hair. */
    addHair?: boolean
}

/** Snapshot stored on the appointment so later edits to the service don't change past bookings. */
export interface SelectedOptions {
    size: StyleOption | null
    length: StyleOption | null
    hair: { mode: HairMode; added: boolean; price: number; note: string } | null
    priceCents: number
    extraMinutes: number
}

export interface AddonLike {
    id: string
    name: string
    price: number
}

/** The fields of a service row the quote needs. */
export interface PricedService {
    price: number
    length: number
    style_options?: unknown
}

export interface Quote {
    /** Style price (base price, or the grid cell's price) — before hair and add-ons. */
    styleCents: number
    hairCents: number
    addonCents: number
    totalCents: number
    durationMinutes: number
    selectedOptions: SelectedOptions | null
    addons: AddonLike[]
}

export class QuoteError extends Error {}

export const gridKey = (sizeId?: string | null, lengthId?: string | null) => `${sizeId ?? ''}|${lengthId ?? ''}`

const HAIR_MODES: HairMode[] = ['none', 'included', 'optional', 'client_brings']
const toCents = (v: unknown) => (Number.isFinite(Number(v)) ? Math.max(0, Math.round(Number(v))) : 0)
const toMinutes = (v: unknown) => (Number.isFinite(Number(v)) ? Math.max(0, Math.round(Number(v))) : 0)

function parseOptionList(raw: unknown): StyleOption[] {
    if (!Array.isArray(raw)) return []
    const seen = new Set<string>()
    return raw
        .map((o: any) => ({ id: String(o?.id ?? '').trim(), label: String(o?.label ?? '').trim() }))
        .filter(o => o.id && o.label && !seen.has(o.id) && seen.add(o.id))
}

/** Validates stored/submitted style options. Returns null when the service has none (or they're off). */
export function parseStyleOptions(raw: unknown): StyleOptions | null {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as any
    if (!r.enabled) return null
    const sizes = parseOptionList(r.sizes)
    const lengths = parseOptionList(r.lengths)
    if (sizes.length === 0 && lengths.length === 0) return null

    const grid: Record<string, StyleCell> = {}
    const sizeIds = sizes.length ? sizes.map(s => s.id) : [null]
    const lengthIds = lengths.length ? lengths.map(l => l.id) : [null]
    for (const s of sizeIds) {
        for (const l of lengthIds) {
            const key = gridKey(s, l)
            const cell = r.grid?.[key]
            if (!cell) continue
            const price = toCents(cell.price)
            grid[key] = {
                price,
                extraMinutes: toMinutes(cell.extraMinutes),
                // A combination with no price is never bookable (no $0 styles).
                available: cell.available !== false && price > 0,
            }
        }
    }

    const mode: HairMode = HAIR_MODES.includes(r.hair?.mode) ? r.hair.mode : 'none'
    return {
        enabled: true,
        sizes,
        lengths,
        grid,
        hair: { mode, price: mode === 'optional' ? toCents(r.hair?.price) : 0, note: String(r.hair?.note ?? '').trim().slice(0, 500) },
    }
}

export function parsePrep(raw: unknown): ServicePrep | null {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as any
    const instructions = String(r.instructions ?? '').trim().slice(0, 2000)
    const checklist = (Array.isArray(r.checklist) ? r.checklist : [])
        .map((c: unknown) => String(c ?? '').trim().slice(0, 200))
        .filter(Boolean)
        .slice(0, 20)
    if (!instructions && checklist.length === 0) return null
    return { instructions, checklist, requireAgreement: r.requireAgreement !== false }
}

/** Combinations a client can pick, with their prices — for "from $X" and option pickers. */
export function availableCells(options: StyleOptions) {
    return Object.entries(options.grid).filter(([, c]) => c.available)
}

/** Lowest bookable style price, for "from $X" on the booking site. */
export function startingPrice(service: PricedService): number {
    const options = parseStyleOptions(service.style_options)
    if (!options) return toCents(service.price)
    const prices = availableCells(options).map(([, c]) => c.price)
    return prices.length ? Math.min(...prices) : toCents(service.price)
}

// ─── Quote ───────────────────────────────────────────────────────────────────

/**
 * Price and duration for a booking. Throws QuoteError when the selection is
 * missing or invalid for a service with style options.
 */
export function quoteBooking(service: PricedService, selection: StyleSelection | null | undefined, addons: AddonLike[] = []): Quote {
    const options = parseStyleOptions(service.style_options)
    const addonList = addons.map(a => ({ id: a.id, name: a.name, price: toCents(a.price) }))
    const addonCents = addonList.reduce((sum, a) => sum + a.price, 0)
    const baseMinutes = toMinutes(service.length)

    if (!options) {
        const styleCents = toCents(service.price)
        return { styleCents, hairCents: 0, addonCents, totalCents: styleCents + addonCents, durationMinutes: baseMinutes, selectedOptions: null, addons: addonList }
    }

    const size = options.sizes.length ? options.sizes.find(s => s.id === selection?.sizeId) ?? null : null
    const length = options.lengths.length ? options.lengths.find(l => l.id === selection?.lengthId) ?? null : null
    if (options.sizes.length && !size) throw new QuoteError('Please choose a size.')
    if (options.lengths.length && !length) throw new QuoteError('Please choose a length.')

    const cell = options.grid[gridKey(size?.id, length?.id)]
    if (!cell || !cell.available) throw new QuoteError("That size and length isn't available. Please choose another.")

    const hairAdded = options.hair.mode === 'optional' && !!selection?.addHair
    const hairCents = hairAdded ? options.hair.price : 0
    const hair = options.hair.mode === 'none' ? null : { mode: options.hair.mode, added: hairAdded, price: hairCents, note: options.hair.note }

    return {
        styleCents: cell.price,
        hairCents,
        addonCents,
        totalCents: cell.price + hairCents + addonCents,
        durationMinutes: baseMinutes + cell.extraMinutes,
        selectedOptions: { size, length, hair, priceCents: cell.price, extraMinutes: cell.extraMinutes },
        addons: addonList,
    }
}

// ─── Deposits ────────────────────────────────────────────────────────────────

export interface DepositPolicy {
    enabled?: boolean
    settings?: { type?: string; value?: number | string }
}

/**
 * Deposit in cents for a booking total. Flat deposits are stored in dollars
 * (the booking settings field is "$ ___"); percentage deposits as a percent.
 * Accepts both 'percent' (what settings save) and 'percentage' (older code).
 * Never more than the total.
 */
export function calculateDeposit(deposit: DepositPolicy | null | undefined, totalCents: number): number {
    if (!deposit?.enabled) return 0
    const value = Number(deposit.settings?.value ?? 0)
    if (!Number.isFinite(value) || value <= 0) return 0
    const type = deposit.settings?.type
    let cents = 0
    if (type === 'flat') cents = Math.round(value * 100)
    else if (type === 'percent' || type === 'percentage') cents = Math.round(totalCents * Math.min(value, 100) / 100)
    return Math.min(Math.max(0, cents), Math.max(0, totalCents))
}

// ─── Editor helper ───────────────────────────────────────────────────────────

/**
 * Quick-fill for the price grid: base price/time for the first size and
 * length, plus a step for each size and length after it. Steps can be
 * negative (e.g. bigger braids cost less).
 */
export function fillGrid(
    sizes: StyleOption[],
    lengths: StyleOption[],
    rule: { basePrice: number; sizeStep: number; lengthStep: number; sizeMinutesStep?: number; lengthMinutesStep?: number }
): Record<string, StyleCell> {
    const grid: Record<string, StyleCell> = {}
    const sizeList: (StyleOption | null)[] = sizes.length ? sizes : [null]
    const lengthList: (StyleOption | null)[] = lengths.length ? lengths : [null]
    sizeList.forEach((s, si) => {
        lengthList.forEach((l, li) => {
            grid[gridKey(s?.id, l?.id)] = {
                price: Math.max(0, Math.round(rule.basePrice + si * rule.sizeStep + li * rule.lengthStep)),
                extraMinutes: Math.max(0, Math.round(si * (rule.sizeMinutesStep ?? 0) + li * (rule.lengthMinutesStep ?? 0))),
                available: true,
            }
        })
    })
    return grid
}

// ─── Balance due ─────────────────────────────────────────────────────────────

/**
 * What's left to pay after the appointment (payment links / end-of-appointment
 * payments). When the deposit is subtracted from the total, amount_due was
 * already reduced at deposit time; otherwise it still includes the deposit.
 */
export function remainingBalance(appt: { amount_due: number; deposit_price?: number | null; paid_deposit?: boolean | null; substraction?: boolean | null }): number {
    const due = Math.max(0, Math.round(Number(appt.amount_due ?? 0)))
    if (appt.paid_deposit && !appt.substraction) return Math.max(0, due - Math.round(Number(appt.deposit_price ?? 0)))
    return due
}
