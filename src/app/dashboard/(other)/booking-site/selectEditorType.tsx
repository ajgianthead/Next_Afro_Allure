'use client'

import { Check, LayoutPanelTop, Loader2, PencilRuler } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { createEditorState, createSectionEditorState } from './actions';
import { PostgrestError } from '@supabase/supabase-js';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PlanGateCard, GatableBusinessData } from '@/components/dashboard/PlanGate';

interface PageProps {
    businessId: string
    urlName: string
    businessName: string
    switchType: string
    planType: 'STARTER' | 'GROWTH'
    gatableData: GatableBusinessData
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

const SelectEditorType = ({ businessId, urlName, businessName, switchType, planType, gatableData }: PageProps) => {
    const [creatingSections, setCreatingSections] = useState(false)
    const [creatingEditor, setCreatingEditor] = useState(false)
    const [showPlanGate, setShowPlanGate] = useState(false)
    const router = useRouter()
    const anyLoading = creatingSections || creatingEditor

    return (
        <div className="max-w-3xl mx-auto px-6 py-16">
            <Dialog open={showPlanGate} onOpenChange={setShowPlanGate}>
                <DialogContent className="max-w-sm">
                    <PlanGateCard
                        featureName="Drag & Drop Editor"
                        description="Build a fully custom booking page with our visual editor — available on Growth."
                        businessData={gatableData}
                    />
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-2xl font-semibold tracking-tight mb-2">
                    How would you like to build your booking page?
                </h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Choose the editor that fits your style. You can always switch later from your booking site settings.
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Drag & Drop */}
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
                        'relative flex flex-col text-left rounded-xl border bg-card p-7 gap-5 transition-all duration-200',
                        'hover:border-primary hover:shadow-md',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        creatingEditor && 'opacity-60 pointer-events-none',
                        anyLoading && !creatingEditor && 'opacity-40 pointer-events-none'
                    )}
                >
                    <div className="absolute top-5 right-5">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border border-primary/20 text-xs font-medium px-2 py-0.5">
                            Recommended
                        </Badge>
                    </div>

                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <PencilRuler className="size-5 text-primary" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <h2 className="text-base font-semibold">Drag &amp; Drop Editor</h2>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Best for a custom, professional look
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            Build a fully custom page using a palette of pre-built components. Drag, drop, and style everything to match your brand.
                        </p>
                    </div>

                    <ul className="flex flex-col gap-2.5 flex-1">
                        {DRAG_DROP_FEATURES.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm">
                                <Check className="size-4 text-primary mt-0.5 shrink-0" />
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-auto pt-1">
                        <div className="w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-primary-foreground bg-primary transition-colors hover:bg-primary/90">
                            {creatingEditor && <Loader2 className="size-4 animate-spin" />}
                            {creatingEditor ? 'Setting up…' : 'Get started'}
                        </div>
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
                        'relative flex flex-col text-left rounded-xl border bg-card p-7 gap-5 transition-all duration-200',
                        'hover:border-foreground/30 hover:shadow-md',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        creatingSections && 'opacity-60 pointer-events-none',
                        anyLoading && !creatingSections && 'opacity-40 pointer-events-none'
                    )}
                >
                    <div className="absolute top-5 right-5">
                        <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
                            Simpler option
                        </Badge>
                    </div>

                    <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <LayoutPanelTop className="size-5 text-muted-foreground" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <h2 className="text-base font-semibold">Section Editor</h2>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Best for getting up and running fast
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            Stack text and image blocks in a clean, structured layout. Familiar if you&apos;ve used tools like Acuity or similar booking platforms.
                        </p>
                    </div>

                    <ul className="flex flex-col gap-2.5 flex-1">
                        {SECTIONS_FEATURES.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm">
                                <Check className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-auto pt-1">
                        <div className="w-full inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium bg-background transition-colors hover:bg-accent">
                            {creatingSections && <Loader2 className="size-4 animate-spin" />}
                            {creatingSections ? 'Setting up…' : 'Get started'}
                        </div>
                    </div>
                </button>

            </div>

            {/* Footer nudge */}
            <p className="text-center text-xs text-muted-foreground mt-8">
                Not sure where to start?{' '}
                <strong className="font-medium text-foreground">Section Editor</strong> is the quickest way to get your page live — you can always upgrade to Drag &amp; Drop later.
            </p>

        </div>
    )
}

export default SelectEditorType;
