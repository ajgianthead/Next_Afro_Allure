'use client'

// The Puck config for builder pages, generated from the section registry.
// The same config renders the editor canvas and the public page.

import type { Config, Data } from '@puckeditor/core'
import { BuilderRoot } from './render/BuilderRoot'
import { useBuilder, type BuilderMetadata } from './render/context'
import { SectionShell } from './render/SectionShell'
import { SECTIONS } from './sections'
import type { SectionDefinition } from './sections/types'
import { DEFAULT_ANIMATION, DEFAULT_STYLE, withDefaults, type SectionProps, type SiteThemeProps } from './types'

export type BuilderData = Data<Record<string, SectionProps & { id: string }>, SiteThemeProps>

export const DEFAULT_THEME: SiteThemeProps = {
    templateId: 'quickstart',
    scheme: '',
    customColors: null,
    fontPairing: '',
    logo: null,
    bookingMatchesSite: true,
}

/** A new section's props: layout 1, the section's default content, style and animation. */
export function newSectionProps(def: SectionDefinition): SectionProps {
    return {
        layout: 1,
        content: structuredClone(def.defaultContent),
        style: { ...DEFAULT_STYLE, ...structuredClone(def.defaultStyle ?? {}) },
        animation: { ...DEFAULT_ANIMATION, ...(def.defaultAnimation ?? {}) },
    }
}

export function SectionRender({ def, props, id }: { def: SectionDefinition; props: Partial<SectionProps>; id: string }) {
    const p = withDefaults(props, def.defaultContent)
    const ctx = useBuilder()
    if (!ctx.editing && def.hideWhen?.(p.content, p.layout, ctx)) return null
    const Layout = def.layouts[p.layout - 1] ?? def.layouts[0]
    return (
        <SectionShell type={def.type} id={id} props={p} fullBleed={def.fullBleed?.(p.layout)} sticky={def.sticky?.(p.layout)}>
            <Layout content={p.content} layout={p.layout} />
        </SectionShell>
    )
}

// Fields are custom: the editor's Properties / Layout / Animation tabs draw
// them (see editor/fields). Puck stores the values and handles undo.
const sectionFields = {
    layout: { type: 'custom' as const, render: () => null },
    content: { type: 'custom' as const, render: () => null },
    style: { type: 'custom' as const, render: () => null },
    animation: { type: 'custom' as const, render: () => null },
}

export function buildConfig(fields?: Partial<typeof sectionFields>, rootFields?: Config['root'] extends infer R ? any : never): Config {
    return {
        root: {
            fields: rootFields ?? { theme: { type: 'custom', render: () => null } },
            defaultProps: DEFAULT_THEME as any,
            render: ({ children, puck, ...theme }: any) => (
                <BuilderRoot themeProps={{ ...DEFAULT_THEME, ...theme }} metadata={puck.metadata as BuilderMetadata} editing={puck.isEditing}>
                    {children}
                </BuilderRoot>
            ),
        },
        components: Object.fromEntries(SECTIONS.map(def => [def.type, {
            label: def.label,
            fields: { ...sectionFields, ...(fields ?? {}) },
            defaultProps: newSectionProps(def),
            render: ({ puck, id, ...props }: any) => <SectionRender def={def} props={props} id={id} />,
        }])),
    } as Config
}

/** The config the public page renders with (no editor fields). */
export const renderConfig = buildConfig()
