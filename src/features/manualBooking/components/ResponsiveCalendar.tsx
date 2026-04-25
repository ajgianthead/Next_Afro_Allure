'use client'
import React, { useState, useEffect, useRef } from "react";
import { Calendar, Event, EventProps, momentLocalizer, SlotInfo, View } from "react-big-calendar";
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from "moment";
import { DateTime } from "luxon";
import CalendarHeader from "./CalendarHeader";
import EventCard from "./EventCard";
import "react-big-calendar/lib/css/react-big-calendar.css";
import '../styles/calendar.scss'
import AddAppointmentFAB from "./AddAppointmentFAB";
import { CircularProgress, DialogActions, DialogContent, DialogTitle, Modal, ModalClose, ModalDialog } from "@mui/joy";
import { Caption } from "@tailus-ui/typography";
import { CalendarDate, CalendarDateTime, parseDate, parseZonedDateTime, DateValue, today, getLocalTimeZone, parseAbsolute } from "@internationalized/date";
import { DateField } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, set } from "date-fns"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Service } from "@/lib/service/Service";
import { Database } from "../../../../lib/database.types";
import { BusinessPolicy, BusinessPolicyType, Level, Type } from "@/lib/businessPolicy/BusinessPolicy";
import { AddOn } from "@/app/utils/types/service";
import { Addon } from "@/lib/addons/AddOn";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { AppointmentData, AppointmentEvent } from "../types";
import { createManualAppointmentAction, rescheduleAppointmentAction } from "../server/actions";
import { useManualBooking } from "../hooks/useManualBooking";



const localizer = momentLocalizer(moment);


interface Props {
    events: AppointmentEvent[];
    services: {
        id: string;
        name: string;
        business: string;
        description: string;
        length: number;
        price: number;
        photo_url: string;
        imagePath: string;
        addons: AddOn[];
        categories: string[];
        availability: string;
    }[],
    policy: BusinessPolicyType
}

const MemoEventCard = React.memo(EventCard);


export function ResponsiveCalendar({ events, services, policy }: Props) {
    const { manualBookingData, setManualBookingData } = useManualBooking()
    const DnDCalendar = React.useMemo(
        () => withDragAndDrop(Calendar),
        []
    );
    const [view, setView] = useState<View>(
        window.innerWidth < 768 ? "day" : "week"
    );

    const handleSelectedSlot = (slot: SlotInfo) => {
        if (slot.start < new Date()) {
            toast.error('Selection Error: Unable to select slots in the past', {
                position: 'top-center',

            })
            return
        }
        setManualBookingData!({
            ...manualBookingData!,
            newAppointmentData: {
                ...manualBookingData?.newAppointmentData!,
                date: slot.start,
                start: DateTime.fromJSDate(slot.start).toFormat('T'),
                end: DateTime.fromJSDate(slot.end).toFormat('T')
            },
            openCreateAppointment: true
        })
    }
    useEffect(() => {
        const handleResize = () => {
            const newView = window.innerWidth < 768 ? "day" : "week";
            setView(prev => (prev === newView ? prev : newView));
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [calendarDate, setCalendarDate] = useState(new Date());
    const scrollTime = React.useMemo(() => {
        const todayEvents = manualBookingData?.appointmentEvents.filter(
            (e) =>
                DateTime.fromJSDate(e.start).hasSame(
                    DateTime.fromJSDate(calendarDate),
                    "day"
                )
        )!;

        if (!todayEvents.length) return DateTime.now().toJSDate();

        const sorted = [...todayEvents].sort(
            (a, b) => a.start.getTime() - b.start.getTime()
        );

        return sorted[0].start;
    }, [manualBookingData?.appointmentEvents, calendarDate]);

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
                        newAppointmentEvent: {
                            ...event,
                            start: start,
                            end: end
                        },
                        openRescheduleConfirmation: true
                    })
                }}
                onEventResize={({ event, start, end }: any) => {
                    setManualBookingData!({
                        ...manualBookingData!,
                        currSelectedEvent: { ...event },
                        newAppointmentEvent: {
                            ...event,
                            start: start,
                            end: end
                        },
                        openRescheduleConfirmation: true
                    })
                }}
                onNavigate={(date) => {
                    setCalendarDate(date)
                }}
                resizable={true}
                scrollToTime={scrollTime}
                step={15}
                timeslots={2}
                selectable
                onSelectSlot={(slot) => {
                    handleSelectedSlot(slot)
                }}

                popup
                components={{
                    toolbar: (props) => (
                        <CalendarHeader
                            date={props.date}
                            currentView={props.view as "day" | "week" | "month"}
                            onNavigate={props.onNavigate}
                            onViewChange={props.onView}
                        />
                    ),
                    event: ({ event }: EventProps) => <MemoEventCard event={event as AppointmentEvent} />,
                }}
            />

            {/* FAB for adding appointments */}

        </div>
    );
}





