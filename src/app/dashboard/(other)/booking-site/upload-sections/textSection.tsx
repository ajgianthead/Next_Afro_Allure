'use client'

import { Button } from '@/components/ui/button';
import { SimpleEditor } from '@tailus-ui/components/tiptap-templates/simple/simple-editor';
import React, { useRef } from 'react';

interface PageProps {
    editorState: any[];
    setEditorState: React.Dispatch<React.SetStateAction<any[]>>;
    index: number;
}

const TextSection = ({ editorState, index, setEditorState }: PageProps) => {
    const editorRef = useRef<any>(null);

    const handleCancel = () => {
        setEditorState(prev => {
            const updated = [...prev];
            updated[index] = { ...prev[index], editing: false };
            return updated;
        });
    };

    const handleSave = () => {
        setEditorState(prev => {
            const updated = [...prev];
            const id = prev[index].id;
            updated[index] = {
                id,
                type: 'text',
                content: editorRef.current.getJSON(),
                // TipTap's getHTML() output is sanitized to the configured extension set
                html: editorRef.current.getHTML(),
                editing: false,
            };
            return updated;
        });
    };

    if (editorState[index].editing) {
        return (
            <div className="flex flex-col gap-3 w-full overflow-hidden">
                <div className="border rounded-lg overflow-hidden max-h-72 overflow-y-auto">
                    <SimpleEditor ref={editorRef} initialContent={editorState[index].content} embedded />
                </div>
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
                    <Button size="sm" onClick={handleSave}>Save</Button>
                </div>
            </div>
        );
    }

    return (
        // TipTap output is sanitized by its extension model
        <div
            className="w-full min-h-[2.5rem] text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: editorState[index].html }}
        />
    );
};

export default TextSection;
