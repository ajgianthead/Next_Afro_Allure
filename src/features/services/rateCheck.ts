// "Am I charging enough?" — what each style actually pays per hour once time
// and supplies are counted. Pure; used by the service editor.

import { gridKey, parseStyleOptions, type PricedService } from './pricing'

export interface RateCosts {
    /** Products / supplies per appointment (cents). */
    suppliesCents: number
    /** What the stylist pays for hair when it's included in the price (cents). */
    hairCents: number
}

export interface RateRow {
    key: string
    label: string
    priceCents: number
    minutes: number
    /** Price minus supplies (and hair, when included), per hour of chair time. */
    hourlyCents: number
    /** Lowest price (rounded up to $5) that meets the target — only set when below it. */
    suggestedCents: number | null
    verdict: 'low' | 'ok' | 'good'
}

/** (price − costs) per hour. 0 when there's no time to divide by. */
export function hourlyRateCents(priceCents: number, minutes: number, costCents = 0): number {
    if (!(minutes > 0)) return 0
    return Math.round(((priceCents - costCents) * 60) / minutes)
}

/** Price needed to earn `targetHourlyCents` for `minutes` of work plus costs, rounded up to $5. */
export function priceForTarget(targetHourlyCents: number, minutes: number, costCents = 0): number {
    const exact = (targetHourlyCents * minutes) / 60 + costCents
    return Math.ceil(exact / 500) * 500
}

export function verdictFor(hourlyCents: number, targetHourlyCents: number): RateRow['verdict'] {
    if (targetHourlyCents <= 0) return 'ok'
    if (hourlyCents < targetHourlyCents * 0.95) return 'low'
    if (hourlyCents >= targetHourlyCents * 1.2) return 'good'
    return 'ok'
}

/** One row per bookable size × length (or one row for a plain service). */
export function rateCheckRows(service: PricedService, targetHourlyCents: number, costs: RateCosts): RateRow[] {
    const options = parseStyleOptions(service.style_options)
    const baseMinutes = Math.max(0, Number(service.length) || 0)

    const row = (key: string, label: string, priceCents: number, minutes: number, costCents: number): RateRow => {
        const hourly = hourlyRateCents(priceCents, minutes, costCents)
        const verdict = verdictFor(hourly, targetHourlyCents)
        return {
            key, label, priceCents, minutes, hourlyCents: hourly, verdict,
            suggestedCents: verdict === 'low' && minutes > 0 ? priceForTarget(targetHourlyCents, minutes, costCents) : null,
        }
    }

    if (!options) {
        return [row('base', 'This service', Math.max(0, Number(service.price) || 0), baseMinutes, costs.suppliesCents)]
    }
    const hairCost = options.hair.mode === 'included' ? costs.hairCents : 0
    const rows: RateRow[] = []
    for (const size of options.sizes.length ? options.sizes : [null]) {
        for (const length of options.lengths.length ? options.lengths : [null]) {
            const key = gridKey(size?.id, length?.id)
            const cell = options.grid[key]
            if (!cell?.available) continue
            const label = [size?.label, length?.label].filter(Boolean).join(' · ') || 'This service'
            rows.push(row(key, label, cell.price, baseMinutes + cell.extraMinutes, costs.suppliesCents + hairCost))
        }
    }
    return rows
}
