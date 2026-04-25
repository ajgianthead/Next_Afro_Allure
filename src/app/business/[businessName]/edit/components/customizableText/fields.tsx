import { PaintBucket, Type } from "lucide-react"
import { ComponentData, DefaultComponentProps, Fields, useGetPuck } from "@puckeditor/core"
import { ColorInput, Input, NumberInput, SegmentedControl, Select, Switch } from "@mantine/core"
import { FontBoldIcon, FontFamilyIcon, FontItalicIcon, FontSizeIcon, LetterSpacingIcon, LineHeightIcon, TextAlignCenterIcon, TextAlignJustifyIcon, TextAlignLeftIcon, TextAlignRightIcon, UnderlineIcon } from "@radix-ui/react-icons"
import { IconButton, ToggleButtonGroup } from "@mui/joy"
import { RegularText } from "../types"
import { EditorConxtextProps, useEditorContext } from "@/app/utils/context/EditorContext"
import { GoogleFont, loadGoogleFont, loadNextFontChunk } from "useGoogleFonts"

export let customizableTextFields: Fields<RegularText, {}> = {
    text: {
        type: 'custom',
        label: 'Text',
        contentEditable: true,
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
            const { editorState }: { editorState: EditorConxtextProps } = useEditorContext()
            loadGoogleFont(value!)
            return (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{"Font"}</p>
                    <Select
                        leftSection={<FontFamilyIcon />}
                        className="col-span-3"
                        size="xs"
                        radius={'md'}
                        searchable
                        value={value}
                        onChange={(value) => {
                            if (!value) return;
                            loadGoogleFont(value);
                            onChange(value);
                        }}
                        renderOption={({ option }) => {
                            let hoveredEl: HTMLElement | null = null;

                            return <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                                onMouseEnter={async (e) => {
                                    const el = e.currentTarget;

                                    // apply a temporary “loading” style
                                    el.style.opacity = "0.5";  // slightly faded while font loads
                                    el.style.transition = "opacity 0.15s ease";

                                    await loadGoogleFont(option.value); // wait for font to start loading
                                    el.style.fontFamily = option.value;

                                    // remove the temporary style
                                    el.style.opacity = "1";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = "1";
                                    e.currentTarget.style.fontFamily = ""; // reset font if you want
                                }}
                            >
                                {option.label}
                            </div>
                        }}

                        data={editorState.fonts?.map((font: GoogleFont, index: number) => {
                            return font.family
                        })}
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
                }} value={value} onChange={(e: any, newValue: any) => onChange(newValue!)}>
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
    isLink: {
        type: 'custom',
        label: 'Hyperlink',
        render: (({ value, onChange, field }) => {
            return (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <Switch checked={value} onChange={(e) => { onChange(e.currentTarget.checked) }} />
                </div>
            )
        })
    },
    linkType: {
        type: 'custom',
        label: 'Link Type',
        render: (({ value, onChange, field }) => {
            return (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <Select value={value} onChange={(value) => onChange(value!)} data={[
                        {
                            label: 'External',
                            value: 'external'
                        },
                        {
                            label: 'Internal',
                            value: 'internal'
                        }
                    ]} />
                </div>
            )
        })
    },
    url: {
        type: 'custom',
        label: 'URL',
        render: ({ onChange, value, field }) => (
            <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-sm font-medium text-slate-400">{field.label}</p>
                <Input
                    className=" col-span-3"
                    size="xs"
                    placeholder="Ex. https://google.com"
                    radius="md"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        )
    },
    sections: {
        type: 'custom',
        label: "Section",
        render: (({ value, onChange, field }) => {
            const { editorState } = useEditorContext()
            const getPuck = useGetPuck()
            const sections = Array.from(editorState.sections)
            const { appState } = getPuck()
            const appStateContent = appState.data.content
            let sectionData: { value: string, label: string }[] = []
            appStateContent.forEach((component) => {
                if (component.type === 'Section') {
                    if (editorState.sections.has(component.props.id)) {
                        sectionData.push({ value: component.props.id, label: component.props.sectionName })
                    }
                }
            })
            return (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <Select value={value} onChange={(value) => onChange(value!)} data={sectionData} />
                </div>
            )
        })
    }

}

export const resolveCustomizableTextFields: (data: Omit<ComponentData<RegularText, string, Record<string, DefaultComponentProps>>, "type">) => Fields<RegularText, {}> | Promise<Fields<RegularText, {}>> = (data) => {
    let customizableTextFields: Fields<RegularText, {}> = {
        text: {
            type: 'custom',
            label: 'Text',
            contentEditable: true,
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
                const { editorState }: { editorState: EditorConxtextProps } = useEditorContext()
                loadGoogleFont(value!)
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{"Font"}</p>
                        <Select
                            leftSection={<FontFamilyIcon />}
                            className="col-span-3"
                            size="xs"
                            radius={'md'}
                            searchable
                            value={value}
                            onChange={(value) => {
                                if (!value) return;
                                loadGoogleFont(value);
                                onChange(value);
                            }}
                            renderOption={({ option }) => {
                                let hoveredEl: HTMLElement | null = null;

                                return <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                    }}
                                    onMouseEnter={async (e) => {
                                        const el = e.currentTarget;

                                        // apply a temporary “loading” style
                                        el.style.opacity = "0.5";  // slightly faded while font loads
                                        el.style.transition = "opacity 0.15s ease";

                                        await loadGoogleFont(option.value); // wait for font to start loading
                                        el.style.fontFamily = option.value;

                                        // remove the temporary style
                                        el.style.opacity = "1";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = "1";
                                        e.currentTarget.style.fontFamily = ""; // reset font if you want
                                    }}
                                >
                                    {option.label}
                                </div>
                            }}

                            data={editorState.fonts?.map((font: GoogleFont, index: number) => {
                                return font.family
                            })}
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
                    }} value={value} onChange={(e: any, newValue: any) => onChange(newValue!)}>
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
        isLink: {
            type: 'custom',
            label: 'Hyperlink',
            render: (({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <Switch size="xs" checked={value} onChange={(e) => { onChange(e.currentTarget.checked) }} />
                    </div>
                )
            })
        },
        linkType: {
            type: 'custom',
            label: 'Link Type',
            visible: false,

            render: (({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <Select className="col-span-3  col-start-2" size="xs"
                            radius={'md'} value={value} onChange={(value) => onChange(value!)} data={[
                                {
                                    label: 'External',
                                    value: 'external'
                                },
                                {
                                    label: 'Internal',
                                    value: 'internal'
                                }
                            ]} />
                    </div>
                )
            })
        },
        url: {
            type: 'custom',
            label: 'URL',
            visible: false,

            render: ({ onChange, value, field }) => (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <Input
                        className=" col-span-3"
                        size="xs"
                        placeholder="Ex. https://google.com"
                        radius="md"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            )
        },
        sections: {
            type: 'custom',
            label: "Section",
            visible: false,
            render: (({ value, onChange, field }) => {
                const { editorState } = useEditorContext()
                const getPuck = useGetPuck()
                const { appState } = getPuck()
                const appStateContent = appState.data.content
                let sectionData: { value: string, label: string }[] = []
                appStateContent.forEach((component) => {
                    if (component.type === 'Section') {
                        if (editorState.sections.has(component.props.id)) {
                            sectionData.push({ value: component.props.sectionName, label: component.props.sectionName })
                        }
                    }
                })
                console.log(sectionData);

                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <Select value={value} onChange={(value) => onChange(value!)} data={sectionData} />
                    </div>
                )
            })
        }

    }
    if (data.props.isLink) {
        customizableTextFields.linkType = {
            type: 'custom',
            label: 'Link Type',
            visible: true,

            render: (({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <Select className="col-span-3  col-start-2" size="xs" value={value} onChange={(value) => onChange(value!)} data={[
                            {
                                label: 'External',
                                value: 'external'
                            },
                            {
                                label: 'Internal',
                                value: 'internal'
                            }
                        ]} />
                    </div>
                )
            })
        }
        if (data.props.linkType === 'external') {
            customizableTextFields.url = {
                type: 'custom',
                label: 'URL',
                visible: true,

                render: ({ onChange, value, field }) => (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <Input
                            className=" col-span-3"
                            size="xs"
                            placeholder="Ex. https://google.com"
                            radius="md"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                        />
                    </div>
                )
            }
        } else {
            customizableTextFields.sections = {
                type: 'custom',
                label: "Section",
                visible: true,
                render: (({ value, onChange, field }) => {
                    const { editorState } = useEditorContext()
                    const getPuck = useGetPuck()
                    const { appState } = getPuck()
                    const appStateContent = appState.data.content
                    let sectionData: { value: string, label: string }[] = []
                    appStateContent.forEach((component) => {
                        if (component.type === 'Section') {
                            if (editorState.sections.has(component.props.id)) {
                                sectionData.push({ value: component.props.sectionName, label: component.props.sectionName })
                            }
                        }
                    })
                    return (
                        <div className="grid grid-cols-4 items-center gap-2">
                            <p className="text-sm font-medium text-slate-400">{field.label}</p>
                            <Select className="col-span-3  col-start-2" size="xs" value={value} onChange={(value) => onChange(value!)} data={sectionData} />
                        </div>
                    )
                })
            }
        }
    }

    return customizableTextFields
}
