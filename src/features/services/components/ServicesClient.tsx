'use client'

import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ServiceCard } from './ServiceCard'
import { ServiceEditor } from './ServiceEditor'
import { AddonManager } from './AddonManager'
import { AddonEditor } from './AddonEditor'
import { ServiceData, AddonData } from '../types'
import { createDefaultService } from '../utils'
import { ServicesTour } from '@/features/tour/tours/ServicesTour'
import { AddonsTour } from '@/features/tour/tours/AddonsTour'

interface ServicesClientProps {
    servicesData: any[]
    addonsData: AddonData[]
    availabilitiesData: any[]
    defaultAvailability: string
    businessId: string
}

export default function ServicesClient({
    servicesData,
    addonsData,
    availabilitiesData,
    defaultAvailability,
    businessId,
}: ServicesClientProps) {
    const [services, setServices] = useState<any[]>(servicesData)
    const [addons, setAddons] = useState<AddonData[]>(addonsData)

    // Service editor
    const [editorOpen, setEditorOpen] = useState(false)
    const [editorKey, setEditorKey] = useState(0)
    const [editingService, setEditingService] = useState<ServiceData | null>(null)
    const [isEditing, setIsEditing] = useState(false)

    // Addon editor
    const [addonEditorOpen, setAddonEditorOpen] = useState(false)
    const [addonEditorKey, setAddonEditorKey] = useState(0)
    const [editingAddon, setEditingAddon] = useState<AddonData | null>(null)
    const [isEditingAddon, setIsEditingAddon] = useState(false)

    // ── Service handlers ────────────────────────────────────────────────────────

    const openCreate = () => {
        setEditingService(createDefaultService(businessId, defaultAvailability))
        setIsEditing(false)
        setEditorKey((k) => k + 1)
        setEditorOpen(true)
    }

    const openEdit = (service: any) => {
        setEditingService(structuredClone(service) as ServiceData)
        setIsEditing(true)
        setEditorKey((k) => k + 1)
        setEditorOpen(true)
    }

    const handleServiceSaved = (saved: any) => {
        const savedWithBuster = {
            ...saved,
            photo_url: saved.photo_url ? `${saved.photo_url}?t=${Date.now()}` : null
        }

        setServices((prev) => {
            const idx = prev.findIndex((s) => s.id === savedWithBuster.id)
            if (idx >= 0) {
                const next = [...prev]
                next[idx] = savedWithBuster
                return next
            }
            return [...prev, savedWithBuster]
        })
        setEditorOpen(false)
    }

    const handleServiceDeleted = (id: string) => {
        setServices((prev) => prev.filter((s) => s.id !== id))
        setEditorOpen(false)
    }

    // ── Addon handlers ──────────────────────────────────────────────────────────

    const openCreateAddon = () => {
        setEditingAddon(null)
        setIsEditingAddon(false)
        setAddonEditorKey((k) => k + 1)
        setAddonEditorOpen(true)
    }

    const openEditAddon = (addon: AddonData) => {
        setEditingAddon(structuredClone(addon))
        setIsEditingAddon(true)
        setAddonEditorKey((k) => k + 1)
        setAddonEditorOpen(true)
    }

    const handleAddonSaved = (saved: AddonData) => {
        setAddons((prev) => {
            const idx = prev.findIndex((a) => a.id === saved.id)
            if (idx >= 0) {
                const next = [...prev]
                next[idx] = saved
                return next
            }
            return [...prev, saved]
        })
        setAddonEditorOpen(false)
    }

    const handleAddonDeleted = (id: string) => {
        setAddons((prev) => prev.filter((a) => a.id !== id))
        setAddonEditorOpen(false)
    }

    return (
        <div className="px-6">
            <ServicesTour />
            <AddonsTour />
            {/* Header */}
            <div data-tour="services-header" className="w-full mt-5 flex justify-between items-center gap-6">
                <h2 className="text-lg font-semibold">Services</h2>
                <div className="flex items-center gap-2">
                    <div data-tour="addons-create">
                        <AddonManager
                            addons={addons}
                            onCreateAddon={openCreateAddon}
                            onEditAddon={openEditAddon}
                        />
                    </div>
                    <div data-tour="services-add">
                        <Button onClick={openCreate}>+ Create Service</Button>
                    </div>
                </div>
            </div>

            <Separator className="my-3" />

            {/* Grid */}
            <div data-tour="services-list">
                {services.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                        <p className="text-sm">No services yet.</p>
                        <p className="text-xs mt-1">Create your first service to get started.</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {services.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onClick={() => openEdit(service)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Service editor Sheet */}
            {editorOpen && editingService && (
                <ServiceEditor
                    key={editorKey}
                    businessId={businessId}
                    initialData={editingService}
                    isEditing={isEditing}
                    isOnlyService={services.length === 1}
                    availabilities={availabilitiesData}
                    allAddons={addons}
                    onSaved={handleServiceSaved}
                    onDeleted={handleServiceDeleted}
                    onClose={() => setEditorOpen(false)}
                />
            )}

            {/* Addon editor Dialog */}
            {addonEditorOpen && (
                <AddonEditor
                    key={addonEditorKey}
                    businessId={businessId}
                    initialData={editingAddon}
                    isEditing={isEditingAddon}
                    onSaved={handleAddonSaved}
                    onDeleted={handleAddonDeleted}
                    onClose={() => setAddonEditorOpen(false)}
                />
            )}
        </div>
    )
}
