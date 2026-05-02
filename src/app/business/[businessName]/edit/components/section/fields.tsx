import { Fields } from "@puckeditor/core";
import { Section } from "../types";

export const sectionFields: Fields<Section, {}> = {
    section: {
        type: 'slot'
    },
    sectionName: {
        type: 'custom',
        label: 'Name',
        render: ({ value, onChange, field }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p className="text-xs font-medium text-slate-400">{field.label}</p>
                <input
                    className="col-span-3 h-6 border border-input rounded-md px-2 text-xs bg-background"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        )
    }
}
