// Shape of a specialty or feature page. The copy lives in ./specialties.tsx
// and ./features.tsx; the layout in ./components/MarketingPage.tsx.
// Only describe what AfroAllure actually does today. Prices in example menus
// are examples a stylist would set, not AfroAllure's prices.

import type { ReactNode } from 'react'
import type { MarketingPageSlug } from './media'

export interface Point { title: string; body: string }

/** An example service as the client sees it: rows × columns of prices. */
export interface SampleMenu {
    service: string
    note?: string
    columns: string[]
    rows: { label: string; cells: string[] }[]
    extras?: string[]
}

export interface MarketingPageContent {
    slug: MarketingPageSlug
    kind: 'specialty' | 'feature'
    metaTitle: string
    metaDescription: string
    eyebrow: string
    heroTitle: ReactNode
    heroBody: string
    painsTitle: string
    pains: Point[]
    benefitsTitle: string
    benefitsIntro: string
    benefits: Point[]
    /** Specialty pages: what the booking menu looks like. */
    sampleMenus?: { title: string; intro: string; menus: SampleMenu[] }
    /** Feature pages: how it works, in order. */
    steps?: { title: string; steps: Point[] }
    faq: [string, string][]
    /** hrefs of related pages from ./menu.ts */
    related: string[]
}
