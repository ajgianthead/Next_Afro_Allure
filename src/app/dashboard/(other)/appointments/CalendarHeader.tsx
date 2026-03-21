'use client'

import React from "react";
import { DateTime } from "luxon";
import { View } from "react-big-calendar";

interface CalendarHeaderProps {
    date: Date;
    onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
    onViewChange: (view: View) => void;
    currentView: "day" | "week" | "month";
}

export default function CalendarHeader({
    date,
    onNavigate,
    onViewChange,
    currentView,
}: CalendarHeaderProps) {
    const monthName = DateTime.fromJSDate(date).toFormat("LLLL yyyy");
    const dayName = DateTime.fromJSDate(date).toFormat("LLLL dd, yyyy");

    return (
        <div className="gloss-header">
            {currentView === 'day' ? <div className='nav-left'>
                <button onClick={() => onNavigate("PREV")}>&lt;</button>
                <div className="current-month">{currentView === 'day' ? dayName : monthName}</div>
                <button onClick={() => onNavigate("NEXT")}>&gt;</button>
            </div> : <div className='nav-left'>
                <div className="current-month">{monthName}</div>
                <button onClick={() => onNavigate("PREV")}>&lt;</button>

                <button onClick={() => onNavigate("NEXT")}>&gt;</button>
            </div>}


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
            </div>
        </div>
    );
}
