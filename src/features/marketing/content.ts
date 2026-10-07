// Shape of a specialty or feature page. The copy lives in ./specialties.tsx,
// ./beauty.tsx and ./features.tsx; the layout in ./components/MarketingPage.tsx.
// Pages differ on purpose: each picks its own hero, accent color, section
// order and section styles, so they don't read as one template.
//
// Only describe what AfroAllure actually does today. Prices in example menus
// are examples a pro would set, not AfroAllure's prices.

import type { ReactNode } from 'react'
import type { MarketingPageSlug, SlotName } from './media'

export interface Point { title: string; body: string }

/** An example service as the client sees it: rows × columns of prices. */
export interface SampleMenu {
    service: string
    note?: string
    columns: string[]
    rows: { label: string; cells: string[] }[]
    extras?: string[]
}

/** A built-in animated demo. Each can be replaced by real media through SLOT_MEDIA. */
export type Widget =
    | { kind: 'price-picker' }                                  // uses the page's first sample menu
    | { kind: 'dm-thread'; messages: { from: 'client' | 'you'; text: string }[] }
    | { kind: 'texts'; business: string; service: string }       // confirmation, reminders, pay link
    | { kind: 'checkout'; service: string; totalCents: number; depositCents: number; noShowFeeCents?: number }
    | { kind: 'booking-site'; business: string; slug: string; services: { name: string; price: string; time: string }[] }
    | { kind: 'calendar' }
    | { kind: 'payout'; amountCents: number }
    | { kind: 'rebook'; business: string; service: string; weeks: number }
    /** The AfroAllure dashboard on a laptop screen. */
    | { kind: 'dashboard'; view: 'appointments' | 'services' | 'no-show'; business: string }

export interface Visual { widget: Widget; slot: SlotName }

/** A feature shown as a row: words on one side, a demo on the other. */
export interface Row { eyebrow?: string; title: string; body: string; bullets?: string[]; visual: Visual }

export type Section =
    | { type: 'pains'; style: 'cards' | 'numbered' | 'quotes' }
    | { type: 'rows' }
    | { type: 'benefits'; style: 'grid' | 'bento' | 'checklist' }
    | { type: 'menu'; withPicker?: boolean }
    | { type: 'steps'; style: 'timeline' | 'cards' }
    | { type: 'demo'; title: string; body: string; visual: Visual }
    | { type: 'facts' }
    | { type: 'showcase' }

export interface Theme {
    /** Highlight color for this page: headline emphasis, eyebrows, buttons' glow. */
    accent: string
    hero: 'split-dark' | 'split-light' | 'centered-dark' | 'split-accent'
}

export interface MarketingPageContent {
    slug: MarketingPageSlug
    kind: 'specialty' | 'feature'
    metaTitle: string
    metaDescription: string
    eyebrow: string
    heroTitle: ReactNode
    heroBody: string
    theme: Theme
    heroVisual: Visual
    /** Middle of the page, in order. FAQ and the closing call to action always follow. */
    sections: Section[]
    painsTitle: string
    pains: Point[]
    rows: Row[]
    benefitsTitle: string
    benefitsIntro: string
    benefits: Point[]
    /** Three short true facts for a fact band, e.g. ['0%', 'AfroAllure fee on Growth']. */
    facts?: [string, string][]
    sampleMenus?: { title: string; intro: string; menus: SampleMenu[] }
    steps?: { title: string; steps: Point[] }
    faq: [string, string][]
    /** hrefs of related pages from ./menu.ts */
    related: string[]
}
