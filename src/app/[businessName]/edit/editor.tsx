'use client'

import { createUsePuck, Puck } from "@measured/puck";
import React from 'react';
import type { Config, Data, Slot, DefaultComponents } from "@measured/puck";
import "@measured/puck/puck.css";
import { Box, Columns2, Type } from "lucide-react";
import { Typography } from "@mui/joy";
import { config, drawerItemStyleProps } from "./constants";
import { sendEditorData } from "@utils/editor_actions";
import Settings from "./settings";



// Describe the initial data
const initialData = {};

// Save the data to your database
const saveData = async (data: Data<DefaultComponents, any>, businessId: string) => {
    const result = await sendEditorData(JSON.stringify(data), businessId)
};
interface PageProps {
    businessId: string
    editorData: string
}
// Render Puck editor
function Editor({ businessId, editorData }: PageProps) {
    return <Puck config={config} data={JSON.parse(editorData)} onPublish={async (data) => {
        await saveData(data, businessId)
    }} overrides={{
        drawerItem: ({ name }) => {
            return (
                <div className="flex items-center px-2 gap-2 "><p>{drawerItemStyleProps.get(name)?.icon}</p><Typography level={`${drawerItemStyleProps.get(name)?.fontLevel!}`}>{drawerItemStyleProps.get(name)?.label}</Typography></div>
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
            console.log(selectedItem)
            return (
                <Settings fields={fields} componentName={selectedItem?.type!} />
            );

        }
    }} />
}

export default Editor;
