import React from 'react'
import { useEditor } from "@craftjs/core";

export default function Settings() {
    const { selected } = useEditor((state) => {
        const [currentNodeId] = state.events.selected;
        let selected;

        if (currentNodeId) {
            selected = {
                id: currentNodeId,
                name: state.nodes[currentNodeId].data.name,
                settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings
            };
        }

        return {
            selected
        }
    });
    return selected ? (
        <div>
            {
                selected.settings && React.createElement(selected.settings)
            }
        </div>
    ) : null
}
