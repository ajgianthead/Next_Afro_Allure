import { parsePrep, parseStyleOptions, startingPrice, type ServicePrep, type StyleOptions } from '@/features/services/pricing'
import { serviceFormProblem, toServicePayload } from '@/features/services/serviceForm'
import { applyTemplate, type StyleTemplate } from '@/features/services/components/styleTemplates'
import type { ServiceData } from '@/features/services/types'

/** One service being set up in the welcome modal. */
export interface ServiceDraft {
    form: ServiceData
    styleOptions: StyleOptions
    prep: ServicePrep
}

const STYLE_OPTIONS_OFF: StyleOptions = { enabled: false, sizes: [], lengths: [], grid: {}, hair: { mode: 'none', price: 0, note: '' } }
const NO_PREP: ServicePrep = { instructions: '', checklist: [], requireAgreement: false }

/** Flat-price starters for services that aren't priced by size and length. Prices are placeholders. */
export const SIMPLE_PRESETS = [
    { name: 'Silk press', price: 8500, length: 120 },
    { name: 'Wash & style', price: 6500, length: 60 },
    { name: 'Wig install', price: 15000, length: 150 },
    { name: 'Lash extensions', price: 12000, length: 120 },
]

function baseForm(availability: string): ServiceData {
    return {
        id: crypto.randomUUID(),
        name: '',
        description: '',
        price: 0,
        length: 0,
        addons: [],
        categories: [],
        photo_url: null,
        imagePath: null,
        business: '',
        availability,
    }
}

export function blankDraft(availability: string): ServiceDraft {
    return { form: baseForm(availability), styleOptions: STYLE_OPTIONS_OFF, prep: NO_PREP }
}

export function draftFromPreset(preset: typeof SIMPLE_PRESETS[number], availability: string): ServiceDraft {
    return { form: { ...baseForm(availability), name: preset.name, price: preset.price, length: preset.length }, styleOptions: STYLE_OPTIONS_OFF, prep: NO_PREP }
}

/** A service with Smart Pricing filled in from one of the editor's style templates. */
export function draftFromTemplate(template: StyleTemplate, availability: string): ServiceDraft {
    const { styleOptions, prep, baseMinutes } = applyTemplate(template)
    const form = { ...baseForm(availability), name: template.name, length: baseMinutes }
    return { form: { ...form, price: startingPrice({ price: 0, length: baseMinutes, style_options: styleOptions }) }, styleOptions, prep }
}

/** A saved service, ready to edit. */
export function draftFromService(service: ServiceData): ServiceDraft {
    return {
        form: { ...service, description: service.description ?? '' },
        styleOptions: parseStyleOptions(service.style_options) ?? STYLE_OPTIONS_OFF,
        prep: parsePrep(service.prep) ?? NO_PREP,
    }
}

/** The first problem stopping this service from being saved. A length is needed to book it. */
export function draftProblem(draft: ServiceDraft): string | null {
    return serviceFormProblem(draft.form, draft.styleOptions)
        ?? (draft.form.length > 0 ? null : 'Set how long this service takes.')
}

export const draftPayload = (draft: ServiceDraft) => toServicePayload(draft.form, draft.styleOptions, draft.prep)
