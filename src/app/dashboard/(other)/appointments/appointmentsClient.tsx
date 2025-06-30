"use client"
import 'react-big-calendar/lib/css/react-big-calendar.css';
import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, DateRange, Event, EventWrapperProps, luxonLocalizer, SlotInfo, View, Views } from 'react-big-calendar'
import { DateTime } from 'luxon';
import Button from '@tailus-ui/Button';
import Dialog from '@components/Dialog';
import { Caption, Text, Title } from '@tailus-ui/typography';
import DropdownMenu from "@components/DropdownMenu";
import Select from '@components/Select';
import { parseAbsoluteToLocal, Time, ZonedDateTime } from "@internationalized/date";
import { CheckIcon, ChevronDown, ChevronsDown, ChevronsUpDown, EllipsisVertical, Info, Pencil, Trash, X } from 'lucide-react';
import Label from '@components/Label';
import { useUserContext } from '@utils/context/UserContext';
import "./calendar.css"
import Input from '@components/Input';
import CircularProgress from '@mui/joy/CircularProgress';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { TimeInput, DateInput, DateInputValue, TimeInputValue } from '@nextui-org/date-input';
import Chip from '@mui/joy/Chip';
import Checkbox from '@components/Checkbox';
import { Checkbox as MUICheckBox, Skeleton } from '@mui/joy';
import Aligner from '@components/Aligner';
import { businessRescheduling, manuallyCancel } from './actions';
import { Drawer, ModalClose, Button as MUIButton } from '@mui/joy';
import Toast from '@components/Toast';
import { Backdrop } from '@mui/material';
import { CheckedState } from '@radix-ui/react-checkbox';

const color: any = {
    "PENDING": "warning",
    "CONFIRMED": "success",
    "COMPLETED": 'info',
    "DENIED": 'danger',
    "CANCELLED": "danger"
}


const AppointmentsClient = () => {
    // Get all appointments and convert from ISO => DateTimes
    const { user } = useUserContext();
    const [loadingData, setLoadingData] = useState<boolean>(true);
    const [appointments, setAppointments] = useState<any>([]);
    const [cancelledAppointmentsChecked, setCancelledAppointmentsChecked] = useState<boolean>(true)
    const [policy, setPolicy] = useState<any>(null)
    const [filteredAppointments, setFilteredAppointments] = useState<any>([]);
    useEffect(() => {
        if (user.business_id && policy === null) {
            (async () => {
                const res = await fetch(`http://localhost:3000/api/${user.business_id}/booking`, {
                    method: 'GET'
                })
                const result = await res.json()
                console.log(result)
                setDepositRequired(result.policy.deposit.enabled)
                setPolicy(result.policy)
                setServices(result.services)
                if (result.appointments) {
                    let temp = []
                    for (let i = 0; i < result.appointments.length; i++) {
                        temp.push({
                            id: result.appointments[i].id,
                            start: new Date(result.appointments[i].start),
                            end: new Date(result.appointments[i].end),
                            title: `${result.appointments[i].service_data.name} with ${result.appointments[i].client_metadata.firstName}`,
                            status: result.appointments[i].status,
                            client_metadata: result.appointments[i].client_metadata,
                            service_data: result.appointments[i].service_data,
                            require_deposit: result.appointments[i].require_deposit,
                            paid_deposit: result.appointments[i].paid_deposit,
                            policy_id: result.appointments[i].policy_id,
                            deposit_charge_id: result.appointments[i].deposit_charge_id,
                            reschedules: result.appointments[i].reschedules,
                            deposit_price: result.appointments[i].deposit_price,
                            addons: [...result.appointments[i].selected_addons]

                        })
                    }
                    setAppointments(temp)
                }

                setLoadingData(false)
            })()
        }
        if (cancelledAppointmentsChecked) {
            let temp = []
            for (let i = 0; i < appointments.length; i++) {
                if (appointments[i].status !== "CANCELLED") {
                    temp.push({
                        id: appointments[i].id,
                        start: new Date(appointments[i].start),
                        end: new Date(appointments[i].end),
                        title: `${appointments[i].service_data.name} with ${appointments[i].client_metadata.firstName}`,
                        status: appointments[i].status,
                        client_metadata: appointments[i].client_metadata,
                        service_data: appointments[i].service_data,
                        require_deposit: appointments[i].require_deposit,
                        paid_deposit: appointments[i].paid_deposit,
                        policy_id: appointments[i].policy_id,
                        deposit_charge_id: appointments[i].deposit_charge_id,
                        reschedules: appointments[i].reschedules,
                        deposit_price: appointments[i].deposit_price,
                        addons: [...appointments[i].addons]
                    })
                }
                if (eventData && appointments[i].id === eventData.id) {
                    setEventData(null)
                }
            }
            setFilteredAppointments(temp)
        } else {
            let temp = []
            for (let i = 0; i < appointments.length; i++) {
                temp.push({
                    id: appointments[i].id,
                    start: new Date(appointments[i].start),
                    end: new Date(appointments[i].end),
                    title: `${appointments[i].service_data.name} with ${appointments[i].client_metadata.firstName}`,
                    status: appointments[i].status,
                    client_metadata: appointments[i].client_metadata,
                    service_data: appointments[i].service_data,
                    require_deposit: appointments[i].require_deposit,
                    paid_deposit: appointments[i].paid_deposit,
                    policy_id: appointments[i].policy_id,
                    deposit_charge_id: appointments[i].deposit_charge_id,
                    reschedules: appointments[i].reschedules,
                    deposit_price: appointments[i].deposit_price,
                    addons: [...appointments[i].addons]

                })

            }
            setFilteredAppointments(temp)
        }
    }, [user, cancelledAppointmentsChecked, appointments]);
    interface DateRange {
        start: DateTime,
        end: DateTime
    }
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [slotInfo, setSlotInfo] = useState<DateRange>()
    const [services, setServices] = useState<any[]>([])
    const localizer = luxonLocalizer(DateTime)
    const [currentAddons, setCurrentAddons] = useState(new Set<string>())
    const handleSelection = (slot: any) => {
        if (DateTime.fromISO(slot.start.toISOString()) > DateTime.now()) {
            let range: DateRange = {
                start: DateTime.fromISO(slot.start.toISOString()),
                end: DateTime.fromISO(slot.end.toISOString())
            }
            setSlotInfo(range)
            setIsOpen(true)
        } else {
            setHasError(true)
            setErrorMessage({
                title: "Error: Selection Denied",
                description: "Unable to create appointment in the past"
            })
        }

    }

    const [selectedService, setSelectedService] = useState<string>("")
    // Create an appointment Supabase => Local State
    const createAppointment = async () => {
        if (slotInfo?.start && slotInfo.end) {
            const service = services.filter((data: any, index: number) => data.id === selectedService)[0]
            let depositPrice;
            if (depositRequired) {
                if (policy.deposit.settings.type === 'percent') {
                    depositPrice = (service.price * (policy.deposit.settings.value / 100))
                }
                else if (policy.deposit.settings.type === 'flat') {
                    depositPrice = policy.deposit.settings.value
                }
            }
            let addonArray = [...Array.from(currentAddons)]
            let addonResult = []
            for (let i = 0; i < addonArray.length; i++) {
                addonResult.push(service.addonDetails.filter((addon: any) => addon.id === addonArray[i])[0])
            }
            setIsSending(true)
            const appointment: any = {
                id: "",
                created_at: "",
                updated_at: "",
                business: user.business_id,
                client: "",
                start: slotInfo.start.toISO() || "",
                end: slotInfo.end.toISO() || "",
                client_metadata: clientInformation,
                status: "PENDING",
                service_data: { ...service },
                require_deposit: depositRequired,
                paid_deposit: false,
                policy_id: policy.id,
                deposit_charge_id: "",
                reschedules: policy.reschedule_limit,
                deposit_price: depositRequired ? depositPrice : null,
                addons: addonResult
            }
            const res = await fetch(`http://localhost:3000/api/appointments`, {
                method: 'POST',
                body: JSON.stringify(appointment)
            })
            setAppointments([
                ...appointments,
                {
                    id: appointment.id,
                    start: new Date(appointment.start),
                    end: new Date(appointment.end),
                    title: `${service.name} with ${clientInformation.firstName}`,
                    client_metadata: appointment.client_metadata,
                    service_data: appointment.service_data,
                    status: appointment.status,
                    require_deposit: appointment.require_deposit,
                    paid_deposit: appointment.paid_deposit,
                    policy_id: policy.id,
                    deposit_charge_id: "",
                    reschedules: policy.reschedule_limit,
                    deposit_price: appointment.deposit_price,
                    addons: addonResult

                }
            ])

            setConfirmation({
                title: "Appointment Created!",
                description: "Confirmation sent to client email. Waiting for client approval"
            })
            setConfirmationOpen(true)
            setClientInformation({
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: ""
            })
            setIsOpen(false)
            setIsSending(false)
        }

    }
    // Reschedule an appointment

    // Delete an appointment
    const handleDelete = async (appointmentID: string) => {
        const res = await fetch(`http://localhost:3000/api/appointments`, {
            method: 'PUT',
            body: JSON.stringify({
                id: appointmentID,
                start: eventData.start,
                end: eventData.end,
                status: 'CANCELLED'
            })
        })
        const response = await res.json();
        // Delete in local state
        let clone = [...appointments]
        let id = clone.findIndex((appointment) => appointment.id === response.data.id)
        clone[id] = response.data
        setAppointments(clone)

        return response
    }

    const handleEvent = (event: any) => {

    }
    // Add a new client to clientele
    const [clientInformation, setClientInformation] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: ""
    })
    const [depositRequired, setDepositRequired] = useState<boolean>(policy ? policy.deposit.enabled : false)
    const [view, setView] = useState<View>("week")
    const onView = useCallback((newView: View) => setView(newView), [setView])
    const [open, setOpen] = useState<boolean>(false)
    const [openDrawer, setOpenDrawer] = useState<boolean>(false)
    const [eventData, setEventData] = useState<any>(null)
    const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false)
    const [confirmation, setConfirmation] = useState<{
        title: string;
        description: string;
    }>({ title: "", description: "" })
    const [hasError, setHasError] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<{ title: string; description: string; }>({ title: "", description: "" })
    const [isEditingDateTime, setIsEditingDateTime] = useState<boolean>(false)
    const [date, setDate] = useState<any>(new Date())
    const onNavigate = useCallback((newDate: any) => setDate(newDate), [setDate])
    const [isSending, setIsSending] = useState<boolean>(false)

    return (
        <div className=' max-h-min  w-full'>
            <Toast.Provider>
                <Toast.Root open={confirmationOpen || hasError} onOpenChange={(open: boolean) => {
                    if (confirmationOpen) {
                        setConfirmationOpen(open)
                    } else {
                        setHasError(open)
                    }
                }}>
                    <Toast.Title>{confirmationOpen ? confirmation.title : errorMessage.title}</Toast.Title>
                    <Toast.Description>{confirmationOpen ? confirmation.description : errorMessage.description}</Toast.Description>
                    <Toast.Action altText='action' />
                    <Toast.Close />
                </Toast.Root>

                <Toast.Viewport />
            </Toast.Provider>
            <Dialog.Root open={isOpen} onOpenChange={(open) => {
                setIsEditingDateTime(false)
                setIsOpen(open)
                if (!open) {
                    setSelectedService("")
                    setCurrentAddons(new Set<string>())
                }

            }}>
                <Dialog.Portal>
                    <Dialog.Overlay className='z-40' />
                    <Dialog.Content className="max-w-lg z-50">
                        <Dialog.Title>Create New Appointment</Dialog.Title>

                        {!isEditingDateTime &&
                            <div>
                                <Caption>{slotInfo?.start.year === slotInfo?.end.year && slotInfo?.start.month === slotInfo?.end.month && slotInfo?.start.day === slotInfo?.end.day ? `${slotInfo?.start.toFormat("MMMM d, yyyy")}` : `${slotInfo?.start.toFormat("MMMM d, yyyy")} - ${slotInfo?.end.toFormat("MMMM d, yyyy")}`}</Caption>
                                <div className='flex gap-2 items-end'>
                                    <Caption>{`${slotInfo?.start.toFormat("h:mm a")} - ${slotInfo?.end.toFormat("h:mm a")}`}</Caption>
                                    <Caption onClick={() => {
                                        setIsEditingDateTime(true)
                                    }} className='underline cursor-pointer font-medium'>Edit</Caption>
                                </div>
                            </div>

                        }
                        <div>
                            {slotInfo && isEditingDateTime && <div className='flex mt-2 flex-col gap-1'>
                                <DateInput
                                    maxValue={parseAbsoluteToLocal(slotInfo?.end.plus({ minute: 1 }).toISO()!)}
                                    onChange={(value: ZonedDateTime | null) => {
                                        setSlotInfo({
                                            start: DateTime.fromISO(value!.toAbsoluteString()),
                                            end: slotInfo.end
                                        })
                                    }}
                                    value={parseAbsoluteToLocal(slotInfo?.start.toISO()!)}
                                    label={"Start Date & Time"}
                                    labelPlacement="inside"
                                />
                                <DateInput
                                    minValue={parseAbsoluteToLocal(slotInfo?.start.plus({ minute: 1 }).toISO()!)}
                                    onChange={(value: ZonedDateTime | null) => {
                                        setSlotInfo({
                                            end: DateTime.fromISO(value!.toAbsoluteString()),
                                            start: slotInfo.start
                                        })
                                    }}
                                    value={parseAbsoluteToLocal(slotInfo?.end.toISO()!)}
                                    label={"End Date & Time"}
                                    labelPlacement="inside"
                                />
                                <div className='w-full flex justify-end'>
                                    <Caption onClick={() => {
                                        setIsEditingDateTime(false)
                                    }} className='underline cursor-pointer font-medium'>Save Changes</Caption>
                                </div>
                            </div>}

                        </div>
                        <Dialog.Description className="mt-2">
                            <div className='gap-3 flex flex-col'>

                                <div>
                                    <Label className='text-sm font-medium'>Service</Label>
                                    <Select.Root defaultValue="" onValueChange={(value: string) => {
                                        setSelectedService(value)
                                        setSlotInfo({
                                            start: slotInfo?.start!,
                                            end: slotInfo?.start.plus({ minutes: services.filter((service) => service.id === value)[0].length })!
                                        })
                                    }}>
                                        <Select.Trigger size="md" className="w-56 flex justify-between">
                                            <Select.Value placeholder={
                                                <Caption>Select a service</Caption>} />
                                            <Select.Icon>
                                                <ChevronDown size={16} />                                        </Select.Icon>
                                        </Select.Trigger>

                                        <Select.Portal>
                                            <Select.Content mixed className="z-50">
                                                <Select.Viewport>
                                                    {
                                                        services.map((service) => (
                                                            <SelectItem service={service} key={service.name} />
                                                        ))
                                                    }
                                                </Select.Viewport>
                                            </Select.Content>
                                        </Select.Portal>
                                    </Select.Root></div>

                                {selectedService.length ? <div>
                                    <Label className='text-sm font-medium'>Service Addons</Label>
                                    {services.filter(service => service.id === selectedService)[0].addonDetails.map((addon: any, index: number) => {
                                        return (
                                            <div key={index} className='flex gap-2 items-center'>
                                                <Checkbox.Root onCheckedChange={(e: CheckedState) => {
                                                    if (e) {
                                                        if (currentAddons.has(addon.id)) {
                                                            let temp = currentAddons;
                                                            temp.delete(addon.id)
                                                            setCurrentAddons(temp)

                                                        }
                                                        else {
                                                            let temp = currentAddons;
                                                            temp.add(addon.id)
                                                            setCurrentAddons(temp)
                                                        }
                                                    }
                                                }} value={addon.id}>
                                                    <Checkbox.Indicator />
                                                </Checkbox.Root>
                                                <Label>{addon.name}</Label>
                                            </div>
                                        )
                                    })}
                                </div> : <></>}
                                <div>

                                    <Label className='text-sm font-medium'>Client Information</Label>
                                    <div className='flex flex-col gap-2'>
                                        <div className='flex gap-2'>
                                            <Input placeholder="First Name" value={clientInformation.firstName} onChange={(e) => {
                                                setClientInformation({
                                                    ...clientInformation,
                                                    firstName: e.target.value
                                                })
                                            }} />
                                            <Input placeholder="Last Name" value={clientInformation.lastName} onChange={(e) => {
                                                setClientInformation({
                                                    ...clientInformation,
                                                    lastName: e.target.value
                                                })
                                            }} />
                                        </div>
                                        <Input placeholder="Email" value={clientInformation.email} onChange={(e) => {
                                            setClientInformation({
                                                ...clientInformation,
                                                email: e.target.value
                                            })
                                        }} />
                                        <Input placeholder="Phone Number" value={clientInformation.phoneNumber} onChange={(e) => {
                                            setClientInformation({
                                                ...clientInformation,
                                                phoneNumber: e.target.value
                                            })
                                        }} />

                                    </div>
                                </div>
                            </div>
                            <div>
                                <Aligner className='gap-x-2 mt-2'>
                                    <Checkbox.Root checked={depositRequired} onClick={() => {
                                        setDepositRequired(!depositRequired)
                                    }}>
                                        <Checkbox.Indicator asChild>
                                            <CheckIcon className="size-3.5" color='purple' strokeWidth={3} />
                                        </Checkbox.Indicator>
                                    </Checkbox.Root>
                                    <Label>Require deposit</Label>
                                </Aligner>

                            </div>
                        </Dialog.Description>

                        <Dialog.Actions>
                            <Dialog.Close asChild>
                                <Button.Root onClick={() => {
                                    setIsOpen(false);
                                    setClientInformation({
                                        firstName: "",
                                        lastName: "",
                                        email: "",
                                        phoneNumber: ""
                                    })
                                    setSelectedService("")
                                    setCurrentAddons(new Set<string>())
                                }} variant="outlined" size="sm" intent="gray">
                                    <Button.Label>Cancel</Button.Label>
                                </Button.Root>
                            </Dialog.Close>
                            <Dialog.Close asChild >
                                <Button.Root disabled={selectedService.length === 0 || clientInformation.firstName.length === 0 || clientInformation.lastName.length === 0 || clientInformation.email.length === 0 || clientInformation.phoneNumber.length === 0} onClick={createAppointment} size="sm">
                                    <Button.Label>Book Appointment</Button.Label>
                                </Button.Root>
                            </Dialog.Close>
                        </Dialog.Actions>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
            {!loadingData ? <div className='w-full h-screen gap-2  flex flex-col justify-between'>
                <MUICheckBox label="Hide Cancelled Appointments" checked={cancelledAppointmentsChecked} onChange={(e) => {
                    setCancelledAppointmentsChecked(e.target.checked)
                }} />
                <div className='flex h-screen'>

                    <div className='flex-1 '>
                        <Backdrop open={isSending} className='z-50 flex justify-center items-center'>
                            <CircularProgress size='sm' />
                        </Backdrop>
                        <Calendar date={date} onNavigate={onNavigate} enableAutoScroll className='w-full' onSelectEvent={handleEvent} view={view} onView={onView} selectable defaultView={Views.WEEK} events={filteredAppointments} showAllEvents onSelectSlot={handleSelection} localizer={localizer} startAccessor="start"
                            endAccessor="end" components={{
                                eventWrapper: ({ event, children }: any) => (
                                    <div onClick={() => {
                                        setEventData(event)
                                        console.log(event);

                                    }}>

                                        {children}

                                    </div>
                                ),
                                week: {
                                    event: CustomEvent
                                }
                            }} />
                    </div>
                    {eventData !== null ? <div className='max-h-min w-[300px]'>
                        <div className='p-5 flex flex-col flex-1 min-h-min justify-between gap-2'>
                            <div className='flex flex-col gap-1'>
                                <Title size="base" as="div" weight="medium">{eventData.title}</Title>

                                <Caption>{eventData.start?.toLocaleDateString()} @ {eventData.start?.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })} - {eventData.end?.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}</Caption>
                                <Aligner className='gap-x-1'>
                                    <Caption>Status:</Caption>
                                    <Chip variant='outlined' color={color[eventData.status]}>{eventData.status}</Chip>
                                </Aligner>
                                <div className='mt-5'>
                                    <Text className='font-medium'>Client Details</Text>
                                    <div className='flex flex-col gap-1 mt-1'>
                                        <Caption>Name: {eventData.client_metadata.firstName + " " + eventData.client_metadata.lastName}</Caption>
                                        <Caption>Email: {eventData.client_metadata.email}</Caption>
                                        <Caption>Phone Number: ({eventData.client_metadata.phoneNumber.slice(0, 3)}) {eventData.client_metadata.phoneNumber.slice(3, 6)}-{eventData.client_metadata.phoneNumber.slice(6)}</Caption>
                                    </div>
                                </div>
                                <div className='mt-5'>
                                    <Text>Service Details</Text>
                                    <div className='flex flex-col gap-1'>
                                        <Caption>Service: {eventData.service_data.name}</Caption>
                                        <Caption>Price: ${eventData.service_data.price / 100}</Caption>
                                        <div className='flex gap-1 max-w'><Caption className='min-w-max'>Add-Ons:</Caption> <div className='flex flex-wrap gap-1'>
                                            {eventData.addons.map((addon: any, index: number) => {
                                                return (
                                                    index !== eventData.addons.length - 1 ? <Caption>{addon.name + ", "}</Caption> : <Caption>{addon.name}</Caption>
                                                )
                                            })}</div></div>
                                    </div>
                                </div>
                                {/* Work on this */}
                                <div className='mt-5'>
                                    <Text>More Details</Text>
                                    <div className='flex flex-col gap-1'>
                                        <Caption>Deposit Required: {eventData.require_deposit ? "Yes" : "No"}</Caption>
                                        <Caption>Deposit Amount: ${eventData.deposit_price ? eventData.deposit_price / 100 : "N/A"}</Caption>
                                        <Caption>Deposit Paid: {!eventData.deposit_charge_id.length ? "No" : "Yes"}</Caption>
                                    </div>
                                </div>

                            </div>
                            {eventData.status === "CANCELLED" ? <>
                            </> : <div className='w-full flex flex-col gap-2 mt-10 mb-5'>
                                <MUIButton color='warning' variant='outlined' onClick={() => {
                                    setIsOpen(true)
                                }}>Edit Appointment</MUIButton>
                                <MUIButton color='danger' onClick={async () => {
                                    setIsSending(true)
                                    await handleDelete(eventData.id).then(async () => {
                                        setIsSending(false)
                                        setConfirmation({
                                            title: "Appointment Cancelled!",
                                            description: ""
                                        })
                                        setConfirmationOpen(true)
                                    })
                                }}>Cancel Appointment</MUIButton>
                            </div>}

                        </div>
                        <EditAppointment setIsSending={setIsSending} setConfirmation={setConfirmation} setConfirmationOpen={setConfirmationOpen} setAppointments={setAppointments} id={eventData.id} appointments={appointments} business_id={user.business_id} appointment_id={eventData.id} eventData={eventData} client_metadata={eventData.client_metadata} isOpen={isOpen} setIsOpen={setIsOpen} services={services} service_data={eventData.service_data} />

                    </div> : <></>}
                </div>

            </div> :
                <div className='w-full h-screen flex justify-center items-center'>
                    {/* <CircularProgress size='sm' /> */}
                    <Skeleton>
                        <div className='w-full h-screen'></div>
                    </Skeleton>
                </div>
            }

        </div>

    );
}

const CustomEvent = ({ event }: any) => {
    return (
        <div className='flex flex-col gap-2'>
            <p>{event.title}</p>
            <Chip variant='outlined' color={color[event.status]}>{event.status}</Chip>
        </div>
    )
}

const EditAppointment = ({ setIsSending, setConfirmation, setConfirmationOpen, setAppointments, appointments, id, eventData, isOpen, setIsOpen, client_metadata, service_data, services, business_id, appointment_id }: {
    eventData: any, isOpen: boolean, setIsSending: any, setIsOpen: any, setConfirmation: any, setConfirmationOpen: any, business_id: string, appointment_id: string, client_metadata: {
        firstName: string,
        lastName: string,
        phoneNumber: string,
        email: string
    }, service_data: Service, services: Service[], appointments: any, id: number, setAppointments: any
}) => {
    interface DateRange {
        start: DateTime,
        end: DateTime
    }
    const initialTimeState = { start: DateTime.fromJSDate(eventData.start), end: DateTime.fromJSDate(eventData.end) }
    const [slotInfo, setSlotInfo] = useState<DateRange>(initialTimeState)

    const [clientInformation, setClientInformation] = useState({ ...client_metadata })
    const [currentServiceID, setCurrentServiceID] = useState<string>(service_data.id)


    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            setClientInformation({ ...client_metadata })
            setSlotInfo(initialTimeState)
        }}>
            <Dialog.Portal>
                <Dialog.Overlay className='z-40' />
                <Dialog.Content className="max-w-4xl z-50">
                    <Dialog.Title>Edit Appointment</Dialog.Title>
                    {Object.keys(slotInfo).length ? <div>
                        <Caption>{slotInfo?.start.year === slotInfo?.end.year && slotInfo?.start.month === slotInfo?.end.month && slotInfo?.start.day === slotInfo?.end.day ? `${slotInfo?.start.toFormat("MMMM d, yyyy")}` : `${slotInfo?.start.toFormat("MMMM d, yyyy")} - ${slotInfo?.end.toFormat("MMMM d, yyyy")}`}</Caption>
                        <div className='flex gap-2 items-end'>
                            <Caption>{`${slotInfo?.start.toFormat("h:mm a")} - ${slotInfo?.end.toFormat("h:mm a")}`}</Caption>
                        </div>
                    </div> : <></>}

                    <Dialog.Description className="mt-2">

                        <div className='flex justify-start items-start'>

                            <div className='gap-3 flex flex-col justify-center'>
                                <div className='flex mt-2 flex-col gap-1'>
                                    <DateInput
                                        maxValue={parseAbsoluteToLocal(slotInfo?.end.plus({ minute: 1 }).toISO()!)}
                                        onChange={(value: ZonedDateTime | null) => {
                                            setSlotInfo({
                                                start: DateTime.fromISO(value!.toAbsoluteString()),
                                                end: slotInfo.end
                                            })
                                        }}
                                        value={parseAbsoluteToLocal(slotInfo?.start.toISO()!)}
                                        label={"Start Date & Time"}
                                        labelPlacement="inside"
                                    />
                                    <DateInput
                                        minValue={parseAbsoluteToLocal(slotInfo?.start.plus({ minute: 1 }).toISO()!)}
                                        onChange={(value: ZonedDateTime | null) => {
                                            setSlotInfo({
                                                end: DateTime.fromISO(value!.toAbsoluteString()),
                                                start: slotInfo.start
                                            })
                                        }}
                                        value={parseAbsoluteToLocal(slotInfo?.end.toISO()!)}
                                        label={"End Date & Time"}
                                        labelPlacement="inside"
                                    />
                                </div>
                                <div>

                                    <Label className='text-sm font-medium'>Service</Label>
                                    <Select.Root defaultValue={currentServiceID} onValueChange={(value: string) => {
                                        setCurrentServiceID(value)
                                    }}>
                                        <Select.Trigger size="md" className="w-56 flex justify-between">
                                            <Select.Value placeholder={
                                                <Caption>Select a service</Caption>} />
                                            <Select.Icon>
                                                <ChevronDown size={16} />                                        </Select.Icon>
                                        </Select.Trigger>

                                        <Select.Portal>
                                            <Select.Content mixed className="z-50">
                                                <Select.Viewport>
                                                    {
                                                        services.map((service) => (
                                                            <SelectItem service={service} key={service.name} />
                                                        ))
                                                    }
                                                </Select.Viewport>
                                            </Select.Content>
                                        </Select.Portal>
                                    </Select.Root></div>
                                <div>
                                    <Label className='text-sm font-medium'>Client Information</Label>
                                    <div className='flex flex-col gap-2'>
                                        <div className='flex gap-2'>
                                            <Input placeholder="First Name" value={clientInformation.firstName} onChange={(e) => {
                                                setClientInformation({
                                                    ...clientInformation,
                                                    firstName: e.target.value
                                                })
                                            }} />
                                            <Input placeholder="Last Name" value={clientInformation.lastName} onChange={(e) => {
                                                setClientInformation({
                                                    ...clientInformation,
                                                    lastName: e.target.value
                                                })
                                            }} />
                                        </div>
                                        <Input placeholder="Email" value={clientInformation.email} onChange={(e) => {
                                            setClientInformation({
                                                ...clientInformation,
                                                email: e.target.value
                                            })
                                        }} />
                                        <Input placeholder="Phone Number" value={clientInformation.phoneNumber} onChange={(e) => {
                                            setClientInformation({
                                                ...clientInformation,
                                                phoneNumber: e.target.value
                                            })
                                        }} />

                                    </div>
                                </div>
                            </div>
                        </div>
                    </Dialog.Description>

                    <Dialog.Actions>
                        <Dialog.Close asChild>
                            <Button.Root onClick={async () => {
                                setIsOpen(false)
                            }} variant="outlined" size="sm" intent="gray">
                                <Button.Label>Cancel</Button.Label>
                            </Button.Root>
                        </Dialog.Close>
                        <Dialog.Close asChild >
                            <Button.Root onClick={async () => {
                                setIsSending(true)
                                const res = services.find((value: Service, index: number) => value.id === currentServiceID)
                                const result = await fetch(`http://localhost:3000/api/appointments`, {
                                    method: 'PUT',
                                    body: JSON.stringify({
                                        id: appointment_id,
                                        start: slotInfo.start.toISO()!,
                                        end: slotInfo.end.toISO()!,
                                        status: 'CONFIRMED'
                                    })
                                })
                                const data = await result.json()
                                // const result = await businessRescheduling(business_id, res!, clientInformation, appointment_id, {
                                //     start: slotInfo.start.toISO()!,
                                //     end: slotInfo.end.toISO()!,
                                //     appointmentLength: service_data.length
                                // }, false)
                                let clone = [...appointments]
                                const id = clone.findIndex((element) => element.id === appointment_id)
                                clone[id] = {
                                    id: appointment_id,
                                    start: new Date(slotInfo.start.toISO()!),
                                    end: new Date(slotInfo.start.toISO()!),
                                    title: `${data.service_data.name} with ${clientInformation.firstName}`,
                                    client_metadata: clientInformation,
                                    service_data: data.service_data,
                                    status: result.status
                                }
                                setAppointments(clone)
                                setIsSending(false)
                                setConfirmation({
                                    title: "Appointment Updated!",
                                    description: "Changes saved"
                                })
                                setConfirmationOpen(true)
                            }} size="sm">
                                <Button.Label>Save Changes</Button.Label>
                            </Button.Root>
                        </Dialog.Close>
                    </Dialog.Actions>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

const SelectItem = ({ service }: { service: Service }) => {
    return (
        <Select.Item value={service.id!} className="pl-7 items-center">
            <Select.ItemIndicator />
            <Select.ItemText>
                {service.name}
            </Select.ItemText>
        </Select.Item>
    );
};

export default AppointmentsClient;
