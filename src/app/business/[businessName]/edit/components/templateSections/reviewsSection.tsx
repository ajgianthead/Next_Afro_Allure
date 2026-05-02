'use client'
import { Stars } from '../../templates/shared'
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

export const ReviewsSectionComponent: any = {
    fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        reviews: {
            type: 'array', label: 'Reviews',
            arrayFields: {
                name: { type: 'text', label: 'Name' },
                stars: { type: 'number', label: 'Stars (1–5)' },
                body: { type: 'text', label: 'Review Body' },
            },
            defaultItemProps: { name: 'New Reviewer', stars: 5, body: 'Write a review here.' },
        },
        bgColor: clr('Background'),
        textColor: clr('Text Color'),
        mutedTextColor: clr('Muted Text'),
        dividerColor: clr('Divider Color'),
    },
    defaultProps: {
        eyebrow: 'IV · Words',
        heading: "From those who've sat.",
        reviews: [
            { name: 'Imani T.', stars: 5, body: "Amani didn't just braid my hair — she sculpted it. The room smelled like tea and rosewood. I felt seen in a way salons rarely do." },
            { name: 'Kemi A.', stars: 5, body: "Worth every dollar. She booked me for the full day, no overlap. My braids were still flawless eight weeks in." },
            { name: 'Sade B.', stars: 5, body: "I drove three hours and would do it again. Quiet, focused, breathtaking work." },
        ],
        bgColor: '#1a1410', textColor: '#f4ede2',
        mutedTextColor: 'rgba(244,237,226,.6)', dividerColor: 'rgba(244,237,226,.2)',
    },
    render: ({ eyebrow, heading, reviews, bgColor, textColor, mutedTextColor, dividerColor }: any) => (
        <section className="px-6 py-14 lg:px-20" style={{ background: bgColor, color: textColor, borderTop: `1px solid ${dividerColor}`, fontFamily: SANS }}>
            <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: mutedTextColor, marginBottom: 18, fontWeight: 500 }}>
                {eyebrow}
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 1.05, letterSpacing: '-.02em', display: 'block', marginBottom: 40, maxWidth: 600 }} className="lg:!text-[64px] lg:!mb-14">
                {heading}
            </div>
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                {(reviews ?? []).map((r: any, i: number) => (
                    <div key={i} style={{ borderTop: `1px solid ${dividerColor}`, paddingTop: 20 }}>
                        <Stars n={r.stars} color={textColor} size={11} />
                        <p style={{
                            fontFamily: SERIF, fontSize: 18, lineHeight: 1.35, fontStyle: 'italic',
                            margin: '14px 0 24px', color: textColor,
                        }} className="lg:!text-[22px]">
                            "{r.body}"
                        </p>
                        <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: mutedTextColor }}>
                            — {r.name}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
