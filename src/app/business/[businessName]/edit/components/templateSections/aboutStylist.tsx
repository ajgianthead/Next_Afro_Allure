'use client'
import { ImgPlaceholder } from '../../templates/shared'
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

export const AboutStylistComponent: any = {
    fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        headingLine1: { type: 'text', label: 'Heading Line 1' },
        headingLine2: { type: 'text', label: 'Heading Line 2' },
        headingLine3Italic: { type: 'text', label: 'Heading Line 3 (italic)' },
        headingLine3Suffix: { type: 'text', label: 'Heading Line 3 (suffix)' },
        bio: { type: 'text', label: 'Bio' },
        credential1: { type: 'text', label: 'Credential 1' },
        credential2: { type: 'text', label: 'Credential 2' },
        credential3: { type: 'text', label: 'Credential 3' },
        portraitImageUrl: { type: 'text', label: 'Portrait Image URL' },
        bgColor: clr('Background'),
        textColor: clr('Text Color'),
        mutedColor: clr('Muted Color'),
        borderColor: clr('Border Color'),
    },
    defaultProps: {
        eyebrow: 'III · About',
        headingLine1: 'Twelve years.',
        headingLine2: 'Four hundred',
        headingLine3Italic: 'eighty',
        headingLine3Suffix: ' sittings.',
        bio: 'Trained in Lagos and Paris, Amani has spent twelve years perfecting the architecture of the braid — from feather-light micros to sculptural goddess locs. Each appointment is private, single-booking, and treated as a sitting.',
        credential1: 'Trained — Lagos, then Paris (École Atelier)',
        credential2: 'Featured — Vogue, Essence, hair stories',
        credential3: 'Studio — Private, single-booking, in NW Portland',
        portraitImageUrl: '',
        bgColor: '#f4ede2', textColor: '#1a1410',
        mutedColor: 'rgba(26,20,16,.55)', borderColor: 'rgba(26,20,16,.14)',
    },
    render: ({
        eyebrow, headingLine1, headingLine2, headingLine3Italic, headingLine3Suffix,
        bio, credential1, credential2, credential3, portraitImageUrl,
        bgColor, textColor, mutedColor, borderColor,
    }: any) => (
        <section className="px-6 py-14 lg:px-20" style={{ background: bgColor, color: textColor, borderTop: `1px solid ${borderColor}`, fontFamily: SANS }}>
            <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div style={{ aspectRatio: '4/5', position: 'relative' }}>
                    {portraitImageUrl ? (
                        <img src={portraitImageUrl} alt="Portrait" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <ImgPlaceholder tone="warm" label="Portrait · Stylist in studio" style={{ width: '100%', height: '100%' }} />
                    )}
                </div>
                <div>
                    <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: mutedColor, marginBottom: 18, fontWeight: 500 }}>
                        {eyebrow}
                    </div>
                    <div style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 1.05, letterSpacing: '-.02em', marginBottom: 24, display: 'block' }} className="lg:!text-[64px]">
                        {headingLine1}<br />
                        {headingLine2}<br />
                        <em style={{ fontStyle: 'italic' }}>{headingLine3Italic}</em>{headingLine3Suffix}
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: mutedColor, marginBottom: 24, maxWidth: 480 }} className="lg:!text-[16px]">
                        {bio}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                        {[credential1, credential2, credential3].filter(Boolean).map((line: string, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 14, fontSize: 13, alignItems: 'baseline' }}>
                                <span style={{ fontFamily: SERIF, fontStyle: 'italic', color: mutedColor, fontSize: 12 }}>—</span>
                                <span>{line}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
