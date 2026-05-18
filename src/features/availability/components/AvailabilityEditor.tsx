'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CircleHelp } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { WeeklySchedule } from './WeeklySchedule'
import { SpecificDateSchedule } from './SpecificDateSchedule'
import { DeleteAvailabilityDialog } from './DeleteAvailabilityDialog'
import { AvailabilityData } from '../utils'
import {
    createAvailabilityAction,
    updateAvailabilityAction,
    deleteAvailabilityAction,
    checkAvailabilityToServices,
} from '../server/actions'
import { PostgrestError } from '@supabase/supabase-js'

interface AvailabilityEditorProps {
    businessId: string
    initialData: AvailabilityData
    isEditing: boolean
    isOnlyAvailability: boolean
    currentDefault: string
    onSaved: (saved: any, newDefault: string) => void
    onDeleted: (id: string) => void
    onClose: () => void
}

export function AvailabilityEditor({
    businessId,
    initialData,
    isEditing,
    isOnlyAvailability,
    currentDefault,
    onSaved,
    onDeleted,
    onClose,
}: AvailabilityEditorProps) {
    const [form, setForm] = useState<AvailabilityData>(initialData)
    const [makeDefault, setMakeDefault] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

    const isCurrentDefault = currentDefault === form.id
    const effectiveDefault = makeDefault || isCurrentDefault

    const handleSave = async () => {
        if (!form.name.trim()) return
        setIsSaving(true)
        try {
            if (isEditing) {
                const newDefault = (makeDefault ? form.id : currentDefault) ?? currentDefault
                const saved = await updateAvailabilityAction(businessId, form, form.id, newDefault)
                onSaved(saved, newDefault)
                toast.success('Availability updated')
            } else {
                const saved = await createAvailabilityAction(businessId, form)
                const newDefault = makeDefault ? form.id : currentDefault
                if (makeDefault) {
                    await updateAvailabilityAction(businessId, form, form.id, form.id)
                }
                onSaved(saved, newDefault ?? currentDefault)
                toast.success('Availability created')
            }
            onClose()
        } catch (err: any) {
            toast.error(err?.message ?? 'Something went wrong')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteRequest = async () => {
        const result = await checkAvailabilityToServices(form.id)
        if (result instanceof PostgrestError) {
            toast.error('Failed to check attached services')
            return
        }
        if (result.attachedServices) {
            toast.error("Can't delete — this availability is attached to services")
            return
        }
        setDeleteConfirmOpen(true)
    }

    const handleDeleteConfirm = async () => {
        setDeleteConfirmOpen(false)
        try {
            await deleteAvailabilityAction(businessId, form.id)
            onDeleted(form.id)
            toast.success('Availability deleted')
            onClose()
        } catch (err: any) {
            toast.error(err?.message ?? 'Delete failed')
        }
    }

    return (
        <>
            <Sheet open onOpenChange={(open) => { if (!open) onClose() }}>
                <SheetContent className="!w-[min(92vw,900px)] !max-w-none overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{isEditing ? 'Edit' : 'Create New'} Availability</SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-col gap-4 mt-4 px-1">
                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                            <Label>Name</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Regular Hours"
                            />
                        </div>

                        {/* Default checkbox — only shown when editing */}
                        {isEditing && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={effectiveDefault}
                                    disabled={isCurrentDefault}
                                    onCheckedChange={(checked) => setMakeDefault(!!checked)}
                                />
                                <Label className="cursor-pointer">Default availability</Label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger asChild>
                                            <CircleHelp className="size-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            This availability will be pre-selected for new services
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}

                        <Separator />

                        {/* Two-panel schedule */}
                        <div className="flex lg:flex-row flex-col gap-6">
                            {/* Weekly */}
                            <div className="rounded-lg border bg-card p-4 lg:w-1/2 w-full">
                                <div className="mb-4">
                                    <p className="font-semibold">Weekly Availability</p>
                                    <p className="text-sm text-muted-foreground">Set your hours for each day of the week</p>
                                </div>
                                <WeeklySchedule
                                    week={form.week}
                                    onChange={(week) => setForm({ ...form, week })}
                                />
                            </div>

                            {/* Specific dates */}
                            <div className="rounded-lg border bg-card p-4 lg:w-1/2 w-full">
                                <div className="mb-4">
                                    <p className="font-semibold">Specific Dates</p>
                                    <p className="text-sm text-muted-foreground">
                                        Override your weekly schedule for particular dates
                                    </p>
                                </div>
                                <SpecificDateSchedule
                                    specificDates={form.specificDates}
                                    onChange={(specificDates) => setForm({ ...form, specificDates })}
                                />
                            </div>
                        </div>

                        {/* Footer actions */}
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>

                            {isEditing && (
                                <TooltipProvider>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <Button
                                                    variant="destructive"
                                                    disabled={isOnlyAvailability}
                                                    onClick={handleDeleteRequest}
                                                >
                                                    Delete
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        {isOnlyAvailability && (
                                            <TooltipContent>Can&apos;t delete your only availability</TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            )}

                            <Button disabled={!form.name.trim() || isSaving} onClick={handleSave}>
                                {isSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Availability'}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <DeleteAvailabilityDialog
                open={deleteConfirmOpen}
                availabilityName={form.name}
                onCancel={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
        </>
    )
}
