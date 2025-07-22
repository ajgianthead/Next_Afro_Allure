'use client'

import { Button, IconButton, styled } from '@mui/joy';
import { Caption } from '@tailus-ui/typography';
import Image from 'next/image';
import React, { useState } from 'react';
import { deleteSectionImage, editSectionImage, uploadImgSectionChanges } from '../actions';
import { ChevronLeftIcon, Pencil, Trash } from 'lucide-react';
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

    const handleImageUpload = async (file: File, isEdit?: boolean, id?: string, index?: number) => {
        if (isEdit) {
            const newUrl = await editSectionImage(id!, file, businessId)
            let clone = [...imageObjects]
            clone[index!].url = newUrl;
            setImageObjects(clone)
        } else {
            const imageObj = await uploadImgSectionChanges({
                id: crypto.randomUUID(),
                fileBody: file,
            }, businessId, editorId, imageObjects.length)
            setImageObjects([
                ...imageObjects,
                imageObj!
            ])
        }

    }

    const handleImageDeletion = async (businessId: string, imageId: string, index: number) => {
        const resArray = await deleteSectionImage(businessId, imageId)
        imageObjects.splice(index, imageObjects.length)
        let newImgObj = imageObjects.concat(resArray)
        console.log(newImgObj, resArray);
        setImageObjects([
            ...newImgObj
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
                    <div className='w-2/3' key={index}>
                        <div className='relative'>
                            <div className='absolute bg-white right-0 rounded-sm'>
                                <IconButton component="label" tabIndex={-1}
                                    role={undefined} color='warning' className='rounded-full bg-gray-300 max-w-min p-2'>
                                    <VisuallyHiddenInput type="file" onChange={(e) => handleImageUpload(e.target.files![0], true, image.id, index)} />
                                    <Pencil size={20} />
                                </IconButton>
                                <IconButton onClick={() => handleImageDeletion(businessId, image.id, index)} color='danger' className='rounded-full bg-gray-300 max-w-min p-2'>
                                    <Trash size={20} />
                                </IconButton>
                            </div>
                            <Image width={1366 / 2} height={768 / 2} className='w-full' src={`${image.url!}?t=${Date.now()}`} alt='web-section' />
                        </div>
                    </div>

                )
            })}
            <Button component="label"
                role={undefined}
                sx={{
                    paddingY: 5,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    marginTop: 2,
                    marginBottom: 5
                }}
                tabIndex={-1}
                variant="outlined"
                color="neutral" className='w-5/6 p-20'>
                <Caption>
                    + Add Section
                </Caption>
                <VisuallyHiddenInput type="file" onChange={(e) => handleImageUpload(e.target.files![0])} />
            </Button>

        </div>
    );
}

export default UploadSectionClient;
