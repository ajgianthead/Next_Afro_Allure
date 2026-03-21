'use client'

import React, { useState, useEffect, useRef } from "react";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import { DateTime } from "luxon";
import CalendarHeader from "./CalendarHeader";
import EventCard from "./EventCard";
import "react-big-calendar/lib/css/react-big-calendar.css";
import './calendar.scss'
import AddAppointmentFAB from "./AddAppointmentFAB";

const localizer = momentLocalizer(moment);

export interface AppointmentEvent {
    id: string;
    start: Date;
    end: Date;
    client: string;
    service: string;
    status?: "confirmed" | "pending" | "cancelled";
}

interface Props {
    events: AppointmentEvent[];
}

export default function ResponsiveCalendar({ events }: Props) {
    const [view, setView] = useState<View>(
        window.innerWidth < 768 ? "day" : "week"
    );
    const [date, setDate] = useState(new Date());

    // Auto-update view on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setView("day");
            else if (view === "day") setView("week");
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [view]);

    // Auto-scroll to first appointment
    const getFirstAppointmentTime = () => {
        const todayEvents = events.filter(
            (e) =>
                DateTime.fromJSDate(e.start).hasSame(DateTime.fromJSDate(date), "day")
        );
        if (!todayEvents.length) return DateTime.now().toJSDate();
        const sorted = todayEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
        return sorted[0].start;
    };

    return (
        <div className="calendar-wrapper">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "90vh" }}
                view={view}
                onView={setView}
                date={date}
                enableAutoScroll
                onNavigate={setDate}
                scrollToTime={getFirstAppointmentTime()}
                step={15}
                timeslots={2}
                selectable
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
                    event: EventCard,
                }}
            />

            {/* FAB for adding appointments */}
            <AddAppointmentFAB />
        </div>
    );
}
