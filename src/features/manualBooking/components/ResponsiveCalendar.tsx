'use client'
import React, { useState, useEffect } from "react";
import { Calendar, EventProps, momentLocalizer, SlotInfo, View } from "react-big-calendar";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from "moment";
import { DateTime } from "luxon";
import CalendarHeader from "./CalendarHeader";
import EventCard from "./EventCard";
import "react-big-calendar/lib/css/react-big-calendar.css";
import '../styles/calendar.scss'
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { AppointmentEvent } from "../types";
import { useManualBooking } from "../hooks/useManualBooking";

const localizer = momentLocalizer(moment);

const MemoEventCard = React.memo(EventCard);

export function ResponsiveCalendar() {
    const { manualBookingData, setManualBookingData } = useManualBooking()
    const DnDCalendar = React.useMemo(() => withDragAndDrop(Calendar), []);

    const [view, setView] = useState<View>('week')
    const [calendarDate, setCalendarDate] = useState(new Date())

    useEffect(() => {
        setView(window.innerWidth < 768 ? 'day' : 'week')
    }, [])

    useEffect(() => {
        const handleResize = () => {
            const next = window.innerWidth < 768 ? 'day' : 'week'
            setView(prev => prev === next ? prev : next)
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const scrollTime = React.useMemo(() => {
        const todayEvents = manualBookingData?.appointmentEvents.filter(e =>
            DateTime.fromJSDate(e.start).hasSame(DateTime.fromJSDate(calendarDate), 'day')
        ) ?? []
        if (!todayEvents.length) return DateTime.now().toJSDate()
        return [...todayEvents].sort((a, b) => a.start.getTime() - b.start.getTime())[0].start
    }, [manualBookingData?.appointmentEvents, calendarDate])

    const handleSelectedSlot = (slot: SlotInfo) => {
        if (slot.start < new Date()) {
            toast.error('Unable to select slots in the past', { position: 'top-center' })
            return
        }
        setManualBookingData!({
            ...manualBookingData!,
            newAppointmentData: {
                ...manualBookingData!.newAppointmentData,
                date: slot.start,
                start: DateTime.fromJSDate(slot.start).toFormat('T'),
                end: DateTime.fromJSDate(slot.end).toFormat('T'),
            },
            openCreateAppointment: true,
        })
    }

    return (
        <div className="calendar-wrapper">
            <Toaster />
            <DnDCalendar
                localizer={localizer}
                events={manualBookingData?.appointmentEvents}
                style={{ height: 900 }}
                view={view}
                date={calendarDate}
                onView={setView}
                onEventDrop={({ event, start, end }: any) => {
                    setManualBookingData!({
                        ...manualBookingData!,
                        currSelectedEvent: { ...event },
                        newAppointmentEvent: { ...event, start, end },
                        openRescheduleConfirmation: true,
                    })
                }}
                onEventResize={({ event, start, end }: any) => {
                    setManualBookingData!({
                        ...manualBookingData!,
                        currSelectedEvent: { ...event },
                        newAppointmentEvent: { ...event, start, end },
                        openRescheduleConfirmation: true,
                    })
                }}
                onNavigate={(date) => setCalendarDate(date)}
                resizable
                scrollToTime={scrollTime}
                step={15}
                timeslots={2}
                selectable
                onSelectSlot={handleSelectedSlot}
                popup
                components={{
                    toolbar: (props) => (
                        <CalendarHeader
                            date={props.date}
                            currentView={props.view as 'day' | 'week' | 'month'}
                            onNavigate={props.onNavigate}
                            onViewChange={props.onView}
                        />
                    ),
                    event: ({ event }: EventProps) => <MemoEventCard event={event as AppointmentEvent} />,
                }}
            />
        </div>
    )
}
