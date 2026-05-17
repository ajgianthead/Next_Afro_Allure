import { Fields } from "@puckeditor/core"
import { ImageComponent } from "../types"
import { MOBILE_VISIBILITY_OPTIONS } from "@/features/editor/lib/responsive"
import { useEffect, useRef, useState } from "react"
import { fetchBusinessUser, fetchUser } from "app/dashboard/(other)/actions"
import { getImages, uploadImage } from "@/app/utils/upload_editor_images"
import { Button } from "@/components/ui/button"
import { ImageIcon, Loader2, Upload } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { NumInput, KVSelect, StrSelect } from "../fieldPrimitives"
import { BorderField, PositionField, RadiusField } from "../compoundFields"

const lbl = { fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' as const }

export const ImageModal = ({ open, onClose, onChange, value }: {
    open: boolean
    onClose: () => void
    onChange: (value: string | null) => void
    value: string | null
}) => {
    const fileInput = useRef<any>(null)
    const [images, setImages] = useState<{ path: string; url: string }[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [selected, setSelected] = useState<string>(value ?? '')

    useEffect(() => {
        (async () => {
            const user = await fetchUser()
            if (user) {
                const business = await fetchBusinessUser(user.id!)
                const result = await getImages(business.business_id)
                setImages(result)
            }
            setLoading(false)
        })()
    }, [])

    const uploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const user = await fetchUser()
        if (user) {
            const business = await fetchBusinessUser(user.id!)
            const result = await uploadImage(e.target.files!, business.business_id)
            if (result) setImages(prev => [...prev, result])
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
            <DialogContent className="max-w-lg">
                <p className="font-medium text-lg">Select Image</p>
                <Button variant="outline" className="w-full" onClick={() => fileInput.current?.click()}>
                    <Upload size={16} className="mr-2" /> Upload Image
                </Button>
                <input multiple={false} accept="image/*" onChange={uploadFiles} ref={fileInput} className="hidden" type="file" />
                <hr className="my-1" />
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {loading ? (
                        <div className="col-span-3 flex justify-center py-6">
                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : images.length === 0 ? (
                        <p className="col-span-3 text-xs italic text-muted-foreground py-4 text-center">No images. Upload one above.</p>
                    ) : images.map((image, index) => (
                        <div
                            key={index}
                            onClick={() => setSelected(prev => prev === image.url ? '' : image.url)}
                            className={`cursor-pointer rounded-md overflow-hidden border-2 transition-colors ${selected === image.url ? 'border-primary' : 'border-transparent'}`}
                        >
                            <Image width={120} height={80} src={image.url} alt="image" className="w-full h-20 object-cover" />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => { setSelected(value ?? ''); onClose() }}>Cancel</Button>
                    <Button disabled={!selected} onClick={() => { onChange(selected); onClose() }}>Select Image</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export const imageResolvedFields: (data: any, params: any) => {} = (data, params) => {
    let fields: Fields<ImageComponent, {}> = {
        url: {
            type: 'custom',
            label: 'Source',
            render: ({ value, onChange, field }) => {
                const [open, setOpen] = useState<boolean>(false)
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ImageModal open={open} onClose={() => setOpen(false)} onChange={onChange} value={value} />
                        <span style={lbl}>{field.label}</span>
                        <Button size="sm" variant="outline" onClick={() => setOpen(true)} style={{ flex: 1, height: 26, fontSize: 11 }}>
                            Select Image
                        </Button>
                    </div>
                )
            }
        },
        alt: {
            type: 'custom',
            label: 'Alt Text',
            render: ({ value, onChange, field }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={lbl}>{field.label}</span>
                    <input
                        style={{ flex: 1, height: 26, borderRadius: 3, padding: '0 8px', fontSize: 11, background: '#F4F1EC', border: 'none', color: '#1A1818' }}
                        placeholder="Describe the image…"
                        value={value ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            )
        },
        width: {
            type: 'custom',
            label: 'Width',
            render: ({ value, onChange, field }) => {
                const widthKeys = ['full', 'three-quarter', 'half', 'one-third']
                const safeWidth = widthKeys.includes(value) ? value : 'full'
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={lbl}>{field.label}</span>
                        <KVSelect
                            value={safeWidth}
                            onChange={onChange}
                            className="flex-1"
                            options={[
                                { label: 'Full width', value: 'full' },
                                { label: '3/4 width', value: 'three-quarter' },
                                { label: 'Half', value: 'half' },
                                { label: '1/3 width', value: 'one-third' },
                            ]}
                        />
                    </div>
                )
            }
        },
        objectFit: {
            type: 'custom',
            label: 'Object Fit',
            render: ({ value, onChange, field }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ ...lbl, minWidth: 56 }}>{field.label}</span>
                    <KVSelect
                        value={value ?? 'cover'}
                        onChange={onChange}
                        className="flex-1"
                        options={[
                            { label: 'Cover (fill & crop)', value: 'cover' },
                            { label: 'Contain (show full)', value: 'contain' },
                            { label: 'Fill (stretch)', value: 'fill' },
                        ]}
                    />
                </div>
            )
        },
        height: {
            type: 'custom',
            label: 'Height',
            render: ({ value, onChange, field }) => {
                const heightKeys = ['auto', 'sm', 'md', 'lg', 'vh']
                const safeHeight = heightKeys.includes(value) ? value : 'auto'
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={lbl}>{field.label}</span>
                        <KVSelect
                            value={safeHeight}
                            onChange={onChange}
                            className="flex-1"
                            options={[
                                { label: 'Auto', value: 'auto' },
                                { label: 'Small (200px)', value: 'sm' },
                                { label: 'Medium (320px)', value: 'md' },
                                { label: 'Large (480px)', value: 'lg' },
                                { label: 'Full screen (100vh)', value: 'vh' },
                            ]}
                        />
                    </div>
                )
            }
        },
        aspectRatio: {
            type: 'custom',
            label: 'Aspect Ratio',
            render: ({ value, onChange, field }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ ...lbl, minWidth: 56 }}>{field.label}</span>
                    <input
                        style={{ flex: 1, height: 26, borderRadius: 3, padding: '0 8px', fontSize: 11, background: '#F4F1EC', border: 'none', color: '#1A1818' }}
                        placeholder="4/5"
                        value={value ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            )
        },

        // ── Border (compound) ─────────────────────────────────────────────────
        borderExpanded: {
            type: 'custom',
            label: 'Border',
            render: ({ value, onChange }) => <BorderField value={value ?? 'false'} onChange={onChange} />
        },
        borderWidth: { visible: false, type: 'number' },
        borderTop: { visible: false, type: 'number' },
        borderBottom: { visible: false, type: 'number' },
        borderLeft: { visible: false, type: 'number' },
        borderRight: { visible: false, type: 'number' },
        borderColor: { visible: false, type: 'text' },
        borderType: { visible: false, type: 'text' },

        // ── Radius (compound) ─────────────────────────────────────────────────
        borderRadiusExpanded: {
            type: 'custom',
            label: 'Radius',
            render: ({ value, onChange }) => <RadiusField value={value ?? 'false'} onChange={onChange} />
        },
        borderRadius: { visible: false, type: 'number' },
        borderRadiusTopLeft: { visible: false, type: 'number' },
        borderRadiusTopRight: { visible: false, type: 'number' },
        borderRadiusBottomLeft: { visible: false, type: 'number' },
        borderRadiusBottomRight: { visible: false, type: 'number' },

        // ── Position (compound) ───────────────────────────────────────────────
        positionType: {
            type: 'custom',
            label: 'Position',
            render: ({ value, onChange }) => <PositionField value={value ?? 'relative'} onChange={onChange as (v: string) => void} />
        },
        top: { visible: false, type: 'number' },
        bottom: { visible: false, type: 'number' },
        left: { visible: false, type: 'number' },
        right: { visible: false, type: 'number' },

        mobileVisibility: {
            type: 'custom',
            label: 'Show on mobile',
            render: ({ value, onChange }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ ...lbl, minWidth: 56 }}>Visibility</span>
                    <select
                        value={value ?? 'show'}
                        onChange={(e) => onChange(e.target.value)}
                        style={{ flex: 1, height: 26, borderRadius: 3, padding: '0 8px', fontSize: 11, background: '#F4F1EC', border: 'none', color: '#1A1818' }}
                    >
                        {MOBILE_VISIBILITY_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
            )
        },
    }

    return fields
}
