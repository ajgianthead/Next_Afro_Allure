// What each plan can use. Starter: layouts 1–8 and the basic animations of
// every section. Growth: everything. A Starter business keeps any Pro choice
// it already published (e.g. after downgrading) but can't make new ones.

import { animationIsPro } from './animation/presets'
import { layoutTier, type SectionAnimation } from './types'

export type PlanType = 'STARTER' | 'GROWTH'

interface PageSection { type: string; props: { id?: string; layout?: number; animation?: SectionAnimation } }

export const canUsePro = (plan: PlanType) => plan === 'GROWTH'

/** Sections in `next` that use a Pro layout or animation Starter can't pick (anything not already published as is). */
export function proViolations(next: PageSection[], published: PageSection[], plan: PlanType): { id: string; type: string; what: 'layout' | 'animation' }[] {
    if (canUsePro(plan)) return []
    const before = new Map(published.map(s => [s.props.id, s]))
    const out: { id: string; type: string; what: 'layout' | 'animation' }[] = []
    for (const s of next) {
        const id = s.props.id ?? ''
        const prev = before.get(id)
        const layout = s.props.layout ?? 1
        if (layoutTier(layout) === 'pro' && !(prev && prev.type === s.type && prev.props.layout === layout)) {
            out.push({ id, type: s.type, what: 'layout' })
        }
        if (s.props.animation && animationIsPro(s.props.animation)
            && !(prev?.props.animation && JSON.stringify(prev.props.animation) === JSON.stringify(s.props.animation))) {
            out.push({ id, type: s.type, what: 'animation' })
        }
    }
    return out
}
