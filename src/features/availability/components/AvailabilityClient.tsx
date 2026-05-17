'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { AvailabilityCard } from './AvailabilityCard'
import { AvailabilityEditor } from './AvailabilityEditor'
import { createDefaultAvailability, AvailabilityData } from '../utils'
import { useUserContext } from '@/app/utils/context/UserContext'
import { createSubscriptionCheckout, createSubscriptionForExistingCustomer } from 'app/for-businesses/actions'
import { AvailabilityTour } from '@/features/tour/tours/AvailabilityTour'

interface AvailabilityClientProps {
    availabilitiesData: any[]
    defaultAvailabilityData: string
    planType: 'STARTER' | 'GROWTH'
    hadTrial: boolean
    businessId: string
    stripeCustomerId: string | null
}

export default function AvailabilityClient({
    availabilitiesData,
    defaultAvailabilityData,
    planType,
    hadTrial,
    businessId,
    stripeCustomerId,
}: AvailabilityClientProps) {
    const { user } = useUserContext()
    const router = useRouter()
    const [availabilities, setAvailabilities] = useState<any[]>(availabilitiesData)
    const [defaultAvailable, setDefaultAvailable] = useState(defaultAvailabilityData)
    const [editorOpen, setEditorOpen] = useState(false)
    const [editorKey, setEditorKey] = useState(0)
    const [editingData, setEditingData] = useState<AvailabilityData | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [upgrading, setUpgrading] = useState(false)

    const atLimit = planType === 'STARTER' && availabilities.length >= 1

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

    const handleUpgrade = async () => {
        setUpgrading(true)
        const session = stripeCustomerId
            ? await createSubscriptionForExistingCustomer(stripeCustomerId)
            : await createSubscriptionCheckout(hadTrial, businessId)
        router.push(session.url!)
    }

    return (
        <div className="px-6">
            <AvailabilityTour />
            <div data-tour="availability-default" className="w-full mt-5 flex justify-between items-center gap-6">
                <h2 className="text-lg font-semibold">Availability</h2>

                {planType === 'STARTER' ? (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                            {availabilities.length} / 1 used
                        </span>
                        <div data-tour="availability-multiple">
                            <Button onClick={openCreate} disabled={atLimit}>
                                + Create New
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div data-tour="availability-multiple">
                        <Button onClick={openCreate}>+ Create New</Button>
                    </div>
                )}
            </div>

            {atLimit && (
                <div className="mt-3 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: '#E8E2D6', backgroundColor: '#FAF7F2' }}>
                    <p style={{ color: '#1A1818' }}>
                        Starter plan includes 1 availability schedule.{' '}
                        <span style={{ color: '#6F6863' }}>
                            Upgrade to Growth to create unlimited schedules for different services and seasons.
                        </span>
                    </p>
                    <button
                        onClick={handleUpgrade}
                        disabled={upgrading}
                        className="mt-2 text-sm font-medium disabled:opacity-50"
                        style={{ color: '#C9974A' }}
                    >
                        {upgrading ? 'Redirecting…' : 'Upgrade to Growth →'}
                    </button>
                </div>
            )}

            <Separator className="my-3" />

            <div data-tour="availability-list" className="flex flex-wrap gap-3 w-full">
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
