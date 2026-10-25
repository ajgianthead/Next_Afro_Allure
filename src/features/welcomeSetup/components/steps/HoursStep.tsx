'use client'

import { useState } from 'react'
import { Lock, Plus, X } from 'lucide-react'
import { IconClock } from '@tabler/icons-react'
import { WeeklySchedule } from '@/features/availability/components/WeeklySchedule'
import { createDefaultAvailability, type AvailabilityData } from '@/features/availability/utils'
import type { PlanType } from '@/lib/beta'
import { BRAND, GrowthBadge, StepHeader, TextField } from '../shared'

export function HoursStep({
    schedules,
    planType,
    onChange,
}: {
    schedules: AvailabilityData[]
    planType: PlanType
    onChange: (schedules: AvailabilityData[]) => void
}) {
    const [active, setActive] = useState(0)
    const index = Math.min(active, schedules.length - 1)
    const schedule = schedules[index]
    const canAddMore = planType === 'GROWTH'

    const update = (patch: Partial<AvailabilityData>) =>
        onChange(schedules.map((s, i) => (i === index ? { ...s, ...patch } : s)))

    const addSchedule = () => {
        const next = { ...createDefaultAvailability(), name: `Schedule ${schedules.length + 1}` }
        onChange([...schedules, next])
        setActive(schedules.length)
    }

    const removeSchedule = (i: number) => {
        onChange(schedules.filter((_, j) => j !== i))
        setActive(Math.max(0, i - 1))
    }

    return (
        <div className="flex flex-col gap-4">
            <StepHeader icon={IconClock} eyebrow="Your hours" title="When do you take appointments?">
                Clients can only book inside these hours. Check the days you work and set your times. You can add
                time off and special dates later in Availability.
            </StepHeader>

            {(schedules.length > 1 || canAddMore) && (
                <div className="flex flex-wrap items-center gap-2">
                    {schedules.map((s, i) => (
                        <div
                            key={s.id}
                            className="flex items-center rounded-full text-sm"
                            style={{
                                border: `1px solid ${i === index ? BRAND.dark : BRAND.border}`,
                                backgroundColor: i === index ? BRAND.dark : '#FFFFFF',
                                color: i === index ? '#FFFFFF' : BRAND.ink,
                            }}
                        >
                            <button type="button" onClick={() => setActive(i)} className="h-8 pl-3 pr-3">
                                {s.name.trim() || `Schedule ${i + 1}`}
                            </button>
                            {schedules.length > 1 && i === index && (
                                <button
                                    type="button"
                                    onClick={() => removeSchedule(i)}
                                    aria-label={`Remove ${s.name || 'schedule'}`}
                                    className="h-8 pr-2.5 -ml-1.5 opacity-80 hover:opacity-100"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                    {canAddMore && (
                        <button
                            type="button"
                            onClick={addSchedule}
                            className="flex items-center gap-1 h-8 rounded-full px-3 text-sm"
                            style={{ border: `1px dashed ${BRAND.border}`, color: BRAND.ink }}
                        >
                            <Plus size={14} /> Add schedule
                        </button>
                    )}
                </div>
            )}

            {schedule && (
                <div className="flex flex-col gap-4">
                    <TextField
                        label="Schedule name"
                        value={schedule.name}
                        placeholder="e.g. Regular hours"
                        maxLength={60}
                        onChange={name => update({ name })}
                    />
                    <div className="rounded-xl p-4" style={{ border: `1px solid ${BRAND.border}` }}>
                        <WeeklySchedule week={schedule.week} onChange={week => update({ week })} />
                    </div>
                </div>
            )}

            {canAddMore ? (
                schedules.length > 1 && (
                    <p className="text-xs" style={{ color: BRAND.warm }}>
                        You&apos;ll choose which schedule each service uses on the next step.
                    </p>
                )
            ) : (
                <div
                    className="flex items-start gap-3 rounded-xl px-4 py-3"
                    style={{ backgroundColor: BRAND.cream, border: `1px solid ${BRAND.border}` }}
                >
                    <Lock size={15} className="mt-0.5 shrink-0" color={BRAND.gold} />
                    <div className="text-xs leading-relaxed" style={{ color: BRAND.warm }}>
                        <span className="inline-flex items-center gap-2 font-medium" style={{ color: BRAND.ink }}>
                            More than one schedule <GrowthBadge />
                        </span>
                        <br />
                        Different hours for different services, like weekend-only installs. Starter includes one schedule.
                    </div>
                </div>
            )}
        </div>
    )
}
