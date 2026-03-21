"use client";

import { useEffect, useState, useRef } from "react";
import { Calendar, luxonLocalizer, EventProps } from "react-big-calendar";
import { DateTime } from "luxon";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.scss";

const localizer = luxonLocalizer(DateTime);

/* -----------------------
   Event Type
----------------------- */

export interface AppointmentEvent {
    id: string;
    title: string;
    client: string;
    service: string;
    time: string;
    status: "confirmed" | "pending" | "cancelled";
    start: Date;
    end: Date;
}

/* -----------------------
   Mobile Hook
----------------------- */

function useMobile(): boolean {
    const [mobile, setMobile] = useState(false);

    useEffect(() => {
        const check = () => setMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return mobile;
}

/* -----------------------
   Custom Event Card
----------------------- */

function EventCard(props: EventProps<AppointmentEvent>) {
    const { event } = props;

    const initials = event.client
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const start = DateTime.fromJSDate(event.start).toFormat("h:mm a");

    return (
        <div className="appointment-card">
            <div className="appointment-avatar">{initials}</div>

            <div className="appointment-info">
                <div className="appointment-client">{event.client}</div>
                <div className="appointment-service">{event.service}</div>
                <div className="appointment-time">{start}</div>
            </div>
        </div>
    );
}

/* -----------------------
   Calendar Component
----------------------- */

function getFirstAppointmentTime(events: AppointmentEvent[]) {
    if (!events.length) return DateTime.now().toJSDate();

    const sorted = [...events].sort(
        (a, b) => a.start.getTime() - b.start.getTime()
    );

    return sorted[0].start;
}

interface AfroCalendarProps {
    events: AppointmentEvent[];
}

interface CalendarHeaderProps {
    date: Date;
    onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
    onViewChange: (view: "day" | "week" | "month") => void;
    currentView: "day" | "week" | "month";
    onAddAppointment: () => void;
}

function CalendarHeader({
    date,
    onNavigate,
    onViewChange,
    currentView,
    onAddAppointment,
}: CalendarHeaderProps) {
    const monthName = DateTime.fromJSDate(date).toFormat("LLLL yyyy");

    return (
        <div className="gloss-header">
            <div className="nav-left">
                <button onClick={() => onNavigate("PREV")}>&lt;</button>
                <button onClick={() => onNavigate("TODAY")}>Today</button>
                <button onClick={() => onNavigate("NEXT")}>&gt;</button>
            </div>

            <div className="current-month">{monthName}</div>

            <div className="nav-right">
                <button
                    className={currentView === "day" ? "active" : ""}
                    onClick={() => onViewChange("day")}
                >
                    Day
                </button>
                <button
                    className={currentView === "week" ? "active" : ""}
                    onClick={() => onViewChange("week")}
                >
                    Week
                </button>
                <button
                    className={currentView === "month" ? "active" : ""}
                    onClick={() => onViewChange("month")}
                >
                    Month
                </button>

                <button className="add-btn" onClick={onAddAppointment}>
                    + Add
                </button>
            </div>
        </div>
    );
}

export default function AfroCalendar({ events }: AfroCalendarProps) {
    const isMobile = useMobile();

    return (
        <div className="calendar-wrapper">
            <Calendar<AppointmentEvent>
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                step={15}
                timeslots={2}
                scrollToTime={getFirstAppointmentTime(events)}
                defaultView={isMobile ? "day" : "week"}
                view={isMobile ? "day" : "week"}
                components={{
                    event: EventCard, toolbar: (props) => (
                        <CalendarHeader
                            date={props.date}
                            currentView={props.view as any}
                            onNavigate={props.onNavigate}
                            onViewChange={props.onView}
                            onAddAppointment={() => console.log("Add new appointment")}
                        />
                    ),
                }}
                popup
                selectable
                longPressThreshold={10}
                style={{ height: "85vh" }}
            />
        </div>
    );
}
