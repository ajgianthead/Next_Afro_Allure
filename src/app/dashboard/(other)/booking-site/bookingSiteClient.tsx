'use client'

import { Card, CardContent } from '@mui/joy';
import { Caption, Title } from '@tailus-ui/typography';
import React from 'react';
import { createEditorState } from './actions';
import { PostgrestError } from '@supabase/supabase-js';
import { redirect, useRouter } from 'next/navigation';

interface PageProps {
    businessId: string
}

const handleCreateEditorState = async (business_id: string) => {
    const editorState = await createEditorState(business_id)
    // Get editor state if exists
    if (editorState instanceof PostgrestError) {
        console.log("Something went wrong")
    } else {
        return editorState
    }
}

const BookingSiteClient = ({ businessId }: PageProps) => {
    const router = useRouter()
    return (
        <div>
            <div className='w-full flex gap-2 cursor-pointer'>
                <div className='w-1/2' onClick={async () => {
                    const res = await handleCreateEditorState(businessId)
                    if (res) {
                        router.push(`/editor/${res.id}`)
                    }
                }}>
                    <Card variant='outlined'>
                        <CardContent sx={{
                            textAlign: 'center'
                        }}>
                            <Title>Create Booking Site with the</Title>
                            <Title>AfroAllure Web Editor</Title>
                            <Caption>(Recommended)</Caption>

                        </CardContent>
                    </Card>
                </div>
                <div className='w-1/2 cursor-pointer'>
                    <Card variant='outlined'>
                        <CardContent sx={{
                            textAlign: 'center'
                        }}>
                            <Title>Upload Images as Sections</Title>
                            <Title>AfroAllure Web Editor</Title>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default BookingSiteClient;
