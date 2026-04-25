import { AppointmentData, AppointmentEvent, AppointmentTableData } from "../../types";
import { Calendar, CalendarIcon, Table } from "lucide-react";
import { useState } from "react";

import { useManualBooking } from "../../hooks/useManualBooking";
import { CircularProgress, DialogActions, DialogContent, DialogTitle, Modal, ModalClose, ModalDialog } from "@mui/joy";
import { Caption } from "@/components/tailus-ui/typography";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns"
import { createManualAppointmentAction } from "../../server";

export const CreateAppointmentModal = () => {
    const { manualBookingData, setManualBookingData } = useManualBooking()

    // U4: Use the selected appointment date, not today, so cross-day validation is correct
    const validateInputs = () => {
        const selectedDate = manualBookingData?.newAppointmentData.date ?? new Date()
        const startParts = manualBookingData?.newAppointmentData.start.split(':')
        const endParts = manualBookingData?.newAppointmentData.end.split(':')

        if (manualBookingData?.newAppointmentData.start.length === 0 || manualBookingData?.newAppointmentData.end.length === 0) {
            setManualBookingData!({
                ...manualBookingData!,
                error: { hasError: true, message: 'Please enter a valid start and end time' }
            })
            return false
        }

        const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), Number(startParts![0]), Number(startParts![1]))
        const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), Number(endParts![0]), Number(endParts![1]))

        if (end <= start) {
            setManualBookingData!({
                ...manualBookingData!,
                error: { hasError: true, message: 'End time must be after start time' }
            })
            return false
        }
        if (manualBookingData?.newAppointmentData.serviceId.length === 0) {
            setManualBookingData!({
                ...manualBookingData!,
                error: { hasError: true, message: 'Please select a service' }
            })
            return false
        }
        if (!manualBookingData?.newAppointmentData.clientData.firstName.length ||
            !manualBookingData?.newAppointmentData.clientData.lastName.length ||
            !manualBookingData?.newAppointmentData.clientData.email.length ||
            !manualBookingData?.newAppointmentData.clientData.phoneNumber.length
        ) {
            setManualBookingData!({
                ...manualBookingData!,
                error: { hasError: true, message: 'Please enter client information' }
            })
            return false
        }
        return true
    }

    const handleNewAppointmentModalClose = () => {
        setManualBookingData!({
            ...manualBookingData!,
            newAppointmentData: {
                start: "",
                end: "",
                date: new Date(),
                serviceId: '',
                clientData: {
                    firstName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: ""
                },
                selectedAddons: new Set(),
                deposit: manualBookingData?.policy.deposit.enabled!
            },
            openCreateAppointment: false,
            error: { hasError: false, message: "" }
        })
    }

    return (
        <Modal open={manualBookingData?.openCreateAppointment!} onClose={() => {
            handleNewAppointmentModalClose()
        }}>
            <ModalDialog size="lg" sx={{ width: 500 }}>
                <ModalClose />
                <DialogTitle>Create Appointment</DialogTitle>
                {manualBookingData?.error.hasError ? <Caption size={'sm'} className="text-red-500">{manualBookingData?.error.message}</Caption> : <></>}
                <div className="flex gap-5 flex-col">
                    <div className="flex flex-col gap-2">
                        <Caption className="font-semibold">Date</Caption>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    size={'sm'}
                                    variant="outline"
                                    data-empty={!manualBookingData?.newAppointmentData.date}
                                    className="w-70 justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                >
                                    <CalendarIcon />
                                    {manualBookingData?.newAppointmentData.date ? <p className="text-sm">{format(manualBookingData?.newAppointmentData.date, "PPP")}</p> : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-9999">
                                <CalendarComponent disabled={(date) => date < new Date()} required mode="single" selected={manualBookingData?.newAppointmentData.date} onSelect={(e) => setManualBookingData!({
                                    ...manualBookingData!,
                                    newAppointmentData: { ...manualBookingData?.newAppointmentData!, date: e }
                                })} />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col gap-2">
                                <Caption className="font-semibold">Start Time</Caption>
                                <Input data-testid='start-time' value={manualBookingData?.newAppointmentData.start} onChange={(e) => {
                                    setManualBookingData!({
                                        ...manualBookingData!,
                                        newAppointmentData: { ...manualBookingData?.newAppointmentData!, start: e.target.value }
                                    })
                                }} style={{ fontSize: 14 }} type='time' />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Caption className="font-semibold">End Time</Caption>
                                <Input data-testid='end-time' value={manualBookingData?.newAppointmentData.end} onChange={(e) => {
                                    setManualBookingData!({
                                        ...manualBookingData!,
                                        newAppointmentData: { ...manualBookingData?.newAppointmentData!, end: e.target.value }
                                    })
                                }} style={{ fontSize: 14 }} type='time' />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Caption className="font-semibold">Service</Caption>
                        <Select onValueChange={(value) => {
                            setManualBookingData!({
                                ...manualBookingData!,
                                newAppointmentData: { ...manualBookingData?.newAppointmentData!, serviceId: value }
                            })
                        }}>
                            <SelectTrigger data-testid='select-service-btn' style={{ fontSize: 14 }} size="sm" className="w-45 text-sm">
                                <SelectValue placeholder='Select a service' className="text-sm" />
                            </SelectTrigger>
                            <SelectContent data-testid='service-name' className="z-9999">
                                {manualBookingData?.services.map((service, index) => {
                                    return <div key={index}>
                                        <SelectItem data-testid='service-name' value={service.id}>{service.name}</SelectItem>
                                    </div>
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* U1+U2: Each addon gets a unique id and a readable label with name + price */}
                    {manualBookingData?.newAppointmentData.serviceId.length! > 0 && manualBookingData?.services.filter((service) => service.id === manualBookingData.newAppointmentData.serviceId)[0].addons.length ? <div className="flex flex-col gap-2">
                        <Caption className="font-semibold">Addon(s)</Caption>
                        <div>
                            <FieldGroup>
                                {manualBookingData.services.filter((service) => service.id === manualBookingData.newAppointmentData.serviceId)[0].addons.map((addon, index) => {
                                    const addonId = `addon-${addon.id}`
                                    return (
                                        <div key={index}>
                                            <Field orientation={'horizontal'}>
                                                <Checkbox
                                                    checked={manualBookingData.newAppointmentData.selectedAddons.has(addon.id)}
                                                    onCheckedChange={(checked: boolean) => {
                                                        let newSet = new Set([...manualBookingData.newAppointmentData.selectedAddons])
                                                        if (manualBookingData.newAppointmentData.selectedAddons.has(addon.id)) {
                                                            newSet.delete(addon.id)
                                                        } else {
                                                            newSet.add(addon.id)
                                                        }
                                                        setManualBookingData!({
                                                            ...manualBookingData,
                                                            newAppointmentData: { ...manualBookingData.newAppointmentData, selectedAddons: newSet }
                                                        })
                                                    }}
                                                    id={addonId}
                                                />
                                                <FieldLabel htmlFor={addonId}>
                                                    {addon.name} — ${(addon.price / 100).toFixed(2)}
                                                </FieldLabel>
                                            </Field>
                                        </div>
                                    )
                                })}
                            </FieldGroup>
                        </div>
                    </div> : <></>}

                    <div className="flex flex-col gap-2">
                        <Caption className="font-semibold">Client Information</Caption>
                        <div className="grid grid-cols-2 grid-rows-2 gap-2">
                            <div>
                                <Input data-testid={'first-name'} value={manualBookingData?.newAppointmentData.clientData.firstName}
                                    onChange={(e) => {
                                        setManualBookingData!({
                                            ...manualBookingData!,
                                            newAppointmentData: {
                                                ...manualBookingData?.newAppointmentData!,
                                                clientData: { ...manualBookingData?.newAppointmentData.clientData!, firstName: e.target.value }
                                            }
                                        })
                                    }} style={{ fontSize: 14 }} placeholder='First Name' />
                            </div>
                            <div>
                                <Input data-testid={'last-name'} onChange={(e) => {
                                    setManualBookingData!({
                                        ...manualBookingData!,
                                        newAppointmentData: {
                                            ...manualBookingData?.newAppointmentData!,
                                            clientData: { ...manualBookingData?.newAppointmentData.clientData!, lastName: e.target.value }
                                        }
                                    })
                                }} value={manualBookingData?.newAppointmentData.clientData.lastName} style={{ fontSize: 14 }} placeholder='Last Name' />
                            </div>
                            <div>
                                <Input data-testid={'email'} onChange={(e) => {
                                    setManualBookingData!({
                                        ...manualBookingData!,
                                        newAppointmentData: {
                                            ...manualBookingData?.newAppointmentData!,
                                            clientData: { ...manualBookingData?.newAppointmentData.clientData!, email: e.target.value }
                                        }
                                    })
                                }} value={manualBookingData?.newAppointmentData.clientData.email} style={{ fontSize: 14 }} placeholder="Email" />
                            </div>
                            <div>
                                <Input data-testid={'phone-number'} onChange={(e) => {
                                    setManualBookingData!({
                                        ...manualBookingData!,
                                        newAppointmentData: {
                                            ...manualBookingData?.newAppointmentData!,
                                            clientData: { ...manualBookingData?.newAppointmentData.clientData!, phoneNumber: e.target.value }
                                        }
                                    })
                                }} value={manualBookingData?.newAppointmentData.clientData.phoneNumber} style={{ fontSize: 14 }} placeholder="Phone Number" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <FieldGroup>
                            <Field orientation={'horizontal'}>
                                <Checkbox disabled={!manualBookingData?.policy.deposit.enabled} checked={manualBookingData?.newAppointmentData.deposit} onCheckedChange={(checked: boolean) => {
                                    setManualBookingData!({
                                        ...manualBookingData!,
                                        newAppointmentData: { ...manualBookingData?.newAppointmentData!, deposit: checked }
                                    })
                                }} id='require-deposit' />
                                <FieldLabel htmlFor="require-deposit">
                                    Require deposit
                                </FieldLabel>
                            </Field>
                        </FieldGroup>
                    </div>
                </div>
                <DialogActions>
                    <Button data-testid={'submit-appointment'} disabled={manualBookingData?.creatingAppointment} onClick={async () => {
                        if (!validateInputs()) {
                            // U3: Keep modal open on validation failure so the user can correct the error
                            return
                        }
                        setManualBookingData!({ ...manualBookingData!, creatingAppointment: true })
                        try {
                            // E2: catch server errors so the spinner clears and the modal stays usable
                            const appointment = await createManualAppointmentAction(manualBookingData?.newAppointmentData!) as AppointmentEvent
                            setManualBookingData!({
                                ...manualBookingData!,
                                appointmentEvents: [...manualBookingData?.appointmentEvents!, appointment],
                                creatingAppointment: false
                            })
                            handleNewAppointmentModalClose()
                        } catch (err: any) {
                            setManualBookingData!({
                                ...manualBookingData!,
                                creatingAppointment: false,
                                error: { hasError: true, message: err?.message ?? 'Failed to create appointment. Please try again.' }
                            })
                        }
                    }} style={{ fontSize: 14 }}>{manualBookingData?.creatingAppointment ? <CircularProgress size="sm" /> : "Create Appointment"}</Button>
                    <Button disabled={manualBookingData?.creatingAppointment} style={{ fontSize: 14 }} variant={'outline'} onClick={() => handleNewAppointmentModalClose()}>Cancel</Button>
                </DialogActions>
            </ModalDialog>
        </Modal>
    )
}
