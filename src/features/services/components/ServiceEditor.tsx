'use client'

import { useCallback, useEffect, useRef, useState, KeyboardEvent } from 'react'
import { toast } from 'sonner'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { ImagePlus, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { ServiceData, AddonData } from '../types'

function CategoryTagsInput({
    value,
    onChange,
}: {
    value: string[]
    onChange: (tags: string[]) => void
}) {
    const [input, setInput] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    const addTag = (tag: string) => {
        const trimmed = tag.trim()
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed])
        }
        setInput('')
    }

    const removeTag = (tag: string) => {
        onChange(value.filter((t) => t !== tag))
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag(input)
        } else if (e.key === 'Backspace' && !input && value.length > 0) {
            removeTag(value[value.length - 1])
        }
    }

    return (
        <div
            className="flex flex-wrap gap-1.5 min-h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-text"
            onClick={() => inputRef.current?.focus()}
        >
            {value.map((tag) => (
                <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-xs rounded px-1.5 py-0.5"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
                        className="hover:text-foreground"
                    >
                        <X className="size-2.5" />
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => { if (input.trim()) addTag(input) }}
                placeholder={value.length === 0 ? 'Enter category…' : ''}
                className="flex-1 min-w-30 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
        </div>
    )
}
import { DeleteServiceDialog } from './DeleteServiceDialog'
import {
    uploadImg,
    updateImg,
    getPublicImgURL,
    createServiceAction,
    updateServiceAction,
    deleteServiceAction,
} from '../server/actions'

interface ServiceEditorProps {
    businessId: string
    initialData: ServiceData
    isEditing: boolean
    isOnlyService: boolean
    availabilities: any[]
    allAddons: AddonData[]
    onSaved: (saved: any) => void
    onDeleted: (id: string) => void
    onClose: () => void
}

export function ServiceEditor({
    businessId,
    initialData,
    isEditing,
    isOnlyService,
    availabilities,
    allAddons,
    onSaved,
    onDeleted,
    onClose,
}: ServiceEditorProps) {
    const [form, setForm] = useState<ServiceData>(initialData)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(initialData.photo_url ? `${initialData.photo_url}?t=${Date.now()}` : null)
    const [checkedAddons, setCheckedAddons] = useState<Set<string>>(new Set(initialData.addons))
    const [isSaving, setIsSaving] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    // Revoke blob URL on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            if (imagePreviewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreviewUrl)
            }
        }
    }, [imagePreviewUrl])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return
        if (imagePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(imagePreviewUrl)
        setImageFile(file)
        setImagePreviewUrl(URL.createObjectURL(file))
    }, [imagePreviewUrl])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
    })

    const toggleAddon = (id: string) => {
        setCheckedAddons((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const handleSave = async () => {
        if (!form.name.trim()) return
        setIsSaving(true)
        try {
            const path = `private/images/${businessId}/services/${form.id}`
            let photo_url = form.photo_url
            let imagePath = form.imagePath

            if (imageFile) {
                if (isEditing && form.imagePath) {
                    await updateImg(path, imageFile)
                } else {
                    await uploadImg(path, imageFile)
                }
                photo_url = await getPublicImgURL(path)
                setImagePreviewUrl(`${photo_url}?t=${Date.now()}`)

                imagePath = path
            }

            const payload: ServiceData = {
                ...form,
                addons: Array.from(checkedAddons),
                photo_url,
                imagePath,
            }

            let saved: any
            if (isEditing) {
                saved = await updateServiceAction(businessId, payload)
                toast.success('Service updated')
            } else {
                saved = await createServiceAction(businessId, payload)
                toast.success('Service created')
            }
            onSaved(saved)
            onClose()
        } catch (err: any) {
            toast.error(err?.message ?? 'Something went wrong')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteConfirm = async () => {
        setDeleteOpen(false)
        setIsSaving(true)
        try {
            await deleteServiceAction(businessId, form.id)
            onDeleted(form.id)
            toast.success('Service deleted')
            onClose()
        } catch (err: any) {
            toast.error(err?.message ?? 'Delete failed')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <>
            <Sheet open onOpenChange={(open) => { if (!open) onClose() }}>
                <SheetContent className="!w-[min(92vw,580px)] !max-w-none overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{isEditing ? 'Edit Service' : 'Create Service'}</SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            {isEditing
                                ? 'Update the details of your service below'
                                : 'Enter the details of your new service below'}
                        </p>
                    </SheetHeader>

                    <div className="flex flex-col gap-5 mt-4 px-1">
                        {/* Photo */}
                        <div className="flex flex-col gap-1.5">
                            <Label>Photo</Label>
                            <div
                                {...getRootProps()}
                                className={`border border-dashed rounded-md p-3 cursor-pointer text-center flex flex-col items-center justify-center min-h-[100px] transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                            >
                                <input {...getInputProps()} />
                                {imagePreviewUrl ? (
                                    <div className="relative w-full h-40">
                                        <Image
                                            src={imagePreviewUrl}
                                            alt="Service preview"
                                            fill
                                            className="object-cover rounded"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                        <ImagePlus className="size-6" />
                                        <p className="text-xs">
                                            {isDragActive ? 'Drop here…' : 'Drag & drop or click to upload'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Availability */}
                        <div className="flex flex-col gap-1.5">
                            <Label>Availability</Label>
                            <p className="text-xs text-muted-foreground -mt-1">
                                The schedule clients will see when booking this service
                            </p>
                            <Select
                                value={form.availability}
                                onValueChange={(value) => setForm({ ...form, availability: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose availability" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availabilities.map((av: any) => (
                                        <SelectItem key={av.id} value={av.id}>
                                            {av.availability_data?.name ?? av.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                            <Label>Service Name</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Loc Retwist"
                            />
                        </div>

                        {/* Price */}
                        <div className="flex flex-col gap-1.5">
                            <Label>Base Price ($)</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price > 0 ? (form.price / 100).toString() : ''}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value)
                                    setForm({ ...form, price: isNaN(val) ? 0 : Math.round(val * 100) })
                                }}
                                placeholder="e.g. 80"
                            />
                        </div>

                        {/* Duration */}
                        <div className="flex flex-col gap-1.5">
                            <Label>Duration (minutes)</Label>
                            <Input
                                type="number"
                                min="0"
                                value={form.length > 0 ? form.length.toString() : ''}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value)
                                    setForm({ ...form, length: isNaN(val) ? 0 : val })
                                }}
                                placeholder="e.g. 180"
                            />
                        </div>

                        {/* Categories */}
                        <div className="flex flex-col gap-1.5">
                            <Label>Categories</Label>
                            <p className="text-xs text-muted-foreground -mt-1">
                                Type a category and press <strong>Enter</strong> to add it
                            </p>
                            <CategoryTagsInput
                                value={form.categories ?? []}
                                onChange={(tags) => setForm({ ...form, categories: tags })}
                            />
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-1.5">
                            <Label>Description</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Describe your service…"
                                rows={3}
                            />
                        </div>

                        {/* Addons */}
                        {allAddons.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                                <Label>Add-ons</Label>
                                <p className="text-xs text-muted-foreground -mt-1">
                                    Select which add-ons are available with this service
                                </p>
                                <div className="flex flex-col gap-2 mt-1">
                                    {allAddons.map((addon) => (
                                        <div key={addon.id} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`addon-${addon.id}`}
                                                checked={checkedAddons.has(addon.id)}
                                                onCheckedChange={() => toggleAddon(addon.id)}
                                            />
                                            <label
                                                htmlFor={`addon-${addon.id}`}
                                                className="text-sm cursor-pointer select-none"
                                            >
                                                {addon.name}
                                                <span className="ml-1.5 text-xs text-muted-foreground">
                                                    +{(addon.price / 100).toFixed(2).replace(/\.00$/, '')}
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-2 pt-2 pb-6">
                            <Button variant="outline" onClick={onClose} disabled={isSaving}>
                                Cancel
                            </Button>

                            {isEditing && (
                                <TooltipProvider>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <Button
                                                    variant="destructive"
                                                    disabled={isOnlyService || isSaving}
                                                    onClick={() => setDeleteOpen(true)}
                                                >
                                                    Delete
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        {isOnlyService && (
                                            <TooltipContent>
                                                Can&apos;t delete your only service
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            )}

                            <Button
                                disabled={!form.name.trim() || isSaving}
                                onClick={handleSave}
                            >
                                {isSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Service'}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <DeleteServiceDialog
                open={deleteOpen}
                serviceName={form.name}
                onCancel={() => setDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
        </>
    )
}
