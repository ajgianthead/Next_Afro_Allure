'use client'


import { ComponentConfig } from "@puckeditor/core"
import { RegularText } from "../types"
import { customizableTextFields, resolveCustomizableTextFields } from "./fields"
import { useEditorContext } from "@/app/utils/context/EditorContext"
import { customTextProps } from "../defaultStyles"

export const CustomizableTextComponent: ComponentConfig<RegularText> = {
    label: 'Regular Text',
    // fields: customizableTextFields,
    resolveFields: resolveCustomizableTextFields,
    defaultProps: customTextProps,
    render: ({ text, fontSize, fontWeight, fontFamily, color, letterSpacing, lineHeight, style, id, align, sections, url, isLink, linkType, textTransform, maxWidth }) => {
        const { editorState } = useEditorContext()
        const fluidFontSize = fontSize > 2
            ? `clamp(1.5rem, calc(${(fontSize * 0.3).toFixed(3)}rem + ${(fontSize * 1.8).toFixed(3)}vw), ${fontSize}rem)`
            : `${fontSize}rem`
        const textStyle: React.CSSProperties = {
            textWrap: 'wrap' as any,
            fontSize: fluidFontSize,
            fontFamily,
            fontWeight: style?.includes('bold') ? 'bold' : fontWeight,
            color,
            letterSpacing,
            lineHeight,
            textAlign: align as any,
            textDecoration: style?.includes('underline') ? 'underline' : "none",
            fontStyle: style?.includes('italic') ? 'italic' : 'normal',
            textTransform: (textTransform && textTransform !== 'none' ? textTransform : undefined) as any,
            maxWidth: maxWidth > 0 ? `${maxWidth}rem` : undefined,
        }
        return isLink
            ? <a href={linkType === 'external' ? url : `${process.env.NEXT_PUBLIC_BASE_URL}/${editorState.businessName}/#${sections.toLowerCase().replace(/\s+/g, "")}`} style={textStyle} className={`apply-font-${id.split('-')[1]}`}>{text}</a>
            : <p style={textStyle} className={`apply-font-${id.split('-')[1]}`}>{text}</p>
    }
}
