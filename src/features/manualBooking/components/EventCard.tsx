'use client'

import React, { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { DateTime } from "luxon";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ban, Check, ChevronRight, CircleCheckBig, EllipsisVertical, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner";
import { AppointmentEvent } from "../types";
import { cancelAppointmentAction } from "../server/actions";
import { useManualBooking } from "../hooks/useManualBooking";
import { markAppointmentAs } from "@/app/dashboard/(other)/appointments/actions";

interface EventProps {
    event: AppointmentEvent;
}

export default function EventCard({ event }: EventProps) {
    const { manualBookingData, setManualBookingData } = useManualBooking()
    const isConfirmed = event.status === 'CONFIRMED'

    const statusColor = () => {
        switch (event.status) {
            case "CONFIRMED":  return "#22c55e";
            case "COMPLETED":  return "#22c55e";
            case "NO_SHOW":    return "#ef4444";
            case "DENIED":     return "#ef4444";
            case "PENDING":    return "#f59e0b";
            case "PROCESSING": return "#f59e0b";
            case "CANCELLED":  return "#ef4444";
            default:           return "#FC6161";
        }
    };

    let addonPrice = 0
    event.serviceData.addons.forEach((addon: any) => { addonPrice += addon.price })

    const [cancellingAppointment, setCancellingAppointment] = useState(false)
    const [openCancelAlert, setOpenCancelAlert] = useState(false)
    const [updatingStatus, setUpdatingStatus] = useState(false)

    const handleMarkAs = async (newStatus: 'COMPLETED' | 'NO_SHOW') => {
        if (updatingStatus) return
        setUpdatingStatus(true)
        try {
            const result = await markAppointmentAs(newStatus, event.amountDue, event.id)
            if (result) {
                setManualBookingData!({
                    ...manualBookingData!,
                    appointmentEvents: manualBookingData!.appointmentEvents.map(ev =>
                        ev.id === event.id
                            ? { ...ev, status: result.status, amountDue: result.amount_due ?? ev.amountDue }
                            : ev
                    )
                })
            }
        } catch {
            // silent — user can retry from dropdown
        } finally {
            setUpdatingStatus(false)
        }
    }

    return (
        <div>
            <Popover>
                <PopoverTrigger asChild>
                    <div
                        className="appointment-card px-1"
                        style={{ borderLeft: `4px solid ${statusColor()}` }}
                    >
                        <div className="appointment-avatar">
                            {event.clientData.firstName ? event.clientData.firstName.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="appointment-info">
                            <div className="appointment-client">{event.title}</div>
                            <div className="appointment-time">
                                {event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                {" - "}
                                {event.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent align="start">
                    <PopoverHeader>
                        <PopoverTitle className="flex justify-between items-center">
                            <p>Appointment Details</p>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost">
                                        {updatingStatus ? <Spinner /> : <EllipsisVertical size={12} />}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {/* Reschedule — only for CONFIRMED */}
                                    <DropdownMenuItem
                                        disabled={!isConfirmed}
                                        onClick={() => {
                                            if (!isConfirmed) return
                                            setManualBookingData!({
                                                ...manualBookingData!,
                                                currSelectedEvent: { ...event },
                                                openRescheduleConfirmation: true
                                            })
                                        }}
                                        className="font-medium"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 10v4h4" /><path d="m11 14 1.535-1.605a5 5 0 0 1 8 1.5" />
                                            <path d="M16 2v4" /><path d="m21 18-1.535 1.605a5 5 0 0 1-8-1.5" />
                                            <path d="M21 22v-4h-4" /><path d="M21 8.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4.3" />
                                            <path d="M3 10h4" /><path d="M8 2v4" />
                                        </svg>
                                        Reschedule
                                    </DropdownMenuItem>

                                    {/* Cancel — only for CONFIRMED */}
                                    <AlertDialog open={openCancelAlert} onOpenChange={setOpenCancelAlert}>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem
                                                disabled={!isConfirmed}
                                                onSelect={(e) => e.preventDefault()}
                                                className="font-medium"
                                                variant="destructive"
                                            >
                                                <Ban size={16} /> Cancel
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently cancel the appointment and notify the client.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => setOpenCancelAlert(false)}>
                                                    Keep Appointment
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    disabled={cancellingAppointment}
                                                    onClick={async (e) => {
                                                        e.preventDefault()
                                                        setCancellingAppointment(true)
                                                        try {
                                                            const cancelled = await cancelAppointmentAction(event.id)
                                                            setManualBookingData!({
                                                                ...manualBookingData!,
                                                                appointmentEvents: manualBookingData!.appointmentEvents.map(ev =>
                                                                    ev.id === cancelled?.id ? { ...ev, status: cancelled.status } : ev
                                                                )
                                                            })
                                                            setOpenCancelAlert(false)
                                                        } catch {
                                                            // keep dialog open
                                                        } finally {
                                                            setCancellingAppointment(false)
                                                        }
                                                    }}
                                                >
                                                    {cancellingAppointment ? <Spinner /> : 'Cancel Appointment'}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <DropdownMenuSeparator />

                                    {/* Mark As — only for CONFIRMED */}
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger disabled={!isConfirmed} className="font-medium">
                                            <ChevronRight size={16} /> Mark As
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuItem onClick={() => handleMarkAs('COMPLETED')} className="font-medium">
                                                <CircleCheckBig size={16} className="text-green-500" />
                                                Completed — Cash
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleMarkAs('NO_SHOW')} className="font-medium">
                                                <UserX size={16} className="text-red-500" />
                                                No Show
                                            </DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </PopoverTitle>
                        <PopoverDescription>
                            <p>Date: {DateTime.fromJSDate(event.start).toFormat('DDDD')}</p>
                            <p>Time: {DateTime.fromJSDate(event.start).toFormat('t')} - {DateTime.fromJSDate(event.end).toFormat('t')}</p>
                            <p>Status: <Badge style={{ backgroundColor: `${statusColor()}20`, color: statusColor() }}>{event.status}</Badge></p>
                            <Label className="mt-2 text-xs font-bold mb-1">General</Label>
                            <p className="flex items-center gap-2">Requires Deposit: {event.requiresDeposit ? <Check size={16} color="green" /> : <X size={16} color="red" />}</p>
                            {event.requiresDeposit && (
                                <div>
                                    <p>Deposit Price: ${event.depositPrice / 100}</p>
                                    <p className="flex items-center gap-2">Paid Deposit: {event.paidDeposit ? <Check size={16} color="green" /> : <X size={16} color="red" />}</p>
                                </div>
                            )}
                            <Label className="mt-2 text-xs font-bold mb-1">Service</Label>
                            <p>Name: {event.serviceData.name}</p>
                            <p>Amount Due: ${(event.amountDue) / 100}</p>
                            <Label className="mt-2 text-xs font-bold mb-1">Client</Label>
                            <p>Name: {event.clientData.firstName} {event.clientData.lastName}</p>
                            <p>Email: {event.clientData.email}</p>
                            <p>Phone Number: {event.clientData.phoneNumber}</p>
                        </PopoverDescription>
                    </PopoverHeader>
                </PopoverContent>
            </Popover>
        </div>
    );
}
