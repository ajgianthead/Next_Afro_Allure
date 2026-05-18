import { ComponentData, DefaultComponentProps, Fields } from "@puckeditor/core";
import { Card } from "../../types";
import { Button } from "@/components/ui/button";
import { ImageIcon, VideoIcon } from "lucide-react";
import { useState } from "react";
import { ImageModal } from "../../image/fields";
import { useEditorContext } from "@/app/utils/context/EditorContext";
import { KVSelect, StrSelect } from "../../fieldPrimitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ServiceField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const { editorState } = useEditorContext()
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="col-span-3 col-start-2 h-6 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
                {editorState.services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export const defaultCardfields: Partial<Fields<Card, {}>> = {
    cardContent: { type: 'slot' },
    variant: {
        type: 'custom',
        label: 'Variant',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-[11px] text-[#A09790]">{field.label}</p>
                <KVSelect value={value} onChange={onChange} options={[{ label: 'Basic', value: 'basic' }, { label: 'Media', value: 'media' }]} className="col-span-2 col-start-3" />
            </div>
        )
    },
    linkToService: {
        type: 'custom',
        label: 'Link to Service',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-[11px] text-[#A09790]">{field.label}</p>
                <label className="col-span-2 flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5" />
                    <span className="text-xs text-muted-foreground">Enabled</span>
                </label>
            </div>
        )
    },
}

export const resolveCardFields: (data: Omit<ComponentData<Card, string, Record<string, DefaultComponentProps>>, "type">) => Fields<Card, {}> | Promise<Fields<Card, {}>> = (data) => {
    let fields = { ...defaultCardfields } as Fields<Card, {}>

    if (data.props.variant === 'media') {
        fields.cardCover = {
            type: 'custom',
            label: 'Media Type',
            visible: true,
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="col-span-2 text-[11px] text-[#A09790]">{field.label}</p>
                    <KVSelect value={value} onChange={onChange} options={[{ label: 'Image', value: 'image' }, { label: 'Video', value: 'video' }]} className="col-span-2 col-start-3" />
                </div>
            )
        }
        if (data.props.cardCover === 'image') {
            fields.imageSource = {
                type: 'custom',
                label: 'Image Source',
                visible: true,
                labelIcon: <ImageIcon size={16} className="mr-1" />,
                render: ({ value, onChange, field }) => {
                    const [open, setOpen] = useState<boolean>(false)
                    return (
                        <div className="grid grid-cols-4 items-center gap-1.5">
                            <ImageModal open={open} onClose={() => setOpen(false)} onChange={onChange} value={value} />
                            <p className="col-span-2 text-[11px] text-[#A09790]">{field.label}</p>
                            <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="col-span-2 col-start-3 h-6 text-xs">
                                Select Image
                            </Button>
                        </div>
                    )
                }
            }
        } else {
            fields.videoSource = {
                type: 'custom',
                label: 'Video Source',
                visible: true,
                labelIcon: <VideoIcon size={16} className="mr-1" />,
                render: ({ onChange, value, field }) => (
                    <div className="grid grid-cols-4 items-center gap-1.5">
                        <p className="col-span-2 text-[11px] text-[#A09790]">{field.label}</p>
                        <input
                            style={{ flex: 1, height: 26, borderRadius: 3, padding: '0 8px', fontSize: 11, background: '#F4F1EC', border: 'none', color: '#1A1818' }}
                            value={value ?? ''}
                            onChange={(e) => onChange(e.target.value)}
                        />
                    </div>
                )
            }
        }
    }

    if (data.props.linkToService) {
        fields.service = {
            type: 'custom',
            label: 'Service',
            visible: true,
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="text-[11px] text-[#A09790]">{field.label}</p>
                    <ServiceField value={value} onChange={onChange} />
                </div>
            )
        }
    }

    return fields
}
