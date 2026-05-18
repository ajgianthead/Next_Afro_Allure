'use client'
import { useState } from 'react'
import { ImgPlaceholder, BookingModal } from '../../templates/shared'
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

export const LuxuryHeroComponent: any = {
    fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        headingLine1: { type: 'text', label: 'Heading Line 1' },
        headingLine2Italic: { type: 'text', label: 'Heading Line 2 (italic)' },
        headingLine3Underline: { type: 'text', label: 'Heading Line 3 (underline)' },
        headingLine4: { type: 'text', label: 'Heading Line 4' },
        bodyText: { type: 'text', label: 'Body Text' },
        cta1Text: { type: 'text', label: 'Primary CTA' },
        cta2Text: { type: 'text', label: 'Secondary CTA' },
        heroImageUrl: { type: 'text', label: 'Hero Image URL' },
        pressQuote: { type: 'text', label: 'Press Quote' },
        stat1Value: { type: 'text', label: 'Stat 1 Value' },
        stat1Label: { type: 'text', label: 'Stat 1 Label' },
        stat2Value: { type: 'text', label: 'Stat 2 Value' },
        stat2Label: { type: 'text', label: 'Stat 2 Label' },
        stat3Value: { type: 'text', label: 'Stat 3 Value' },
        stat3Label: { type: 'text', label: 'Stat 3 Label' },
        bgColor: clr('Background'),
        textColor: clr('Text Color'),
        mutedColor: clr('Muted Color'),
        borderColor: clr('Border Color'),
    },
    defaultProps: {
        eyebrow: 'Est. 2014 · By appointment',
        headingLine1: 'The art of',
        headingLine2Italic: 'quiet ',
        headingLine3Underline: 'luxury',
        headingLine4: 'braiding.',
        bodyText: 'Amani Okonkwo accepts a single client per day. Every braid is hand-installed in a private studio in Portland, OR, with no rush and no overlap.',
        cta1Text: 'Book a sitting',
        cta2Text: 'View portfolio',
        heroImageUrl: '',
        pressQuote: '"She braids like she\'s drawing." — Vogue, \'24',
        stat1Value: '12 yrs', stat1Label: 'Atelier practice',
        stat2Value: '4.9/5', stat2Label: '480+ clients',
        stat3Value: 'By referral', stat3Label: 'New & returning',
        bgColor: '#f4ede2', textColor: '#1a1410',
        mutedColor: 'rgba(26,20,16,.55)', borderColor: 'rgba(26,20,16,.14)',
    },
    render: ({
        eyebrow, headingLine1, headingLine2Italic, headingLine3Underline, headingLine4,
        bodyText, cta1Text, cta2Text, heroImageUrl, pressQuote,
        stat1Value, stat1Label, stat2Value, stat2Label, stat3Value, stat3Label,
        bgColor, textColor, mutedColor, borderColor,
    }: any) => {
        const [bookingOpen, setBookingOpen] = useState(false)
        const modalTheme = {
            bg: bgColor, fg: textColor, accent: textColor, accentFg: bgColor,
            muted: mutedColor, border: borderColor, fieldBg: 'rgba(26,20,16,.04)',
            font: SANS, serif: SERIF, ctaRadius: 0, ctaLetter: '.08em', ctaTransform: 'uppercase', radius: 0,
        }
        return (
            <section className="px-6 py-14 lg:px-20 lg:py-28 relative" style={{ background: bgColor, color: textColor, fontFamily: SANS }}>
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: mutedColor, marginBottom: 18, fontWeight: 500 }}>
                            {eyebrow}
                        </div>
                        <div style={{ fontFamily: SERIF, lineHeight: 1.05, letterSpacing: '-.02em', marginBottom: 24, display: 'block', fontSize: 44 }} className="lg:!text-[88px]">
                            {headingLine1}<br />
                            <em style={{ fontStyle: 'italic' }}>{headingLine2Italic}</em>
                            <span style={{ borderBottom: `2px solid ${textColor}`, paddingBottom: 2 }}>{headingLine3Underline}</span><br />
                            {headingLine4}
                        </div>
                        <p style={{ fontSize: 15, lineHeight: 1.55, color: mutedColor, maxWidth: 440, marginBottom: 32, marginTop: 0 }} className="lg:!text-[17px]">
                            {bodyText}
                        </p>
                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={() => setBookingOpen(true)}
                                style={{ background: textColor, color: bgColor, fontFamily: SANS, fontSize: 13, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', padding: '18px 32px', border: 'none', borderRadius: 0, cursor: 'pointer' }}
                            >{cta1Text}</button>
                            <button
                                style={{ background: 'transparent', color: textColor, fontFamily: SANS, fontSize: 13, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', padding: '18px 32px', border: `1px solid ${textColor}`, borderRadius: 0, cursor: 'pointer' }}
                            >{cta2Text}</button>
                        </div>
                        <div className="flex gap-6 lg:gap-10 mt-10 lg:mt-14 pt-6 lg:pt-8" style={{ borderTop: `1px solid ${borderColor}` }}>
                            {[
                                { v: stat1Value, l: stat1Label },
                                { v: stat2Value, l: stat2Label },
                                { v: stat3Value, l: stat3Label },
                            ].map((s, i) => (
                                <div key={i}>
                                    <div style={{ fontFamily: SERIF, fontSize: 22, marginBottom: 4 }} className="lg:!text-[28px]">{s.v}</div>
                                    <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: mutedColor }}>{s.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-9 lg:mt-0" style={{ aspectRatio: '4/5', position: 'relative' }}>
                        {heroImageUrl ? (
                            <img src={heroImageUrl} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <ImgPlaceholder tone="gold" label="Portrait · Featured client" style={{ width: '100%', height: '100%' }} />
                        )}
                        {pressQuote && (
                            <div style={{
                                position: 'absolute', bottom: -1, right: -1, padding: '14px 18px',
                                background: bgColor, fontFamily: SERIF, fontSize: 13, fontStyle: 'italic',
                                borderTop: `1px solid ${textColor}`, borderLeft: `1px solid ${textColor}`,
                            }}>
                                {pressQuote}
                            </div>
                        )}
                    </div>
                </div>
                <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} theme={modalTheme} services={[]} stylistName="" />
            </section>
        )
    }
}
