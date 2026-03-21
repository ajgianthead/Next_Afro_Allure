'use client'

import { Button, Card, Tooltip } from '@mui/joy';
import { Caption, Title } from '@tailus-ui/typography';
import { Info, LayoutPanelTop, PencilRuler } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { createEditorState, createSectionEditorState } from './actions';
import { PostgrestError } from '@supabase/supabase-js';

interface PageProps {
    businessId: string,
    urlName: string
    businessName: string,
    switchType: string
}

const SelectEditorType = ({ businessId, urlName, businessName, switchType }: PageProps) => {
    const [creatingSections, setCreatingSections] = useState<boolean>(false)
    const [creatingEditor, setCreatingEditor] = useState<boolean>(false)
    const router = useRouter()
    return (
        <div>
            <div className='w-full flex flex-col items-center justify-center'>
                <div className='flex w-full justify-start flex-col mb-10 gap-1 pl-6'>
                    <Title>Choose Web Editor Type</Title>
                    <Caption>Below, choose which editor you want to build your webpage with. The section editor allows you to add sections/parts to your webpage in the form of images or text. While the drag & drop editor allows for more customization, and comes along with prebuilt components and templates.</Caption>
                </div>
                <div className='w-full flex md:flex-row flex-col justify-center gap-5 h-[300px] items-center'>
                    <Button loading={creatingEditor} disabled={creatingSections} onClick={async () => {
                        setCreatingEditor(true)
                        await createEditorState(businessId, switchType).then((res) => {
                            if (res instanceof PostgrestError) {
                                setCreatingEditor(false)
                                return
                            }
                            else if (res) {
                                router.push(`/${urlName}/edit`)
                            }
                        })
                    }} className='flex flex-col' variant='outlined'>
                        <div className='w-full flex justify-end'>
                            <Tooltip title={
                                <div className='text-center'>
                                    <p>The <strong>Drag & Drop Editor</strong> is recommended for those who are</p>
                                    <p>looking to build their booking site either from scratch or a provided template</p>
                                </div>
                            } size='sm' placement='top' variant="solid">
                                <Info size={15} />
                            </Tooltip>
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: 300,
                            gap: 10,
                            textAlign: 'center',
                            paddingTop: 20,
                            paddingBottom: 20
                        }}><PencilRuler />Build with Drag and Drop Editor</div></Button>
                    <Button loading={creatingSections} disabled={creatingEditor} onClick={async () => {
                        setCreatingSections(true)
                        await createSectionEditorState(businessName, businessId, switchType).then((res) => {
                            console.log(res);

                            if (res instanceof PostgrestError) {

                                setCreatingSections(false)
                                return
                            }
                            else {
                                router.push(`/dashboard/booking-site/upload-sections`)

                            }
                        })

                    }} className='flex flex-col' variant='outlined'>
                        <div className='w-full flex justify-end'>
                            <Tooltip title={
                                <div className='text-center'>
                                    <p>The <strong>Section Editor</strong> is recommended for those who are</p>
                                    <p>familiar with tools such as <strong className='underline'>Acuity</strong>, that have a similar editor</p>
                                </div>
                            } size='sm' placement='top' variant="solid">
                                <Info size={15} />
                            </Tooltip>
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: 300,
                            gap: 10,
                            textAlign: 'center',
                            paddingTop: 20,
                            paddingBottom: 20
                        }}><LayoutPanelTop />Build with Section Editor</div></Button>

                </div>
            </div>
        </div>

    );
}

export default SelectEditorType;
