'use client'

import { createUsePuck, Puck, useGetPuck } from "@puckeditor/core";
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import type { Config, Data, Slot, DefaultComponents, ComponentDataMap } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { Box, Columns2, Loader2, Type } from "lucide-react";
import { config, drawerItemStyleProps } from "./constants";
import { sendEditorData } from "@/app/utils/editor_actions";
import Settings from "./settings";
import { TemplatePicker } from "./templatePicker";
import { EditorConxtextProps, useEditorContext } from "@/app/utils/context/EditorContext";
import { Components } from "./components/types";
import { Json } from "../../../../../lib/database.types";
import * as Accordion from '@radix-ui/react-accordion';
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";



// Describe the initial data
const initialData = {};

const saveData = async (data: Data<DefaultComponents, any>, businessId: string, currentlyPublished: boolean) => {
    await sendEditorData(JSON.stringify(data), businessId, currentlyPublished)
};
interface ServiceType {
    addons: Json[] | null;
    availability: string;
    business: string;
    categories: string[] | null;
    created_at: string;
    description: string;
    id: string;
    imagePath: string | null;
    length: number;
    name: string;
    photo_url: string | null;
    price: number;
    updated_at: string | null;
}
interface PageProps {
    businessId: string
    editorData: string,
    businessName: string
    services: ServiceType[]
    isPublished: boolean
}
// Render Puck editor
function Editor({ businessId, editorData, businessName, services, isPublished }: PageProps) {
    const { editorState, setEditorState } = useEditorContext()

    useEffect(() => {
        setEditorState!(prev => ({ ...prev, businessName, services }))
    }, [businessName, services]);

    useEffect(() => {
        if (editorData.length > 0) {
            const data = JSON.parse(editorData)
            data.content.forEach((component: ComponentDataMap<Components>) => {
                if (component.type === 'Section') {
                    setEditorState!(prev => {
                        if (prev.sections.has(component.props.id)) return prev
                        const newSections = new Set(prev.sections)
                        newSections.add(component.props.id)
                        return { ...prev, sections: newSections }
                    })
                }
            })
        }
    }, []);

    return <Puck config={config} data={editorData.length > 0 ? JSON.parse(editorData) : undefined} onAction={(action, state) => {
        if (action.type === 'insert') {
            const inserted = state.data.content.filter(c => c.type === 'Section').map(c => c.props.id)
            if (inserted.length) {
                setEditorState!(prev => {
                    const next = new Set(prev.sections)
                    inserted.forEach((id: string) => next.add(id))
                    return { ...prev, sections: next }
                })
            }
        }
        if (action.type === 'remove') {
            const remaining = new Set(
                state.data.content.filter(c => c.type === 'Section').map(c => c.props.id)
            )
            setEditorState!(prev => ({ ...prev, sections: remaining }))
        }
    }} onPublish={async (data) => {
        await saveData(data, businessId, isPublished)
    }} overrides={{
        headerActions({ children }) {
            const usePuck = createUsePuck();
            const appState = usePuck((s) => s.appState);
            const [savingData, setSavingData] = useState<boolean>(false)
            return (
                <>
                    <TemplatePicker />
                    <Button
                        disabled={savingData}
                        style={{ backgroundColor: 'rgb(252, 97, 97)' }}
                        onClick={async () => {
                            setSavingData(true)
                            try {
                                await saveData(appState.data, businessId, isPublished)
                            } finally {
                                setSavingData(false)
                            }
                        }}
                    >
                        {savingData && <Loader2 className="size-4 animate-spin mr-2" />}
                        {isPublished ? 'Save Changes' : 'Publish Site'}
                    </Button>
                    {/*{children}*/}
                </>
            )

        },
        drawer({ children }) {
            const drawerItems: any = React.Children.toArray(children)
            return (
                <div>
                    {drawerItems[0].props.title === 'layout' ? <div>
                        <Accordion.Root type="multiple" defaultValue={['layout']}>
                            {drawerItems.map((section: any, index: number) => {
                                return (
                                    <Accordion.Item key={index} value={section.props.title}>
                                        <Accordion.Header>
                                            <Accordion.Trigger className="flex w-full items-center justify-between px-4 py-2 text-xs text-slate-400 font-semibold uppercase hover:bg-accent transition-colors [&[data-state=open]>svg]:rotate-180">
                                                {section.props.title.toUpperCase()}
                                                <ChevronDown className="size-3 transition-transform duration-200" />
                                            </Accordion.Trigger>
                                        </Accordion.Header>
                                        <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                                            <div className="grid gap-2 grid-cols-2 p-2" key={index}>
                                                {section.props.children.map((item: any, index: number) => {
                                                    return (
                                                        <div key={index}>
                                                            {item}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </Accordion.Content>
                                    </Accordion.Item>
                                )
                            })}
                        </Accordion.Root>
                    </div> : children}
                </div>

            )
        },
        drawerItem: ({ name }) => {
            return (
                <div className="flex items-center bg-white border-[#f0f0f0] rounded-md flex-col py-5 border px-2 gap-2 text-center">
                    <p className="text-center">{drawerItemStyleProps.get(name)?.icon}</p>
                    <span className="text-sm">{drawerItemStyleProps.get(name)?.label}</span>
                </div>
            )
        },
        fields: ({ children, isLoading, itemSelector }) => {
            const usePuck = createUsePuck();
            const selectedItem = usePuck((s) => {
                return s.selectedItem
            })
            if (isLoading) return <div>Loading...</div>;
            const fields = React.Children.toArray(children);
            return (
                <Settings fields={fields} componentName={selectedItem?.type!} />
            );

        }
    }} />
}

export default Editor;
