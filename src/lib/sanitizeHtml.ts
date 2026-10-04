import sanitize from 'sanitize-html'

/**
 * Sanitizes business-authored rich text (booking-site text sections) before
 * it's rendered with dangerouslySetInnerHTML. Uses sanitize-html, which is
 * pure JS — isomorphic-dompurify pulled jsdom into the server bundle, and
 * jsdom's ESM-only dependencies crashed every business homepage on Vercel.
 * Safe to call on the server and in the browser.
 */
const OPTIONS: sanitize.IOptions = {
    allowedTags: [
        ...sanitize.defaults.allowedTags,
        'h1', 'h2', 'span', 'u', 's', 'mark', 'sub', 'sup',
    ],
    allowedAttributes: {
        a: ['href', 'name', 'target', 'rel'],
        '*': ['class', 'style'],
    },
    allowedStyles: {
        '*': {
            'text-align': [/^(left|right|center|justify)$/],
            color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i],
            'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i],
            'font-weight': [/^(normal|bold|[1-9]00)$/],
            'font-style': [/^(normal|italic)$/],
            'text-decoration': [/^(none|underline|line-through)$/],
        },
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    // Links that open in a new tab must not get access to the opener.
    transformTags: {
        a: (tagName, attribs) => ({
            tagName,
            attribs: attribs.target === '_blank' ? { ...attribs, rel: 'noopener noreferrer' } : attribs,
        }),
    },
}

export function sanitizeHtml(html: string | null | undefined): string {
    return sanitize(html ?? '', OPTIONS)
}
