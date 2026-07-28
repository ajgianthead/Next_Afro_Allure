import { useState } from 'react'
import { ImageModal } from '../../image/fields'
import { NumInput, KVSelect } from '../../fieldPrimitives'
import { Button } from '@/components/ui/button'
import { ImageIcon } from 'lucide-react'

const lbl = { fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' as const }
const row = { display: 'flex', alignItems: 'center', gap: 6 }

const ImageUrlField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const [open, setOpen] = useState(false)
    return (
        <div style={row}>
            <ImageModal open={open} onClose={() => setOpen(false)} onChange={onChange} value={value} />
            <Button size="sm" variant="outline" onClick={() => setOpen(true)} style={{ height: 26, fontSize: 11, flex: 1 }}>
                <ImageIcon size={12} className="mr-1" /> Change Image
            </Button>
        </div>
    )
}

export const galleryFields = {
    images: {
        type: 'array',
        label: 'Images',
        arrayFields: {
            url: {
                type: 'custom',
                label: 'Image',
                render: ({ value, onChange }: any) => <ImageUrlField value={value} onChange={onChange} />,
            },
            alt: { type: 'text', label: 'Alt text' },
        },
        defaultItemProps: {
            url: 'https://jappbqntqogmnoluifzx.supabase.co/storage/v1/object/public/editor-media-pool/placeholder_photo.jpg',
            alt: '',
        },
        getItemSummary: (_: any, i: number) => `Image ${i + 1}`,
    },
    columns: {
        type: 'custom',
        label: 'Columns',
        render: ({ value, onChange }: any) => (
            <div style={row}>
                <span style={lbl}>Columns</span>
                <NumInput value={value ?? 3} onChange={onChange} step={1} allowNegative={false} className="flex-1" />
            </div>
        ),
    },
    gap: {
        type: 'custom',
        label: 'Gap',
        render: ({ value, onChange }: any) => (
            <div style={row}>
                <span style={lbl}>Gap</span>
                <NumInput value={value ?? 8} onChange={onChange} step={1} allowNegative={false} className="flex-1" />
                <span style={lbl}>px</span>
            </div>
        ),
    },
    borderRadius: {
        type: 'custom',
        label: 'Border Radius',
        render: ({ value, onChange }: any) => (
            <div style={row}>
                <span style={lbl}>Radius</span>
                <NumInput value={value ?? 8} onChange={onChange} step={1} allowNegative={false} className="flex-1" />
                <span style={lbl}>px</span>
            </div>
        ),
    },
    aspectRatio: {
        type: 'custom',
        label: 'Aspect Ratio',
        render: ({ value, onChange }: any) => (
            <div style={row}>
                <span style={lbl}>Ratio</span>
                <KVSelect
                    value={value ?? '1/1'}
                    onChange={onChange}
                    options={[
                        { label: '1:1 Square', value: '1/1' },
                        { label: '4:3', value: '4/3' },
                        { label: '3:2', value: '3/2' },
                        { label: '16:9', value: '16/9' },
                        { label: 'Auto', value: 'auto' },
                    ]}
                    className="flex-1"
                />
            </div>
        ),
    },
}
