'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { BRAND, SERIF } from '@/features/welcomeSetup/components/shared'
import type { BookingTheme } from '@/features/automatedBooking/types/theme'
import type { SiteData } from '../siteData'
import { BookingThemePanel } from './BookingThemePanel'

/** Booking page (sidebar): how /book looks — matching the website, or styled on its own. */
export function BookingPageScreen({ site, canMatchSite, bookingTheme, bookLink }: {
    /** The website's colors and fonts (from the builder page or the template site), for "match my website". */
    site: SiteData
    canMatchSite: boolean
    bookingTheme: BookingTheme | null
    bookLink: string
}) {
    const [current, setCurrent] = useState(site)
    const [theme, setTheme] = useState(bookingTheme)
    return (
        <div className="min-h-screen pb-28 lg:pb-12" style={{ backgroundColor: BRAND.cream }}>
            <header className="sticky top-0 z-20 border-b px-4 py-3 backdrop-blur sm:px-6" style={{ borderColor: BRAND.border, backgroundColor: 'rgba(250,247,242,.92)' }}>
                <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
                    <h1 className="truncate text-lg sm:text-xl" style={{ fontFamily: SERIF, color: BRAND.ink }}>Booking page</h1>
                    <a href={bookLink} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium" style={{ border: `1px solid ${BRAND.border}`, color: BRAND.ink, backgroundColor: '#FFFFFF' }}>
                        <ExternalLink size={14} /> Open
                    </a>
                </div>
            </header>
            <div className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6">
                <div className="mx-auto max-w-xl rounded-2xl p-4 sm:p-6" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${BRAND.border}` }}>
                    <div className="mb-4 min-w-0">
                        <h2 className="text-lg" style={{ fontFamily: SERIF, color: BRAND.ink }}>Your booking page</h2>
                        <p className="truncate text-xs" style={{ color: BRAND.warm }}>{bookLink.replace(/^https?:\/\//, '')}</p>
                    </div>
                    <BookingThemePanel site={current} canMatchSite={canMatchSite} initialTheme={theme}
                        onSaved={({ theme: t, matchesSite }) => { setTheme(t); setCurrent(prev => ({ ...prev, bookingMatchesSite: matchesSite })) }} />
                </div>
            </div>
        </div>
    )
}
