'use client'

import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { Loader2, CalendarIcon } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { toast } from "sonner"
import { useManualBooking } from "../../hooks/useManualBooking"
import { rescheduleAppointmentAction } from "../../server"
import { combineDateAndTime, minStartTimeFor, validateAppointmentTimes } from "../../utils/appointmentTime"

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export const RescheduleConfirmationModal = () => {
    const { manualBookingData } = useManualBooking()
    return manualBookingData?.currSelectedEvent !== null ? <RescheduleConfirmation /> : null
}

export const RescheduleConfirmation = () => {
    const { manualBookingData, setManualBookingData } = useManualBooking()
    const currDate = DateTime.fromJSDate(manualBookingData?.currSelectedEvent!.start!).toFormat('DDDD')
    const currStart = DateTime.fromJSDate(manualBookingData?.currSelectedEvent!.start!).toFormat('t')
    const currEnd = DateTime.fromJSDate(manualBookingData?.currSelectedEvent!.end!).toFormat('t')

    const [editedAppointmentData, setEditedAppointmentData] = useState<{
        date: Date
        start: string
        end: string
    }>({ date: new Date(), start: '', end: '' })

    useEffect(() => {
        const source = manualBookingData?.newAppointmentEvent ?? manualBookingData?.currSelectedEvent
        if (source?.start) {
            setEditedAppointmentData({
                date: new Date(source.start),
                start: DateTime.fromJSDate(new Date(source.start)).toFormat('T'),
                end: DateTime.fromJSDate(new Date(source.end)).toFormat('T'),
            })
        }
    }, [manualBookingData?.newAppointmentEvent, manualBookingData?.currSelectedEvent])

    const [reschedulingAppointment, setReschedulingAppointment] = useState(false)
    const [error, setError] = useState('')

    const handleClose = () => {
        setManualBookingData!(prev => ({ ...prev, openRescheduleConfirmation: false, newAppointmentEvent: null }))
        setEditedAppointmentData({ date: new Date(), start: '', end: '' })
        setError('')
    }

    const validateInputs = () => {
        const timeError = validateAppointmentTimes(editedAppointmentData.date, editedAppointmentData.start, editedAppointmentData.end)
        if (timeError) {
            setError(timeError)
            return false
        }
        return true
    }

    return (
        <Dialog open={manualBookingData?.openRescheduleConfirmation} onOpenChange={(open) => { if (!open) handleClose() }}>
            <DialogContent className="w-[calc(100vw-2rem)] overflow-x-hidden p-4 sm:p-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6', borderRadius: '16px', maxWidth: 480 }}>
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: SERIF, color: '#1A1818', fontSize: '1.1rem' }}>
                        Reschedule Appointment
                    </DialogTitle>
                    <div className="flex flex-col gap-0.5 mt-1">
                        <p className="text-sm" style={{ color: '#6F6863' }}>{currDate}</p>
                        <p className="text-sm" style={{ color: '#6F6863' }}>{currStart} – {currEnd}</p>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {error && (
                        <p className="text-sm" style={{ color: '#FC6161' }}>{error}</p>
                    )}

                    {/* Date */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6F6863' }}>Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="justify-start text-left font-normal"
                                    style={{ borderColor: '#E8E2D6', color: editedAppointmentData.date ? '#1A1818' : '#6F6863' }}
                                >
                                    <CalendarIcon size={14} style={{ color: '#6F6863' }} />
                                    {editedAppointmentData.date
                                        ? format(editedAppointmentData.date, 'PPP')
                                        : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-[9999]" style={{ border: '1px solid #E8E2D6' }}>
                                <CalendarComponent
                                    mode="single"
                                    required
                                    selected={editedAppointmentData.date}
                                    disabled={(date) => date < DateTime.now().startOf('day').toJSDate()}
                                    onSelect={(e) => setEditedAppointmentData({ ...editedAppointmentData, date: e! })}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Start / End time */}
                    <div className="grid grid-cols-2 gap-3 min-w-0">
                        <div className="flex flex-col gap-1.5 min-w-0">
                            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6F6863' }}>Start Time</label>
                            <Input
                                type="time"
                                value={editedAppointmentData.start}
                                min={minStartTimeFor(editedAppointmentData.date)}
                                onChange={(e) => setEditedAppointmentData({ ...editedAppointmentData, start: e.target.value })}
                                className="h-10 w-full min-w-0 max-w-full appearance-none text-base sm:text-sm [&::-webkit-date-and-time-value]:text-left"
                                style={{ borderColor: '#E8E2D6' }}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 min-w-0">
                            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6F6863' }}>End Time</label>
                            <Input
                                type="time"
                                value={editedAppointmentData.end}
                                min={editedAppointmentData.start || undefined}
                                onChange={(e) => setEditedAppointmentData({ ...editedAppointmentData, end: e.target.value })}
                                className="h-10 w-full min-w-0 max-w-full appearance-none text-base sm:text-sm [&::-webkit-date-and-time-value]:text-left"
                                style={{ borderColor: '#E8E2D6' }}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        disabled={reschedulingAppointment}
                        onClick={handleClose}
                        style={{ borderColor: '#E8E2D6', color: '#1A1818' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={reschedulingAppointment}
                        onClick={async () => {
                            if (!validateInputs()) return
                            setReschedulingAppointment(true)
                            setError('')
                            try {
                                const res = await rescheduleAppointmentAction({
                                    appointmentId: manualBookingData?.newAppointmentEvent?.id ?? manualBookingData?.currSelectedEvent!.id!,
                                    startISO: combineDateAndTime(editedAppointmentData.date, editedAppointmentData.start).toISO()!,
                                    endISO: combineDateAndTime(editedAppointmentData.date, editedAppointmentData.end).toISO()!,
                                })
                                if (!res.ok) throw new Error(res.error)
                                const appointment = res.data
                                // Functional update so the close below can't overwrite it with a stale snapshot.
                                setManualBookingData!(prev => ({
                                    ...prev,
                                    appointmentEvents: prev.appointmentEvents.map(e =>
                                        e.id === appointment.id
                                            ? { ...e, start: new Date(appointment.start), end: new Date(appointment.end) }
                                            : e
                                    ),
                                }))
                                handleClose()
                                toast.success('Appointment rescheduled')
                            } catch (err: any) {
                                setError(err?.message ?? 'Failed to reschedule. Please try again.')
                            } finally {
                                setReschedulingAppointment(false)
                            }
                        }}
                        style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF' }}
                    >
                        {reschedulingAppointment ? <Loader2 className="size-4 animate-spin" /> : 'Reschedule Appointment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
