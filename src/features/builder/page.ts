// Checks a page the browser sent before it's stored. Pure.

import { SECTION_TYPES, type SectionType } from './types'

export const MAX_SECTIONS = 40
export const MAX_PAGE_BYTES = 600_000

export interface StoredSection { type: SectionType; props: Record<string, unknown> & { id: string } }
export interface StoredPage { root: { props: Record<string, unknown> }; content: StoredSection[]; zones: Record<string, never> }

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

/** A clean page, or an error a person can act on. Unknown section types and malformed items are dropped. */
export function sanitizePage(raw: unknown): { ok: true; page: StoredPage } | { ok: false; error: string } {
    if (!isObject(raw)) return { ok: false, error: 'That page could not be read. Please refresh and try again.' }
    let size = 0
    try { size = JSON.stringify(raw).length } catch { return { ok: false, error: 'That page could not be read. Please refresh and try again.' } }
    if (size > MAX_PAGE_BYTES) return { ok: false, error: 'This page is too large to save. Remove some sections or text and try again.' }

    const rootProps = isObject(raw.root) && isObject((raw.root as Record<string, unknown>).props) ? (raw.root as { props: Record<string, unknown> }).props : {}
    const content = (Array.isArray(raw.content) ? raw.content : [])
        .filter((item): item is { type: SectionType; props: Record<string, unknown> } =>
            isObject(item) && (SECTION_TYPES as readonly string[]).includes(item.type as string) && isObject(item.props) && typeof item.props.id === 'string')
        .map(item => ({ type: item.type, props: item.props as StoredSection['props'] }))
    if (content.length > MAX_SECTIONS) return { ok: false, error: `A page can have up to ${MAX_SECTIONS} sections.` }
    return { ok: true, page: { root: { props: rootProps }, content, zones: {} } }
}
