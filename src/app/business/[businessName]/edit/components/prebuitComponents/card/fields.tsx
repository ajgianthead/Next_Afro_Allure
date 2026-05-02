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

export const defaultCardfields: Fields<Card, {}> = {
    cardContent: { type: 'slot' },
    variant: {
        type: 'custom',
        label: 'Variant',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <KVSelect value={value} onChange={onChange} options={[{ label: 'Basic', value: 'basic' }, { label: 'Media', value: 'media' }]} className="col-span-2 col-start-3" />
            </div>
        )
    },
    cardCover: {
        type: 'custom',
        label: 'Media Type',
        visible: false,
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <KVSelect value={value} onChange={onChange} options={[{ label: 'Image', value: 'image' }, { label: 'Video', value: 'video' }]} className="col-span-2 col-start-3" />
            </div>
        )
    },
    imageSource: {
        type: 'custom',
        label: 'Source',
        visible: false,
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
    videoSource: {
        type: 'custom',
        label: 'Video Source',
        visible: false,
        labelIcon: <VideoIcon size={16} className="mr-1" />,
        render: ({ onChange, value, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <input
                    className="col-span-2 col-start-3 h-6 border border-input rounded-md px-2 text-xs bg-background"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        )
    },
    linkToService: {
        type: 'custom',
        label: 'Link to Service',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                <label className="col-span-2 flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5" />
                    <span className="text-xs text-muted-foreground">Enabled</span>
                </label>
            </div>
        )
    },
    service: {
        type: 'custom',
        label: 'Service',
        visible: false,
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <ServiceField value={value} onChange={onChange} />
            </div>
        )
    }
}

export const resolveCardFields: (data: Omit<ComponentData<Card, string, Record<string, DefaultComponentProps>>, "type">) => Fields<Card, {}> | Promise<Fields<Card, {}>> = (data) => {
    let fields: Fields<Card, {}> = { ...defaultCardfields }

    if (data.props.variant === 'media') {
        fields.cardCover = {
            type: 'custom',
            label: 'Media Type',
            visible: true,
            render: ({ value, onChange, field }) => (
                <div className="grid grid-cols-4 items-center gap-1.5">
                    <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
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
                            <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
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
                        <p className="col-span-2 text-xs font-medium text-slate-400">{field.label}</p>
                        <input
                            className="col-span-2 col-start-3 h-6 border border-input rounded-md px-2 text-xs bg-background"
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
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <ServiceField value={value} onChange={onChange} />
                </div>
            )
        }
    }

    return fields
}
