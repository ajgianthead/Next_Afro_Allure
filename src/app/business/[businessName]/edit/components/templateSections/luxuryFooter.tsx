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

const itemArrayField = (label: string) => ({
    type: 'array' as const, label,
    arrayFields: { text: { type: 'text' as const, label: 'Text' } },
    defaultItemProps: { text: '' },
})

export const LuxuryFooterComponent: any = {
    fields: {
        brandName: { type: 'text', label: 'Brand Name' },
        addressLine1: { type: 'text', label: 'Address Line 1' },
        addressLine2: { type: 'text', label: 'Address Line 2' },
        addressLine3: { type: 'text', label: 'Address Line 3' },
        col1Heading: { type: 'text', label: 'Column 1 Heading' },
        col1Items: itemArrayField('Column 1 Items'),
        col2Heading: { type: 'text', label: 'Column 2 Heading' },
        col2Items: itemArrayField('Column 2 Items'),
        col3Heading: { type: 'text', label: 'Column 3 Heading' },
        col3Items: itemArrayField('Column 3 Items'),
        bgColor: clr('Background'),
        textColor: clr('Text Color'),
        mutedColor: clr('Muted Color'),
        borderColor: clr('Border Color'),
    },
    defaultProps: {
        brandName: 'Maison Tresse',
        addressLine1: '2104 NW Lovejoy St',
        addressLine2: 'Portland, OR 97210',
        addressLine3: 'By appointment only',
        col1Heading: 'Studio',
        col1Items: [{ text: 'amani@maisontresse.co' }, { text: '+1 503 555 0142' }],
        col2Heading: 'Hours',
        col2Items: [{ text: 'Tue–Sat by booking' }, { text: 'Sun & Mon: closed' }],
        col3Heading: 'Follow',
        col3Items: [{ text: 'Instagram' }, { text: 'TikTok' }],
        bgColor: '#f4ede2', textColor: '#1a1410',
        mutedColor: 'rgba(26,20,16,.55)', borderColor: 'rgba(26,20,16,.14)',
    },
    render: ({
        brandName, addressLine1, addressLine2, addressLine3,
        col1Heading, col1Items, col2Heading, col2Items, col3Heading, col3Items,
        bgColor, textColor, mutedColor, borderColor,
    }: any) => (
        <footer
            className="px-6 py-10 lg:px-20 lg:py-12 flex flex-col lg:flex-row lg:justify-between gap-10"
            style={{ background: bgColor, color: textColor, borderTop: `1px solid ${borderColor}`, fontFamily: SANS }}
        >
            <div>
                <div style={{ fontFamily: SERIF, fontSize: 22, marginBottom: 12 }}>
                    {brandName}
                </div>
                <div style={{ fontSize: 12, color: mutedColor, lineHeight: 1.7 }}>
                    {addressLine1 && <>{addressLine1}<br /></>}
                    {addressLine2 && <>{addressLine2}<br /></>}
                    {addressLine3}
                </div>
            </div>
            <div className="flex gap-8 lg:gap-14 flex-wrap">
                {[
                    { heading: col1Heading, items: col1Items ?? [] },
                    { heading: col2Heading, items: col2Items ?? [] },
                    { heading: col3Heading, items: col3Items ?? [] },
                ].map((col, i) => (
                    <div key={i}>
                        <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: mutedColor, marginBottom: 12 }}>
                            {col.heading}
                        </div>
                        {col.items.map((item: { text: string }, j: number) => (
                            <div key={j} style={{ fontSize: 13, marginBottom: 6 }}>{item.text}</div>
                        ))}
                    </div>
                ))}
            </div>
        </footer>
    )
}
