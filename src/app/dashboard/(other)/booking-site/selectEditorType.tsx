import { Button, Card, Tooltip } from '@mui/joy';
import { Caption, Title } from '@tailus-ui/typography';
import { LayoutPanelTop, PencilRuler } from 'lucide-react';
import React from 'react';

const SelectEditorType = () => {
    return (
        <div>
            <div className='w-full flex flex-col items-center justify-center'>
                <div className='flex w-full justify-start flex-col mb-10 gap-1 pl-6'>
                    <Title>Choose Web Editor Type</Title>
                    <Caption>Below, choose which editor you want to build your webpage with. The drag and drop editor is still <strong>under development</strong>, while the section editor is <strong>live and ready to go</strong></Caption>
                </div>
                <div className='w-full flex justify-center gap-5 h-[300px] items-center'>
                    <Tooltip sx={{
                        zIndex: 50
                    }} open title="Drag and drop builder is still in development" variant="solid">
                        <Button disabled variant='outlined'><div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: 300,
                            gap: 10,
                            textAlign: 'center',
                            paddingTop: 20,
                            paddingBottom: 20
                        }}><PencilRuler />Build with Drag and Drop Editor</div></Button>
                    </Tooltip>

                    <Button component='a' href='/dashboard/booking-site/upload-sections' variant='outlined'><div style={{
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
