import { ComponentData, DefaultComponentProps, Fields } from "@puckeditor/core";
import { Card } from "../../types";
import { Button, Input, Select, Switch } from "@mantine/core";
import { ImageIcon, VideoIcon } from "lucide-react";
import { useState } from "react";
import { imageModal } from "../../image/fields";
import { useEditorContext } from "@utils/context/EditorContext";

export const defaultCardfields: Fields<Card, {}> = {
    cardContent: {
        type: 'slot'
    },
    variant: {
        type: 'custom',
        label: 'Variant',
        render: (({ value, onChange, field }) => {
            return (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className=" col-span-2 text-sm font-medium text-slate-400">{field.label}</p>
                    <Select
                        checkIconPosition="right"
                        onChange={(e: any) => { onChange(e) }}
                        className="col-span-2 col-start-3"
                        size="xs"
                        value={value}
                        radius={'md'}
                        data={[{
                            label: 'Basic',
                            value: 'basic'
                        }, {
                            label: 'Media',
                            value: 'media'
                        }]}
                    />
                </div>
            )
        })
    },
    cardCover: {
        type: 'custom',
        label: 'Media Type',
        visible: false,
        render: (({ value, onChange, field }) => {
            return (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className=" col-span-2 text-sm font-medium text-slate-400">{field.label}</p>
                    <Select
                        checkIconPosition="right"
                        onChange={(e: any) => { onChange(e) }}
                        className="col-span-2 col-start-3"
                        size="xs"
                        value={value}
                        radius={'md'}
                        data={[{
                            label: 'Image',
                            value: 'image'
                        }, {
                            label: 'Video',
                            value: 'video'
                        }]}
                    />
                </div>
            )
        })
    },
    imageSource: {
        type: 'custom',
        label: 'Source',
        visible: false,
        labelIcon: <ImageIcon size={16} className="mr-1" />,
        render: ({ value, onChange, field }) => {
            const [open, setOpen] = useState<boolean>(false)
            return (
                <div className="grid grid-cols-4 items-center gap-2">
                    {imageModal(open, setOpen, onChange, value)}
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <Button size="xs" onClick={() => setOpen(true)} variant='solid' className='w-full col-span-3'>
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
            <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-sm font-medium text-slate-400 col-span-2">{field.label}</p>
                <Input
                    className=" col-span-2 col-start-3"
                    size="xs"
                    radius="md"
                    value={value!}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>


        )
    },
    linkToService: {
        type: 'custom',
        label: 'Link to Service',
        render: (({ value, onChange, field }) => {
            return (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium col-span-2 text-slate-400">{field.label}</p>
                    <Switch size="xs" checked={value} onChange={(e) => { onChange(e.currentTarget.checked) }} />
                </div>
            )
        })
    },
    service: {
        type: 'custom',
        label: 'Service',
        visible: false,
        render: (({ value, onChange, field }) => {
            return (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <Select className="col-span-3  col-start-2" size="xs"
                        radius={'md'} value={value} onChange={(value) => onChange(value!)} data={[]} />
                </div>
            )
        })
    }
}


export const resolveCardFields: (data: Omit<ComponentData<Card, string, Record<string, DefaultComponentProps>>, "type">) => Fields<Card, {}> | Promise<Fields<Card, {}>> = (data) => {
    let fields: Fields<Card, {}> = {
        cardContent: {
            type: 'slot'
        },
        variant: {
            type: 'custom',
            label: 'Variant',
            render: (({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className=" col-span-2 text-sm font-medium text-slate-400">{field.label}</p>
                        <Select
                            checkIconPosition="right"
                            onChange={(e: any) => { onChange(e) }}
                            className="col-span-2 col-start-3"
                            size="xs"
                            value={value}
                            radius={'md'}
                            data={[{
                                label: 'Basic',
                                value: 'basic'
                            }, {
                                label: 'Media',
                                value: 'media'
                            }]}
                        />
                    </div>
                )
            })
        },
        cardCover: {
            type: 'custom',
            label: 'Media Type',
            visible: false,
            render: (({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className=" col-span-2 text-sm font-medium text-slate-400">{field.label}</p>
                        <Select
                            checkIconPosition="right"
                            onChange={(e: any) => { onChange(e) }}
                            className="col-span-2 col-start-3"
                            size="xs"
                            value={value}
                            radius={'md'}
                            data={[{
                                label: 'Image',
                                value: 'image'
                            }, {
                                label: 'Video',
                                value: 'video'
                            }]}
                        />
                    </div>
                )
            })
        },
        imageSource: {
            type: 'custom',
            label: 'Source',
            visible: false,
            labelIcon: <ImageIcon size={16} className="mr-1" />,
            render: ({ value, onChange, field }) => {
                const [open, setOpen] = useState<boolean>(false)
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        {imageModal(open, setOpen, onChange, value)}
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <Button size="xs" onClick={() => setOpen(true)} variant='solid' className='w-full col-span-3'>
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
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400 col-span-2">{field.label}</p>
                    <Input
                        className=" col-span-2 col-start-3"
                        size="xs"
                        radius="md"
                        value={value!}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>


            )
        },
        linkToService: {
            type: 'custom',
            label: 'Link to Service',
            render: (({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium col-span-2 text-slate-400">{field.label}</p>
                        <Switch size="xs" checked={value} onChange={(e) => { onChange(e.currentTarget.checked) }} />
                    </div>
                )
            })
        },
        service: {
            type: 'custom',
            label: 'Service',
            visible: false,
            render: (({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <Select className="col-span-3  col-start-2" size="xs"
                            radius={'md'} value={value} onChange={(value) => onChange(value!)} data={[]} />
                    </div>
                )
            })
        }
    }
    if (data.props.variant === 'media') {
        fields.cardCover = {
            type: 'custom',
            label: 'Media Type',
            visible: true,
            render: (({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className=" col-span-2 text-sm font-medium text-slate-400">{field.label}</p>
                        <Select
                            checkIconPosition="right"
                            onChange={(e: any) => { onChange(e) }}
                            className="col-span-2 col-start-3"
                            size="xs"
                            value={value}
                            radius={'md'}
                            data={[{
                                label: 'Image',
                                value: 'image'
                            }, {
                                label: 'Video',
                                value: 'video'
                            }]}
                        />
                    </div>
                )
            })
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
                        <div className="grid grid-cols-4 items-center gap-2">
                            {imageModal(open, setOpen, onChange, value)}
                            <p className="text-sm font-medium text-slate-400 col-span-2">{field.label}</p>
                            <Button size="xs" onClick={() => setOpen(true)} variant='solid' className='w-full col-span-2 col-start-3'>
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
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400 col-span-2">{field.label}</p>
                        <Input
                            className=" col-span-2 col-start-3"
                            size="xs"
                            radius="md"
                            value={value!}
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
            render: (({ value, onChange, field }) => {
                const { editorState } = useEditorContext()
                const dataRes = editorState.services.map((service, index) => {
                    return { label: service.name, value: service.id }
                })
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <Select className="col-span-3  col-start-2" size="xs"
                            radius={'md'} value={value} onChange={(value) => onChange(value!)} data={dataRes} />
                    </div>
                )
            })
        }
    }

    return fields

}
