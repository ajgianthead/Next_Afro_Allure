'use client'

import React from "react";
import { AppointmentEvent } from "./ResponsiveCalendar";

interface EventProps {
    event: AppointmentEvent;
}

export default function EventCard({ event }: EventProps) {
    const statusColor = () => {
        switch (event.status) {
            case "confirmed":
                return "#22c55e";
            case "pending":
                return "#f59e0b";
            case "cancelled":
                return "#ef4444";
            default:
                return "#FC6161";
        }
    };

    return (
        <div
            className="appointment-card px-1"
            style={{ borderLeft: `4px solid ${statusColor()}` }}
        >
            <div className="appointment-avatar">
                {event.client ? event.client.charAt(0).toUpperCase() : "?"}
            </div>

            <div className="appointment-info">
                <div className="appointment-client">{event.client}</div>
                <div className="appointment-service">{event.service}</div>
                <div className="appointment-time">
                    {event.start.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {event.end.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            </div>
        </div>
    );
}
