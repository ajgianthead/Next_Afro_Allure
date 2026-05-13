'use client'

import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { CircleCheckBig, Loader2 } from 'lucide-react'
import { getAvailability, getUnavailability, rescheduleAppointment } from 'app/business/[businessName]/actions'
import { DateTime } from 'luxon'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getSlots } from 'slot-calculator'
import { getAvailabilitiesAction } from '@/features/availability/server/actions'
import { getBusinessAppointmentsAction } from '@/app/dashboard/(other)/appointments/actions'
import { getBusinessByIdAction } from '@/features/shared/appointments/actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export default function RescheduleClient() {
    const { appointment_id, businessId } = useParams<{ appointment_id: string; businessId: string }>()

    const [date, setDate] = useState<Date | undefined>()
    const [isLoading, setIsLoading] = useState(true)
    const [slots, setSlots] = useState<Record<string, string[][]>>({})
    const [currSlots, setCurrSlots] = useState<DateTime[]>([])
    const [appointments, setAppointments] = useState<any[]>([])
    const [availabilities, setAvailabilities] = useState<any[]>([])
    const [appointment, setAppointment] = useState<any>({})
    const [availability, setAvailability] = useState<any>({})
    const [selectedDateTime, setSelectedDateTime] = useState<{ start: string; end: string }>({ start: '', end: '' })
    const [canReschedule, setCanReschedule] = useState<boolean | null>(null)
    const [businessName, setBusinessName] = useState('')
    const [confirmed, setConfirmed] = useState(false)
    const [sendingData, setSendingData] = useState(false)
    const [rescheduleError, setRescheduleError] = useState('')
    const [isDisabled, setIsDisabled] = useState(true)

    const computeSlots = async (startDate: string, endDate: string, avs: any[], appts: any[]) => {
        const appt = appts.find((a: any) => a.id === appointment_id)
        if (!appt) return
        const av = avs.find((a: any) => a.id === appt.service_data.availability)
        if (!av) return

        if (!(appt.reschedules > 0)) {
            setCanReschedule(false)
        } else {
            setCanReschedule(true)
        }
        setAppointment(appt)
        setAvailability(av.availability_data)
        setSelectedDateTime({
            start: DateTime.fromJSDate(new Date(appt.start)).toISO()!,
            end: DateTime.fromJSDate(new Date(appt.end)).toISO()!,
        })

        const formattedAv = await getAvailability(
            startDate, endDate, av.availability_data,
            Intl.DateTimeFormat().resolvedOptions().timeZone
        )
        const formattedUnav = await getUnavailability(
            startDate, endDate, appts,
            Intl.DateTimeFormat().resolvedOptions().timeZone
        )
        const { availableSlotsByDay } = getSlots({
            from: startDate,
            to: endDate,
            duration: 1,
            availability: formattedAv,
            unavailability: formattedUnav,
            outputTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })

        const days = Object.keys(availableSlotsByDay)
        const slotValues = Object.values(availableSlotsByDay)
        const result: Record<string, string[][]> = {}
        for (let i = 0; i < slotValues.length; i++) {
            result[days[i]] = [[slotValues[i][0].from]]
            for (let j = 0; j < slotValues[i].length; j++) {
                if (j === slotValues[i].length - 1) {
                    result[days[i]][result[days[i]].length - 1].push(slotValues[i][j].to)
                    continue
                }
                if (slotValues[i][j].to !== slotValues[i][j + 1].from) {
                    result[days[i]][result[days[i]].length - 1].push(slotValues[i][j].to)
                    result[days[i]].push([slotValues[i][j + 1].from])
                }
            }
        }
        setSlots(result)
    }

    useEffect(() => {
        const init = async () => {
            const [{ availabilities: avs }, appts, business] = await Promise.all([
                getAvailabilitiesAction(businessId),
                getBusinessAppointmentsAction(businessId),
                getBusinessByIdAction(businessId).catch(() => null),
            ])
            setAvailabilities(avs as any)
            setAppointments(appts as any)
            if (business?.business_name) setBusinessName(business.business_name)

            const startDate = DateTime.now().startOf('day').toISO()!
            const endDate = DateTime.now().endOf('month').toISO()!
            await computeSlots(startDate, endDate, avs as any, appts as any)
            setIsLoading(false)
        }
        init()
    }, [])

    const handleMonthChange = async (month: Date) => {
        if (!appointments.length || !Object.keys(availability).length) return
        setIsLoading(true)
        const lMonth = DateTime.fromJSDate(month)
        const startDate =
            lMonth.month === DateTime.now().month
                ? DateTime.now().startOf('day').toISO()!
                : lMonth.toISO()!
        const endDate = lMonth.endOf('month').toISO()!
        await computeSlots(startDate, endDate, availabilities, appointments)
        setIsLoading(false)
    }

    const handleDateSelect = (day: Date | undefined) => {
        setDate(day)
        if (!day || !Object.keys(slots).length) return
        const key = DateTime.fromJSDate(day).toISODate()!
        const fetchedSlots = slots[key]
        if (!fetchedSlots) { setCurrSlots([]); return }

        const res: DateTime[] = []
        for (const range of fetchedSlots) {
            let timeStart = DateTime.fromISO(range[0])
            const timeEnd = DateTime.fromISO(range[range.length - 1])
            while (timeStart < timeEnd) {
                const next = timeStart.plus({ minutes: appointment.service_data?.length ?? 60 })
                if (next <= timeEnd) {
                    res.push(timeStart)
                    timeStart = timeStart.plus({ minutes: 10 })
                } else break
            }
        }
        setCurrSlots(res)
    }

    // Loading state
    if (canReschedule === null) {
        return (
            <div className="w-full h-screen flex justify-center items-center" style={{ backgroundColor: '#FAF7F2' }}>
                <Loader2 className="size-8 animate-spin" style={{ color: '#6F6863' }} />
            </div>
        )
    }

    // Reschedule limit reached
    if (!canReschedule) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center gap-3 px-5 text-center" style={{ backgroundColor: '#FAF7F2' }}>
                <p className="text-base font-medium" style={{ color: '#1A1818' }}>
                    You've reached the maximum number of reschedules for this booking.
                </p>
                <p className="text-sm" style={{ color: '#6F6863' }}>
                    Contact {businessName || 'the business'} directly to reschedule.
                </p>
            </div>
        )
    }

    // Success
    if (confirmed) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center gap-3 px-5" style={{ backgroundColor: '#FAF7F2' }}>
                <div className="flex items-center gap-3">
                    <CircleCheckBig size={24} style={{ color: '#16a34a' }} />
                    <h2 className="text-lg font-semibold" style={{ color: '#1A1818' }}>Appointment Rescheduled</h2>
                </div>
                <p className="text-sm text-center" style={{ color: '#6F6863' }}>
                    If you have any questions, please contact the business directly.
                </p>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen py-10 px-4" style={{ backgroundColor: '#FAF7F2' }}>
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
                <div className="rounded-xl p-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6' }}>
                    <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#6F6863' }}>
                        Reschedule
                    </p>
                    <h2 className="text-xl font-semibold mb-6" style={{ color: '#1A1818', fontFamily: SERIF }}>
                        Pick a new date &amp; time
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="shrink-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateSelect}
                                onMonthChange={handleMonthChange}
                                disabled={(day) => {
                                    const today = new Date()
                                    today.setHours(0, 0, 0, 0)
                                    if (day < today) return true
                                    const key = DateTime.fromJSDate(day).toISODate()!
                                    return !slots[key]
                                }}
                                className="rounded-lg p-0"
                            />
                            {isLoading && (
                                <div className="flex items-center gap-2 mt-2">
                                    <Loader2 className="size-4 animate-spin" style={{ color: '#6F6863' }} />
                                    <span className="text-xs" style={{ color: '#6F6863' }}>Loading availability…</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-h-50">
                            {!date ? (
                                <p className="text-sm" style={{ color: '#6F6863' }}>Select a date to see available times.</p>
                            ) : (
                                <>
                                    <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#6F6863' }}>
                                        {DateTime.fromJSDate(date).toFormat('LLLL d')}
                                    </p>
                                    {currSlots.length === 0 ? (
                                        <p className="text-sm" style={{ color: '#6F6863' }}>No available times for this day.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {currSlots.map((slot, i) => {
                                                const iso = slot.toISO()!
                                                const isSelected = selectedDateTime.start === iso
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            const end = slot.plus({ minutes: appointment.service_data?.length ?? 60 }).toISO()!
                                                            setSelectedDateTime({ start: iso, end })
                                                            const origStart = DateTime.fromJSDate(new Date(appointment.start)).toISO()
                                                            setIsDisabled(origStart === iso)
                                                        }}
                                                        className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                                                        style={{
                                                            border: `${isSelected ? 2 : 1}px solid ${isSelected ? '#FC6161' : '#E8E2D6'}`,
                                                            backgroundColor: isSelected ? 'rgba(252,97,97,0.06)' : '#FFFFFF',
                                                            color: isSelected ? '#FC6161' : '#1A1818',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        {slot.toLocaleString(DateTime.TIME_SIMPLE)}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {rescheduleError && (
                    <p className="text-sm" style={{ color: '#FC6161' }}>{rescheduleError}</p>
                )}

                <div className="flex justify-end">
                    <Button
                        disabled={isDisabled || sendingData}
                        onClick={async () => {
                            setSendingData(true)
                            setIsDisabled(true)
                            setRescheduleError('')
                            try {
                                const res = await rescheduleAppointment(
                                    appointment_id,
                                    {
                                        start: selectedDateTime.start,
                                        end: selectedDateTime.end,
                                        appointmentLength: appointment.service_data?.length ?? 60,
                                    },
                                    businessId,
                                    availability.id,
                                    Intl.DateTimeFormat().resolvedOptions().timeZone
                                )
                                if (res) setConfirmed(true)
                            } catch (err: any) {
                                setRescheduleError(err?.message ?? 'Failed to reschedule. Please try again.')
                                setIsDisabled(false)
                            } finally {
                                setSendingData(false)
                            }
                        }}
                        style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF' }}
                    >
                        {sendingData ? <Loader2 className="size-4 animate-spin" /> : 'Reschedule Appointment'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
