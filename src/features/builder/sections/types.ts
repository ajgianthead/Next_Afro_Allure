// The contract every section follows: its content fields, text roles,
// defaults, and its 20 layout components.

import type { LucideIcon } from 'lucide-react'
import type { SiteMedia } from '@/features/siteBuilder/siteData'
import type { SectionAnimation, SectionStyle, SectionType, TextStyle } from '../types'
import type { BuilderContextValue } from '../render/context'

/** A button/link a business sets: label + where it goes. */
export interface LinkValue {
    label: string
    /** 'book', 'book:<serviceId>', '#<section anchor>', or an https/mailto/tel link. */
    href: string
}

/** Content fields shown in the Properties tab's Content group. */
export type FieldSpec =
    | { kind: 'text'; key: string; label: string; placeholder?: string; max?: number; help?: string }
    | { kind: 'textarea'; key: string; label: string; placeholder?: string; rows?: number; max?: number; help?: string }
    | { kind: 'media'; key: string; label: string; accept: 'image' | 'media'; help?: string }
    | { kind: 'mediaList'; key: string; label: string; max: number; help?: string }
    | { kind: 'link'; key: string; label: string; help?: string }
    | { kind: 'toggle'; key: string; label: string; help?: string }
    | { kind: 'select'; key: string; label: string; options: { value: string; label: string }[]; help?: string }
    | { kind: 'number'; key: string; label: string; min: number; max: number; step?: number; help?: string }
    | { kind: 'list'; key: string; label: string; itemLabel: string; fields: FieldSpec[]; max: number; empty: Record<string, unknown>; help?: string }
    | { kind: 'services'; key: string; label: string; help?: string }

/** Which services a section shows. */
export interface ServicePick {
    mode: 'all' | 'picked'
    ids: string[]
    /** Most to show (0 = all). */
    limit: number
}

export interface LayoutProps<Content> {
    content: Content
    layout: number
}

export interface SectionDefinition<Content = any> {
    type: SectionType
    label: string
    /** One line for the section picker. */
    description: string
    icon: LucideIcon
    /** id in WIREFRAME_SECTIONS (the layout cards' thumbnails). */
    wireframeId: string
    /** Text roles that get their own style controls, with the layout's default look. */
    textRoles: { id: string; label: string; defaults?: TextStyle }[]
    fields: FieldSpec[]
    defaultContent: Content
    /** Index 0 is layout 1. A missing entry falls back to layout 1. */
    layouts: React.ComponentType<LayoutProps<Content>>[]
    /** Layouts drawn edge to edge, without the shell's padding and width. */
    fullBleed?: (layout: number) => boolean
    /** Layouts that stay at the top while scrolling. 'overlay' also takes no space, so the next section sits under it. */
    sticky?: (layout: number) => boolean | 'overlay'
    defaultStyle?: Partial<SectionStyle>
    defaultAnimation?: Partial<SectionAnimation>
    /** On the live site, leave the section out entirely (e.g. Offers with no offer on). The editor still shows it. */
    hideWhen?: (content: Content, layout: number, ctx: BuilderContextValue) => boolean
    /** Only one of this section per page (Navbar, Footer). */
    single?: boolean
}

export type { SiteMedia }
