'use client'

import { useMemo } from 'react'
import { buildGoogleFontsUrl } from '@lib/extractFonts'
import { SiteProvider } from '@/features/siteBuilder/templates/context'
import { MobileBookBar } from '@/features/siteBuilder/templates/parts'
import { defaultSiteData, EMPTY_CONTENT } from '@/features/siteBuilder/siteData'
import { resolveTheme } from '@/features/siteBuilder/themes'
import { BuilderProvider, type BuilderMetadata } from './context'
import type { SiteThemeProps } from '../types'
import './builder.css'

/**
 * Wraps a builder page: resolves the site theme into CSS variables, loads its
 * fonts, and provides the page's data to every section. The template parts
 * (Button, Slot, Logo, Lightbox…) read the same values through SiteProvider.
 */
export function BuilderRoot({ themeProps, metadata, editing, children }: {
    themeProps: SiteThemeProps
    metadata: BuilderMetadata
    editing: boolean
    children: React.ReactNode
}) {
    const theme = useMemo(() => {
        const t = resolveTheme(themeProps.templateId, themeProps.scheme, themeProps.customColors, themeProps.fontPairing)
        return {
            ...t,
            radius: themeProps.radius ?? t.radius,
            buttonRadius: themeProps.buttonRadius ?? t.buttonRadius,
            buttonCase: themeProps.buttonCase ?? t.buttonCase,
        }
    }, [themeProps])

    const site = useMemo(() => ({
        ...defaultSiteData(themeProps.templateId),
        scheme: themeProps.scheme,
        customColors: themeProps.customColors,
        fontPairing: themeProps.fontPairing,
        media: { logo: themeProps.logo, cover: null, about: null, gallery: [] },
        content: { ...EMPTY_CONTENT },
        bookingMatchesSite: themeProps.bookingMatchesSite,
    }), [themeProps])

    const bookHref = (serviceId?: string) => `${metadata.basePath}/book${serviceId ? `?service=${encodeURIComponent(serviceId)}` : ''}`

    const vars = {
        '--s-bg': theme.bg,
        '--s-fg': theme.fg,
        '--s-accent': theme.accent,
        '--s-accent-fg': theme.accentFg,
        '--s-muted': theme.muted,
        '--s-border': theme.border,
        '--s-surface': theme.surface,
        '--s-heading': theme.headingFont,
        '--s-body': theme.bodyFont,
        '--s-radius': `${theme.radius}px`,
        '--s-button-radius': `${theme.buttonRadius}px`,
    } as React.CSSProperties

    return (
        <BuilderProvider value={{ ...metadata, theme, themeProps, editing, bookHref }}>
            <SiteProvider info={metadata.info} site={site} theme={theme} basePath={metadata.basePath} editing={editing}>
                <div
                    className={`aa-root @container relative w-full min-h-full overflow-x-clip text-base antialiased${editing || metadata.still ? '' : ' aa-anim'}`}
                    style={{ ...vars, background: 'var(--s-bg)', color: 'var(--s-fg)', fontFamily: 'var(--s-body)', fontSynthesis: 'none' }}
                >
                    <link rel="stylesheet" href={buildGoogleFontsUrl(theme.fonts)} precedence="default" />
                    {/* Live site: entrance content starts hidden (builder.css) until its animation runs,
                        with a 2.5 s failsafe; without JavaScript it shows right away. In the editor
                        content always shows and the Preview button plays animations. */}
                    {!editing && <noscript><style>{'.aa-anim [data-enter]{opacity:1!important;animation:none!important}'}</style></noscript>}
                    {children}
                    {/* Phones: a Book bar stuck to the bottom (Site look → "Book bar on phones"). Hidden in
                        thumbnails, and when the menu bar brings its own (Bottom booking bar). */}
                    {themeProps.mobileBookBar !== false && !metadata.still && <div className="aa-root-bookbar"><MobileBookBar /></div>}
                </div>
            </SiteProvider>
        </BuilderProvider>
    )
}
