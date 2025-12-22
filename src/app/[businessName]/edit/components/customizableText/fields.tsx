import { PaintBucket, Type, UnderlineIcon } from "lucide-react"
import { RegularText } from "../../constants"
import { Fields } from "@measured/puck"
import { ColorInput, Input, NumberInput, SegmentedControl, Select } from "@mantine/core"
import { FontBoldIcon, FontFamilyIcon, FontItalicIcon, FontSizeIcon, LetterSpacingIcon, LineHeightIcon, TextAlignCenterIcon, TextAlignJustifyIcon, TextAlignLeftIcon, TextAlignRightIcon } from "@radix-ui/react-icons"
import { IconButton, ToggleButtonGroup } from "@mui/joy"

export const customizableTextFields: Fields<RegularText, {}> = {
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

}
