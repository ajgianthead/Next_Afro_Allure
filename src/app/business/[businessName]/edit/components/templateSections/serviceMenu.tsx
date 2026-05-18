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

export const ServiceMenuComponent: any = {
    fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        pricingNote: { type: 'text', label: 'Pricing Note' },
        services: {
            type: 'array', label: 'Services',
            arrayFields: {
                name: { type: 'text', label: 'Name' },
                duration: { type: 'text', label: 'Duration' },
                price: { type: 'number', label: 'Price ($)' },
                desc: { type: 'text', label: 'Description' },
            },
            defaultItemProps: { name: 'New Service', duration: '1–2 hr', price: 100, desc: '' },
        },
        bgColor: clr('Background'),
        textColor: clr('Text Color'),
        mutedColor: clr('Muted Color'),
        borderColor: clr('Border Color'),
    },
    defaultProps: {
        eyebrow: 'I · Services',
        heading: 'The menu.',
        pricingNote: 'Pricing reflects a single-client day, premium hair, and aftercare kit. Tax included.',
        services: [
            { name: 'Knotless Box Braids', duration: '5–7 hr', price: 320, desc: 'Mid-back length included' },
            { name: 'Feed-In Cornrows', duration: '2–3 hr', price: 180, desc: 'Custom pattern consultation' },
            { name: 'Goddess Locs', duration: '6–8 hr', price: 380, desc: 'Boho or sleek finish' },
            { name: 'Fulani Braids', duration: '4–5 hr', price: 240, desc: 'Beads & cuffs included' },
            { name: 'Style Consultation', duration: '30 min', price: 40, desc: 'Virtual or in-studio' },
        ],
        bgColor: '#f4ede2', textColor: '#1a1410',
        mutedColor: 'rgba(26,20,16,.55)', borderColor: 'rgba(26,20,16,.14)',
    },
    render: ({ eyebrow, heading, pricingNote, services, bgColor, textColor, mutedColor, borderColor }: any) => {
        const [bookingOpen, setBookingOpen] = useState(false)
        const [selectedService, setSelectedService] = useState<any>(null)
        const modalTheme = {
            bg: bgColor, fg: textColor, accent: textColor, accentFg: bgColor,
            muted: mutedColor, border: borderColor, fieldBg: 'rgba(26,20,16,.04)',
            font: SANS, serif: SERIF, ctaRadius: 0, ctaLetter: '.08em', ctaTransform: 'uppercase', radius: 0,
        }
        const openBooking = (svc: any) => { setSelectedService(svc); setBookingOpen(true) }
        return (
            <section className="px-6 py-14 lg:px-20" style={{ background: bgColor, color: textColor, borderTop: `1px solid ${borderColor}`, fontFamily: SANS }}>
                <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
                    <div>
                        <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: mutedColor, marginBottom: 18, fontWeight: 500 }}>
                            {eyebrow}
                        </div>
                        <div style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 1.05, letterSpacing: '-.02em' }} className="lg:!text-[64px]">
                            {heading}
                        </div>
                    </div>
                    <div style={{ fontSize: 12, color: mutedColor, maxWidth: 260 }}>{pricingNote}</div>
                </div>
                <div>
                    {(services ?? []).map((svc: any, i: number) => (
                        <button
                            key={i}
                            onClick={() => openBooking(svc)}
                            className="w-full text-left cursor-pointer"
                            style={{
                                display: 'grid', gridTemplateColumns: '24px 1fr auto',
                                gap: 16, alignItems: 'center', padding: '20px 0',
                                borderTop: i === 0 ? 'none' : `1px solid ${borderColor}`,
                                background: 'transparent', border: 'none', borderTopColor: borderColor,
                                fontFamily: SANS, color: textColor,
                            }}
                        >
                            <span style={{ fontFamily: SERIF, fontSize: 14, color: mutedColor, fontStyle: 'italic' }}>
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <span style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.05, letterSpacing: '-.02em' }} className="lg:!text-[40px]">
                                {svc.name}
                            </span>
                            <span style={{ fontFamily: SERIF, fontSize: 18, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 8 }} className="lg:!text-[24px]">
                                ${svc.price}
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="1" />
                                </svg>
                            </span>
                        </button>
                    ))}
                </div>
                <BookingModal
                    open={bookingOpen}
                    onClose={() => setBookingOpen(false)}
                    theme={modalTheme}
                    services={services ?? []}
                    stylistName=""
                />
            </section>
        )
    }
}
