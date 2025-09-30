"use client"
import 'react-big-calendar/lib/css/react-big-calendar.css';
import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, DateRange, Event, EventWrapperProps, luxonLocalizer, SlotInfo, View, Views } from 'react-big-calendar'
import { DateTime } from 'luxon';
import Button from '@tailus-ui/Button';
import Dialog from '@components/Dialog';
import { Caption, Text, Title } from '@tailus-ui/typography';
import Select from '@components/Select';
import { parseAbsoluteToLocal, Time, ZonedDateTime } from "@internationalized/date";
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle2, CheckIcon, ChevronDown, ChevronsDown, ChevronsUpDown, EllipsisVertical, Grid3x3, Info, Pencil, Trash, X, XCircle } from 'lucide-react';
import Label from '@components/Label';
import { useUserContext } from '@utils/context/UserContext';
import "./calendar.css"
import Input from '@components/Input';
import CircularProgress from '@mui/material/CircularProgress';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { TimeInput, DateInput, DateInputValue, TimeInputValue } from '@nextui-org/date-input';
import Chip from '@mui/joy/Chip';
import Checkbox from '@components/Checkbox';
import { Divider, Dropdown, IconButton, Menu, MenuButton, MenuItem, Checkbox as MUICheckBox, Skeleton, Snackbar, Tab, TabList, TabPanel, Tabs, Typography } from '@mui/joy';
import Aligner from '@components/Aligner';
import { businessRescheduling, getPolicyById, manuallyCancel, markAppointmentAs } from './actions';
import { Drawer, ModalClose, Button as MUIButton } from '@mui/joy';
import Toast from '@components/Toast';
import { Backdrop } from '@mui/material';
import { CheckedState } from '@radix-ui/react-checkbox';
import { keyframes } from '@mui/system';
import randomColor from 'randomcolor'
import { PostgrestError } from '@supabase/supabase-js';
import AppointmentTable from './appointmentTable';
const color: any = {
    "PENDING": "warning",
    "CONFIRMED": "success",
    "COMPLETED": 'primary',
    "DENIED": 'danger',
    "CANCELLED": "danger",
    'NO_SHOW': 'danger',
    'INCOMPLETE': 'neutral'
}

interface PageProps {
    appointmentData: Appointment[]
    policyData: Policy,
    servicesData: Service[],
    business_id: string,
    stripeOnboardingCompleted: boolean
}

const AppointmentsClient = ({ business_id, appointmentData, policyData, servicesData, stripeOnboardingCompleted }: PageProps) => {
    // Get all appointments and convert from ISO => DateTimes
    const [loadingData, setLoadingData] = useState<boolean>(true);
    const [appointments, setAppointments] = useState<any[]>(appointmentData);
    const [cancelledAppointmentsChecked, setCancelledAppointmentsChecked] = useState<boolean>(true)
    const [policy, setPolicy] = useState<any>(policyData)
    const [filteredAppointments, setFilteredAppointments] = useState<any>([]);
    const [openAppointmentDrawer, setOpenAppointmentDrawer] = useState<boolean>(false)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    useEffect(() => {
        if (business_id && policy === null) {
            (async () => {

                setDepositRequired(policy.deposit.enabled)
                if (appointments.length) {
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
                            selected_addons: [...appointments[i].selected_addons],
                            amount_due: appointments[i].amount_due

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
                        selected_addons: [...appointments[i].selected_addons],
                        amount_due: appointments[i].amount_due
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
                    selected_addons: [...appointments[i].selected_addons],
                    amount_due: appointments[i].amount_due

                })

            }
            setFilteredAppointments(temp)
        }
    }, [cancelledAppointmentsChecked, appointments]);
    interface DateRange {
        start: DateTime,
        end: DateTime
    }
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [slotInfo, setSlotInfo] = useState<DateRange>()
    const [editingSlotInfo, setEditingSlotInfo] = useState<DateRange>()
    const [services, setServices] = useState<any[]>(servicesData)
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
                title: "Selection Denied",
                description: "Unable to create appointment in the past"
            })
        }

    }

    const [selectedService, setSelectedService] = useState<string>("")
    // Create an appointment Supabase => Local State
    const getContrastYIQ = (hexColor: string) => {
        hexColor = hexColor.replace('#', '');

        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);

        // YIQ formula to determine brightness
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;

        return yiq >= 128 ? 'black' : 'white';
    }

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
                business: business_id,
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
                addons: addonResult,
            }

            const res = await fetch(`/api/appointments`, {
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
                    selected_addons: addonResult

                }
            ])

            setConfirmation({
                title: "Appointment Created Successfully!",
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
        const res = await fetch(`/api/appointments`, {
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

    const animationDuration = 600;

    const handleClose = () => {
        setConfirmationOpen(false)
        setHasError(false)
    };
    const inAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

    const outAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
`;
    const [hidePastAppointments, setHidePastAppointments] = useState<boolean>(true)
    return (
        <div className=' max-h-min px-6  w-full'>
            <div className='mb-5'>
                <Title>Appointments</Title>
                <Caption>Click on a slot in the calendar view to create an appointment</Caption>
            </div>
            <Snackbar
                size='lg'
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={confirmationOpen}
                color='success'
                onClose={handleClose}
                autoHideDuration={4000}
                animationDuration={animationDuration}
                sx={[
                    confirmationOpen && {
                        animation: `${inAnimation} ${animationDuration}ms forwards`,
                    },
                    !confirmationOpen && {
                        animation: `${outAnimation} ${animationDuration}ms forwards`,
                    },
                ]}
                variant={'soft'}

            >
                <div className='flex gap-2 items-center'>
                    <CheckCircle2 size={20} />{confirmation.title}Appointment Created Successfully
                </div>
            </Snackbar>
            <Snackbar
                size='lg'
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={hasError}
                color='danger'
                onClose={handleClose}
                autoHideDuration={4000}
                animationDuration={animationDuration}
                sx={[
                    hasError && {
                        animation: `${inAnimation} ${animationDuration}ms forwards`,
                    },
                    !hasError && {
                        animation: `${outAnimation} ${animationDuration}ms forwards`,
                    },
                ]}
                variant={'soft'}

            >
                <div className='flex gap-2 items-center'>
                    <XCircle size={20} />{errorMessage.title}: {errorMessage.description}
                </div>
            </Snackbar>
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
                                <Aligner className='gap-x-2 mt-3'>
                                    <Checkbox.Root disabled={!stripeOnboardingCompleted} checked={depositRequired} onClick={() => {
                                        setDepositRequired(!depositRequired)
                                    }}>
                                        <Checkbox.Indicator asChild>
                                            <CheckIcon className="size-3.5" color='purple' strokeWidth={3} />
                                        </Checkbox.Indicator>
                                    </Checkbox.Root>
                                    <Label>Require deposit{!stripeOnboardingCompleted ? <Caption>Onboard with Stripe to start collecting deposits</Caption> : <div></div>}
                                    </Label>
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
            <div className='w-full h-screen gap-2  flex flex-col justify-between'>
                <div className='flex gap-5 pb-4'>
                    <MUICheckBox label="Hide Cancelled Appointments" checked={cancelledAppointmentsChecked} onChange={(e) => {
                        setCancelledAppointmentsChecked(e.target.checked)
                    }} />
                    <MUICheckBox label="Hide Past Appointments" checked={hidePastAppointments} onChange={(e) => {
                        setHidePastAppointments(e.target.checked)
                    }} />
                </div>
                <div className='flex h-screen'>

                    <div className='flex-1 '>
                        <Backdrop open={isSending} className='z-50 flex justify-center items-center'>
                            <CircularProgress size='sm' />
                        </Backdrop>
                        <Calendar eventPropGetter={(event) => {
                            const backgroundColor = randomColor()
                            const textColor = getContrastYIQ(backgroundColor);
                            return {
                                style: {
                                    backgroundColor,
                                    color: textColor
                                }
                            }
                        }} date={date} onNavigate={onNavigate} enableAutoScroll className='w-full' onSelectEvent={handleEvent} view={view} onView={onView} selectable defaultView={Views.WEEK} events={filteredAppointments} showAllEvents onSelectSlot={handleSelection} localizer={localizer} startAccessor="start"
                            endAccessor="end" components={{
                                eventWrapper: ({ event, children }: any) => (
                                    <div onClick={() => {
                                        setEventData(event)
                                        setOpenAppointmentDrawer(true)

                                    }}>
                                        {children}
                                    </div>
                                ),
                                week: {
                                    event: CustomEvent
                                }
                            }} />
                    </div>

                    {eventData ? <Drawer anchor='right' open={openAppointmentDrawer} onClose={() => {
                        setOpenAppointmentDrawer(false)
                        setIsEditing(false)
                    }}>
                        {!isEditing ? <div className='flex flex-col justify-between h-full'>
                            <div className='w-full p-5 flex flex-col justify-between'>
                                <div className='flex flex-col gap-1'>
                                    <Typography level='h4'>{eventData.title}</Typography>
                                    <Caption>{eventData.start?.toLocaleDateString()} @ {eventData.start?.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })} - {eventData.end?.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}</Caption>
                                    <Aligner className='gap-x-1'>
                                        <Caption>Status:</Caption>
                                        <Chip variant='outlined' color={color[eventData.status]}>{eventData.status}</Chip>
                                    </Aligner>
                                </div>
                                <div className='mt-5'>
                                    <Typography className='font-medium'>Client Details</Typography>
                                    <div className='flex flex-col gap-1 mt-1'>
                                        <Caption>Name: {eventData.client_metadata.firstName + " " + eventData.client_metadata.lastName}</Caption>
                                        <Caption>Email: {eventData.client_metadata.email}</Caption>
                                        <Caption>Phone Number: ({eventData.client_metadata.phoneNumber.slice(0, 3)}) {eventData.client_metadata.phoneNumber.slice(3, 6)}-{eventData.client_metadata.phoneNumber.slice(6)}</Caption>
                                    </div>
                                </div>
                                <div className='mt-5'>
                                    <Typography className='font-medium'>Service Details</Typography>
                                    <div className='flex flex-col gap-1'>
                                        <Caption>Service: {eventData.service_data.name}</Caption>
                                        <Caption>Price: ${eventData.service_data.price / 100}</Caption>
                                        <div className='flex gap-1 max-w'><Caption className='min-w-max'>Add-Ons:</Caption> <div className='flex flex-wrap gap-1'>
                                            {eventData.selected_addons.length ? eventData.selected_addons.map((addon: any, index: number) => {
                                                return (
                                                    index !== eventData.selected_addons.length - 1 ? <Caption>{addon.name + ", "}</Caption> : <Caption>{addon.name}</Caption>
                                                )
                                            }) : <Caption className='italic font-bold'>No addons selected</Caption>}</div></div>
                                    </div>
                                </div>
                                <div className='mt-5'>
                                    <Typography className="font-medium">More Details</Typography>
                                    <div className='flex flex-col gap-1'>
                                        <Caption>Deposit Required: {eventData.require_deposit ? "Yes" : "No"}</Caption>
                                        <Caption>Deposit Amount: {eventData.deposit_price ? `$${eventData.deposit_price / 100}` : "N/A"}</Caption>
                                        <Caption>Deposit Paid: {!eventData.deposit_charge_id.length ? "No" : "Yes"}</Caption>
                                        <Caption>Amount Due: {eventData.amount_due ? `$${eventData.amount_due / 100}` : 'N/A'}</Caption>
                                    </div>
                                </div>
                            </div>
                            <div className='p-5'>
                                {eventData.status !== 'PENDING' && eventData.status !== 'PROCESSING' && eventData.status !== 'CANCELLED' ? <div>
                                    <Dropdown>
                                        <MenuButton color='success' sx={{ width: '100%', display: 'flex', justifyContent: 'center', }}>
                                            <div>Mark Appointment as...</div>
                                        </MenuButton>
                                        <Menu disablePortal>
                                            <MenuItem color='success' onClick={async () => {
                                                const res = await markAppointmentAs('COMPLETED', eventData.amount_due, eventData.id)
                                                const index = appointments.indexOf(appointments.filter((appointment) => appointment.id === res?.id)[0])
                                                const clone = [...appointments]

                                                clone[index].status = res?.status
                                                clone[index].amount_due = res?.amount_due
                                                setAppointments(clone)

                                            }}>Completed (Paid Cash)</MenuItem>
                                            <MenuItem color='warning' onClick={async () => {
                                                let servicePlusAddonPrice = eventData.service_data.price;
                                                let finalAmountOwned = 0
                                                const addons = eventData.selected_addons;
                                                for (let i = 0; i < addons.length; i++) {
                                                    servicePlusAddonPrice += addons[i].price
                                                }
                                                if (eventData.require_deposit) {
                                                    const appointmentPolicy = await getPolicyById(policyData.id)
                                                    if (!(appointmentPolicy instanceof PostgrestError)) {
                                                        if (appointmentPolicy.deposit.settings.subtraction) {
                                                            finalAmountOwned = servicePlusAddonPrice - eventData.deposit_price
                                                        } else {
                                                            finalAmountOwned = servicePlusAddonPrice
                                                        }
                                                    }
                                                } else {
                                                    finalAmountOwned = servicePlusAddonPrice
                                                }
                                                const res = await markAppointmentAs('INCOMPLETE', finalAmountOwned, eventData.id)
                                                const index = appointments.indexOf(appointments.filter((appointment) => appointment.id === res?.id)[0])
                                                const clone = [...appointments]


                                                clone[index].status = res?.status
                                                clone[index].amount_due = res?.amount_due
                                                setAppointments(clone)
                                            }}>Incomplete (Didn't Pay)</MenuItem>

                                            <MenuItem color='danger' onClick={async () => {
                                                let servicePlusAddonPrice = eventData.service_data.price;
                                                let finalAmountOwned = 0
                                                const addons = eventData.selected_addons;
                                                for (let i = 0; i < addons.length; i++) {
                                                    servicePlusAddonPrice += addons[i].price
                                                }
                                                if (eventData.require_deposit) {
                                                    const appointmentPolicy = await getPolicyById(policyData.id)
                                                    if (!(appointmentPolicy instanceof PostgrestError)) {
                                                        if (appointmentPolicy.deposit.settings.subtraction) {
                                                            finalAmountOwned = servicePlusAddonPrice - eventData.deposit_price
                                                        } else {
                                                            finalAmountOwned = servicePlusAddonPrice
                                                        }
                                                    }
                                                } else {
                                                    finalAmountOwned = servicePlusAddonPrice
                                                }
                                                const res = await markAppointmentAs('NO_SHOW', finalAmountOwned, eventData.id)
                                                const index = appointments.indexOf(appointments.filter((appointment) => appointment.id === res?.id)[0])
                                                const clone = [...appointments]
                                                clone[index].status = res?.status
                                                clone[index].amount_due = res?.amount_due
                                                setAppointments(clone)
                                            }}>Didn't Show</MenuItem>

                                        </Menu>
                                    </Dropdown>

                                </div> : <></>}
                                {eventData.status === "CANCELLED" || eventData.status === 'COMPLETED' ? <div className='w-full flex flex-col gap-2 mb-5'>
                                    <Divider sx={{ marginY: 2 }} orientation='horizontal' />
                                    <MUIButton color='warning' variant='outlined' onClick={() => {
                                        const initialTimeState = { start: DateTime.fromJSDate(eventData.start), end: DateTime.fromJSDate(eventData.end) }
                                        setEditingSlotInfo(initialTimeState)
                                        setIsEditing(true)
                                    }}>Reschedule Appointment</MUIButton>
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
                                </div> : <div className='w-full'>
                                    <MUIButton className='w-full' color='danger' onClick={async () => {
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
                        </div> : <div className='p-5 h-full flex flex-col justify-between'>
                            <div>
                                <div className='flex w-full mb-5 cursor-pointer' onClick={() => {
                                    setIsEditing(false)
                                }}>
                                    <ArrowLeft size={16} />
                                </div>
                                <Typography>Reschedule Appointment</Typography>
                                {Object.keys(editingSlotInfo!).length ? <div>
                                    <Caption>{editingSlotInfo?.start.year === editingSlotInfo?.end.year && editingSlotInfo?.start.month === editingSlotInfo?.end.month && editingSlotInfo?.start.day === editingSlotInfo?.end.day ? `${editingSlotInfo?.start.toFormat("MMMM d, yyyy")}` : `${editingSlotInfo?.start.toFormat("MMMM d, yyyy")} - ${editingSlotInfo?.end.toFormat("MMMM d, yyyy")}`}</Caption>
                                    <div className='flex gap-2 items-end'>
                                        <Caption>{`${editingSlotInfo?.start.toFormat("h:mm a")} - ${editingSlotInfo?.end.toFormat("h:mm a")}`}</Caption>
                                    </div>
                                </div> : <></>}
                                <div className='flex flex-col gap-2 mt-5'>
                                    <DateInput
                                        maxValue={parseAbsoluteToLocal(editingSlotInfo?.end.plus({ minute: 1 }).toISO()!)}
                                        onChange={(value: ZonedDateTime | null) => {
                                            setSlotInfo({
                                                start: DateTime.fromISO(value!.toAbsoluteString()),
                                                end: editingSlotInfo!.end
                                            })
                                        }}
                                        value={parseAbsoluteToLocal(editingSlotInfo?.start.toISO()!)}
                                        label={"Start Date & Time"}
                                        labelPlacement="inside"
                                    />
                                    <DateInput
                                        minValue={parseAbsoluteToLocal(editingSlotInfo?.start.plus({ minute: 1 }).toISO()!)}
                                        onChange={(value: ZonedDateTime | null) => {
                                            setSlotInfo({
                                                end: DateTime.fromISO(value!.toAbsoluteString()),
                                                start: editingSlotInfo!.start
                                            })
                                        }}
                                        value={parseAbsoluteToLocal(editingSlotInfo?.end.toISO()!)}
                                        label={"End Date & Time"}
                                        labelPlacement="inside"
                                    />
                                </div>
                                <div className='w-full flex mt-5'>


                                </div>
                            </div>
                            <div className='flex w-full'>
                                <MUIButton className='w-full'>Save Changes</MUIButton>
                            </div>

                        </div>}

                    </Drawer> : <></>}
                </div>
                {/* <EditAppointment setIsSending={setIsSending} setConfirmation={setConfirmation} setConfirmationOpen={setConfirmationOpen} setAppointments={setAppointments} id={eventData.id} appointments={appointments} business_id={business_id} appointment_id={eventData.id} eventData={eventData} client_metadata={eventData.client_metadata} isOpen={isOpen} setIsOpen={setIsOpen} services={services} service_data={eventData.service_data} /> */}



            </div>


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
        <div>
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
                        const result = await fetch(`/api/appointments`, {
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
        </div>
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
