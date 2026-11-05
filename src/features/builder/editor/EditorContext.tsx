'use client'

import { createContext, useContext } from 'react'
import { createUsePuck } from '@puckeditor/core'
import type { SiteData, SiteInfo } from '@/features/siteBuilder/siteData'
import type { PlanType } from '../gating'

/** Reads Puck's editor state (selection, data, history) with a selector. */
export const usePuck = createUsePuck()

export interface EditorContextValue {
    info: SiteInfo
    /** The business's old template site, for template previews' photos and text. */
    site: SiteData | null
    businessId: string
    plan: PlanType
    /** Opens the "this needs Growth" prompt. */
    askUpgrade: (what: string) => void
}

const EditorContext = createContext<EditorContextValue | null>(null)
export const EditorProvider = EditorContext.Provider
export function useEditor(): EditorContextValue {
    const v = useContext(EditorContext)
    if (!v) throw new Error('useEditor must be used inside the builder editor')
    return v
}

export const ROOT_ZONE = 'root:default-zone'
