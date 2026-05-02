import { Fields } from "@puckeditor/core"
import { ImageComponent } from "../types"
import { useEffect, useRef, useState } from "react"
import { fetchBusinessUser, fetchUser } from "app/dashboard/(other)/actions"
import { getImages, uploadImage } from "@/app/utils/upload_editor_images"
import { Button } from "@/components/ui/button"
import { ImageIcon, Loader2, Upload } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { NumInput, SegToggle, ColorPicker, StrSelect } from "../fieldPrimitives"
import { LocateFixed, Square } from "lucide-react"
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, BorderAllIcon, BorderBottomIcon, BorderLeftIcon, BorderRightIcon, BorderTopIcon, CornerBottomLeftIcon, CornerBottomRightIcon, CornersIcon, CornerTopLeftIcon, CornerTopRightIcon } from "@radix-ui/react-icons"

const expandOpts = [{ label: 'All', value: 'false' }, { label: 'Various', value: 'true' }]
const posOpts = [{ label: 'Relative', value: 'relative' }, { label: 'Absolute', value: 'absolute' }]

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
            labelIcon: <ImageIcon size={16} className="mr-1" />,
            render: ({ value, onChange, field }) => {
                const [open, setOpen] = useState<boolean>(false)
                return (
                    <div className="grid grid-cols-4 items-center gap-1.5">
                        <ImageModal open={open} onClose={() => setOpen(false)} onChange={onChange} value={value} />
                        <p className="text-xs font-medium text-slate-400">{field.label}</p>
                        <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="col-span-3 h-6 text-xs">
                            Select Image
                        </Button>
                    </div>
                )
            }
        },
        width: {
            type: 'custom',
            label: 'Width (%)',
            labelIcon: <ImageIcon size={16} className="mr-1" />,
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <NumInput value={value} onChange={onChange} />
                </div>
            )
        },
        objectFit: {
            type: 'custom',
            label: 'Object Fit',
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                    <StrSelect value={value ?? 'fill'} onChange={onChange} options={['fill', 'cover', 'contain', 'none']} className="col-span-2 col-start-3" />
                </div>
            )
        },
        height: {
            type: 'custom',
            label: 'Height (%)',
            render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} />
        },
        aspectRatio: {
            type: 'custom',
            label: 'Aspect Ratio',
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                    <input
                        className="col-span-2 h-6 border border-input rounded-md px-2 text-xs bg-background"
                        placeholder="4/5"
                        value={value ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            )
        },
        borderExpanded: {
            type: 'custom',
            label: 'Border',
            labelIcon: <Square size={16} className="mr-1" />,
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <SegToggle value={value} onChange={onChange} options={expandOpts} />
                </div>
            )
        },
        borderWidth: {
            label: undefined,
            type: 'custom',
            render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<BorderAllIcon />} />,
        },
        borderTop: { visible: false, type: 'number' },
        borderBottom: { visible: false, type: 'number' },
        borderLeft: { visible: false, type: 'number' },
        borderRight: { visible: false, type: 'number' },
        borderColor: {
            type: 'custom',
            label: undefined,
            render: ({ onChange, value }) => <ColorPicker value={value} onChange={onChange} />,
        },
        borderType: {
            type: 'custom',
            label: undefined,
            render: ({ onChange, value }) => <StrSelect value={value} onChange={onChange} options={['solid', 'dashed', 'dotted']} />,
        },
        borderRadiusExpanded: {
            type: 'custom',
            label: 'Radius',
            labelIcon: <Square size={16} className="mr-1" />,
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <SegToggle value={value} onChange={onChange} options={expandOpts} />
                </div>
            )
        },
        borderRadius: {
            label: undefined,
            type: 'custom',
            render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<CornersIcon />} />,
        },
        borderRadiusTopLeft: { visible: false, type: 'number' },
        borderRadiusTopRight: { visible: false, type: 'number' },
        borderRadiusBottomLeft: { visible: false, type: 'number' },
        borderRadiusBottomRight: { visible: false, type: 'number' },
        positionType: {
            type: 'custom',
            label: 'Position',
            labelIcon: <LocateFixed size={16} className="mr-1" />,
            render: ({ onChange, value, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <SegToggle value={value} onChange={onChange} options={posOpts} />
                </div>
            )
        },
        top: { type: 'number', visible: false },
        bottom: { type: 'number', visible: false },
        left: { type: 'number', visible: false },
        right: { type: 'number', visible: false },
    }

    if (data.props.borderExpanded === 'true') {
        fields.borderWidth = { visible: false, type: 'text' }
        fields.borderTop = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<BorderTopIcon />} className="w-full" /> }
        fields.borderBottom = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<BorderBottomIcon />} className="w-full" /> }
        fields.borderLeft = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<BorderLeftIcon />} className="w-full" /> }
        fields.borderRight = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<BorderRightIcon />} className="w-full" /> }
    }
    if (data.props.borderRadiusExpanded === 'true') {
        fields.borderRadius = { visible: false, type: 'text' }
        fields.borderRadiusTopLeft = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<CornerTopLeftIcon />} className="w-full" /> }
        fields.borderRadiusBottomLeft = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<CornerBottomLeftIcon />} className="w-full" /> }
        fields.borderRadiusBottomRight = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<CornerBottomRightIcon />} className="w-full" /> }
        fields.borderRadiusTopRight = { type: 'custom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<CornerTopRightIcon />} className="w-full" /> }
    }
    if (data.props.positionType === 'absolute') {
        fields.top = { type: 'custom', label: 'Top', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowUpIcon />} className="w-full" /> }
        fields.bottom = { type: 'custom', label: 'Bottom', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowDownIcon />} className="w-full" /> }
        fields.left = { type: 'custom', label: 'Left', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowLeftIcon />} className="w-full" /> }
        fields.right = { type: 'custom', label: 'Right', visible: true, render: ({ onChange, value }) => <NumInput value={value} onChange={onChange} icon={<ArrowRightIcon />} className="w-full" /> }
    }
    return fields
}
