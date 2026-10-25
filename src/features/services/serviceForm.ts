import { gridKey, startingPrice, type ServicePrep, type StyleOption, type StyleOptions } from './pricing'
import type { ServiceData } from './types'

/**
 * Turning the service form into what gets saved. Shared by the Services
 * page editor and the welcome setup, so both store services the same way.
 * Pure module: safe on server and client.
 */

/** Problems that would stop a client booking; shown under the grid and checked before saving. */
export function styleOptionProblems(options: StyleOptions): string[] {
    if (!options.enabled) return []
    const problems: string[] = []
    if (options.sizes.length === 0 && options.lengths.length === 0) problems.push('Add at least one size or length.')
    const labels = (list: StyleOption[]) => list.map(o => o.label.trim().toLowerCase())
    for (const [name, list] of [['size', options.sizes], ['length', options.lengths]] as const) {
        if (list.some(o => !o.label.trim())) problems.push(`Every ${name} needs a name.`)
        const l = labels(list)
        if (new Set(l).size !== l.length) problems.push(`Two ${name}s have the same name.`)
    }
    const sizeIds = options.sizes.length ? options.sizes.map(s => s.id) : [null]
    const lengthIds = options.lengths.length ? options.lengths.map(l => l.id) : [null]
    let bookable = 0
    let missing = 0
    for (const s of sizeIds) for (const l of lengthIds) {
        const cell = options.grid[gridKey(s, l)]
        if (cell?.available === false) continue
        if (!cell || !Number.isFinite(cell.price) || cell.price <= 0) missing++
        else bookable++
    }
    if (missing) problems.push(`${missing} combination${missing === 1 ? ' has' : 's have'} no price — add one or switch it off.`)
    if (!missing && bookable === 0) problems.push('Switch on at least one combination.')
    if (options.hair.mode === 'optional' && !(options.hair.price > 0)) problems.push('Set a price for supplying hair.')
    return problems
}

/** The first thing stopping this service from being saved, or null. */
export function serviceFormProblem(form: Pick<ServiceData, 'name' | 'length'>, styleOptions: StyleOptions): string | null {
    if (!form.name.trim()) return 'Give this service a name.'
    const problems = styleOptionProblems(styleOptions)
    if (problems.length > 0) return problems[0]
    if (styleOptions.enabled && !(form.length > 0)) return 'Set a base duration for this service.'
    return null
}

/**
 * The service row to save. With size/length pricing, the stored base price
 * is the lowest combination, used for "from $X" and sorting.
 */
export function toServicePayload(form: ServiceData, styleOptions: StyleOptions, prep: ServicePrep): ServiceData {
    const price = styleOptions.enabled
        ? startingPrice({ price: form.price, length: form.length, style_options: styleOptions })
        : form.price
    return {
        ...form,
        price,
        style_options: styleOptions.enabled ? styleOptions : null,
        prep,
    }
}
