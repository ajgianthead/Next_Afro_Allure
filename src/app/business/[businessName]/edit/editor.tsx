'use client'

import { createUsePuck, Puck, useGetPuck } from "@puckeditor/core";
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import type { Config, Data, Slot, DefaultComponents, ComponentDataMap } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { Box, Columns2, Type } from "lucide-react";
import { Typography } from "@mui/joy";
import { config, drawerItemStyleProps } from "./constants";
import { sendEditorData } from "@utils/editor_actions";
import Settings from "./settings";
import { GoogleFont, loadAllFontsProgressively, loadGoogleFont, preloadFonts } from "useGoogleFonts";
import { EditorConxtextProps, useEditorContext } from "@utils/context/EditorContext";
import { Components } from "./components/types";
import { Json } from "../../../../../lib/database.types";
import { Accordion, Button } from "@mantine/core";



// Describe the initial data
const initialData = {};

// Save the data to your database
const saveData = async (data: Data<DefaultComponents, any>, businessId: string, currentlyPublished: boolean) => {
    const result = await sendEditorData(JSON.stringify(data), businessId, currentlyPublished)
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
    const fontFamilies = useMemo(
        () => editorState.fonts?.map(f => f.family) ?? [],
        [editorState.fonts]
    );
    useEffect(() => {
        setEditorState!({
            ...editorState,
            businessName: businessName,
            services: services
        })
        if (editorData.length > 0) {
            const data = JSON.parse(editorData)
            data.content.forEach((component: ComponentDataMap<Components>) => {
                if (component.type === 'Section') {
                    if (!editorState.sections.has(component.props.id)) {
                        let newState = { ...editorState }
                        newState.sections.add(component.props.id)
                        setEditorState!(newState)
                    }
                }
            })
        }
    }, [fontFamilies]);
    console.log(typeof editorData);

    return <Puck config={config} data={editorData.length > 0 ? JSON.parse(editorData) : undefined} onAction={(action, state, prevState) => {
        if (action.type === 'insert') {
            const stateContent = state.data.content
            if (stateContent.length) {
                stateContent.forEach((component, index) => {
                    if (component.type === 'Section') {
                        if (!editorState.sections.has(component.props.id)) {
                            let newState = { ...editorState }
                            newState.sections.add(component.props.id)
                            setEditorState!(newState)
                        }
                    }
                })
            }
        }
        if (action.type === 'remove') {
            const stateContent = state.data.content
            if (stateContent.length) {
                let res: string[] = []
                stateContent.forEach((component, index) => {
                    if (component.type === 'Section') {
                        if (!editorState.sections.has(component.props.id)) {
                            res.push(component.props.id)
                        }
                    }
                })
                let newState = { ...editorState }
                newState.sections = new Set(res)
                setEditorState!(newState)
            }
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
                    <Button
                        loading={savingData}
                        loaderProps={{
                            type: 'dots'
                        }}
                        color="rgb(252, 97, 97)"
                        onClick={async () => {
                            setSavingData(true)
                            await saveData(appState.data, businessId, isPublished)
                            setSavingData(false)
                        }}
                    >
                        {isPublished ? 'Save Changes' : 'Publish Site'}
                    </Button>

                    {/* Render default header actions, such as the default Button */}
                    {/*{children}*/}
                </>
            )

        },
        drawer({ children }) {
            const drawerItems: any = React.Children.toArray(children)
            return (
                <div>
                    {drawerItems[0].props.title === 'layout' ? <div>
                        <Accordion multiple defaultValue={['layout']}>
                            {drawerItems.map((section: any, index: number) => {
                                return (
                                    <Accordion.Item key={index} value={section.props.title}>
                                        <Accordion.Control className="text-xs text-slate-400 font-semibold">{section.props.title.toUpperCase()}</Accordion.Control>
                                        <Accordion.Panel><div className="grid gap-2 grid-cols-2" key={index}>{section.props.children.map((item: any, index: number) => {
                                            return (
                                                <div key={index}>
                                                    {item}
                                                </div>
                                            )
                                        })}</div></Accordion.Panel>
                                    </Accordion.Item>
                                )
                            })}


                        </Accordion>
                    </div> : children}
                </div>

            )
        },
        drawerItem: ({ name }) => {
            return (
                <div className="flex items-center bg-white border-[#f0f0f0] rounded-md flex-col py-5 border px-2 gap-2 text-center"><p className="text-center">{drawerItemStyleProps.get(name)?.icon}</p><Typography level={`${drawerItemStyleProps.get(name)?.fontLevel!}`}>{drawerItemStyleProps.get(name)?.label}</Typography></div>
            )
        },
        fields: ({ children, isLoading, itemSelector }) => {
            const usePuck = createUsePuck();
            const selectedItem = usePuck((s) => {
                return s.selectedItem
            })
            if (isLoading) return <div>Loading...</div>;
            // Convert children to array of React elements
            const fields = React.Children.toArray(children);
            return (
                <Settings fields={fields} componentName={selectedItem?.type!} />
            );

        }
    }} />
}

export default Editor;
