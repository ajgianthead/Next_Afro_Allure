'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CircleCheckBig, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import { getAppointmentByIdAction, cancelClientAppointmentAction, getPolicyByIdAction } from '@/features/shared/appointments/actions'

function fmt(cents: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

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
    const [cancelError, setCancelError] = useState('')
    const [depositNote, setDepositNote] = useState<string | null>(null)
    const [blocked, setBlocked] = useState(false)

    useEffect(() => {
        ;(async () => {
            const appt = await getAppointmentByIdAction(appointment_id as string)
            setAppointment(appt)
            setCancelled(appt.status === 'CANCELLED')

            const depositPrice = appt.deposit_price ?? 0
            if (appt.paid_deposit && depositPrice > 0 && appt.policy_id) {
                const policy = await getPolicyByIdAction(appt.policy_id).catch(() => null)
                const limit = policy?.cancel_day_limit ?? 0
                const daysUntil = DateTime.fromISO(appt.start).diff(DateTime.now(), 'days').days
                if (limit > 0) {
                    if (daysUntil < limit) {
                        setBlocked(true)
                        setDepositNote(
                            `Cancellations are not allowed within ${limit} day${limit !== 1 ? 's' : ''} of your appointment. Your deposit of ${fmt(depositPrice)} cannot be refunded.`
                        )
                    } else {
                        setDepositNote(
                            `Note: Cancelling within ${limit} day${limit !== 1 ? 's' : ''} of your appointment will forfeit your deposit of ${fmt(depositPrice)}.`
                        )
                    }
                } else {
                    setDepositNote(`Note: Your deposit of ${fmt(depositPrice)} is non-refundable.`)
                }
            }
        })()
    }, [])

    const handleCheckChange = (value: string, checked: boolean) => {
        setReasons((prev) => {
            const next = new Set(prev)
            checked ? next.add(value) : next.delete(value)
            return next
        })
    }

    if (cancelled === null) {
        return (
            <div className="w-full h-screen flex justify-center items-center" style={{ backgroundColor: '#FAF7F2' }}>
                <Loader2 className="size-8 animate-spin" style={{ color: '#6F6863' }} />
            </div>
        )
    }

    if (cancelled) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center gap-3 px-5" style={{ backgroundColor: '#FAF7F2' }}>
                <div className="flex items-center gap-3">
                    <CircleCheckBig size={24} style={{ color: '#16a34a' }} />
                    <h2 className="text-lg font-semibold" style={{ color: '#1A1818' }}>Appointment Cancelled</h2>
                </div>
                <p className="text-sm text-center" style={{ color: '#6F6863' }}>
                    {appointment.business_users?.business_name
                        ? `Contact ${appointment.business_users.business_name} to book again.`
                        : 'Your appointment has been cancelled.'}
                </p>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen flex justify-center items-start px-4 py-16" style={{ backgroundColor: '#FAF7F2' }}>
            <div className="w-full max-w-md rounded-xl p-6 flex flex-col gap-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6' }}>
                <div>
                    {appointment.start && (
                        <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#6F6863' }}>
                            {DateTime.fromISO(appointment.start).toFormat('DDDD')}
                        </p>
                    )}
                    <h2 className="text-xl font-semibold" style={{ color: '#1A1818' }}>Cancel Appointment</h2>
                    <p className="text-sm mt-1" style={{ color: '#6F6863' }}>
                        Select your reason for cancelling below.
                    </p>
                </div>

                {depositNote && (
                    <div
                        className="rounded-lg px-4 py-3 text-sm"
                        style={{
                            backgroundColor: blocked ? 'rgba(252,97,97,0.08)' : 'rgba(201,151,74,0.1)',
                            border: `1px solid ${blocked ? '#FC6161' : '#C9974A'}`,
                            color: blocked ? '#FC6161' : '#C9974A',
                        }}
                    >
                        {depositNote}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {REASONS.map(({ value, label }) => (
                        <div key={value} className="flex items-center gap-2">
                            <Checkbox
                                id={value}
                                onCheckedChange={(checked) => handleCheckChange(value, !!checked)}
                            />
                            <label htmlFor={value} className="text-sm cursor-pointer select-none" style={{ color: '#1A1818' }}>
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
                        <label htmlFor="other" className="text-sm cursor-pointer select-none" style={{ color: '#1A1818' }}>
                            Other
                        </label>
                    </div>
                    {otherChecked && (
                        <Textarea
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            rows={4}
                            placeholder="Describe your reason…"
                            style={{ borderColor: '#E8E2D6' }}
                        />
                    )}
                </div>

                {cancelError && (
                    <p className="text-sm" style={{ color: '#FC6161' }}>{cancelError}</p>
                )}

                <div className="flex justify-end">
                    <Button
                        disabled={reasons.size === 0 || sendingData || blocked}
                        onClick={async () => {
                            setSendingData(true)
                            setCancelError('')
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
                            } catch (err: any) {
                                setCancelError(err?.message ?? 'Failed to cancel. Please try again.')
                            } finally {
                                setSendingData(false)
                            }
                        }}
                        style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                    >
                        {sendingData ? <Loader2 className="size-4 animate-spin" /> : 'Cancel Appointment'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
