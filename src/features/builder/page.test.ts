import { describe, expect, it } from 'vitest'
import { MAX_SECTIONS, sanitizePage } from './page'

describe('sanitizePage', () => {
    it('keeps known sections and the theme', () => {
        const r = sanitizePage({ root: { props: { templateId: 'fade-house' } }, content: [{ type: 'Hero', props: { id: 'h1', layout: 3 } }] })
        expect(r.ok && r.page.content).toEqual([{ type: 'Hero', props: { id: 'h1', layout: 3 } }])
        expect(r.ok && r.page.root.props.templateId).toBe('fade-house')
    })
    it('drops unknown types and malformed items', () => {
        const r = sanitizePage({ root: {}, content: [{ type: 'Script', props: { id: 'x' } }, { type: 'Hero' }, { type: 'Hero', props: { id: 7 } }, 'junk'] })
        expect(r.ok && r.page.content).toEqual([])
    })
    it('refuses pages that are not objects, too big or too long', () => {
        expect(sanitizePage(null).ok).toBe(false)
        expect(sanitizePage({ content: [{ type: 'Hero', props: { id: 'a', text: 'x'.repeat(700_000) } }] }).ok).toBe(false)
        const many = Array.from({ length: MAX_SECTIONS + 1 }, (_, i) => ({ type: 'Hero', props: { id: `s${i}` } }))
        expect(sanitizePage({ content: many }).ok).toBe(false)
    })
})
