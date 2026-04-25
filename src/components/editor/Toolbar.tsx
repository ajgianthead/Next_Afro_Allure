'use client'
import { useEditor } from '@craftjs/core';
import { Button, IconButton, ToggleButtonGroup } from '@mui/joy'
import { CircleCheck, Eye, Laptop, Monitor, Redo, Smartphone, Tablet, Undo, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import lz from "lzutf8";
import { getEditorData, sendEditorData } from '@/app/utils/editor_actions';
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

    }
    const [screenSize, setScreenSize] = useState<string>("1280")
    const [confirmation, setConfirmation] = useState<boolean>(false)
    return (
        <div>
            <div className='w-full px-5 h-16 border-b border-[#D4D4D4] flex items-center justify-between'>
                <div></div>
                <div>
                    <ToggleButtonGroup value={screenSize} onChange={(event, newValue: string | null) => {
                        setScreenSize(newValue!)
                        actions.setProp('ROOT', (props: any) => {
                            props.width = parseInt(newValue!)
                        });
                    }}>
                        <IconButton value={'1280'}>
                            <Monitor size={20} />
                        </IconButton>
                        <IconButton value={'360'}>
                            <Smartphone size={20} />
                        </IconButton>

                    </ToggleButtonGroup>
                </div>
                <div className='flex gap-5'>
                    <IconButton variant='outlined'>
                        <Eye size={16} />
                    </IconButton>
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
