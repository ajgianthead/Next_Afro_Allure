import { customizableTextFields } from "./fields"

export const CustomizableTextComponent: any = {
    label: 'Regular Text',
    fields: customizableTextFields,
    defaultProps: {
        text: 'Customizable Text',
        fontSize: 1,
        fontWeight: 400,
        letterSpacing: 1.2,
        lineHeight: 1.5,
        color: '#000000',
        style: [],
        fontFamily: 'Inter',
        align: 'start'
    },
    render: ({ text, fontSize, fontWeight, fontFamily, color, letterSpacing, lineHeight, style, id, align }: any) => {
        return <p style={{
            textWrap: 'wrap',
            fontSize: `${fontSize}rem`,
            fontFamily,
            fontWeight: style?.includes('bold') ? 'bold' : fontWeight,
            color,
            letterSpacing,
            lineHeight,
            textAlign: align,
            textDecoration: style?.includes('underline') ? 'underline' : "none",
            fontStyle: style?.includes('italic') ? 'italic' : 'normal'

        }} className={`apply-font-${id.split('-')[1]}`}>{text}</p>
    }
}
