'use client'


import { ComponentConfig, createUsePuck, SlotComponent } from "@puckeditor/core";
import { sectionFields } from "./fields";
import { useEffect, useState } from "react";
import { useEditorContext } from "@/app/utils/context/EditorContext";
import { Section } from "../types";
import { sectionProps } from "../defaultStyles";
import { usePathname } from "next/navigation";


export const SectionComponent: ComponentConfig<Section> = {
    fields: sectionFields,
    defaultProps: sectionProps,
    render: (({ section, sectionName, id, puck }) => {
        const pathName = usePathname()
        const isEditor = pathName.split('/').includes("edit")
        if (isEditor) {
            const [newId, setNewId] = useState<string | null>(sectionName === null ? id : sectionName)
            const usePuck = createUsePuck()
            const dispatch = usePuck((s) => s.dispatch)
            const appState = usePuck((s) => s.appState)

            useEffect(() => {
                if (sectionName === null) {
                    const index = appState.data.content.findIndex((value) => value.props.id === id)
                    dispatch({
                        type: 'setData',
                        data: (prev) => {
                            let newContent = [...prev.content]
                            newContent[index].props.sectionName = id
                            return {
                                ...prev,
                                content: [...newContent]
                            }
                        }
                    })
                }
            }, [sectionName]);
        }


        return (
            <div id={sectionName ? sectionName!.toLowerCase().replace(/\s+/g, "") : id.toLowerCase().replace(/\s+/g, "")}>{
                section()
            }</div>
        )
    })
}
