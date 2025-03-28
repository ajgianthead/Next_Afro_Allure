'use client'
import { useEditor } from '@craftjs/core';
import { Button, IconButton } from '@mui/joy'
import { CircleCheck, Redo, Undo, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import lz from "lzutf8";
import { getEditorData, sendEditorData } from '@utils/editor_actions';
import Toast from '@components/Toast';
import { PostgrestError } from '@supabase/supabase-js';

export const Toolbar = ({ editorId, setEditorData, setLoadingEditorData }: any) => {
    const { actions, query, enabled, canRedo, canUndo } = useEditor((state, query) => ({
        enabled: state.options.enabled,
        canUndo: query.history.canUndo(),
        canRedo: query.history.canRedo()
    }));
    const compressState = (json: string) => {
        return lz.encodeBase64(lz.compress(json))
    }
    const handleEditorState = async (state: string) => {
        // Send to database
        const res = await sendEditorData(state, editorId)
        console.log(res);
    }
    useEffect(() => {
        const getData = async () => {
            const res: any = await getEditorData(editorId)
            const json = lz.decompress(lz.decodeBase64(res.editor_data!));
            setEditorData(json)
        }
        getData()
        setTimeout(() => {
            setLoadingEditorData(false)
        }, 5000);
    }, [editorId]);
    const [confirmation, setConfirmation] = useState<boolean>(false)
    return (
        <div className='w-full px-5 h-16 border-b border-[#D4D4D4] flex justify-end items-center'>
            <div className='flex gap-5'>
                <div className='flex gap-2'>
                    <IconButton disabled={!canUndo} variant='outlined' onClick={() => actions.history.undo()}>
                        <Undo size={16} />
                    </IconButton>
                    <IconButton variant='outlined' disabled={!canRedo} onClick={() => actions.history.redo()}>
                        <Redo size={16} />
                    </IconButton>
                </div>
                <div>
                    <Button onClick={async () => {
                        const compressedEditorState = compressState(query.serialize())
                        await handleEditorState(compressedEditorState).then(() => {
                            setConfirmation(true)
                        })
                    }}>Save Changes</Button>
                </div>
            </div>
            <Toast.Provider>
                <Toast.Root open={confirmation} onOpenChange={setConfirmation} mixed>
                    <div className='flex justify-between items-center'>
                        <Toast.Title className='flex gap-2 items-center'><CircleCheck color='green' size={16} />Changes Saved</Toast.Title>
                        <Toast.Close aria-label="Close">
                            <span aria-hidden><X size={16} /></span>
                        </Toast.Close>
                    </div>
                    <Toast.Description>Changes made to your booking site are saved!</Toast.Description>
                </Toast.Root>

                <Toast.Viewport />
            </Toast.Provider>
        </div>
    )
}
