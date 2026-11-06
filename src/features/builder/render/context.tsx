'use client'

import { createContext, useContext } from 'react'
import type { SiteInfo } from '@/features/siteBuilder/siteData'
import type { SiteTheme } from '@/features/siteBuilder/themes'
import type { SectionPalette } from '../palette'
import type { SectionAnimation, SectionStyle, SiteThemeProps } from '../types'

/** What the editor and the public page pass to Puck as `metadata`. */
export interface BuilderMetadata {
    info: SiteInfo
    /** Thumbnails: no animations (content shows as-is). */
    still?: boolean
    /** For forms that write to the business (the footer's openings sign-up). */
    businessId?: string
    /** '' on the business's subdomain, '/business/<name>' on the app domain. */
    basePath: string
    planType: 'STARTER' | 'GROWTH'
    /** Loyalty and referral offers, for the Offers section. */
    offers?: BuilderOffers
    /** The next open times ("Thu, Nov 6 · 10 AM"), soonest first, each linking to booking. */
    openings?: { label: string; href?: string }[]
    /** The next 7 days ("Today", "Fri"…) and whether each has an open time. */
    week?: { day: string; date: string; open: boolean }[]
}

export interface BuilderOffers {
    loyalty: { title: string; detail: string; visits?: number; rewardText: string } | null
    referral: { title: string; detail: string; rewardText: string } | null
}

export interface BuilderContextValue extends BuilderMetadata {
    theme: SiteTheme
    themeProps: SiteThemeProps
    editing: boolean
    bookHref: (serviceId?: string) => string
}

const BuilderContext = createContext<BuilderContextValue | null>(null)
export const BuilderProvider = BuilderContext.Provider
/** The builder context, or null outside a builder page. */
export const useOptionalBuilder = () => useContext(BuilderContext)

export function useBuilder(): BuilderContextValue {
    const v = useContext(BuilderContext)
    if (!v) throw new Error('useBuilder must be used inside a builder page')
    return v
}

export interface SectionContextValue {
    style: SectionStyle
    palette: SectionPalette
    animation: SectionAnimation
    layout: number
}

const SectionContext = createContext<SectionContextValue | null>(null)
export const SectionProvider = SectionContext.Provider
export function useSection(): SectionContextValue {
    const v = useContext(SectionContext)
    if (!v) throw new Error('useSection must be used inside a section')
    return v
}
