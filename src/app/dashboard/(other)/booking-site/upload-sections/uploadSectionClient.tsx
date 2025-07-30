'use client'

import { Button, CircularProgress, IconButton, styled } from '@mui/joy';
import { Caption, Text, Title } from '@tailus-ui/typography';
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
        if (file) {
            setLoading(true)
        } else {
            return
        }
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
        setLoading(false)

    }

    const handleImageDeletion = async (businessId: string, imageId: string, index: number) => {
        const resArray = await deleteSectionImage(businessId, imageId)
        setLoading(true)
        imageObjects.splice(index, imageObjects.length)
        let newImgObj = imageObjects.concat(resArray)
        console.log(newImgObj, resArray);
        setImageObjects([
            ...newImgObj
        ])
        setLoading(false)
    }
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter()
    return (
        <div>
            <div className='w-full flex flex-col items-center justify-center'>

                <div className='flex w-full justify-start flex-col mb-10 pl-6'>
                    <Title>Upload and Edit Sections</Title>
                    <Caption>Below, you are able to upload, edit, or delete sections of your site. Click the pencil icon to edit a section, or the trash can icon to delete. <strong>Updates to your booking site happen in realtime</strong></Caption>
                </div>
                <div className='w-full relative flex justify-center flex-col items-center'>
                    {loading ? <div className='w-full absolute h-full top-0 z-10 flex justify-center items-center bg-transparent'>
                        <CircularProgress size='lg' />
                    </div> : <></>}
                    {imageObjects.map((image, index) => {
                        return (
                            <div className='w-2/3 hover:border-3 hover:border-dashed hover:border-black' key={index}>
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
                </div>
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
        </div>

    );
}

export default UploadSectionClient;
