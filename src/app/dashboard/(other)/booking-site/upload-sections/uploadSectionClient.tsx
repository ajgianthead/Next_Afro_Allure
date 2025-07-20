'use client'

import { Button, styled } from '@mui/joy';
import { Caption } from '@tailus-ui/typography';
import Image from 'next/image';
import React, { useState } from 'react';
import { ImageObject, uploadImgSectionChanges } from '../actions';
import { ChevronLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';


const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const UploadSectionClient = ({ businessId, editorId, imageObj }: { businessId: string, editorId: string, imageObj: ImageObject[] }) => {
    const [imageObjects, setImageObjects] = useState<ImageObject[]>(imageObj)
    const handleImageUpload = (file: File) => {
        const url = URL.createObjectURL(file)
        setImageObjects([
            ...imageObjects,
            {
                id: crypto.randomUUID(),
                fileBody: file,
                url: URL.createObjectURL(file)
            }
        ])
    }
    const router = useRouter()
    return (
        <div className='w-full flex flex-col items-center justify-center'>
            <div className='flex justify-start w-full mb-5'>
                <Button onClick={() => router.push('/dashboard/booking-site')} variant='plain' className='flex gap-2'><ChevronLeftIcon size={20} />Back</Button>
            </div>
            {imageObjects.map((image, index) => {
                return (
                    <div className='w-2/3'>
                        <Image width={1366 / 2} height={768 / 2} className='w-full' src={image.url} alt='web-section' />
                    </div>
                )
            })}
            <Button component="label"
                role={undefined}
                sx={{
                    paddingY: 5,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    marginTop: 2
                }}
                tabIndex={-1}
                variant="outlined"
                color="neutral" className='w-5/6 p-20'>
                <Caption>
                    + Add Section
                </Caption>
                <VisuallyHiddenInput type="file" onChange={(e) => handleImageUpload(e.target.files![0])} />
            </Button>
            <Button sx={{ marginY: 3 }} onClick={async () => {
                const imageObjs = await uploadImgSectionChanges(imageObjects, businessId, editorId)
                if (imageObjs instanceof Array) {
                    setImageObjects(imageObjs)
                }
            }}>Save Changes</Button>
        </div>
    );
}

export default UploadSectionClient;
