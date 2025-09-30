'use client'

import { AspectRatio, Button, CircularProgress, Divider, IconButton, Input, Modal, ModalClose, ModalDialog, styled, Typography } from '@mui/joy';
import { Caption, Text, Title } from '@tailus-ui/typography';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { deleteSectionImage, deleteUploadedImg, editSectionImage, saveSectionData, uploadImgSectionChanges } from '../actions';
import { ChevronLeftIcon, Pencil, Trash, Type, Image as ImageIcon, Upload, X, Menu, ImageDown, GripVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SimpleEditor } from '@tailus-ui/components/tiptap-templates/simple/simple-editor';
import LOGO_IMG from '../../../../../../public/images/logo.jpg'
import TextSection from './textSection';
import content from "@tailus-ui/components/tiptap-templates/simple/data/content.json";
import { closestCorners, DndContext, DragOverEvent, UniqueIdentifier, useDraggable, useDroppable } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Database, Json } from '../../../../../../lib/database.types';

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


const UploadSectionClient = ({ businessId, editorId, url_name, section_data, uploadedImageUrls }: {
    businessId: string, editorId: string, url_name: string, section_data: {
        business_id: string | null;
        created_at: string;
        editor_data: string | null;
        id: string;
        image_objects: Json[] | null;
        section_data: Json[] | null;
        type: Database["public"]["Enums"]["web_editor"] | null;
        updated_at: string | null;
    } | null
    uploadedImageUrls: {
        url: string;
        id: string;
    }[]
}) => {
    const [imageURLS, setImageURLS] = useState<{ url: string, id: string }[]>(uploadedImageUrls)
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter()
    const [editorState, setEditorState] = useState<any[]>(section_data?.section_data?.length ? section_data.section_data : [{
        id: crypto.randomUUID(),
        type: 'text',
        html: "<p>Type here...<p>",
        content: content,
        editing: false
    }])
    const getSectionPosition = (id: UniqueIdentifier) => editorState.findIndex(section => section.id === id)
    const [selectImage, setSelectImage] = useState<boolean>(false)
    const handleDragEnd = (event: DragOverEvent) => {
        const { active, over } = event;
        if (active.id === over!.id) {
            return
        }
        setEditorState(editorState => {
            const originalPosition = getSectionPosition(active!.id)
            const newPosition = getSectionPosition(over!.id)
            return arrayMove(editorState, originalPosition, newPosition)
        })
    }
    const [openImageModal, setOpenImageModal] = useState<{ open: boolean, sectionId: string }>({ open: false, sectionId: "" })
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [savingData, setSavingData] = useState<boolean>(false)
    const [initialData, setInitialData] = useState<any[]>([...section_data?.section_data!])
    const [imgDeleting, setImgDeleting] = useState<string>("")
    const [deletingImg, setDeletingImg] = useState<boolean>(false)
    return (

        <div>
            <Modal open={openImageModal.open} onClose={() => {
                setOpenImageModal({ open: false, sectionId: "" })
            }}>
                <ModalDialog size='lg' sx={{
                    width: "60%"
                }}>
                    <ModalClose />
                    <div>
                        <Typography level='h4'>Select an Image</Typography>
                        <Caption>Upload an image from your device and select one to add to your section</Caption>
                    </div>
                    <div>
                        <Button className='flex gap-2 w-full items-center' onClick={() => {
                            setOpenImageModal({ open: true, sectionId: "" })
                        }} component='label' role={undefined} variant='outlined'><Upload size={16} />
                            <VisuallyHiddenInput type='file' onChange={
                                async (e) => {
                                    const id = crypto.randomUUID()
                                    const url = await uploadImgSectionChanges({
                                        id: id,
                                        fileBody: e.target.files![0],
                                    }, businessId)
                                    setImageURLS([...imageURLS, { url: url, id: id }])
                                }

                            } />
                            Upload Image</Button>
                        <Divider orientation='horizontal' sx={{
                            marginTop: 2
                        }} />
                    </div>
                    <div className='flex w-full h-full gap-2 flex-wrap mb-5 justify-evenly overflow-y-scroll'>
                        {imageURLS.length ? imageURLS.map((imgObj, index) => {
                            return (
                                <div className='relative' key={index}>
                                    <div className='absolute z-20 right-0'>
                                        <IconButton disabled={deletingImg} onClick={async () => {
                                            setImgDeleting(imgObj.id)
                                            setDeletingImg(true)
                                            const res = await deleteUploadedImg(imgObj.id, businessId)
                                            let clone = [...imageURLS]
                                            clone.splice(index, 1)
                                            setImageURLS(clone)
                                            setDeletingImg(false)
                                            setImgDeleting("")
                                        }} size='sm' color='danger' variant='plain'>
                                            {deletingImg && imgDeleting === imgObj.id ? <CircularProgress size='sm' /> : <Trash size={12} />}
                                        </IconButton>
                                    </div>
                                    <div onClick={() => {

                                        if (openImageModal.sectionId.length) {
                                            let clone = [...editorState]
                                            const index = clone.findIndex((section) => section.id === openImageModal.sectionId)
                                            clone[index] = {
                                                id: openImageModal.sectionId,
                                                imgId: imgObj.id,
                                                type: 'image',
                                                url: imgObj.url,
                                                editing: false
                                            }
                                            setEditorState(clone)
                                        } else {
                                            setEditorState([...editorState,
                                            {
                                                id: crypto.randomUUID(),
                                                imgId: imgObj.id,
                                                type: 'image',
                                                url: imgObj.url,
                                                editing: false
                                            }
                                            ])
                                        }
                                        setOpenImageModal({ open: false, sectionId: "" })
                                    }} className='relative'>
                                        <ImageContainer selectedImage={selectedImage} index={index} url={imgObj.url} />
                                    </div>
                                </div>
                            )
                        }) : <div className='w-full flex justify-center italic text-center'>
                            <Caption>No images available</Caption>
                        </div>}

                    </div>
                </ModalDialog>
            </Modal>
            <div className='flex w-full justify-start flex-col mb-10 pl-6'>
                <Title className='flex items-center mb-2 gap-2'>
                    <IconButton component='a' onClick={() => {
                        router.back()
                    }}>
                        <ChevronLeftIcon /></IconButton>Upload and Edit Sections</Title>
                <Caption className='pr-6'>Below, you are able to upload, edit, or delete sections of your site. Click the pencil icon to edit a section, or the trash can icon to delete. <strong>Updates to your booking site happen in realtime</strong></Caption>
                <Caption><strong> NOTE: ALL IMAGES WILL APPEAR IN BANNER FORMAT, MEANING ALL IMAGES WILL APPEAR IN 683 x 384 on your official booking site</strong></Caption>
                <Caption>Don't forget to save your changes at the ve</Caption>
                <div className=''>
                    <Caption className=' font-medium '>Booking Site URL: <Link className='underline' href={`${process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_PROD_BASE_URL : process.env.NEXT_PUBLIC_BASE_URL}/${url_name}`} target='_blank'>{`beta.afroallure.co/${url_name}`}</Link></Caption>
                </div>
            </div>
            <DndContext onDragOver={handleDragEnd} collisionDetection={closestCorners}>
                <div className='flex'>
                    <div className='w-full flex flex-col items-center justify-start h-[calc(100vh-204px)] overflow-y-scroll p-10 pb-0'>
                        <div className='w-full relative flex justify-center flex-col items-center'>
                            {loading ? <div className='w-full absolute h-full top-0 z-10 flex justify-center items-center bg-transparent'>
                                <CircularProgress size='lg' />
                            </div> : <></>}

                            <SortableContext items={editorState.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                                {editorState.map((element, index) => {
                                    return (
                                        <WebSection setOpenImageModal={setOpenImageModal} element={element} index={index} editorState={editorState} setEditorState={setEditorState} />
                                    )
                                })}
                            </SortableContext>


                        </div>
                        <div className='flex w-full gap-2 px-10 h-1/4'>
                            <AspectRatio sx={{
                                width: '50%'
                            }}>
                                <Button onClick={(e) => {
                                    setEditorState([...editorState,
                                    {
                                        id: crypto.randomUUID(),
                                        type: 'text',
                                        html: "<p>Type here...<p>",
                                        content: content,
                                        editing: true
                                    }
                                    ])
                                }}
                                    sx={{
                                        paddingY: 5,
                                        borderStyle: 'dashed',
                                        borderWidth: 2,
                                        marginTop: 2,
                                        marginBottom: 5,
                                        width: '50%'
                                    }}
                                    tabIndex={-1}
                                    variant="outlined"
                                    color="neutral" className='w-5/6 p-20'>
                                    <Caption className='flex flex-col items-center gap-2 text-center'>
                                        <Type size={50} />
                                        + Add Text Section
                                    </Caption>
                                    <VisuallyHiddenInput />
                                </Button>
                            </AspectRatio>
                            <AspectRatio sx={{
                                width: '50%'
                            }}>
                                <Button onClick={() => {
                                    // setSelectImage(true)
                                    setOpenImageModal({ open: true, sectionId: "" })

                                }}
                                    role={undefined}
                                    sx={{
                                        paddingY: 5,
                                        borderStyle: 'dashed',
                                        borderWidth: 2,
                                        marginTop: 2,
                                        marginBottom: 5,
                                        width: '50%'
                                    }}
                                    tabIndex={-1}
                                    variant="outlined"
                                    color="neutral" className='w-5/6 p-20'>
                                    <Caption className='flex flex-col items-center gap-2 text-center'>
                                        <ImageIcon size={50} />
                                        + Add Image Section
                                    </Caption>
                                    <VisuallyHiddenInput />
                                </Button>
                            </AspectRatio>
                        </div>

                    </div>

                </div>
            </DndContext>
            <div className='my-10 flex justify-end pr-10'>
                <Button disabled={(() => {
                    let cloneEditorState = []
                    let cloneInitialState = []
                    for (let i = 0; i < editorState.length; i++) {
                        const { editing: editState, ...restOfObjectEditorState } = editorState[i]
                        cloneEditorState.push({
                            ...restOfObjectEditorState
                        })
                        if (initialData[i]) {
                            const { editing, ...restOfObj } = initialData[i]
                            cloneInitialState.push({
                                ...restOfObj
                            })
                        }
                    }
                    return (JSON.stringify(cloneEditorState) === JSON.stringify(cloneInitialState))
                })()} onClick={async () => {
                    setSavingData(true)
                    const res = await saveSectionData(editorState, businessId)
                    setEditorState(res?.section_data!)
                    setInitialData(res?.section_data!)
                    setSavingData(false)
                }}>{savingData ? <CircularProgress size='sm' /> : "Save Changes"}</Button>
            </div>
        </div >



    );
}

const ImageContainer = ({ index, url, selectedImage }: { index: number, url: string, selectedImage: string }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `draggable-${index}`,
    });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    useEffect(() => {

        return () => {

        };
    }, [selectedImage]);

    return (
        <AspectRatio ref={setNodeRef} style={style} {...listeners} {...attributes} objectFit='contain' sx={{
            width: 150,
            height: 100,


        }}>
            <Image style={{
                borderWidth: selectedImage === url ? 1 : 0,
                borderColor: 'black',

            }} height={100} width={200} src={url} alt='section-image' />
        </AspectRatio>
    )
}

const WebSection = ({ element, editorState, setEditorState, index, setOpenImageModal }: any) => {
    const { transform, transition, attributes, listeners, setNodeRef } = useSortable({ id: element.id })
    const { isOver, setNodeRef: nodeRef } = useDroppable({
        id: 'droppable'
    })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }
    return (
        <div ref={setNodeRef} style={style} key={element.id} className='w-full my-5  flex items-center gap-2 justify-between'>
            <div {...attributes} {...listeners}>
                <GripVertical size={16} />
            </div>
            {element.type === 'text' ? <TextSection editorState={editorState} setEditorState={setEditorState} index={index} /> : <>
                <div className='w-full h-[220px] border-2 border-dashed rounded border-gray-200 relative'>
                    <div className='absolute z-20 right-0'>
                        <IconButton onClick={() => {
                            let clone = [...editorState]
                            clone.splice(index, 1)
                            setEditorState(clone)
                        }} size='sm' color='danger' variant='plain'>
                            <Trash size={16} />
                        </IconButton>
                    </div>
                    <div className='relative h-full'>
                        <div ref={nodeRef} className='w-full gap-2 flex-col h-full flex justify-center items-center cursor-pointer' onClick={() => {
                            setOpenImageModal({ open: true, sectionId: element.id })
                        }}>
                            <Image src={element.url} alt='section-image' width={200} height={220} />
                        </div>
                    </div>
                </div>
            </>}
        </div>
    )
}

export default UploadSectionClient;
