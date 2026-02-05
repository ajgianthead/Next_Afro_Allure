import { Checkbox, ColorInput, Input, NumberInput, SegmentedControl, Select, Switch } from "@mantine/core";
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, BorderAllIcon, BorderBottomIcon, BorderLeftIcon, BorderRightIcon, BorderTopIcon, ColumnsIcon, ColumnSpacingIcon, CornerBottomLeftIcon, CornerBottomRightIcon, CornersIcon, CornerTopLeftIcon, CornerTopRightIcon, DotIcon, FontBoldIcon, FontFamilyIcon, FontItalicIcon, FontSizeIcon, GridIcon, LetterSpacingIcon, LineHeightIcon, PaddingIcon, RowsIcon, RowSpacingIcon, TextAlignCenterIcon, TextAlignJustifyIcon, TextAlignLeftIcon, TextAlignRightIcon, UnderlineIcon, ViewHorizontalIcon, ViewVerticalIcon } from "@radix-ui/react-icons";
import { ButtonContainer } from "../types";
import { FieldLabel, Fields, useGetPuck } from "@puckeditor/core";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowRightLeft, ArrowUp, ArrowUpDown, LocateFixed, PaintBucket, Signpost, Square, SquareDashedBottom, Type } from "lucide-react";
import { IconButton, ToggleButtonGroup } from "@mui/joy";
import { useEditorContext } from "@utils/context/EditorContext";

export const buttonResolvedFields: (data: any) => {} = (data: any) => {
    let fields: Fields<ButtonContainer, {}> = {

        action: {
            label: 'Action',
            type: 'custom',
            render: ({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <Select
                            value={value}
                            checkIconPosition="right"
                            onChange={(e: any) => { onChange(e) }}
                            className="col-span-3 col-start-2"
                            size="xs"
                            radius={'md'}
                            data={['REDIRECT']}
                        />
                    </div>
                )
            }
        },
        variant: {
            type: 'custom',
            label: 'Variant',
            render: ({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="  text-sm font-medium text-slate-400">{field.label}</p>
                        <Select
                            checkIconPosition="right"
                            onChange={(e: any) => { onChange(e) }}
                            className="col-span-3 col-start-2"
                            size="xs"
                            value={value}
                            radius={'md'}
                            data={['start', 'end', 'center', 'space-between', 'space-evenly', 'space-around']}
                        />
                    </div>
                )
            }
        },
        link: {
            visible: true,
            type: 'custom',
            label: 'Link',
            render: ({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className=" text-sm font-medium text-slate-400">{field.label}</p>
                        <Input
                            onChange={(e: any) => { onChange(e) }}
                            className="col-span-3 col-start-2"
                            size="xs"
                            value={value}
                            radius={'md'}
                        />
                    </div>
                )
            }
        },
        flexDirection: {
            type: 'custom',
            visible: true,
            label: 'Layout Direction',
            labelIcon: <Signpost size={16} className="mr-1" />,
            render: ({ onChange, value, field }) => (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <SegmentedControl value={value} size="xs" radius={'md'} onChange={(e: any) => { onChange(e) }} className=" col-span-3"
                        data={[{
                            label: <div className="flex justify-center"><ViewHorizontalIcon className="my-1" /></div>,
                            value: 'flex-col'
                        }, {
                            label: <div className="flex justify-center"><ViewVerticalIcon className="my-1 mr-1" /></div>,
                            value: 'flex-row'
                        },

                        ]} />
                </div>


            )
        },

        gapX: {
            label: 'Spacing',
            visible: true,
            type: 'custom',
            render: (({ field, value, onChange }) => {
                return (
                    <NumberInput step={1} leftSection={<ColumnSpacingIcon />} radius={'md'} className="w-full col-span-3" size="xs" value={value} onChange={(e) => onChange(Number(e))} />

                )
            })
        },
        gapY: {
            label: 'Spacing',
            visible: true,
            type: 'custom',
            render: (({ field, value, onChange }) => {
                return (
                    <NumberInput step={1} leftSection={<RowSpacingIcon />} radius={'md'} className="w-full col-span-3" size="xs" value={value} onChange={(e) => onChange(Number(e))} />

                )
            })
        },
        grow: {
            type: 'custom',
            label: 'Grow',
            render: (({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <Switch className="col-span-3"
                            size="xs" checked={value} onChange={(event) => onChange(event.currentTarget.checked)} />
                    </div>
                )
            })
        },
        paddingExpanded: {
            type: 'custom',
            label: 'Padding',
            labelIcon: <SquareDashedBottom size={16} className="mr-1" />,
            render: (({ field, value, onChange }) => {
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
        padding: {
            type: 'custom',
            label: undefined,
            render: ({ onChange, value, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <NumberInput leftSection={<PaddingIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
                    </div>
                )
            }
        },

        paddingTop: {
            type: 'custom',
            label: 'Padding Top',
            visible: false,
            render: ({ onChange, value, field }: any) => (
                <FieldLabel label={field.label!} icon={field.labelIcon}>
                    <Input step={0.1} className="w-1/2" type="number" size="xs" radius={'xs'} defaultValue={data.props.padding} value={value} onChange={(e) => onChange(Number(e.target.value))} />
                </FieldLabel>
            )
        },
        paddingBottom: {
            type: 'custom',
            label: 'Padding Bottom',
            visible: false,
            render: ({ onChange, value, field }: any) => (
                <FieldLabel label={field.label!} icon={field.labelIcon}>
                    <Input step={0.1} className="w-1/2" type="number" size="xs" radius={'xs'} defaultValue={data.props.padding} value={value} onChange={(e) => onChange(Number(e.target.value))} />
                </FieldLabel>
            )
        },
        paddingRight: {
            type: 'custom',
            label: 'Padding Right',
            visible: false,
            render: ({ onChange, value, field }: any) => (
                <FieldLabel label={field.label!} icon={field.labelIcon}>
                    <Input step={0.1} className="w-1/2" type="number" size="xs" radius={'xs'} defaultValue={data.props.padding} value={value} onChange={(e) => onChange(Number(e.target.value))} />
                </FieldLabel>
            )
        },
        paddingLeft: {
            type: 'custom',
            label: 'Padding Left',
            visible: false,
            render: ({ onChange, value, field }: any) => (
                <FieldLabel label={field.label!} icon={field.labelIcon}>
                    <Input step={0.1} className="w-1/2" type="number" size="xs" radius={'xs'} defaultValue={data.props.padding} value={value} onChange={(e) => onChange(Number(e.target.value))} />
                </FieldLabel>
            )
        },
        marginExpanded: {
            type: 'custom',
            label: 'Margin',
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
        margin: {
            type: 'custom',
            label: undefined,
            render: ({ onChange, value, field }) => (
                <div className="grid grid-cols-4 items-center gap-2">
                    <NumberInput leftSection={<PaddingIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
                </div>
            )
        },

        marginTop: {
            type: 'custom',
            label: 'Margin Top',
            visible: false,

            render: ({ onChange, value, field }: any) => (
                <FieldLabel label={field.label!} icon={field.labelIcon}>
                    <Input step={0.1} className="w-1/2" type="number" radius={'xs'} size="xs" defaultValue={data.props.padding} value={value} onChange={(e) => onChange(Number(e.target.value))} />
                </FieldLabel>
            )
        },
        marginBottom: {
            type: 'custom',
            label: 'Margin Bottom',
            visible: false,

            render: ({ onChange, value, field }: any) => (
                <FieldLabel label={field.label!} icon={field.labelIcon}>
                    <Input step={0.1} className="w-1/2" type="number" radius={'xs'} size="xs" defaultValue={data.props.padding} value={value} onChange={(e) => onChange(Number(e.target.value))} />
                </FieldLabel>
            )
        },
        marginRight: {
            type: 'custom',
            label: 'Margin Right',
            visible: false,

            render: ({ onChange, value, field }: any) => (
                <FieldLabel label={field.label!} icon={field.labelIcon}>
                    <Input step={0.1} className="w-1/2" type="number" size="xs" radius={'xs'} defaultValue={data.props.padding} value={value} onChange={(e) => onChange(Number(e.target.value))} />
                </FieldLabel>
            )
        },
        marginLeft: {
            type: 'custom',
            label: 'Margin Left',
            visible: false,
            render: ({ onChange, value, field }: any) => (
                <FieldLabel label={field.label!} icon={field.labelIcon}>
                    <Input step={0.1} className="w-1/2" type="number" size="xs" radius={'xs'} defaultValue={data.props.padding} value={value} onChange={(e) => onChange(Number(e.target.value))} />
                </FieldLabel>
            )
        },
        backgroundColor: {
            type: 'custom',
            label: 'Color',
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
        responsive: {
            type: 'custom',
            label: undefined,
            render: ({ value, onChange, id }) => {
                return (
                    <Checkbox size='xs' label='Responsive' checked={value} onChange={(e) => onChange(e.target.checked)} />
                )
            }
        },

        mainAxisLayout: {
            visible: true,
            type: 'custom',
            label: 'Main Axis Alignment',
            labelIcon: <ArrowRightLeft size={16} className="mr-1" />,
            render: (({ field, onChange, value }) => {
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
                            data={['start', 'end', 'center', 'space-between', 'space-evenly', 'space-around']}
                        />
                    </div>
                )
            })

        },
        altAxisLayout: {
            visible: true,
            label: 'Cross Axis Alignment',
            labelIcon: <ArrowUpDown size={16} className="mr-1" />,
            type: 'custom',
            render: (({ field, onChange, value }) => {
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
                            data={['start', 'end', 'center', 'baseline', 'stretch']}
                        />
                    </div>
                )
            })
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
            type: 'custom',
            label: 'Top',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowUpIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        },
        bottom: {
            type: 'custom',
            label: 'Bottom',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowDownIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        },
        left: {
            type: 'custom',
            label: 'Left',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowLeftIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        },
        right: {
            type: 'custom',
            label: 'Right',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowRightIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        },
        rotation: {
            type: 'custom',
            label: 'Rotation',
            render: (({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <NumberInput
                            size="xs"
                            radius={'md'}
                            className="col-span-3"
                            value={value}
                            onChange={(e) => onChange(Number(e))}
                            rightSection={<DotIcon />}
                        />
                    </div>
                )
            })
        },
        draggable: {
            type: 'number'
        },
        text: {
            type: 'custom',
            label: 'Text',
            labelIcon: <Type size={16} className="mr-1" />,
            render: ({ onChange, value, field }) => (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <Input
                        className=" col-span-3"
                        size="xs"
                        radius="md"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>


            )
        },
        fontFamily: {
            type: 'custom',
            label: 'Font Family',
            labelIcon: <Type size={16} className="mr-1" />,
            render: ({ onChange, value, field, id }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{"Font"}</p>
                        <Select
                            leftSection={<FontFamilyIcon />}
                            className="col-span-3"
                            size="xs"
                            radius={'md'}

                            placeholder="Roboto"
                            data={['React', 'Angular', 'Vue', 'Svelte']}
                        />
                    </div>

                )
            }
        },
        fontWeight: {
            type: 'custom',
            label: 'Font Weight',
            labelIcon: <Type size={16} className="mr-1" />,
            render: ({ onChange, value }) => (
                <div className="grid grid-cols-4 items-center gap-2">
                    <NumberInput step={50} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
                </div>

            )
        },
        fontSize: {
            type: 'custom',
            label: 'Font Size (rem)',
            labelIcon: <Type size={16} className="mr-1" />,
            render: ({ onChange, value }) => (
                <NumberInput leftSection={<FontSizeIcon />} step={0.1} className="w-full" size="xs" value={value} onChange={(e) => onChange(Number(e))} />
            )
        },
        style: {
            type: 'custom',
            render: ({ value, onChange }) => (
                <div >
                    <ToggleButtonGroup size="lg" sx={{
                        width: '100%'
                    }} value={value} onChange={(e, newValue) => onChange(newValue!)}>
                        <IconButton className="w-1/3" size={'sm'} value={'bold'}>
                            <FontBoldIcon />
                        </IconButton>
                        <IconButton className="w-1/3" size="sm" value={'italic'}>
                            <FontItalicIcon />
                        </IconButton><IconButton className="w-1/3" size="sm" value={'underline'}>
                            <UnderlineIcon />
                        </IconButton>
                    </ToggleButtonGroup>
                </div>

            )
        },
        lineHeight: {
            type: 'custom',
            label: 'Line Height',
            labelIcon: <Type size={16} />,
            render: ({ onChange, value, field }) => (
                <NumberInput leftSection={<LineHeightIcon />} size="xs" radius={'md'} step={0.1} className="w-full" value={value} onChange={(e) => onChange(Number(e))} />
            )
        },
        letterSpacing: {
            type: 'custom',
            label: 'Letter Spacing',
            labelIcon: <Type size={16} />,
            render: ({ onChange, value, field }) => (
                <NumberInput leftSection={<LetterSpacingIcon />} step={0.1} radius={'md'} className="w-full" size="xs" value={value} onChange={(e) => onChange(Number(e))} />
            )
        },
        align: {
            type: 'custom',
            label: 'Align',
            labelIcon: <Type size={16} className="mr-1" />,
            render: ({ onChange, value, field }) => (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <SegmentedControl value={value} size="xs" radius={'md'} onChange={(e: any) => { onChange(e) }} className=" col-span-3"
                        data={[{
                            label: <div className="flex justify-center"><TextAlignLeftIcon /></div>,
                            value: 'start'
                        }, {
                            label: <div className="flex justify-center"><TextAlignCenterIcon /></div>,
                            value: 'center'
                        }, {
                            label: <div className="flex justify-center"><TextAlignRightIcon /></div>,
                            value: 'end'
                        },
                        {
                            label: <div className="flex justify-center"><TextAlignJustifyIcon /></div>,
                            value: 'justify'
                        },
                        ]} />
                </div>
            )
        },

        color: {
            type: 'custom',
            label: 'Color',
            labelIcon: <PaintBucket size={16} className="mr-1" />,
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

    if (data.props.paddingExpanded === 'true') {
        fields.paddingTop = {
            type: 'custom',
            label: 'Top',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowUpIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.paddingBottom = {
            type: 'custom',
            label: 'Bottom',
            labelIcon: <ArrowDown size={16} className="mr-1" />,

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowDownIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.paddingLeft = {
            type: 'custom',
            label: 'Left',
            labelIcon: <ArrowLeft size={16} className="mr-1" />,

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowLeftIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.paddingRight = {
            type: 'custom',
            label: 'Right',
            labelIcon: <ArrowRight size={16} className="mr-1" />,

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowRightIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.padding = {
            type: 'custom',
            label: 'Padding',
            visible: false,
            render: ({ onChange, value, field }) => {
                return (
                    <FieldLabel label={field.label!} >
                        <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
                    </FieldLabel>
                )

            }
        }

    }
    if (data.props.marginExpanded === 'true') {
        fields.margin = {
            type: 'custom',
            label: 'Margin',
            visible: false,
            render: ({ onChange, value, field }) => (
                <FieldLabel label={field.label!}>
                    <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
                </FieldLabel>
            )
        },
            fields.marginTop = {
                type: 'custom',
                label: 'Top',
                labelIcon: <ArrowUp size={16} className="mr-1" />,
                visible: true,
                render: ({ onChange, value, field }: any) => (
                    <NumberInput leftSection={<ArrowUpIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
                )
            },
            fields.marginBottom = {
                type: 'custom',
                label: 'Bottom',
                labelIcon: <ArrowDown size={16} className="mr-1" />,
                visible: true,
                render: ({ onChange, value, field }: any) => (
                    <NumberInput leftSection={<ArrowDownIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
                )
            },
            fields.marginLeft = {
                type: 'custom',
                label: 'Left',
                labelIcon: <ArrowLeft size={16} className="mr-1" />,
                visible: true,
                render: ({ onChange, value, field }: any) => (
                    <NumberInput leftSection={<ArrowLeftIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
                )
            },
            fields.marginRight = {
                type: 'custom',
                label: 'Right',
                labelIcon: <ArrowRight size={16} className="mr-1" />,
                visible: true,
                render: ({ onChange, value, field }: any) => (
                    <NumberInput leftSection={<ArrowRightIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
                )
            }
    }
    return fields
}
