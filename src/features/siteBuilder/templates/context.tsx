'use client'

import { createContext, useContext } from 'react'
import type { SiteData, SiteInfo } from '../siteData'
import type { SiteTheme } from '../themes'

export interface TemplateProps {
    info: SiteInfo
    site: SiteData
    theme: SiteTheme
    /** '' on the business's subdomain, '/business/<name>' on the app domain. */
    basePath: string
    /** In the builder: empty photo slots show "Add photo" instead of disappearing. */
    editing?: boolean
}

interface SiteContextValue extends TemplateProps {
    bookHref: (serviceId?: string) => string
    bio: string
}

const SiteContext = createContext<SiteContextValue | null>(null)

export function SiteProvider({ children, ...props }: TemplateProps & { children: React.ReactNode }) {
    const bookHref = (serviceId?: string) => `${props.basePath}/book${serviceId ? `?service=${encodeURIComponent(serviceId)}` : ''}`
    const bio = props.site.content.bio || props.info.fallbackBio
    return <SiteContext.Provider value={{ ...props, bookHref, bio }}>{children}</SiteContext.Provider>
}

export function useSite(): SiteContextValue {
    const value = useContext(SiteContext)
    if (!value) throw new Error('useSite must be used inside SiteProvider')
    return value
}
