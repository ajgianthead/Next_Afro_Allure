'use client'

import { Check, LayoutPanelTop, Loader2, PencilRuler } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { createEditorState, createSectionEditorState } from './actions'
import { PostgrestError } from '@supabase/supabase-js'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { PlanGateCard, GatableBusinessData } from '@/components/dashboard/PlanGate'
import { WebBuilderTour } from '@/features/tour/tours/WebBuilderTour'
import { cn } from '@/lib/utils'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

const B = {
    bg: '#FAF7F2',
    white: '#FFFFFF',
    border: '#E8E2D6',
    primary: '#FC6161',
    gold: '#C9974A',
    dark: '#1A1818',
    muted: '#6F6863',
    black: '#0F0E0E',
    cream: '#F0EBE3',
}

const DRAG_DROP_FEATURES = [
    '20+ pre-built components — Navbar, Hero, Card, Footer',
    'Full layout control with columns, rows, and grids',
    'Complete typography, color, and spacing customization',
]

const SECTIONS_FEATURES = [
    'Rich text editing with formatting tools',
    'Image upload with banner-format display',
    'Drag to reorder sections instantly',
]

interface PageProps {
    businessId: string
    urlName: string
    businessName: string
    switchType: string
    planType: 'STARTER' | 'GROWTH'
    gatableData: GatableBusinessData
}

const SelectEditorType = ({ businessId, urlName, businessName, switchType, planType, gatableData }: PageProps) => {
    const [creatingSections, setCreatingSections] = useState(false)
    const [creatingEditor, setCreatingEditor] = useState(false)
    const [showPlanGate, setShowPlanGate] = useState(false)
    const router = useRouter()
    const anyLoading = creatingSections || creatingEditor

    return (
        <div style={{ minHeight: '100vh', backgroundColor: B.bg }} className="px-4 py-12 sm:py-16">
            <WebBuilderTour />

            <Dialog open={showPlanGate} onOpenChange={setShowPlanGate}>
                <DialogContent className="max-w-sm">
                    <PlanGateCard
                        featureName="Drag & Drop Editor"
                        description="Build a fully custom booking page with our visual editor — available on Growth."
                        businessData={gatableData}
                    />
                </DialogContent>
            </Dialog>

            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div data-tour="builder-type" className="text-center mb-10">
                    <h1
                        className="text-3xl font-medium mb-3"
                        style={{ fontFamily: SERIF, color: B.dark }}
                    >
                        How would you like to build your booking page?
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: B.muted }}>
                        Choose the editor that fits your style. You can always switch later from your booking site settings.
                    </p>
                </div>

                {/* Cards */}
                <div data-tour="builder-templates" className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Drag & Drop — recommended */}
                    <button
                        disabled={anyLoading}
                        onClick={async () => {
                            if (planType === 'STARTER') {
                                setShowPlanGate(true)
                                return
                            }
                            setCreatingEditor(true)
                            const res = await createEditorState(businessId, switchType)
                            if (res instanceof PostgrestError) {
                                setCreatingEditor(false)
                                return
                            }
                            if (res) router.push(`/${urlName}/edit`)
                        }}
                        className={cn(
                            'relative flex flex-col text-left rounded-2xl p-6 gap-5 transition-all duration-200',
                            creatingEditor && 'opacity-60 pointer-events-none',
                            anyLoading && !creatingEditor && 'opacity-40 pointer-events-none'
                        )}
                        style={{
                            backgroundColor: B.white,
                            border: `1.5px solid ${B.primary}`,
                            boxShadow: '0 4px 24px -8px rgba(252,97,97,0.15)',
                        }}
                    >
                        {/* Recommended badge */}
                        <div
                            className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full"
                            style={{ backgroundColor: 'rgba(252,97,97,0.1)', color: B.primary }}
                        >
                            Recommended
                        </div>

                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(252,97,97,0.1)' }}
                        >
                            <PencilRuler size={18} style={{ color: B.primary }} />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold mb-1" style={{ color: B.dark }}>
                                Drag &amp; Drop Editor
                            </h2>
                            <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: B.muted }}>
                                Best for a custom, professional look
                            </p>
                            <p className="text-sm leading-relaxed" style={{ color: B.muted }}>
                                Build a fully custom page using a palette of pre-built components. Drag, drop, and style everything to match your brand.
                            </p>
                        </div>

                        <ul className="flex flex-col gap-2 flex-1">
                            {DRAG_DROP_FEATURES.map(f => (
                                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: B.dark }}>
                                    <Check size={13} className="mt-0.5 shrink-0" style={{ color: B.primary }} />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <div
                            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold mt-auto"
                            style={{ backgroundColor: B.primary, color: B.white }}
                        >
                            {creatingEditor && <Loader2 size={14} className="animate-spin" />}
                            {creatingEditor ? 'Setting up…' : 'Get started'}
                        </div>
                    </button>

                    {/* Section Editor */}
                    <button
                        disabled={anyLoading}
                        onClick={async () => {
                            setCreatingSections(true)
                            const res = await createSectionEditorState(businessName, businessId, switchType)
                            if (res instanceof PostgrestError) {
                                setCreatingSections(false)
                                return
                            }
                            router.push(`/dashboard/booking-site/upload-sections`)
                        }}
                        className={cn(
                            'relative flex flex-col text-left rounded-2xl p-6 gap-5 transition-all duration-200',
                            creatingSections && 'opacity-60 pointer-events-none',
                            anyLoading && !creatingSections && 'opacity-40 pointer-events-none'
                        )}
                        style={{
                            backgroundColor: B.white,
                            border: `1.5px solid ${B.border}`,
                        }}
                    >
                        {/* Simpler badge */}
                        <div
                            className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full"
                            style={{ backgroundColor: B.cream, color: B.muted }}
                        >
                            Simpler option
                        </div>

                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: B.cream }}
                        >
                            <LayoutPanelTop size={18} style={{ color: B.muted }} />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold mb-1" style={{ color: B.dark }}>
                                Section Editor
                            </h2>
                            <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: B.muted }}>
                                Best for getting up and running fast
                            </p>
                            <p className="text-sm leading-relaxed" style={{ color: B.muted }}>
                                Stack text and image blocks in a clean, structured layout. Familiar if you&apos;ve used tools like Acuity or similar platforms.
                            </p>
                        </div>

                        <ul className="flex flex-col gap-2 flex-1">
                            {SECTIONS_FEATURES.map(f => (
                                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: B.dark }}>
                                    <Check size={13} className="mt-0.5 shrink-0" style={{ color: B.muted }} />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <div
                            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold mt-auto border"
                            style={{ backgroundColor: B.bg, borderColor: B.border, color: B.dark }}
                        >
                            {creatingSections && <Loader2 size={14} className="animate-spin" />}
                            {creatingSections ? 'Setting up…' : 'Get started'}
                        </div>
                    </button>

                </div>

                <p className="text-center text-xs mt-6" style={{ color: B.muted }}>
                    Not sure?{' '}
                    <span style={{ color: B.dark, fontWeight: 500 }}>Section Editor</span> is the quickest way to get live — you can always switch to Drag &amp; Drop later.
                </p>
            </div>
        </div>
    )
}

export default SelectEditorType
