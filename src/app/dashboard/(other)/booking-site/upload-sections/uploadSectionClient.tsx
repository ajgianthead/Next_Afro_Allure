'use client'

import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import { deleteUploadedImg, saveSectionData, uploadImgSectionChanges } from '../actions';
import { ChevronLeft, GripVertical, ImageIcon, Loader2, Pencil, Trash, Type, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import content from "@tailus-ui/components/tiptap-templates/simple/data/content.json";
import { closestCorners, DndContext, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Database, Json } from '../../../../../../lib/database.types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import TextSection from './textSection';

const UploadSectionClient = ({ businessId, editorId, url_name, section_data, uploadedImageUrls, isPublished }: {
    businessId: string
    editorId: string
    url_name: string
    section_data: {
        business_id: string | null;
        created_at: string;
        editor_data: string | null;
        id: string;
        image_objects: Json[] | null;
        section_data: Json[] | null;
        type: Database["public"]["Enums"]["web_editor"] | null;
        updated_at: string | null;
    } | null
    uploadedImageUrls: { url: string; id: string }[]
    isPublished: boolean
}) => {
    const [imageURLS, setImageURLS] = useState<{ url: string; id: string }[]>(uploadedImageUrls)
    const [editorState, setEditorState] = useState<any[]>(
        section_data?.section_data?.length
            ? section_data.section_data
            : [{ id: crypto.randomUUID(), type: 'text', html: '<p>Type here...</p>', content, editing: false }]
    )
    const [openImageModal, setOpenImageModal] = useState<{ open: boolean; sectionId: string }>({ open: false, sectionId: '' })
    const [savingData, setSavingData] = useState(false)
    const [initialData, setInitialData] = useState<any[]>([...(section_data?.section_data ?? [])])
    const [imgDeleting, setImgDeleting] = useState('')
    const [deletingImg, setDeletingImg] = useState(false)
    const router = useRouter()

    const getSectionPosition = (id: UniqueIdentifier) => editorState.findIndex(s => s.id === id)

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setEditorState(prev => arrayMove(prev, getSectionPosition(active.id), getSectionPosition(over.id)))
    }

    const hasChanges = useMemo(() => {
        const strip = (arr: any[]) => arr.map(({ editing, ...rest }) => rest)
        return JSON.stringify(strip(editorState)) !== JSON.stringify(strip(initialData))
    }, [editorState, initialData])

    const handleSave = async () => {
        setSavingData(true)
        const res = await saveSectionData(editorState, businessId, isPublished)
        if (res) {
            setEditorState(res.section_data!)
            setInitialData(res.section_data!)
            toast.success('Changes saved')
        } else {
            toast.error('Failed to save changes')
        }
        setSavingData(false)
    }

    return (
        <div className="min-h-screen flex flex-col">

            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-background border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => router.back()}>
                        <ChevronLeft className="size-4" />
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-sm font-semibold">Section Editor</h1>
                        <p className="hidden sm:block text-xs text-muted-foreground">Drag to reorder · click Edit to modify</p>
                    </div>
                </div>
                <Button size="sm" disabled={!hasChanges || savingData} onClick={handleSave} className="shrink-0">
                    {savingData && <Loader2 className="size-4 animate-spin mr-2" />}
                    {isPublished ? 'Save Changes' : 'Publish Site'}
                </Button>
            </div>

            {/* URL bar */}
            <div className="px-4 sm:px-6 py-2.5 border-b bg-muted/30">
                <p className="text-xs text-muted-foreground flex items-center gap-1 min-w-0">
                    <span className="shrink-0">Booking site:</span>
                    <Link
                        href={`${process.env.NEXT_PUBLIC_BASE_URL}/${url_name}`}
                        target="_blank"
                        className="font-medium text-foreground underline-offset-2 hover:underline truncate"
                    >
                        {`${process.env.NEXT_PUBLIC_BASE_URL}/${url_name}`}
                    </Link>
                </p>
            </div>

            {/* Image picker modal */}
            <Dialog
                open={openImageModal.open}
                onOpenChange={(open) => setOpenImageModal({ open, sectionId: open ? openImageModal.sectionId : '' })}
            >
                <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Select an Image</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground -mt-2">
                        Upload a new image or choose one you've already added.
                    </p>

                    <Button variant="outline" className="flex gap-2 w-full items-center" asChild>
                        <label>
                            <Upload className="size-4" />
                            Upload Image
                            <input
                                type="file"
                                className="sr-only"
                                onChange={async (e) => {
                                    const id = crypto.randomUUID()
                                    const url = await uploadImgSectionChanges({ id, fileBody: e.target.files![0] }, businessId)
                                    setImageURLS(prev => [...prev, { url, id }])
                                }}
                            />
                        </label>
                    </Button>

                    <Separator />

                    {imageURLS.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                            <ImageIcon className="size-8 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">No images uploaded yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                            {imageURLS.map((imgObj) => (
                                <div key={imgObj.id} className="relative group">
                                    <div
                                        className="relative h-20 sm:h-24 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer transition-colors"
                                        onClick={() => {
                                            if (openImageModal.sectionId.length) {
                                                setEditorState(prev => {
                                                    const clone = [...prev]
                                                    const idx = clone.findIndex(s => s.id === openImageModal.sectionId)
                                                    clone[idx] = { id: openImageModal.sectionId, imgId: imgObj.id, type: 'image', url: imgObj.url, editing: false }
                                                    return clone
                                                })
                                            } else {
                                                setEditorState(prev => [...prev, { id: crypto.randomUUID(), imgId: imgObj.id, type: 'image', url: imgObj.url, editing: false }])
                                            }
                                            setOpenImageModal({ open: false, sectionId: '' })
                                        }}
                                    >
                                        <Image src={imgObj.url} alt="section-image" fill className="object-cover" />
                                    </div>
                                    <button
                                        disabled={deletingImg}
                                        className="absolute top-1 right-1 size-6 rounded-md bg-background/80 backdrop-blur-sm border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        onClick={async (e) => {
                                            e.stopPropagation()
                                            setImgDeleting(imgObj.id)
                                            setDeletingImg(true)
                                            await deleteUploadedImg(imgObj.id, businessId)
                                            setImageURLS(prev => prev.filter(img => img.id !== imgObj.id))
                                            setDeletingImg(false)
                                            setImgDeleting('')
                                        }}
                                    >
                                        {deletingImg && imgDeleting === imgObj.id
                                            ? <Loader2 className="size-3 animate-spin" />
                                            : <Trash className="size-3" />
                                        }
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Main content */}
            <div className="flex-1 max-w-5xl mx-auto w-full px-3 py-5 sm:px-6 sm:py-8">
                <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
                    <SortableContext items={editorState.map(item => item.id)} strategy={verticalListSortingStrategy}>
                        {editorState.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                                <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                                    <Type className="size-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">No sections yet</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Add a text or image section below to get started</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {editorState.map((element, index) => (
                                    <WebSection
                                        key={element.id}
                                        element={element}
                                        index={index}
                                        editorState={editorState}
                                        setEditorState={setEditorState}
                                        setOpenImageModal={setOpenImageModal}
                                    />
                                ))}
                            </div>
                        )}
                    </SortableContext>
                </DndContext>

                {/* Add section */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 sm:h-14 gap-2 border-dashed border-2"
                        onClick={() => setEditorState(prev => [...prev, {
                            id: crypto.randomUUID(),
                            type: 'text',
                            html: '<p>Type here...</p>',
                            content,
                            editing: true,
                        }])}
                    >
                        <Type className="size-4" />
                        Add Text Section
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 h-12 sm:h-14 gap-2 border-dashed border-2"
                        onClick={() => setOpenImageModal({ open: true, sectionId: '' })}
                    >
                        <ImageIcon className="size-4" />
                        Add Image Section
                    </Button>
                </div>
            </div>
        </div>
    )
}

const WebSection = ({ element, editorState, setEditorState, index, setOpenImageModal }: any) => {
    const isEditing = element.type === 'text' && element.editing

    const { transform, transition, attributes, listeners, setNodeRef } = useSortable({
        id: element.id,
        disabled: isEditing,
    })
    const style = { transform: CSS.Transform.toString(transform), transition }

    const handleDelete = () => {
        setEditorState((prev: any[]) => {
            const clone = [...prev]
            clone.splice(index, 1)
            return clone
        })
    }

    const handleEdit = () => {
        setEditorState((prev: any[]) => {
            const updated = [...prev]
            updated[index] = { ...prev[index], editing: true }
            return updated
        })
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'w-full rounded-xl border bg-card flex items-stretch overflow-hidden transition-shadow',
                isEditing && 'shadow-md ring-1 ring-ring'
            )}
        >
            {/* Drag handle */}
            <div
                {...attributes}
                {...listeners}
                className={cn(
                    'flex items-center px-2.5 border-r transition-colors',
                    isEditing
                        ? 'cursor-default text-muted-foreground/20'
                        : 'cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground'
                )}
            >
                <GripVertical className="size-4" />
            </div>

            {/* Content */}
            <div className={cn('flex-1 min-w-0', isEditing ? 'p-3 sm:p-4' : 'p-2.5 sm:p-3')}>
                {element.type === 'text' ? (
                    <TextSection editorState={editorState} setEditorState={setEditorState} index={index} />
                ) : (
                    <div className="relative w-full h-28 sm:h-36 rounded-lg overflow-hidden">
                        <Image src={element.url} alt="section-image" fill className="object-cover" />
                    </div>
                )}
            </div>

            {/* Actions — hidden while a text section is in edit mode */}
            {!isEditing && (
                <div className="flex flex-col items-center justify-center gap-1 px-2 border-l">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={element.type === 'text'
                            ? handleEdit
                            : () => setOpenImageModal({ open: true, sectionId: element.id })
                        }
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={handleDelete}
                    >
                        <Trash className="size-3.5" />
                    </Button>
                </div>
            )}
        </div>
    )
}

export default UploadSectionClient;
