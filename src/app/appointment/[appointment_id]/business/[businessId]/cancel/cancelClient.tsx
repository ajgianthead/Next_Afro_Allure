'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CircleCheckBig, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getAppointmentByIdAction, cancelClientAppointmentAction } from '@/features/shared/appointments/actions'

const REASONS = [
    { value: 'scheduling-conflict', label: 'Scheduling Conflict' },
    { value: 'found-another-service', label: 'Found Another Service' },
    { value: 'too-expensive', label: 'Too Expensive' },
    { value: 'no-longer-needed', label: 'Service No Longer Needed' },
    { value: 'personal', label: 'Personal Reasons' },
]

export default function CancelClient() {
    const { appointment_id } = useParams()
    const [reasons, setReasons] = useState<Set<string>>(new Set())
    const [otherChecked, setOtherChecked] = useState(false)
    const [otherReason, setOtherReason] = useState('')
    const [appointment, setAppointment] = useState<any>({})
    const [sendingData, setSendingData] = useState(false)
    const [cancelled, setCancelled] = useState<boolean | null>(null)

    useEffect(() => {
        (async () => {
            const appt = await getAppointmentByIdAction(appointment_id as string)
            setAppointment(appt)
            setCancelled(appt.status === 'CANCELLED')
        })()
    }, [])

    const handleCheckChange = (value: string, checked: boolean) => {
        setReasons((prev) => {
            const next = new Set(prev)
            checked ? next.add(value) : next.delete(value)
            return next
        })
    }

    return (
        <div>
            {cancelled === null ? (
                <div className="w-full h-screen flex justify-center items-center">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            ) : cancelled === false ? (
                <div className="w-full h-screen flex flex-col justify-start items-center">
                    <div className="flex items-start flex-col gap-5 mt-20 max-w-md w-full rounded-xl border bg-card p-6 shadow-sm">
                        <div>
                            <h2 className="text-lg font-semibold">Cancel Appointment</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Sorry that you&apos;re canceling your appointment. Below select why you want to cancel.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            {REASONS.map(({ value, label }) => (
                                <div key={value} className="flex items-center gap-2">
                                    <Checkbox
                                        id={value}
                                        onCheckedChange={(checked) => handleCheckChange(value, !!checked)}
                                    />
                                    <label htmlFor={value} className="text-sm cursor-pointer select-none">
                                        {label}
                                    </label>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="other"
                                    checked={otherChecked}
                                    onCheckedChange={(checked) => {
                                        setOtherChecked(!!checked)
                                        handleCheckChange('other', !!checked)
                                    }}
                                />
                                <label htmlFor="other" className="text-sm cursor-pointer select-none">
                                    Other
                                </label>
                            </div>
                            <Textarea
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                                rows={4}
                                disabled={!otherChecked}
                                placeholder="Describe your reason…"
                            />
                        </div>
                        <div className="flex w-full justify-end gap-2">
                            <Button
                                variant="destructive"
                                disabled={reasons.size === 0 || sendingData}
                                onClick={async () => {
                                    setSendingData(true)
                                    try {
                                        const clone = [...reasons]
                                        const otherIdx = clone.indexOf('other')
                                        if (otherIdx !== -1) clone.splice(otherIdx, 1, otherReason)
                                        await cancelClientAppointmentAction(
                                            appointment_id as string,
                                            appointment.start,
                                            appointment.end,
                                            clone
                                        )
                                        setCancelled(true)
                                    } finally {
                                        setSendingData(false)
                                    }
                                }}
                            >
                                {sendingData ? <Loader2 className="size-4 animate-spin" /> : 'Cancel Appointment'}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex h-125 gap-2 px-5 flex-col w-screen justify-center items-center">
                    <div className="flex items-center gap-3">
                        <CircleCheckBig color="green" />
                        <h2 className="text-lg font-semibold">Appointment has been cancelled</h2>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        If you want to book a new appointment contact {appointment.business_users?.business_name}
                    </p>
                </div>
            )}
        </div>
    )
}
