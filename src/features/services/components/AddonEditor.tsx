'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AddonData } from '../types'
import {
    createAddonAction,
    updateAddonAction,
    deleteAddonAction,
} from '../server/actions'

interface AddonEditorProps {
    businessId: string
    initialData: AddonData | null
    isEditing: boolean
    onSaved: (saved: AddonData) => void
    onDeleted: (id: string) => void
    onClose: () => void
}

export function AddonEditor({
    businessId,
    initialData,
    isEditing,
    onSaved,
    onDeleted,
    onClose,
}: AddonEditorProps) {
    const [form, setForm] = useState<{ name: string; price: string }>({
        name: initialData?.name ?? '',
        price: initialData ? String(initialData.price / 100) : '',
    })
    const [isSaving, setIsSaving] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)

    const parsedPrice = Math.round(parseFloat(form.price || '0') * 100)
    const canSave = form.name.trim().length > 0 && !isNaN(parsedPrice) && parsedPrice >= 0

    const hasChanges = isEditing && initialData
        ? form.name !== initialData.name || parsedPrice !== initialData.price
        : true

    const handleSave = async () => {
        if (!canSave) return
        setIsSaving(true)
        try {
            if (isEditing && initialData) {
                const updated = await updateAddonAction({
                    ...initialData,
                    name: form.name.trim(),
                    price: parsedPrice,
                })
                onSaved(updated)
                toast.success('Add-on updated')
            } else {
                const created = await createAddonAction(businessId, form.name.trim(), parsedPrice)
                onSaved(created)
                toast.success('Add-on created')
            }
            onClose()
        } catch (err: any) {
            toast.error(err?.message ?? 'Something went wrong')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!initialData) return
        setIsSaving(true)
        try {
            await deleteAddonAction(initialData.id)
            onDeleted(initialData.id)
            toast.success('Add-on deleted')
            onClose()
        } catch (err: any) {
            toast.error(err?.message ?? 'Delete failed')
        } finally {
            setIsSaving(false)
            setConfirmDelete(false)
        }
    }

    return (
        <Dialog open onOpenChange={(open: boolean) => { if (!open) onClose() }}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit' : 'Create'} Add-on</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Add-ons are optional sub-services clients can add when booking (e.g. Hair Wash, Deep Condition).
                    </p>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="addon-name">Name</Label>
                        <Input
                            id="addon-name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Hair Wash"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="addon-price">Price ($)</Label>
                        <Input
                            id="addon-price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            placeholder="e.g. 10"
                        />
                    </div>
                </div>

                <DialogFooter className="flex-row items-center gap-2 sm:justify-between">
                    <div>
                        {isEditing && (
                            confirmDelete ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Sure?</span>
                                    <Button size="sm" variant="destructive" disabled={isSaving} onClick={handleDelete}>
                                        {isSaving ? 'Deleting…' : 'Yes, Delete'}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                                        No
                                    </Button>
                                </div>
                            ) : (
                                <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)}>
                                    Delete
                                </Button>
                            )
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                        <Button
                            size="sm"
                            disabled={!canSave || !hasChanges || isSaving}
                            onClick={handleSave}
                        >
                            {isSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Add-on'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
