'use client'
import { useState } from 'react'
import { ImgPlaceholder, Lightbox } from '../../templates/shared'
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

export const PortfolioGalleryComponent: any = {
    fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        headingMain: { type: 'text', label: 'Heading (main)' },
        headingItalic: { type: 'text', label: 'Heading (italic)' },
        headingSuffix: { type: 'text', label: 'Heading (suffix)' },
        archiveLinkText: { type: 'text', label: 'Archive Link Text' },
        gallery: {
            type: 'array', label: 'Gallery Items',
            arrayFields: {
                imageUrl: { type: 'text', label: 'Image URL' },
                tone: { type: 'text', label: 'Placeholder Tone (gold/warm/dark/cool/bone)' },
                label: { type: 'text', label: 'Label' },
            },
            defaultItemProps: { imageUrl: '', tone: 'warm', label: 'New Image' },
        },
        bgColor: clr('Background'),
        textColor: clr('Text Color'),
        mutedColor: clr('Muted Color'),
    },
    defaultProps: {
        eyebrow: 'II · Portfolio',
        headingMain: 'Selected',
        headingItalic: 'sittings',
        headingSuffix: ", '23–'25.",
        archiveLinkText: 'Full archive →',
        gallery: [
            { imageUrl: '', tone: 'gold', label: 'Knotless · Mid-back' },
            { imageUrl: '', tone: 'warm', label: 'Fulani · Beaded' },
            { imageUrl: '', tone: 'dark', label: 'Goddess Locs' },
            { imageUrl: '', tone: 'gold', label: 'Cornrows · Feed-in' },
            { imageUrl: '', tone: 'warm', label: 'Box braids · Waist' },
            { imageUrl: '', tone: 'dark', label: 'Tribal · Updo' },
        ],
        bgColor: '#ebe2d3', textColor: '#1a1410', mutedColor: 'rgba(26,20,16,.55)',
    },
    render: ({ eyebrow, headingMain, headingItalic, headingSuffix, archiveLinkText, gallery, bgColor, textColor, mutedColor }: any) => {
        const [galleryIdx, setGalleryIdx] = useState<number | null>(null)
        const items = gallery ?? []
        return (
            <section className="px-6 py-14 lg:px-20" style={{ background: bgColor, color: textColor, borderTop: `1px solid rgba(26,20,16,.14)`, fontFamily: SANS }}>
                <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: mutedColor, marginBottom: 18, fontWeight: 500 }}>
                    {eyebrow}
                </div>
                <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
                    <div style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 1.05, letterSpacing: '-.02em', maxWidth: 520 }} className="lg:!text-[64px]">
                        {headingMain} <em style={{ fontStyle: 'italic' }}>{headingItalic}</em>{headingSuffix}
                    </div>
                    <a style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: textColor, paddingBottom: 4, borderBottom: `1px solid ${textColor}`, cursor: 'pointer' }}>
                        {archiveLinkText}
                    </a>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4">
                    {items.map((g: any, i: number) => (
                        <button
                            key={i}
                            onClick={() => setGalleryIdx(i)}
                            className={i === 0 ? 'lg:row-span-2' : ''}
                            style={{ padding: 0, border: 'none', cursor: 'pointer', aspectRatio: i === 0 ? '4/5' : '3/4', width: '100%' }}
                        >
                            {g.imageUrl ? (
                                <img src={g.imageUrl} alt={g.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <ImgPlaceholder tone={g.tone || 'warm'} label={g.label} style={{ width: '100%', height: '100%' }} />
                            )}
                        </button>
                    ))}
                </div>
                <Lightbox
                    open={galleryIdx !== null}
                    items={items}
                    idx={galleryIdx ?? 0}
                    onClose={() => setGalleryIdx(null)}
                    onPrev={() => setGalleryIdx(((galleryIdx ?? 0) - 1 + items.length) % items.length)}
                    onNext={() => setGalleryIdx(((galleryIdx ?? 0) + 1) % items.length)}
                    theme={{ bg: bgColor, fg: textColor, border: 'rgba(26,20,16,.14)' }}
                />
            </section>
        )
    }
}
