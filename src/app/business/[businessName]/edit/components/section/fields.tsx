import { Fields } from "@puckeditor/core";
import { Section } from "../types";

const lbl = { fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' as const }

export const sectionFields: Fields<Section, {}> = {
    section: {
        type: 'slot'
    },
    sectionName: {
        type: 'custom',
        label: 'Name',
        render: ({ value, onChange, field }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 40 }}>{field.label}</span>
                <input
                    style={{ flex: 1, height: 26, borderRadius: 3, padding: '0 8px', fontSize: 11, background: '#F4F1EC', border: 'none', color: '#1A1818' }}
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        )
    }
}
