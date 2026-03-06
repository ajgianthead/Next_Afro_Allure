import { Fields } from "@puckeditor/core";
import { Section } from "../types";
import { Input } from "@mantine/core";
import { useEffect } from "react";

export const sectionFields: Fields<Section, {}> = {
    section: {
        type: 'slot'
    },
    sectionName: {
        type: 'custom',
        label: 'Name',

        render: (({ value, onChange, field }) => {
            return (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <Input
                        className=" col-span-3"
                        size="xs"
                        radius="md"
                        value={value!}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            )
        })
    }
}
