'use client'

import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { AvailabilityCard } from './AvailabilityCard'
import { AvailabilityEditor } from './AvailabilityEditor'
import { createDefaultAvailability, AvailabilityData } from '../utils'
import { useUserContext } from '@/app/utils/context/UserContext'

interface AvailabilityClientProps {
    availabilitiesData: any[]
    defaultAvailabilityData: string
}

export default function AvailabilityClient({
    availabilitiesData,
    defaultAvailabilityData,
}: AvailabilityClientProps) {
    const { user } = useUserContext()
    const [availabilities, setAvailabilities] = useState<any[]>(availabilitiesData)
    const [defaultAvailable, setDefaultAvailable] = useState(defaultAvailabilityData)
    const [editorOpen, setEditorOpen] = useState(false)
    const [editorKey, setEditorKey] = useState(0)
    const [editingData, setEditingData] = useState<AvailabilityData | null>(null)
    const [isEditing, setIsEditing] = useState(false)

    const openCreate = () => {
        setEditingData(createDefaultAvailability())
        setIsEditing(false)
        setEditorKey((k) => k + 1)
        setEditorOpen(true)
    }

    const openEdit = (element: any) => {
        setEditingData(structuredClone(element.availability_data) as AvailabilityData)
        setIsEditing(true)
        setEditorKey((k) => k + 1)
        setEditorOpen(true)
    }

    const handleSaved = (saved: any, newDefault: string) => {
        setAvailabilities((prev) => {
            const idx = prev.findIndex((a) => a.id === saved.id)
            if (idx >= 0) {
                const next = [...prev]
                next[idx] = saved
                return next
            }
            return [...prev, saved]
        })
        setDefaultAvailable(newDefault)
        setEditorOpen(false)
    }

    const handleDeleted = (id: string) => {
        setAvailabilities((prev) => prev.filter((a) => a.id !== id))
        setEditorOpen(false)
    }

    return (
        <div className="px-6">
            <div className="w-full mt-5 flex justify-between items-center gap-6">
                <h2 className="text-lg font-semibold">Availability</h2>
                <Button onClick={openCreate}>+ Create New</Button>
            </div>

            <Separator className="my-3" />

            <div className="flex flex-wrap gap-3 w-full">
                {availabilities.map((element) => (
                    <AvailabilityCard
                        key={element.id}
                        availability={element}
                        isDefault={defaultAvailable === element.id}
                        onClick={() => openEdit(element)}
                    />
                ))}
            </div>

            {editorOpen && editingData && (
                <AvailabilityEditor
                    key={editorKey}
                    businessId={user.business_id!}
                    initialData={editingData}
                    isEditing={isEditing}
                    isOnlyAvailability={availabilities.length === 1}
                    currentDefault={defaultAvailable}
                    onSaved={handleSaved}
                    onDeleted={handleDeleted}
                    onClose={() => setEditorOpen(false)}
                />
            )}
        </div>
    )
}
