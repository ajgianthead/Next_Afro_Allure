// Competitor pricing used on /for-businesses and the /switch pages.
// Every figure is from the platform's published pricing or a 2026 pricing
// review, checked October 2026 — re-check before changing copy, and update
// CHECKED_ON when you do.

import {
    GROWTH_MONTHLY_CENTS, GROWTH_YEARLY_CENTS,
} from './plans'
import { STRIPE_PROCESSING_FIXED_CENTS, STRIPE_PROCESSING_PERCENT } from '@/lib/fees'

export const CHECKED_ON = 'October 2026'

export interface CostModel {
    name: string
    /** Monthly software cost in dollars at the plan compared. */
    monthly: number
    planLabel: string
    cardPercent: number
    cardFixed: number
    /** One-time fee per new client the platform's marketplace sends, in dollars, given the first-visit price. */
    newClientFee?: (firstVisit: number) => number
}

export const AFROALLURE_GROWTH_MONTHLY: CostModel = {
    name: 'AfroAllure',
    monthly: GROWTH_MONTHLY_CENTS / 100,
    planLabel: 'Growth, monthly',
    cardPercent: STRIPE_PROCESSING_PERCENT,
    cardFixed: STRIPE_PROCESSING_FIXED_CENTS / 100,
}

export const AFROALLURE_GROWTH_YEARLY: CostModel = {
    ...AFROALLURE_GROWTH_MONTHLY,
    monthly: GROWTH_YEARLY_CENTS / 100 / 12,
    planLabel: 'Growth, yearly',
}

export const STYLESEAT: CostModel = {
    name: 'StyleSeat',
    monthly: 35,
    planLabel: 'Standard plan',
    cardPercent: 0.026,
    cardFixed: 0.3,
    newClientFee: firstVisit => Math.min(firstVisit * 0.3, 50),
}

export const GLOSSGENIUS: CostModel = {
    name: 'GlossGenius',
    monthly: 28,
    planLabel: 'Standard, billed monthly',
    cardPercent: 0.026,
    cardFixed: 0,
}

export const ACUITY: CostModel = {
    name: 'Acuity',
    monthly: 20,
    planLabel: 'Starter, billed monthly (no text reminders)',
    // Acuity doesn't process cards itself; this is Stripe's standard rate.
    cardPercent: STRIPE_PROCESSING_PERCENT,
    cardFixed: STRIPE_PROCESSING_FIXED_CENTS / 100,
}

export interface Usage {
    /** Card payments per month. */
    payments: number
    /** Average card payment, dollars. */
    average: number
    /** New clients per month that came from the platform's marketplace. */
    marketplaceClients?: number
}

export function monthlyCost(model: CostModel, usage: Usage): number {
    const card = usage.payments * (usage.average * model.cardPercent + model.cardFixed)
    const newClients = model.newClientFee ? (usage.marketplaceClients ?? 0) * model.newClientFee(usage.average) : 0
    return model.monthly + card + newClients
}

export const SOURCES: Record<'styleseat' | 'glossgenius' | 'acuity', { label: string; url: string }[]> = {
    styleseat: [
        { label: 'StyleSeat: How much does StyleSeat cost?', url: 'https://www.styleseat.com/blog/how-much-does-styleseat-cost/' },
        { label: 'Pabau: StyleSeat pricing 2026', url: 'https://pabau.com/blog/styleseat-pricing/' },
    ],
    glossgenius: [
        { label: 'Koalendar: GlossGenius pricing', url: 'https://koalendar.com/blog/gloss-genius-pricing' },
        { label: 'Pabau: GlossGenius pricing 2026', url: 'https://pabau.com/blog/glossgenius-pricing/' },
    ],
    acuity: [
        { label: 'Acuity Scheduling pricing', url: 'https://acuityscheduling.com/pricing' },
        { label: 'Koalendar: Acuity plans explained 2026', url: 'https://koalendar.com/blog/acuity-scheduling-pricing' },
    ],
}
