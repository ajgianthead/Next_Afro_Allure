import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { CircularProgress, DialogActions, DialogContent, DialogTitle, Modal, ModalClose, ModalDialog } from "@mui/joy";
import { Caption } from "@/components/tailus-ui/typography";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useManualBooking } from "../../hooks/useManualBooking";
import { rescheduleAppointmentAction } from "../../server";


export const RescheduleConfirmationModal = () => {
    const { manualBookingData, setManualBookingData } = useManualBooking()
    return (
        <div>
            {manualBookingData?.currSelectedEvent !== null ? <RescheduleConfirmation /> : <></>}
        </div>
    )
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
    }>({
        date: new Date(),
        start: "",
        end: "",
    })

    // U5: Fall back to currSelectedEvent when newAppointmentEvent is null (e.g. opened from table)
    useEffect(() => {
        const source = manualBookingData?.newAppointmentEvent ?? manualBookingData?.currSelectedEvent
        if (source?.start) {
            setEditedAppointmentData({
                date: new Date(source.start),
                start: DateTime.fromJSDate(new Date(source.start)).toFormat('T'),
                end: DateTime.fromJSDate(new Date(source.end)).toFormat('T'),
            })
        }
    }, [manualBookingData?.newAppointmentEvent, manualBookingData?.currSelectedEvent]);

    const [reschedulingAppointment, setReschedulingAppointment] = useState<boolean>(false)

    const handleModalClose = () => {
        setManualBookingData!({
            ...manualBookingData!,
            openRescheduleConfirmation: false
        })
        setEditedAppointmentData({ date: new Date(), start: "", end: "" })
    }

    const [error, setError] = useState<{ error: boolean, message: string }>({
        error: false,
        message: ''
    })

    // U4: Use the selected date, not today, for the time comparison
    const validateInputs = () => {
        if (editedAppointmentData.start.length === 0 || editedAppointmentData.end.length === 0) {
            setError({ error: true, message: 'Please enter an appointment start and end time' })
            return false
        }
        const d = editedAppointmentData.date
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Number(editedAppointmentData.start.split(':')[0]), Number(editedAppointmentData.start.split(':')[1]))
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Number(editedAppointmentData.end.split(':')[0]), Number(editedAppointmentData.end.split(':')[1]))
        if (end <= start) {
            setError({ error: true, message: 'End time must be after start time' })
            return false
        }
        return true
    }

    return (
        <div>
            <Modal open={manualBookingData?.openRescheduleConfirmation!} onClose={() => { handleModalClose() }}>
                <ModalDialog sx={{ width: 500 }}>
                    <ModalClose />
                    <DialogTitle className="flex flex-col">
                        <p>Confirm Reschedule</p>
                        <div>
                            <Caption>{currDate}</Caption>
                            <Caption>{`${currStart} - ${currEnd}`}</Caption>
                        </div>
                    </DialogTitle>
                    <DialogContent>
                        {error.error && <Caption size={'sm'} className="text-red-500 mb-2">{error.message}</Caption>}
                        <div className="grid gap-2 grid-cols-2 grid-rows-2">
                            <div className="flex col-span-2 flex-col gap-2">
                                <Caption className="font-semibold">Date</Caption>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            size={'sm'}
                                            variant="outline"
                                            data-empty={!editedAppointmentData.date}
                                            className="w-70 justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                        >
                                            <CalendarIcon />
                                            {editedAppointmentData.date ? <p className="text-sm">{format(editedAppointmentData.date, "PPP")}</p> : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-9999">
                                        <CalendarComponent disabled={(date) => date < new Date()} required mode="single" selected={editedAppointmentData.date} onSelect={(e) => setEditedAppointmentData({
                                            ...editedAppointmentData,
                                            date: e
                                        })} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Caption className="font-semibold">Start Time</Caption>
                                <Input data-testid='start-time' value={editedAppointmentData.start} onChange={(e) => {
                                    setEditedAppointmentData({ ...editedAppointmentData, start: e.target.value })
                                }} style={{ fontSize: 14 }} type='time' />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Caption className="font-semibold">End Time</Caption>
                                <Input data-testid='end-time' value={editedAppointmentData.end} onChange={(e) => {
                                    setEditedAppointmentData({ ...editedAppointmentData, end: e.target.value })
                                }} style={{ fontSize: 14 }} type='time' />
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button data-testid={'submit-appointment'} disabled={reschedulingAppointment} onClick={async () => {
                            if (!validateInputs()) return

                            setReschedulingAppointment(true)
                            // U6: try/finally so the spinner always clears even if the action throws
                            try {
                                const appointment = await rescheduleAppointmentAction({
                                    appointmentId: manualBookingData?.newAppointmentEvent!.id ?? manualBookingData?.currSelectedEvent!.id!,
                                    start: editedAppointmentData.start,
                                    end: editedAppointmentData.end,
                                    date: editedAppointmentData.date
                                })
                                if (appointment && !Array.isArray(appointment)) {
                                    setManualBookingData!({
                                        ...manualBookingData!,
                                        appointmentEvents: manualBookingData?.appointmentEvents.map(e =>
                                            e.id === appointment.id
                                                ? { ...e, start: new Date(appointment.start), end: new Date(appointment.end) }
                                                : e
                                        )!
                                    })
                                }
                                handleModalClose()
                            } catch (err: any) {
                                setError({ error: true, message: err?.message ?? 'Failed to reschedule. Please try again.' })
                            } finally {
                                setReschedulingAppointment(false)
                            }
                        }} style={{ fontSize: 14 }}>{reschedulingAppointment ? <CircularProgress size="sm" /> : "Reschedule Appointment"}</Button>
                        <Button disabled={reschedulingAppointment} style={{ fontSize: 14 }} variant={'outline'} onClick={() => handleModalClose()}>Cancel</Button>
                    </DialogActions>
                </ModalDialog>
            </Modal>
        </div>
    );
}
