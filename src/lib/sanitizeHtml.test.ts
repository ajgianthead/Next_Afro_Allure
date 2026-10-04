import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from './sanitizeHtml'

describe('sanitizeHtml', () => {
    it('keeps normal rich-text formatting', () => {
        const html = '<h2 style="text-align:center">Hello</h2><p><strong>Bold</strong> <em>it</em> <u>u</u></p><ul><li>One</li></ul>'
        expect(sanitizeHtml(html)).toBe(html)
    })
    it('strips scripts, event handlers and javascript: links', () => {
        const out = sanitizeHtml('<p onclick="steal()">Hi</p><script>alert(1)</script><a href="javascript:alert(1)">x</a><img src=x onerror=alert(1)>')
        expect(out).not.toMatch(/script|onclick|onerror|javascript:/i)
        expect(out).toContain('<p>Hi</p>')
    })
    it('drops unsafe styles but keeps allowed ones', () => {
        expect(sanitizeHtml('<p style="text-align: right; position: fixed">x</p>')).toBe('<p style="text-align:right">x</p>')
    })
    it('adds noopener to new-tab links', () => {
        expect(sanitizeHtml('<a href="https://x.co" target="_blank">x</a>')).toContain('rel="noopener noreferrer"')
    })
    it('handles empty input', () => {
        expect(sanitizeHtml(null)).toBe('')
    })
})
