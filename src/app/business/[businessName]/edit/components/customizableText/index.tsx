'use client'


import { ComponentConfig } from "@puckeditor/core"
import { RegularText } from "../types"
import { customizableTextFields, resolveCustomizableTextFields } from "./fields"
import { useEditorContext } from "@utils/context/EditorContext"
import { customTextProps } from "../defaultStyles"

export const CustomizableTextComponent: ComponentConfig<RegularText> = {
    label: 'Regular Text',
    // fields: customizableTextFields,
    resolveFields: resolveCustomizableTextFields,
    defaultProps: customTextProps,
    render: ({ text, fontSize, fontWeight, fontFamily, color, letterSpacing, lineHeight, style, id, align, sections, url, isLink, linkType }) => {
        const { editorState } = useEditorContext()
        return isLink ? <a href={linkType === 'external' ? url : `${process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_BASE_URL : process.env.NEXT_PUBLIC_PROD_BASE_URL}/${editorState.businessName}/#${sections.toLowerCase().replace(/\s+/g, "")}`} style={{
            textWrap: 'wrap',
            fontSize: `${fontSize}rem`,
            fontFamily,
            fontWeight: style?.includes('bold') ? 'bold' : fontWeight,
            color,
            letterSpacing,
            lineHeight,
            textAlign: align as any,
            textDecoration: style?.includes('underline') ? 'underline' : "none",
            fontStyle: style?.includes('italic') ? 'italic' : 'normal'

        }} className={`apply-font-${id.split('-')[1]}`}>{text}</a> : <p style={{
            textWrap: 'wrap',
            fontSize: `${fontSize}rem`,
            fontFamily,
            fontWeight: style?.includes('bold') ? 'bold' : fontWeight,
            color,
            letterSpacing,
            lineHeight,
            textAlign: align as any,
            textDecoration: style?.includes('underline') ? 'underline' : "none",
            fontStyle: style?.includes('italic') ? 'italic' : 'normal'

        }} className={`apply-font-${id.split('-')[1]}`}>{text}</p>
    }
}
