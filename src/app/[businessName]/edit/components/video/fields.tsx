import { Fields } from "@measured/puck"
import { VideoComponent } from "../../constants"
import { Checkbox, ColorInput, Input, NumberInput, SegmentedControl, Select } from "@mantine/core"
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUp, ArrowUpIcon, LocateFixed, Square } from "lucide-react"
import { BorderAllIcon, BorderBottomIcon, BorderLeftIcon, BorderRightIcon, BorderTopIcon, CornerBottomLeftIcon, CornerBottomRightIcon, CornersIcon, CornerTopLeftIcon, CornerTopRightIcon } from "@radix-ui/react-icons"

export const videoResolvedFields: (data: any, params: any) => {} = (data, params) => {
    let fields: Fields<VideoComponent, {}> = {
        url: {
            type: 'custom',
            label: 'URL',
            render: ({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <Input size="xs" value={value!} radius={'md'} onChange={(e) => onChange(e.target.value)} className='w-full col-span-3' />
                    </div>
                )
            }
        },
        loop: {
            type: 'custom',
            label: undefined,
            render: ({ value, onChange, id }) => {
                return (
                    <Checkbox size='sm' label='Loop Video' checked={value} onChange={(e) => onChange(e.target.checked)} />
                )
            }
        },
        controls: {
            type: 'custom',
            label: undefined,
            render: ({ value, onChange, id }) => {
                return (
                    <Checkbox size='sm' label='Show Controls' checked={value} onChange={(e) => onChange(e.target.checked)} />
                )
            }
        },
        autoPlay: {
            type: 'custom',
            label: undefined,
            render: ({ value, onChange, id }) => {
                return (
                    <Checkbox size='sm' label='Automatically Play' checked={value} onChange={(e) => onChange(e.target.checked)} />
                )
            }
        },
        speed: {
            type: 'custom',
            label: 'Speed',
            render: ({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <NumberInput size="xs" value={value!} radius={'md'} onChange={(e) => onChange(Number(e))} className='w-full col-span-3' />
                    </div>
                )
            }
        },
        width: {
            type: 'custom',
            label: 'Width',
            render: ({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <NumberInput size="xs" value={value!} radius={'md'} onChange={(e) => onChange(Number(e))} className='w-full col-span-3' />
                    </div>
                )
            }
        },

        borderExpanded: {
            type: 'custom',
            label: 'Border',
            labelIcon: <Square size={16} className="mr-1" />,
            render: (({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <SegmentedControl value={value} size="xs" radius={'md'} onChange={(e) => { onChange(e) }} className=" col-span-3"
                            data={[{
                                label: <div className="flex justify-center">All</div>,
                                value: "false"
                            }, {
                                label: <div className="flex justify-center">Various</div>,
                                value: 'true'
                            },

                            ]} />
                    </div>
                )
            })
        },
        borderWidth: {
            label: undefined,
            type: 'custom',
            render: (({ field, value, onChange }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <NumberInput step={1} leftSection={<BorderAllIcon />} radius={'md'} className="w-full col-span-3" size="xs" value={value} onChange={(e) => onChange(Number(e))} />

                    </div>

                )
            })
        },
        borderTop: {
            visible: false,
            type: 'number'
        },
        borderBottom: {
            visible: false,
            type: 'number'
        },
        borderLeft: {
            visible: false,
            type: 'number'
        },
        borderRight: {
            visible: false,
            type: 'number'
        },
        borderColor: {
            type: 'custom',
            label: undefined,
            render: ({ onChange, value, field }) => (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <ColorInput
                        className="col-span-3"
                        placeholder="Choose a color"
                        value={value}
                        onChangeEnd={(e) => onChange(e)}
                        format="hexa"
                    />
                </div>
            )
        },


        borderType: {
            type: 'custom',
            label: undefined,
            render: (({ field, onChange, value }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className=" text-sm font-medium text-slate-400">{field.label}</p>
                        <Select
                            checkIconPosition="right"
                            onChange={(e: any) => { onChange(e) }}
                            className="col-span-3 col-start-2"
                            size="xs"
                            value={value}
                            radius={'md'}
                            data={['solid', 'dashed', 'dotted']}
                        />
                    </div>
                )
            })

        },
        borderRadiusExpanded: {
            type: 'custom',
            label: 'Radius',
            labelIcon: <Square size={16} className="mr-1" />,
            render: (({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <SegmentedControl value={value} size="xs" radius={'md'} onChange={(e) => { onChange(e) }} className=" col-span-3"
                            data={[{
                                label: <div className="flex justify-center">All</div>,
                                value: "false"
                            }, {
                                label: <div className="flex justify-center">Various</div>,
                                value: 'true'
                            },

                            ]} />
                    </div>
                )
            })
        },
        borderRadius: {
            label: undefined,
            type: 'custom',
            render: (({ field, value, onChange }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <NumberInput step={1} leftSection={<CornersIcon />} radius={'md'} className="w-full col-span-3" size="xs" value={value} onChange={(e) => onChange(Number(e))} />

                    </div>

                )
            })
        },
        borderRadiusTopLeft: {
            visible: false,
            type: 'number'
        },
        borderRadiusTopRight: {
            visible: false,
            type: 'number'
        },
        borderRadiusBottomLeft: {
            visible: false,
            type: 'number'
        },
        borderRadiusBottomRight: {
            visible: false,
            type: 'number'
        },

        positionType: {
            type: 'custom',
            label: 'Position',
            labelIcon: <LocateFixed size={16} className="mr-1" />,
            render: (({ onChange, value, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <SegmentedControl value={value} size="xs" radius={'md'} onChange={(e: any) => { onChange(e) }} className=" col-span-3"
                            data={[{
                                label: <div className="flex justify-center">Relative</div>,
                                value: "relative"
                            }, {
                                label: <div className="flex justify-center">Absolute</div>,
                                value: 'absolute'
                            },

                            ]} />
                    </div>
                )
            })
        },
        top: {
            type: 'number',
            visible: false
        },
        bottom: {
            type: 'number',
            visible: false
        },
        left: {
            type: 'number',
            visible: false,
        },
        right: {
            type: 'number',
            visible: false,
        },
    }
    if (data.props.borderExpanded === 'true') {
        fields.borderWidth = {
            visible: false,
            type: 'text'
        }
        fields.borderTop = {
            type: 'custom',

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<BorderTopIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.borderBottom = {
            type: 'custom',

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<BorderBottomIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.borderLeft = {
            type: 'custom',

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<BorderLeftIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.borderRight = {
            type: 'custom',
            label: 'Top',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<BorderRightIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }

    }
    if (data.props.borderRadiusExpanded === 'true') {
        fields.borderRadius = {
            visible: false,
            type: 'text'
        }
        fields.borderRadiusTopLeft = {
            type: 'custom',

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<CornerTopLeftIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.borderRadiusBottomLeft = {
            type: 'custom',

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<CornerBottomLeftIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.borderRadiusBottomRight = {
            type: 'custom',

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<CornerBottomRightIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.borderRadiusTopRight = {
            type: 'custom',
            label: 'Top',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<CornerTopRightIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }

    }
    if (data.props.positionType === 'absolute') {
        fields.top = {
            type: 'custom',
            label: 'Top',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowUpIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.bottom = {
            type: 'custom',
            label: 'Bottom',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowDownIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.left = {
            type: 'custom',
            label: 'Left',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowLeftIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.right = {
            type: 'custom',
            label: 'Right',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowRightIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
    }
    return fields
}
