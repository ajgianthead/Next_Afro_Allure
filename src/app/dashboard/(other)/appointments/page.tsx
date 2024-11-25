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
import { ChevronDown, ChevronsDown, ChevronsUpDown, EllipsisVertical, Info, Pencil, Trash, X } from 'lucide-react';
import Label from '@components/Label';
import { useUserContext } from '@utils/context/UserContext';
import "./calendar.css"
import Popover from '@tailus-ui/Popover';
import Input from '@components/Input';
import CircularProgress from '@mui/joy/CircularProgress';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { TimeInput, TimeInputValue } from '@nextui-org/date-input';


const Page = () => {
    // Get all appointments and convert from ISO => DateTimes
    const { user } = useUserContext();
    const [loadingData, setLoadingData] = useState<boolean>(true);
    useEffect(() => {
        const getAppointments = async (services: Service[]) => {
            const res = await fetch(`http://localhost:3000/api/${user.business_id}/appointments`, {
                method: 'GET'
            })
            const data = await res.json();
            console.log(data)
            const result = data.appointments
            let temp = []
            for (let i = 0; i < result.length; i++) {
                temp.push({
                    start: new Date(result[i].start),
                    end: new Date(result[i].end),
                    title: `${result[i].service_data.name} with ${result[i].client_metadata.firstName}`,
                    client_metadata: result[i].client_metadata,
                    service_data: result[i].service_data
                })
            }
            setAppointments(temp)
        }
        // Get services
        const getServices = async () => {
            const { business_id } = user
            const res = await fetch(`http://localhost:3000/api/${business_id}/services`)
            const services = await res.json()
            console.log(services);
            setServices(services.result)
            return services.result
        }
        if (user.business_id) {
            (async () => {
                await getServices().then(async (res) => {
                    console.log(res);

                    await getAppointments(res)
                })
                setLoadingData(false)
            })()

        }
    }, [user]);
    interface DateRange {
        start: DateTime,
        end: DateTime
    }
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [slotInfo, setSlotInfo] = useState<DateRange>()
    const [services, setServices] = useState<Service[]>([])
    const localizer = luxonLocalizer(DateTime)
    const handleSelection = (slot: any) => {
        let range: DateRange = {
            start: DateTime.fromISO(slot.start.toISOString()),
            end: DateTime.fromISO(slot.end.toISOString())
        }
        setSlotInfo(range)
        setIsOpen(true)
    }

    const [appointments, setAppointments] = useState<any>([]);
    const [selectedService, setSelectedService] = useState<string>("")
    // Create an appointment Supabase => Local State
    const createAppointment = async () => {
        if (slotInfo?.start && slotInfo.end) {
            const service = services.filter((data: any, index: number) => data.id === selectedService)[0]
            const appointment: Appointment = {
                id: "",
                created_at: "",
                updated_at: "",
                business: user.business_id,
                client: "",
                start: slotInfo.start.toISO() || "",
                end: slotInfo.end.toISO() || "",
                client_metadata: clientInformation,
                status: "PENDING",
                service_data: { ...service }
            }
            const res = await fetch(`http://localhost:3000/api/appointments`, {
                method: 'POST',
                body: JSON.stringify(appointment)
            })
            setAppointments([
                ...appointments,
                {
                    start: new Date(appointment.start),
                    end: new Date(appointment.end),
                    title: `${service.name} with ${clientInformation.firstName}`,
                    client_metadata: appointment.client_metadata,
                    service_data: appointment.service_data
                }
            ])
            setIsOpen(false)
            console.log(await res.json());
            setClientInformation({
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: ""
            })
        }

    }
    // Reschedule an appointment

    // Delete an appointment
    const handleDelete = async (appointmentID: string) => {
        const res = await fetch(`http://localhost:3000/api/appointments/${appointmentID}`, {
            method: 'DELETE'
        });
        const response = await res.json();
        // Delete in local state
        let clone = [...appointments]
        const index = clone.indexOf(response)
        clone.splice(index, 1);
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
    const [view, setView] = useState("week")
    const onView = useCallback((newView: View) => setView(newView), [setView])
    const [open, setOpen] = useState<boolean>(false)
    return (
        <div className='px-6 h-screen flex w-full'>
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
            {!loadingData ? <div className='w-full'>
                <Calendar onSelectEvent={handleEvent} onView={onView} selectable defaultView={Views.WEEK} events={appointments} showAllEvents onSelectSlot={handleSelection} localizer={localizer} startAccessor="start"
                    endAccessor="end" components={{
                        eventWrapper: ({ event, children }: any) => (
                            <div onMouseOver={(e) => {
                                e.preventDefault();

                            }}>
                                <Popover.Root>
                                    <Popover.Trigger asChild>
                                        {children}
                                    </Popover.Trigger>
                                    <Popover.Portal>
                                        <Popover.Content mixed className="max-w-xs py-4 px-5">
                                            <div className='w-full flex justify-end'>
                                                <div>
                                                    <DropdownMenu.Root>
                                                        <DropdownMenu.Trigger asChild>
                                                            <EllipsisVertical size={16} className='hover:cursor-pointer' />

                                                        </DropdownMenu.Trigger>

                                                        <DropdownMenu.Portal>
                                                            <DropdownMenu.Content mixed sideOffset={5}>
                                                                <DropdownMenu.Item onClick={() => {
                                                                    setOpen(true)
                                                                }}>
                                                                    <DropdownMenu.Icon>
                                                                        <Pencil />
                                                                    </DropdownMenu.Icon>
                                                                    Reschedule
                                                                </DropdownMenu.Item>

                                                                <DropdownMenu.Item intent="danger">
                                                                    <DropdownMenu.Icon>
                                                                        <Trash />
                                                                    </DropdownMenu.Icon>
                                                                    Cancel Appointment
                                                                </DropdownMenu.Item>
                                                            </DropdownMenu.Content>
                                                        </DropdownMenu.Portal>
                                                    </DropdownMenu.Root>
                                                </div>
                                            </div>
                                            <Title size="base" as="div" weight="medium">{event.title}</Title>

                                            <Caption className="mb-2">{event.start?.toLocaleDateString()} - {event.end?.toLocaleDateString()}</Caption>

                                        </Popover.Content>
                                    </Popover.Portal>
                                </Popover.Root>
                                <EditAppointment slotInfo={event} client_metadata={event.client_metadata} isOpen={open} setIsOpen={setOpen} services={services} service_data={event.service_data} />
                            </div>
                        )
                    }} />
            </div> : <div className='w-full h-full flex justify-center items-center'>
                <CircularProgress size='sm' />
            </div>}

        </div>
    );
}

const EditAppointment = ({ slotInfo, isOpen, setIsOpen, client_metadata, service_data, services }: {
    slotInfo: any, isOpen: boolean, setIsOpen: any, client_metadata: {
        firstName: string,
        lastName: string,
        phoneNumber: string,
        email: string
    }, service_data: Service, services: Service[]
}) => {
    const [clientInformation, setClientInformation] = useState({ ...client_metadata })
    console.log(slotInfo);
    const [date, setDate] = useState<DateTime>(DateTime.fromJSDate(slotInfo.start))
    const handleDateChange = (value: DateTime) => {
        setDate(value)
    }
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
                                    <Select.Root defaultValue={service_data.id} onValueChange={(value: string) => {

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
                            <Button.Root onClick={() => { }} size="sm">
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

export default Page;
