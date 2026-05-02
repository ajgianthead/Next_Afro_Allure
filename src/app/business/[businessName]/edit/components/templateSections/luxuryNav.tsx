'use client'
import { ColorPicker } from '../fieldPrimitives'

const SERIF = '"Fraunces", "Times New Roman", serif'
const SANS = '"Inter", system-ui, sans-serif'

const clr = (label: string) => ({
    type: 'custom' as const, label,
    render: ({ value, onChange, field }: any) => (
        <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">{field.label}</span>
            <ColorPicker value={value} onChange={onChange} />
        </div>
    )
})

export const LuxuryNavComponent: any = {
    fields: {
        brandName: { type: 'text', label: 'Brand Name' },
        ctaText: { type: 'text', label: 'CTA Text' },
        nav1: { type: 'text', label: 'Nav 1' },
        nav2: { type: 'text', label: 'Nav 2' },
        nav3: { type: 'text', label: 'Nav 3' },
        nav4: { type: 'text', label: 'Nav 4' },
        bgColor: clr('Background'),
        textColor: clr('Text Color'),
        borderColor: clr('Border Color'),
    },
    defaultProps: {
        brandName: 'Maison Tresse',
        ctaText: 'Book a sitting',
        nav1: 'Atelier', nav2: 'Services', nav3: 'Portfolio', nav4: 'Contact',
        bgColor: '#f4ede2', textColor: '#1a1410', borderColor: 'rgba(26,20,16,.14)',
    },
    render: ({ brandName, ctaText, nav1, nav2, nav3, nav4, bgColor, textColor, borderColor }: any) => (
        <header
            className="flex items-center justify-between px-6 lg:px-20 py-5"
            style={{ background: bgColor, color: textColor, borderBottom: `1px solid ${borderColor}`, fontFamily: SANS }}
        >
            <div style={{ fontFamily: SERIF, fontSize: 20, letterSpacing: '-.02em' }}>
                {brandName}
            </div>
            <nav className="hidden lg:flex gap-8" style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                {[nav1, nav2, nav3, nav4].filter(Boolean).map((link: string, i: number) => (
                    <a key={i} style={{ color: textColor, cursor: 'pointer' }}>{link}</a>
                ))}
            </nav>
            <div className="flex lg:hidden flex-col justify-between" style={{ width: 22, height: 14 }}>
                <div style={{ height: 1, background: textColor }} />
                <div style={{ height: 1, background: textColor }} />
            </div>
            <button style={{
                background: textColor, color: bgColor, fontFamily: SANS, fontSize: 12, fontWeight: 600,
                letterSpacing: '.16em', textTransform: 'uppercase', padding: '14px 24px',
                border: 'none', borderRadius: 0, cursor: 'pointer',
            }}>{ctaText}</button>
        </header>
    )
}
