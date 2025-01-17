'use client'
import { Text as AAText } from "@tailus-ui/typography";
import React, { useEffect, useState } from "react";
import { Node, useNode } from "@craftjs/core";
import ContentEditable from 'react-contenteditable'


const EditableText = ({ text, fontSize = 16, fontColor = '#111827', className }: any) => {

    const { connectors: { connect, drag }, hasSelectedNode, hasDraggedNode, actions: { setProp } } = useNode((state: any) => ({
        hasSelectedNode: state.events.selected,
        hasDraggedNode: state.events.dragged
    }));
    const [activeEdit, setActiveEdit] = useState<boolean>(false);
    useEffect(() => { !hasSelectedNode && setActiveEdit(false) }, [hasSelectedNode]);


    return (
        <div ref={(ref: any) => connect(drag(ref))} onClick={e => setActiveEdit(true)}>
            <Text className={className} activeEdit={activeEdit} setActiveEdit={setActiveEdit} isEditable={true} text={text} setProp={setProp} fontSize={fontSize} fontColor={fontColor} />
        </div>
    )
}
const Text = ({ text, fontSize = 16, fontColor = '#111827', isEditable, className, setProp, activeEdit, setActiveEdit }: any) => {
    return (
        <div>
            {isEditable ? <div>
                <ContentEditable
                    html={text}
                    onChange={e =>
                        setProp((props: any) =>
                            props.text = e.target.value.replace(/<\/?[^>]+(>|$)/g, "")
                        )
                    }
                    disabled={!activeEdit}
                    tagName="p"
                    className={`${className}`} style={{ fontSize, color: fontColor }}
                />
            </div> : <AAText className={`${className}`} style={{ fontSize, color: fontColor }}>{text}</AAText>}
        </div>

    )
}

export { Text, EditableText };
