import { FieldLabel, Fields } from "@measured/puck"
import { Input, Typography } from "@mui/joy"
import { SketchPicker } from "react-color"
import { Text } from "../types"

const templateTextFields: Fields<Text, {}> = {
    text: {
        type: 'custom',
        label: 'Text',
        render: ({ onChange, value, field }) => (
            <FieldLabel label={field.label!}>
                <Input value={value} onChange={(e) => onChange(e.target.value)} />
            </FieldLabel>
        )
    },
    color: {
        type: 'custom',
        label: 'Text Color',
        render: ({ onChange, value, field }) => (
            <FieldLabel label={field.label!}>
                <div>
                    {field.labelIcon}
                </div>
                <SketchPicker color={value} onChange={(color) => {
                    onChange(color.hex)
                }} />
            </FieldLabel>
        )
    }

}

export const textPresetsComponents = {
    HeadingOne: {
        label: 'Heading 1',
        fields: templateTextFields,
        defaultProps: {
            text: "Heading 1",
            color: '#000000'
        },
        render: ({ text, color }: any) => {
            return <Typography sx={{
                color
            }} level="h1">{text}</Typography>
        }
    },
    HeadingTwo: {
        label: 'Heading 2',
        fields: templateTextFields,
        defaultProps: {
            text: "Heading 2",
            color: "#000000"
        },
        render: ({ text, color }: any) => {
            return <Typography sx={{
                color
            }} level="h2">{text}</Typography>
        }
    },
    HeadingThree: {
        label: 'Heading 3',
        fields: templateTextFields,
        defaultProps: {
            text: "Heading 3",
            color: '#000000'
        },
        render: ({ text, color }: any) => {
            return <Typography sx={{
                color
            }} level="h3">{text}</Typography>
        }
    },
    HeadingFour: {
        label: 'Heading 4',
        fields: templateTextFields,
        defaultProps: {
            text: "Heading 4",
            color: "#000000"
        },
        render: ({ text, color }: any) => {
            return <Typography sx={{
                color
            }} level="h4">{text}</Typography>
        }
    },
    TitleLarge: {
        label: 'Title Large',
        fields: templateTextFields,
        defaultProps: {
            text: "Title Large",
            color: "#000000"
        },
        render: ({ text, color }: any) => {
            return <Typography sx={{
                color
            }} level="title-lg">{text}</Typography>
        }
    },
    TitleMedium: {
        label: 'Title Medium',
        fields: templateTextFields,
        defaultProps: {
            text: "Title Medium",
            color: '#000000'
        },
        render: ({ text, color }: any) => {
            return <Typography sx={{
                color
            }} level="title-md">{text}</Typography>
        }
    },
    TitleSmall: {
        label: 'Title Small',
        fields: templateTextFields,
        defaultProps: {
            text: "Title Small",
            color: '#000000'
        },
        render: ({ text, color }: any) => {
            return <Typography sx={{
                color
            }} level="title-sm">{text}</Typography>
        }
    },
    BodyLarge: {
        label: 'Body Large',
        fields: templateTextFields,
        defaultProps: {
            text: "Body Large",
            color: '#000000'
        },
        render: ({ text, color }: any) => {
            return <Typography sx={{
                color
            }} level="body-lg">{text}</Typography>
        }
    },
    BodyMedium: {
        label: 'Body Medium',
        fields: templateTextFields,
        defaultProps: {
            text: "Body Medium",
            color: '#000000'
        },
        render: ({ text, color }: any) => {
            return <Typography sx={{
                color
            }} level="body-md">{text}</Typography>
        }
    },
    BodySmall: {
        label: 'Body Small',
        fields: templateTextFields,
        defaultProps: {
            text: "Body Small",
            color: '#000000'
        },
        render: ({ text, color }: any) => {
            return <Typography sx={{
                color
            }} level="body-sm">{text}</Typography>
        }
    },
    BodyExtraSmall: {
        label: 'Body Extra-Small',
        fields: templateTextFields,
        defaultProps: {
            text: "Body Extra-Small",
            color: '#000000'
        },
        render: ({ text, color }: any) => {
            return <Typography sx={{
                color
            }} level="body-xs">{text}</Typography>
        }
    },
}
