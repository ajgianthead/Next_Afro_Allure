'use client'
import { useState } from 'react'
import { BookingModal } from '../../templates/shared'
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

export const BookingCTAComponent: any = {
    fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        headingLine1: { type: 'text', label: 'Heading Line 1' },
        headingLine2Italic: { type: 'text', label: 'Heading Line 2 (italic)' },
        bodyText: { type: 'text', label: 'Body Text' },
        ctaText: { type: 'text', label: 'CTA Button Text' },
        bgColor: clr('Background'),
        textColor: clr('Text Color'),
        mutedColor: clr('Muted Color'),
        borderColor: clr('Border Color'),
    },
    defaultProps: {
        eyebrow: 'V',
        headingLine1: 'The chair',
        headingLine2Italic: 'is yours.',
        bodyText: 'One client per day. Booking opens six weeks out and tends to fill within forty-eight hours.',
        ctaText: 'Reserve your sitting',
        bgColor: '#f4ede2', textColor: '#1a1410',
        mutedColor: 'rgba(26,20,16,.55)', borderColor: 'rgba(26,20,16,.14)',
    },
    render: ({ eyebrow, headingLine1, headingLine2Italic, bodyText, ctaText, bgColor, textColor, mutedColor, borderColor }: any) => {
        const [bookingOpen, setBookingOpen] = useState(false)
        const modalTheme = {
            bg: bgColor, fg: textColor, accent: textColor, accentFg: bgColor,
            muted: mutedColor, border: borderColor, fieldBg: 'rgba(26,20,16,.04)',
            font: SANS, serif: SERIF, ctaRadius: 0, ctaLetter: '.08em', ctaTransform: 'uppercase', radius: 0,
        }
        return (
            <section
                className="px-6 py-20 lg:px-20 lg:py-28 text-center"
                style={{ background: bgColor, color: textColor, borderTop: `1px solid ${borderColor}`, fontFamily: SANS }}
            >
                <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: mutedColor, marginBottom: 18, fontWeight: 500 }}>
                    {eyebrow}
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1.05, letterSpacing: '-.02em', display: 'block', marginBottom: 24 }} className="lg:!text-[88px]">
                    {headingLine1}<br />
                    <em style={{ fontStyle: 'italic' }}>{headingLine2Italic}</em>
                </div>
                <p style={{ fontSize: 15, color: mutedColor, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.5 }} className="lg:!text-[17px]">
                    {bodyText}
                </p>
                <button
                    onClick={() => setBookingOpen(true)}
                    style={{
                        background: textColor, color: bgColor, fontFamily: SANS, fontSize: 13, fontWeight: 600,
                        letterSpacing: '.16em', textTransform: 'uppercase', padding: '18px 32px',
                        border: 'none', borderRadius: 0, cursor: 'pointer',
                    }}
                >{ctaText}</button>
                <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} theme={modalTheme} services={[]} stylistName="" />
            </section>
        )
    }
}
