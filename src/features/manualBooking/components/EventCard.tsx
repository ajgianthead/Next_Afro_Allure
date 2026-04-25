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
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ban, Check, EllipsisVertical, X } from "lucide-react";
import { DialogContent, DialogTitle, IconButton, Modal, ModalClose, ModalDialog } from "@mui/joy";
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

interface EventProps {
    event: AppointmentEvent;

}

export default function EventCard({ event }: EventProps) {
    const { manualBookingData, setManualBookingData } = useManualBooking()
    const statusColor = () => {
        switch (event.status) {
            case "CONFIRMED":
                return "#22c55e";
            case "COMPLETED":
                return "#22c55e";
            case "NO_SHOW":
                return "#ef4444";
            case "DENIED":
                return "#ef4444";
            case "PENDING":
                return "#f59e0b";
            case "PROCESSING":
                return "#f59e0b";
            case "CANCELLED":
                return "#ef4444";
            default:
                return "#FC6161";
        }
    };
    let addonPrice = 0
    event.serviceData.addons.forEach((addon: any) => {
        addonPrice += addon.price
    })
    const [cancellingAppointment, setCancellingAppointment] = useState<boolean>(false)
    const [openCancelAlert, setOpenCancelAlert] = useState<boolean>(false)
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
                            {/* <div className="appointment-service">{event.service}</div> */}
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
                </PopoverTrigger>
                <PopoverContent align="start">
                    <PopoverHeader>
                        <PopoverTitle className="flex justify-between items-center">
                            <p>Appointment Details</p>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant={'ghost'}>
                                        <EllipsisVertical size={12} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => {
                                        setManualBookingData!({
                                            ...manualBookingData!,
                                            currSelectedEvent: { ...event },
                                            openRescheduleConfirmation: true
                                        })
                                    }} className="font-medium"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-calendar-sync-icon lucide-calendar-sync"><path d="M11 10v4h4" /><path d="m11 14 1.535-1.605a5 5 0 0 1 8 1.5" /><path d="M16 2v4" /><path d="m21 18-1.535 1.605a5 5 0 0 1-8-1.5" /><path d="M21 22v-4h-4" /><path d="M21 8.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4.3" /><path d="M3 10h4" /><path d="M8 2v4" /></svg> Reschedule</DropdownMenuItem>
                                    <AlertDialog open={openCancelAlert} onOpenChange={(open) => {
                                        setOpenCancelAlert(open)
                                    }}>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem disabled={event.status !== 'CONFIRMED'} onSelect={(e) => e.preventDefault()} className="font-medium" variant="destructive"><Ban />Cancel</DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently cancel the appointment and will notify the client that the appointment was cancelled.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => {
                                                    setOpenCancelAlert(false)
                                                }}>Keep Appointment</AlertDialogCancel>
                                                <AlertDialogAction disabled={cancellingAppointment} onClick={async (e) => {
                                                    e.preventDefault()
                                                    setCancellingAppointment(true)
                                                    try {
                                                        const cancelledAppointment = await cancelAppointmentAction(event.id)
                                                        setManualBookingData!({
                                                            ...manualBookingData!,
                                                            appointmentEvents: manualBookingData?.appointmentEvents.map(ev =>
                                                                ev.id === cancelledAppointment?.id
                                                                    ? { ...ev, status: cancelledAppointment?.status }
                                                                    : ev
                                                            )!
                                                        })
                                                        setOpenCancelAlert(false)
                                                    } catch {
                                                        // keep dialog open so the user can retry
                                                    } finally {
                                                        setCancellingAppointment(false)
                                                    }
                                                }}>{cancellingAppointment ? <Spinner /> : 'Cancel Appointment'}</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                </DropdownMenuContent>
                            </DropdownMenu>


                        </PopoverTitle>
                        <PopoverDescription>
                            <p>Date: {DateTime.fromJSDate(event.start).toFormat('DDDD')}</p>
                            <p>Time: {DateTime.fromJSDate(event.start).toFormat('t')} - {DateTime.fromJSDate(event.end).toFormat('t')}</p>
                            <p>Status: <Badge style={{
                                backgroundColor: `${statusColor()}20`,
                                color: statusColor()
                            }}>

                                {event.status}
                            </Badge></p>
                            <Label className="mt-2 text-xs font-bold mb-1">General</Label>

                            <p className="flex items-center gap-2">Requires Deposit: {event.requiresDeposit ? <Check size={16} color="green" /> : <X size={16} color="red" />}</p>
                            {event.requiresDeposit ?
                                <div>
                                    <p>Deposit Price: ${event.depositPrice / 100}</p>
                                    <p className="flex items-center gap-2">Paid Deposit: {event.paidDeposit ? <Check size={16} color="green" /> : <X size={16} color="red" />}</p>
                                </div> : <></>}
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
