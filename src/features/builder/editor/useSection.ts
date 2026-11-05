'use client'

import { useCallback, useMemo } from 'react'
import { SECTION_BY_TYPE } from '../sections'
import type { SectionDefinition } from '../sections/types'
import { withDefaults, type SectionAnimation, type SectionProps, type SectionStyle, type SiteThemeProps } from '../types'
import { ROOT_ZONE, usePuck } from './EditorContext'

/** The selected section with its props merged over the defaults, and setters that go through Puck (so undo works). */
export function useSelectedSection() {
    const item = usePuck(s => s.selectedItem)
    const index = usePuck(s => s.appState.ui.itemSelector?.index ?? -1)
    const dispatch = usePuck(s => s.dispatch)
    const def: SectionDefinition | undefined = item ? SECTION_BY_TYPE[item.type as keyof typeof SECTION_BY_TYPE] : undefined
    const props = item && def ? withDefaults(item.props as Partial<SectionProps>, def.defaultContent) : null

    const update = useCallback((patch: (p: SectionProps) => Partial<SectionProps>) => {
        if (!item || !def || index < 0) return
        const current = withDefaults(item.props as Partial<SectionProps>, def.defaultContent)
        dispatch({
            type: 'replace',
            destinationIndex: index,
            destinationZone: ROOT_ZONE,
            data: { ...item, props: { ...item.props, ...patch(current) } },
        })
    }, [item, def, index, dispatch])

    const setContent = useCallback((c: Record<string, unknown>) => update(p => ({ content: { ...(p.content as object), ...c } })), [update])
    const setStyle = useCallback((s: (style: SectionStyle) => Partial<SectionStyle>) => update(p => ({ style: { ...p.style, ...s(p.style) } })), [update])
    const setAnimation = useCallback((a: Partial<SectionAnimation>) => update(p => ({ animation: { ...p.animation, ...a } })), [update])
    const setLayout = useCallback((layout: number) => update(() => ({ layout })), [update])

    return { item, index, def, props, setContent, setStyle, setAnimation, setLayout }
}

/** The site theme (root props) and a setter. */
export function useTheme() {
    const root = usePuck(s => s.appState.data.root)
    const dispatch = usePuck(s => s.dispatch)
    const theme = useMemo(() => ((root as { props?: SiteThemeProps }).props ?? {}) as SiteThemeProps, [root])
    const setTheme = useCallback((patch: Partial<SiteThemeProps>) => {
        dispatch({ type: 'replaceRoot', root: { ...root, props: { ...theme, ...patch } } as any })
    }, [root, theme, dispatch])
    return { theme, setTheme }
}
