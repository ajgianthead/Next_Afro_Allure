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
import { Time } from "@internationalized/date";
import { CheckIcon, ChevronDown, ChevronsDown, ChevronsUpDown, EllipsisVertical, Info, Pencil, Trash, X } from 'lucide-react';
import Label from '@components/Label';
import { useUserContext } from '@utils/context/UserContext';
import "./calendar.css"
import Input from '@components/Input';
import CircularProgress from '@mui/joy/CircularProgress';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { TimeInput, TimeInputValue } from '@nextui-org/date-input';
import Chip from '@mui/joy/Chip';
import Checkbox from '@components/Checkbox';
import { Checkbox as MUICheckBox } from '@mui/joy';
import Aligner from '@components/Aligner';
import { businessRescheduling, manuallyCancel } from './actions';
import { Drawer, ModalClose, Button as MUIButton } from '@mui/joy';
import Toast from '@components/Toast';

const color: any = {
    "PENDING": "warning",
    "CONFIRMED": "success",
    "COMPLETED": 'info',
    "DENIED": 'danger',
    "CANCELLED": "danger"
}


const Page = () => {
    // Get all appointments and convert from ISO => DateTimes
    const { user } = useUserContext();
    const [loadingData, setLoadingData] = useState<boolean>(true);
    const [appointments, setAppointments] = useState<any>([]);
    const [cancelledAppointmentsChecked, setCancelledAppointmentsChecked] = useState<boolean>(false)
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
                            reschedules: result.appointments[i].reschedules
                        })
                    }
                    setAppointments(temp)
                }

                setLoadingData(false)
            })()
        }else{
            if(cancelledAppointmentsChecked){
                let temp = []
                    for (let i = 0; i < appointments.length; i++) {
                        if(appointments[i].status !== "CANCELLED"){
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
                                reschedules: appointments[i].reschedules
                            })
                        }
                    }
                    setFilteredAppointments(temp)
            }else{
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
                                reschedules: appointments[i].reschedules
                            })
                        
                    }
                    setFilteredAppointments(temp)
            }
        }
    }, [user, cancelledAppointmentsChecked, appointments]);
    interface DateRange {
        start: DateTime,
        end: DateTime
    }
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [slotInfo, setSlotInfo] = useState<DateRange>()
    const [services, setServices] = useState<Service[]>([])
    const localizer = luxonLocalizer(DateTime)
    const handleSelection = (slot: any) => {
        if (DateTime.fromISO(slot.start.toISOString()) > DateTime.now()) {
            let range: DateRange = {
                start: DateTime.fromISO(slot.start.toISOString()),
                end: DateTime.fromISO(slot.end.toISOString())
            }
            setSlotInfo(range)
            setIsOpen(true)
        }

    }

    const [selectedService, setSelectedService] = useState<string>("")
    // Create an appointment Supabase => Local State
    const createAppointment = async () => {
        if (slotInfo?.start && slotInfo.end) {
            const service = services.filter((data: any, index: number) => data.id === selectedService)[0]
            console.log(policy);

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
                reschedules: policy.reschedule_limit
            }
            const res = await fetch(`http://localhost:3000/api/appointments`, {
                method: 'POST',
                body: JSON.stringify(appointment)
            })
            if (policy.deposit.enabled) {
                if (policy.deposit.settings.type === 'flat') {
                    setDepositAmount(policy.deposit.settings.value)
                } else {
                    setDepositAmount((policy.deposit.settings.value / 100) * appointment.service_data?.price)
                }
            }
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
                    reschedules: policy.reschedule_limit

                }
            ])

            console.log(await res.json());
            setConfirmation({
                title: "Appointment Created!",
                description: "Waiting for client approval"
            })
            setConfirmationOpen(true)
            setClientInformation({
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: ""
            })
            setIsOpen(false)
        }

    }
    // Reschedule an appointment

    // Delete an appointment
    const handleDelete = async (appointmentID: string) => {
        const res = await fetch(`http://localhost:3000/api/appointments/${appointmentID}`, {
            method: 'PUT',
            body: JSON.stringify({
                start: eventData.start,
                end: eventData.end,
                status: 'CANCELLED'
            })
        })
        const response = await res.json();
        // Delete in local state
        let clone = [...appointments]
        const index = clone.indexOf(response)
        clone.splice(index, 1);
        setAppointments(clone)
        setConfirmation({
            title: "Appointment Cancelled!",
            description: ""
        })
        setConfirmationOpen(true)
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
    const [depositAmount, setDepositAmount] = useState<number | null>(null)
    const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false)
    const [confirmation, setConfirmation] = useState<{
        title: string;
        description: string;
    }>({ title: "", description: "" })
    return (
        <div className=' max-h-min  w-full'>
            <Toast.Provider>
                <Toast.Root open={confirmationOpen} onOpenChange={setConfirmationOpen}>
                    <Toast.Title>{confirmation.title}</Toast.Title>
                    <Toast.Description>{confirmation.description}</Toast.Description>
                    <Toast.Action altText='action' />
                    <Toast.Close />
                </Toast.Root>

                <Toast.Viewport />
            </Toast.Provider>
            <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>

                <Dialog.Portal>
                    <Dialog.Overlay className='z-40' />

                    <Dialog.Content className="max-w-lg z-50">
                        <Dialog.Title>Create New Appointment</Dialog.Title>
                        <Caption>{`${slotInfo?.start.toFormat("MMMM d, yyyy")}`}</Caption>
                        <Caption>{`${slotInfo?.start.toFormat("h:mm a")} - ${slotInfo?.end.toFormat("h:mm a")}`}</Caption>

                        <Dialog.Description className="mt-2">
                            <div className='gap-3 flex flex-col'>

                                <div>
                                    <Label className='text-sm font-medium'>Service</Label>
                                    <Select.Root defaultValue="" onValueChange={(value: string) => {
                                        setSelectedService(value)
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
                                    setIsOpen(false),
                                        setClientInformation({
                                            firstName: "",
                                            lastName: "",
                                            email: "",
                                            phoneNumber: ""
                                        })
                                }} variant="outlined" size="sm" intent="gray">
                                    <Button.Label>Cancel</Button.Label>
                                </Button.Root>
                            </Dialog.Close>
                            <Dialog.Close asChild >
                                <Button.Root onClick={createAppointment} size="sm">
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
                }}/>
                <div>
                <div className='flex-1 '>
                        <Calendar className='w-full  ' onSelectEvent={handleEvent} view={view} onView={onView} selectable defaultView={Views.WEEK} events={filteredAppointments} showAllEvents onSelectSlot={handleSelection} localizer={localizer} startAccessor="start"
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
                    {eventData !== null ? <div className='max-h-min'>
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
                                        <Caption>Price: ${eventData.service_data.price}</Caption>
                                        <Caption>Add-Ons:</Caption>
                                    </div>
                                </div>
                                {/* Work on this */}
                                <div className='mt-5'>
                                    <Text>More Details</Text>
                                    <div className='flex flex-col gap-1'>
                                        <Caption>Deposit Required: {eventData.require_deposit ? "Yes" : "No"}</Caption>
                                        <Caption>Deposit Amount: {depositAmount ? depositAmount : "N/A"}</Caption>
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
                                    await manuallyCancel(user.business_id, eventData.id)
                                }}>Cancel Appointment</MUIButton>
                            </div>}

                        </div>
                        <EditAppointment setConfirmation={setConfirmation} setConfirmationOpen={setConfirmationOpen} setAppointments={setAppointments} id={eventData.id} appointments={appointments} business_id={user.business_id} appointment_id={eventData.id} slotInfo={eventData} client_metadata={eventData.client_metadata} isOpen={isOpen} setIsOpen={setIsOpen} services={services} service_data={eventData.service_data} />

                    </div> : <></>}
                </div> 
                
                </div>:
            <div className='w-full h-full flex justify-center items-center'>
                    <CircularProgress size='sm' />
                </div>
            }

        </div>
    
);
}

            const CustomEvent = ({event}: any) => {
return (
            <div className='flex flex-col gap-2'>
                <p>{event.title}</p>
                <Chip variant='outlined' color={color[event.status]}>{event.status}</Chip>
            </div>
            )
}

            const EditAppointment = ({setConfirmation, setConfirmationOpen, setAppointments, appointments, id, slotInfo, isOpen, setIsOpen, client_metadata, service_data, services, business_id, appointment_id}: {
                slotInfo: any, isOpen: boolean, setIsOpen: any, setConfirmation: any, setConfirmationOpen: any, business_id: string, appointment_id: string, client_metadata: {
                firstName: string,
            lastName: string,
            phoneNumber: string,
            email: string
}, service_data: Service, services: Service[], appointments: any, id: number, setAppointments: any
}) => {
const [clientInformation, setClientInformation] = useState({...client_metadata})
            const [date, setDate] = useState<DateTime>(DateTime.fromJSDate(slotInfo.start))
const handleDateChange = (value: DateTime) => {
                    setDate(value)
                }
                const [currentServiceID, setCurrentServiceID] = useState<string>(service_data.id)
                    const [time, setTime] = useState<TimeInputValue>(new Time(slotInfo.start.getHours(), slotInfo.start.getMinutes()))
                        return (
                        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>

                            <Dialog.Portal>
                                <Dialog.Overlay className='z-40' />

                                <Dialog.Content className="max-w-4xl z-50">
                                    <Dialog.Title>Edit Appointment</Dialog.Title>
                                    <Caption>{`${slotInfo?.start.toLocaleDateString()}`}</Caption>
                                    <Caption>{`${slotInfo?.start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })} - ${slotInfo?.end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}`}</Caption>

                                    <Dialog.Description className="mt-2">

                                        <div className='flex justify-between items-start'>
                                            <div>
                                                <LocalizationProvider dateAdapter={AdapterLuxon}>
                                                    <DateCalendar value={date} onChange={handleDateChange} />
                                                </LocalizationProvider>


                                            </div>
                                            <div className='gap-3 flex flex-col justify-center'>
                                                <div>
                                                    <Label>Time</Label>
                                                    <TimeInput variant='bordered' aria-label="TimeInput" value={time} size='sm' className='w-[100px] rounded-sm' label={null} onChange={(timeValue) => {
                                                        setTime(timeValue)
                                                    }} />
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
                                                setClientInformation({
                                                    firstName: "",
                                                    lastName: "",
                                                    email: "",
                                                    phoneNumber: ""
                                                })

                                            }} variant="outlined" size="sm" intent="gray">
                                                <Button.Label>Cancel</Button.Label>
                                            </Button.Root>
                                        </Dialog.Close>
                                        <Dialog.Close asChild >
                                            <Button.Root onClick={async () => {
                                                const startDate = date.set({ hour: time.hour, minute: time.minute })
                                                const endDate = startDate.plus({ minutes: service_data.length })
                                                const res = services.find((value: Service, index: number) => value.id === currentServiceID)
                                                const result = await businessRescheduling(business_id, res!, clientInformation, appointment_id, {
                                                    start: startDate.toISO()!,
                                                    end: endDate.toISO()!,
                                                    appointmentLength: service_data.length
                                                }, false)
                                                let clone = [...appointments]
                                                const id = clone.findIndex((element) => element.id === appointment_id)
                                                console.log({
                                                    id: appointment_id,
                                                    start: new Date(startDate.toISO()!),
                                                    end: new Date(endDate.toISO()!),
                                                    title: `${result.service_data.name} with ${clientInformation.firstName}`,
                                                    client_metadata: clientInformation,
                                                    service_data: result.service_data,
                                                    status: result.status
                                                });

                                                clone[id] = {
                                                    id: appointment_id,
                                                    start: new Date(startDate.toISO()!),
                                                    end: new Date(endDate.toISO()!),
                                                    title: `${result.service_data.name} with ${clientInformation.firstName}`,
                                                    client_metadata: clientInformation,
                                                    service_data: result.service_data,
                                                    status: result.status
                                                }
                                                setAppointments(clone)
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

const SelectItem = ({service}: {service: Service }) => {
    return (
        <Select.Item value={service.id!} className="pl-7 items-center">
            <Select.ItemIndicator />
            <Select.ItemText>
                {service.name}
            </Select.ItemText>
        </Select.Item>
    );
};

export default Page;
