import { fillGrid, type HairSetting, type ServicePrep, type StyleOption, type StyleOptions } from '../pricing'

/**
 * Starter setups for common braid and loc services. Picking one fills in
 * sizes, lengths, a price grid (from a base price plus steps), the hair
 * setting and prep instructions — the stylist then edits anything.
 * Prices are placeholders in cents; every stylist sets their own.
 */
export interface StyleTemplate {
    id: string
    name: string
    sizes: string[]
    lengths: string[]
    /** Price of the first size × first length, then the change for each step. */
    basePrice: number
    sizeStep: number
    lengthStep: number
    /** Extra minutes for each size / length step (the base duration covers the first cell). */
    sizeMinutesStep: number
    lengthMinutesStep: number
    baseMinutes: number
    hair: HairSetting
    prep: ServicePrep
}

const BRAID_LENGTHS = ['Shoulder', 'Mid-back', 'Waist', 'Butt']
const BRAID_SIZES = ['Small', 'Smedium', 'Medium', 'Large', 'Jumbo']

const BRAID_PREP: ServicePrep = {
    instructions: 'Please arrive with your hair prepped so we can start on time.',
    checklist: ['Hair washed and fully dry', 'Hair detangled and blown out', 'No heavy oils or product'],
    requireAgreement: true,
}

const LOC_PREP: ServicePrep = {
    instructions: 'Please arrive with clean locs so your retwist lasts.',
    checklist: ['Locs washed and fully dry', 'No heavy product build-up'],
    requireAgreement: true,
}

export const STYLE_TEMPLATES: StyleTemplate[] = [
    {
        id: 'knotless', name: 'Knotless braids', sizes: BRAID_SIZES, lengths: BRAID_LENGTHS,
        basePrice: 30000, sizeStep: -4000, lengthStep: 4000, sizeMinutesStep: -60, lengthMinutesStep: 60, baseMinutes: 480,
        hair: { mode: 'optional', price: 3000, note: 'Pre-stretched braiding hair, 6–8 packs depending on size and length' },
        prep: BRAID_PREP,
    },
    {
        id: 'box-braids', name: 'Box braids', sizes: BRAID_SIZES, lengths: BRAID_LENGTHS,
        basePrice: 26000, sizeStep: -3500, lengthStep: 3500, sizeMinutesStep: -60, lengthMinutesStep: 45, baseMinutes: 420,
        hair: { mode: 'optional', price: 3000, note: 'Pre-stretched braiding hair' },
        prep: BRAID_PREP,
    },
    {
        id: 'boho-knotless', name: 'Boho knotless', sizes: ['Small', 'Medium', 'Large'], lengths: ['Mid-back', 'Waist', 'Butt'],
        basePrice: 35000, sizeStep: -5000, lengthStep: 5000, sizeMinutesStep: -60, lengthMinutesStep: 60, baseMinutes: 480,
        hair: { mode: 'client_brings', price: 0, note: 'Braiding hair plus human hair curls for the boho pieces' },
        prep: BRAID_PREP,
    },
    {
        id: 'twists', name: 'Twists (Senegalese / passion)', sizes: ['Small', 'Medium', 'Large'], lengths: BRAID_LENGTHS,
        basePrice: 22000, sizeStep: -3000, lengthStep: 3000, sizeMinutesStep: -45, lengthMinutesStep: 45, baseMinutes: 360,
        hair: { mode: 'optional', price: 3000, note: 'Twist or passion hair' },
        prep: BRAID_PREP,
    },
    {
        id: 'feed-ins', name: 'Feed-in / stitch braids', sizes: ['4–6 braids', '8–10 braids', '12+ braids'], lengths: ['Mid-back', 'Waist'],
        basePrice: 8000, sizeStep: 2500, lengthStep: 2000, sizeMinutesStep: 30, lengthMinutesStep: 15, baseMinutes: 120,
        hair: { mode: 'optional', price: 1500, note: 'Pre-stretched braiding hair' },
        prep: BRAID_PREP,
    },
    {
        id: 'cornrows', name: 'Cornrows', sizes: ['Straight back', 'Design'], lengths: [],
        basePrice: 6000, sizeStep: 3000, lengthStep: 0, sizeMinutesStep: 45, lengthMinutesStep: 0, baseMinutes: 90,
        hair: { mode: 'none', price: 0, note: '' },
        prep: BRAID_PREP,
    },
    {
        id: 'starter-locs', name: 'Starter locs', sizes: ['Micro', 'Small', 'Medium', 'Large'], lengths: ['Short', 'Medium', 'Long'],
        basePrice: 30000, sizeStep: -5000, lengthStep: 3000, sizeMinutesStep: -60, lengthMinutesStep: 30, baseMinutes: 300,
        hair: { mode: 'none', price: 0, note: '' },
        prep: LOC_PREP,
    },
    {
        id: 'retwist', name: 'Loc retwist', sizes: ['Under 80 locs', '80–150 locs', '150+ locs'], lengths: ['Short', 'Medium', 'Long'],
        basePrice: 8500, sizeStep: 2000, lengthStep: 1500, sizeMinutesStep: 30, lengthMinutesStep: 15, baseMinutes: 120,
        hair: { mode: 'none', price: 0, note: '' },
        prep: LOC_PREP,
    },
    {
        id: 'loc-extensions', name: 'Loc extensions', sizes: ['Small', 'Medium', 'Large'], lengths: ['Shoulder', 'Mid-back', 'Waist'],
        basePrice: 45000, sizeStep: -5000, lengthStep: 5000, sizeMinutesStep: -60, lengthMinutesStep: 60, baseMinutes: 480,
        hair: { mode: 'optional', price: 15000, note: 'Human hair loc extensions' },
        prep: LOC_PREP,
    },
]

export const newOptionId = () =>
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)).slice(0, 8)

const toOptions = (labels: string[]): StyleOption[] => labels.map(label => ({ id: newOptionId(), label }))

/** Builds editable style options + prep + base duration from a template. */
export function applyTemplate(t: StyleTemplate): { styleOptions: StyleOptions; prep: ServicePrep; baseMinutes: number } {
    const sizes = toOptions(t.sizes)
    const lengths = toOptions(t.lengths)
    // Duration steps that make a size shorter (e.g. jumbo is faster) are
    // applied relative to the slowest size, so no cell has negative time.
    const sizeMinDelta = Math.min(0, (sizes.length - 1) * t.sizeMinutesStep)
    const grid = fillGrid(sizes, lengths, {
        basePrice: t.basePrice,
        sizeStep: t.sizeStep,
        lengthStep: t.lengthStep,
        sizeMinutesStep: 0,
        lengthMinutesStep: t.lengthMinutesStep,
    })
    sizes.forEach((s, si) => {
        Object.keys(grid).forEach(key => {
            if (key.startsWith(`${s.id}|`)) grid[key].extraMinutes += si * t.sizeMinutesStep - sizeMinDelta
        })
    })
    return {
        styleOptions: { enabled: true, sizes, lengths, grid, hair: { ...t.hair } },
        prep: { ...t.prep, checklist: [...t.prep.checklist] },
        baseMinutes: t.baseMinutes + sizeMinDelta,
    }
}
