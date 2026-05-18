'use client'

import { ComponentConfig, createUsePuck } from "@puckeditor/core";
import { sectionFields } from "./fields";
import { useEffect } from "react";
import { Section } from "../types";
import { sectionProps } from "../defaultStyles";
import { usePathname } from "next/navigation";

// Isolated component so hooks are always called unconditionally
const EditorSectionInit = ({ sectionName, id }: { sectionName: string | null | '', id: string }) => {
    const usePuck = createUsePuck()
    const dispatch = usePuck((s) => s.dispatch)
    const appState = usePuck((s) => s.appState)

    useEffect(() => {
        if (!sectionName) {
            const index = appState.data.content.findIndex((c) => c.props.id === id)
            if (index === -1) return
            dispatch({
                type: 'setData',
                data: (prev) => {
                    const newContent = [...prev.content]
                    newContent[index] = {
                        ...newContent[index],
                        props: { ...newContent[index].props, sectionName: id },
                    }
                    return { ...prev, content: newContent }
                },
            })
        }
    }, [sectionName, id])

    return null
}

export const SectionComponent: ComponentConfig<Section> = {
    fields: sectionFields,
    defaultProps: sectionProps,
    render: ({ section, sectionName, id }) => {
        const pathName = usePathname()
        const isEditor = pathName.split('/').includes('edit')
        const resolvedId = sectionName
            ? sectionName.toLowerCase().replace(/\s+/g, '')
            : id.toLowerCase().replace(/\s+/g, '')

        return (
            <div id={resolvedId}>
                {isEditor && <EditorSectionInit sectionName={sectionName} id={id} />}
                {section()}
            </div>
        )
    },
}
