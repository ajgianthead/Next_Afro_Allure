'use client'

import { Plus } from 'lucide-react'
import { IconScissors } from '@tabler/icons-react'
import { STYLE_TEMPLATES } from '@/features/services/components/styleTemplates'
import type { AvailabilityData } from '@/features/availability/utils'
import { blankDraft, draftFromPreset, draftFromTemplate, draftProblem, SIMPLE_PRESETS, type ServiceDraft } from '../../serviceDrafts'
import { BRAND, StepHeader } from '../shared'
import { ServiceCard } from './ServiceCard'

export function ServicesStep({
    drafts,
    schedules,
    openId,
    showProblems,
    onOpen,
    onChange,
}: {
    drafts: ServiceDraft[]
    schedules: AvailabilityData[]
    openId: string | null
    /** Highlight problems once the business has tried to continue. */
    showProblems: boolean
    onOpen: (id: string | null) => void
    onChange: (drafts: ServiceDraft[]) => void
}) {
    const defaultSchedule = schedules[0]?.id ?? ''
    const add = (draft: ServiceDraft) => {
        onChange([...drafts, draft])
        onOpen(draft.form.id)
    }

    return (
        <div className="flex flex-col gap-4">
            <StepHeader icon={IconScissors} eyebrow="Your services" title="What do you offer?">
                Add each service with its price and how long it takes. For braids, locs and installs, turn on
                Smart Pricing to price by size and length, with hair included or optional.
            </StepHeader>

            <div className="flex flex-col gap-2">
                <p className="text-xs font-medium" style={{ color: BRAND.warm }}>
                    Quick start: tap to add, then edit the prices.{' '}
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BRAND.gold }} aria-hidden /> comes with Smart Pricing
                    </span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {STYLE_TEMPLATES.map(t => (
                        <Chip key={t.id} label={t.name} smart onClick={() => add(draftFromTemplate(t, defaultSchedule))} />
                    ))}
                    {SIMPLE_PRESETS.map(p => (
                        <Chip key={p.name} label={p.name} onClick={() => add(draftFromPreset(p, defaultSchedule))} />
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {drafts.map(draft => (
                    <ServiceCard
                        key={draft.form.id}
                        draft={draft}
                        open={openId === draft.form.id}
                        problem={showProblems ? draftProblem(draft) : null}
                        schedules={schedules}
                        canRemove={drafts.length > 1}
                        onToggle={() => onOpen(openId === draft.form.id ? null : draft.form.id)}
                        onChange={next => onChange(drafts.map(d => (d.form.id === draft.form.id ? next : d)))}
                        onRemove={() => {
                            onChange(drafts.filter(d => d.form.id !== draft.form.id))
                            onOpen(null)
                        }}
                    />
                ))}
                <button
                    type="button"
                    onClick={() => add(blankDraft(defaultSchedule))}
                    className="flex items-center justify-center gap-1.5 h-11 rounded-xl text-sm font-medium"
                    style={{ border: `1px dashed ${BRAND.border}`, color: BRAND.ink }}
                >
                    <Plus size={15} /> Add a service
                </button>
            </div>

            <p className="text-xs" style={{ color: BRAND.warm }}>
                Add photos, add-ons and prep instructions anytime in Services.
            </p>
        </div>
    )
}

function Chip({ label, smart, onClick }: { label: string; smart?: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={smart ? 'Adds sizes, lengths and prices you can edit' : undefined}
            className="flex items-center gap-1 h-8 rounded-full px-3 text-xs font-medium transition-colors hover:bg-[#FAF7F2]"
            style={{ border: `1px solid ${BRAND.border}`, color: BRAND.ink, backgroundColor: '#FFFFFF' }}
        >
            <Plus size={12} />
            {label}
            {smart && <span className="ml-0.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BRAND.gold }} aria-hidden />}
        </button>
    )
}
