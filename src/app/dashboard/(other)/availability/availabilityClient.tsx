'use client'
import Checkbox from '@components/Checkbox'
import Label from '@components/Label'
import Card from '@tailus-ui/Card'
import { Caption, Text, Title } from '@tailus-ui/typography'
import { CheckIcon, CircleCheck, CircleHelp, Plus, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Select from "@components/Select";
import Input from '@components/Input'
import Button from '@tailus-ui/Button'
import Separator from '@tailus-ui/Separator'
import Dialog from '@components/Dialog'
import Aligner from '@components/Aligner'
import { TimeField } from '@mui/x-date-pickers/TimeField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { TimeInput, TimeInputValue } from "@nextui-org/date-input";
import { Time } from "@internationalized/date";
import { CheckedState } from '@radix-ui/react-checkbox'
import { Calendar } from "react-multi-date-picker"
import { useUserContext } from '@utils/context/UserContext'
import CircularProgress from '@mui/joy/CircularProgress'
import Tooltip from '@tailus-ui/Tooltip'
import Toast from '@components/Toast'
import { DateTime } from 'luxon'
import { VisuallyHidden } from '@nextui-org/react'
import { checkAvailabilityToServices } from './actions'
import { PostgrestError } from '@supabase/supabase-js'
import { Alert, Modal, ModalClose, ModalDialog, Snackbar, Typography } from '@mui/joy'


const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const shortCuts: any = {
    "Monday": "MON",
    "Tuesday": "TUE",
    "Wednesday": "WED",
    "Thursday": "THU",
    "Friday": "FRI",
    "Saturday": "SAT",
    "Sunday": "SUN"
}

interface PageProps {
    availabilitiesData: any,
    defaultAvailabilityData: string
}

export default function AvailabilityClient({ availabilitiesData, defaultAvailabilityData }: PageProps) {
    const { user } = useUserContext()
    const defaultAvailability = {
        id: crypto.randomUUID(),
        name: "",
        week: [{
            isChecked: true,
            timeRanges: [{
                start: new Time(9),
                end: new Time(17)
            }]
        },
        {
            isChecked: true,
            timeRanges: [{
                start: new Time(9),
                end: new Time(17)
            }]
        },
        {
            isChecked: true,
            timeRanges: [{
                start: new Time(9),
                end: new Time(17)
            }]
        },
        {
            isChecked: true,
            timeRanges: [{
                start: new Time(9),
                end: new Time(17)
            }]
        },
        {
            isChecked: true,
            timeRanges: [{
                start: new Time(9),
                end: new Time(17)
            }]
        },
        {
            isChecked: false,
            timeRanges: [{
                start: new Time(9),
                end: new Time(17)
            }]
        },
        {
            isChecked: false,
            timeRanges: [{
                start: new Time(9),
                end: new Time(17)
            }]
        }],
        specificDates: {}
    }

    const [openCreate, setOpenCreate] = useState<boolean>(false)
    const [availability, setAvailability] = useState<any>(defaultAvailability)
    const [editingAvailability, setEditingAvailability] = useState<any>()
    const [dates, setDates] = useState<string[]>(Object.keys(defaultAvailability.specificDates))
    const onDateSelect = (focused: any, clicked: any) => {


        let date = clicked.toString();
        if (!dates.includes(date)) {
            let newObj = { ...availability }
            newObj.specificDates[date] = [{
                start: new Time(9),
                end: new Time(17)
            }]
            setAvailability(newObj)
            setDates(Object.keys(newObj.specificDates))

        } else {
            let newObj = { ...availability }
            delete newObj.specificDates[date]
            setAvailability(newObj)
            setDates(Object.keys(newObj.specificDates))
        }
    }
    const [availabilities, setAvailabilities] = useState<any>(availabilitiesData)
    const uploadAvailability = async (isEdit: boolean, index?: number) => {
        if (!isEdit) {
            const result = await fetch(`/api/${user.business_id}/availabilities`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        businessId: user.business_id,
                        availabilityData: availability
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            const res = await result.json()
            setAvailabilities([...availabilities,
            res.result
            ])
            setConfirmationData({
                title: "Success",
                description: "Availability Created"
            })
            setConfirmation(true)
        } else {
            if (index != undefined) {
                const result = await fetch(`/api/${user.business_id}/availabilities`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            availability: availability,
                            id: availability.id,
                            defaultAvailability: isDefault ? availability.id : defaultAvailable
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
                const res = await result.json()


                let clone = [...availabilities]
                clone[index] = res.result
                setAvailabilities(clone)
            }
            setisEditing(false)
            setConfirmationData({
                title: "Success",
                description: "Availability Updated"
            })
            setConfirmation(true)
        }
        setAvailability(defaultAvailability)
    }
    const [isEditing, setisEditing] = useState(false);
    const [currEditIndex, setCurrEditIndex] = useState<number>();
    const [defaultAvailable, setDefaultAvailable] = useState(defaultAvailabilityData)
    const handleEdit = (index: number, element: any) => {


        setCurrEditIndex(index)
        setisEditing(true)
        let clone = structuredClone(element.availability_data)
        setDates([...Object.keys(clone.specificDates)])
        setAvailability(clone)
        setEditingAvailability(availabilities[index].availability_data)
        setOpenCreate(true)
    }
    const handleDelete = async (index: number) => {
        const hasAttachedServices = await checkAvailabilityToServices(availability.id)
        if (hasAttachedServices instanceof PostgrestError) {

        } else if (hasAttachedServices.attachedServices) {
            // Set some error state
            setDeletePromptOpen(true)
        } else if (!hasAttachedServices.attachedServices) {
            // Delete availability
            const result = await fetch(`/api/${user.business_id}/availabilities/${availability.id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            const res = await result.json()
            let clone = [...availabilities]
            clone.splice(index, 1)
            setAvailabilities(clone)
            setConfirmationData({
                title: "Success",
                description: "Availability Deleted"
            })
            setConfirmation(true)
        }
    }
    const [tooltip, setTooltip] = useState<boolean>(false)
    const [confirmation, setConfirmation] = useState<boolean>(false)
    const [confirmationData, setConfirmationData] = useState<{
        title: string;
        description: string;
    }>({
        title: "",
        description: "",
    })
    const [isDefault, setisDefault] = useState(false);
    const [deletePromptOpen, setDeletePromptOpen] = useState(false)
    const handleClose = ({ event, reason }: any) => {
        if (reason === 'clickaway') {
            return;
        }
        setDeletePromptOpen(false)
    }
    return (
        <div className='px-6'>
            <Snackbar
                variant='soft'
                color='danger'
                anchorOrigin={{
                    horizontal: 'right',
                    vertical: 'bottom'
                }}
                open={deletePromptOpen}
                onClose={handleClose}
            >
                Can't delete availability. Must remove from attached services
            </Snackbar>
            <Dialog.Root open={openCreate} onOpenChange={() => {
                setOpenCreate(false)
                setDates(Object.keys(availability.specificDates))
            }}>
                {/* TODO: onClose() handle getting rid of data during editing availability */}
                <Dialog.Portal>
                    <Dialog.Overlay className='z-40' />
                    <VisuallyHidden>
                        <Dialog.Title>
                            {isEditing ? "Edit" : "Create New"} Availability
                        </Dialog.Title>
                    </VisuallyHidden>

                    <Dialog.Content className="max-w-7xl z-50 overflow-y-scroll">
                        <div className='mb-2'>
                            <Title>{isEditing ? "Edit" : "Create New"} Availability</Title>
                        </div>
                        <Dialog.Description className=''>

                            <Input value={availability.name} onChange={(e) => {
                                setAvailability({
                                    ...availability,
                                    name: e.target.value
                                })
                            }} placeholder='Enter availability name' className='' />
                            <div className='flex items-center gap-2 mt-2'>
                                <Checkbox.Root checked={defaultAvailable === availability.id || isDefault} disabled={isEditing && defaultAvailable === availability.id} onClick={() => {
                                    setisDefault(!isDefault)
                                }}>
                                    <Checkbox.Indicator asChild>
                                        <CheckIcon className="size-3.5" color='purple' strokeWidth={3} />
                                    </Checkbox.Indicator>
                                </Checkbox.Root>
                                <div className='flex gap-2 items-center'>
                                    <Label>Default Availability </Label>

                                    <Tooltip.Provider>
                                        <Tooltip.Root delayDuration={100}>
                                            <Tooltip.Trigger asChild>
                                                <div><CircleHelp size={16} /></div>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal>
                                                <Tooltip.Content className='z-50'>
                                                    If checked, this will be your default availability for all services
                                                </Tooltip.Content>
                                            </Tooltip.Portal>
                                        </Tooltip.Root>
                                    </Tooltip.Provider>
                                </div>
                            </div>
                            <div className='flex lg:flex-row flex-col mt-2 gap-2'>
                                <Card className=' lg:w-1/2 w-full' variant='outlined'>
                                    {/* Weekday Component */}
                                    <div className='mb-5'>
                                        <Title>Weekly Availability</Title>
                                        <Caption>Enter the times you are available for each day of the week</Caption>
                                    </div>
                                    {weekDays.map((day, index) => {
                                        return (
                                            <div className='mb-5' key={index}>
                                                <Aligner className='mb-2'>
                                                    <Checkbox.Root checked={availability.week[index].isChecked} onClick={() => {
                                                        if (availability.week[index].isChecked) {
                                                            let clone = { ...availability }
                                                            clone.week[index].isChecked = false
                                                            clone.week[index].timeRanges = [{
                                                                start: new Time(9),
                                                                end: new Time(17)
                                                            }]


                                                            setAvailability(clone)
                                                        } else {
                                                            let clone = { ...availability }
                                                            clone.week[index].isChecked = true;
                                                            setAvailability(clone)
                                                        }

                                                    }}>
                                                        <Checkbox.Indicator asChild>
                                                            <CheckIcon className="size-3.5" color='purple' strokeWidth={3} />
                                                        </Checkbox.Indicator>
                                                    </Checkbox.Root>
                                                    <Label>{day}</Label>

                                                </Aligner>
                                                {availability.week[index].isChecked && availability.week[index].timeRanges.map((range: any, rangeIndex: number) => {
                                                    const startRange = range.start ? new Time(range.start.hour, range.start.minute) : null
                                                    const endRange = range.end ? new Time(range.end.hour, range.end.minute) : null
                                                    return (
                                                        <div className='mt-2 flex gap-2 items-center'>
                                                            {range.start && range.end && rangeIndex === availability.week[index].timeRanges.length - 1 && (range.end.hour !== 11 && range.end.minute < 58) ? <Button.Root className='justify-center' variant='ghost' size='sm' onClick={() => {
                                                                let clone = { ...availability }
                                                                clone.week[index].timeRanges.push({
                                                                    start: null,
                                                                    end: null
                                                                })
                                                                setAvailability(clone)
                                                            }}>
                                                                <Button.Icon className=' cursor-pointer'>
                                                                    <Plus />
                                                                </Button.Icon>
                                                            </Button.Root> : <></>}

                                                            {/* Start */}
                                                            <TimeInput minValue={rangeIndex === 0 ? new Time(0) : new Time(availability.week[index].timeRanges[rangeIndex - 1].end.hour, availability.week[index].timeRanges[rangeIndex - 1].end.minute)?.add({ minutes: 1 })} maxValue={new Time(23, 58)} variant='bordered' aria-label="TimeInput" value={startRange} size='sm' className='w-[100px] rounded-sm' label={null} onChange={(timeValue) => {
                                                                let clone = { ...availability }
                                                                clone.week[index].timeRanges[rangeIndex].start = timeValue
                                                                setAvailability(clone)


                                                            }} />
                                                            <Text>-</Text>
                                                            {/* End */}
                                                            <TimeInput minValue={startRange?.add({ minutes: 1 })} maxValue={new Time(23, 59)} variant='bordered' aria-label="TimeInput" value={endRange} size='sm' className='w-[100px] rounded-sm' label={null} onChange={(timeValue) => {
                                                                let clone = { ...availability }
                                                                clone.week[index].timeRanges[rangeIndex].end = timeValue
                                                                setAvailability(clone)


                                                            }} />
                                                            {availability.week[index].timeRanges.length > 1 && <Button.Root variant='ghost' onClick={() => {
                                                                let clone = { ...availability }
                                                                clone.week[index].timeRanges.splice(rangeIndex, 1)
                                                                setAvailability(clone)
                                                            }}>
                                                                <Button.Icon className=' cursor-pointer'>
                                                                    <X />
                                                                </Button.Icon></Button.Root>}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}

                                </Card>
                                <Card variant='outlined' className='lg:w-1/2 w-full  flex flex-col  justify-start'>
                                    <div className='mb-5 text-wrap'>
                                        <Title>Specific Dates</Title>
                                        <Caption>Select dates that differ from your regular availability and enter the time(s) you're available</Caption>
                                    </div>
                                    <div className='w-1/2'>
                                        <Calendar multiple onFocusedDateChange={onDateSelect} />
                                    </div>
                                    <div className='w-1/2'>
                                        {Object.keys(availability.specificDates).map((date, index) => {
                                            return (
                                                <div key={index}>
                                                    <Caption className='mt-3'>{DateTime.fromFormat(date, 'y/mm/dd').toFormat('DDD')}</Caption>
                                                    {availability.specificDates[date].map((range: any, rangeIndex: any) => {
                                                        const rangeStart = new Time(range.start.hour, range.start.minute)
                                                        const rangeEnd = new Time(range.end.hour, range.end.minute)
                                                        return (
                                                            <div className='mt-2 flex gap-2 items-center' key={rangeIndex}>
                                                                {range.start && range.end && rangeIndex === availability.specificDates[date].length - 1 && (range.end.hour !== 11 && range.end.minute < 58) ? <Button.Root className='justify-center' variant='ghost' size='sm' onClick={() => {
                                                                    let clone = { ...availability }
                                                                    clone.specificDates[date].push({
                                                                        start: null,
                                                                        end: null
                                                                    })
                                                                    setAvailability(clone)
                                                                }}>
                                                                    <Button.Icon className=' cursor-pointer'>
                                                                        <Plus />
                                                                    </Button.Icon>
                                                                </Button.Root> : <></>}

                                                                {/* Start */}
                                                                <TimeInput minValue={rangeIndex === 0 ? new Time(0) : new Time(availability.specificDates[date][rangeIndex - 1].end.hour, availability.specificDates[date][rangeIndex - 1].end.minute)?.add({ minutes: 1 })} maxValue={new Time(23, 58)} variant='bordered' aria-label="TimeInput" value={range.start} size='sm' className='w-[100px] rounded-sm' label={null} onChange={(timeValue) => {
                                                                    let clone = { ...availability }
                                                                    clone.specificDates[date][rangeIndex].start = timeValue
                                                                    setAvailability(clone)
                                                                }} />
                                                                <Text>-</Text>
                                                                {/* End */}
                                                                <TimeInput minValue={rangeStart?.add({ minutes: 1 })} maxValue={new Time(23, 59)} variant='bordered' aria-label="TimeInput" value={range.end} size='sm' className='w-[100px] rounded-sm' label={null} onChange={(timeValue) => {
                                                                    let clone = { ...availability }
                                                                    clone.specificDates[date][rangeIndex].end = timeValue
                                                                    setAvailability(clone)
                                                                }} />
                                                                {availability.specificDates[date].length > 1 && <Button.Root variant='ghost' onClick={() => {
                                                                    let clone = { ...availability }
                                                                    clone.specificDates[date].splice(rangeIndex, 1)
                                                                    setAvailability(clone)
                                                                }}>
                                                                    <Button.Icon className=' cursor-pointer'>
                                                                        <X />
                                                                    </Button.Icon></Button.Root>}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </Card>
                            </div>
                        </Dialog.Description>

                        <Dialog.Actions>
                            <Dialog.Close asChild>
                                <Button.Root onClick={() => {
                                    setAvailability(defaultAvailability)
                                    setisEditing(false)
                                }} variant="outlined" size="sm" intent="gray">
                                    <Button.Label>Cancel</Button.Label>
                                </Button.Root>
                            </Dialog.Close>
                            {isEditing ? <Dialog.Close asChild>
                                <Tooltip.Provider>
                                    <Tooltip.Root open={tooltip} onOpenChange={availabilities.length > 1 ? () => { } : () => { setTooltip(!tooltip) }} delayDuration={100}>
                                        <Tooltip.Trigger asChild>
                                            <Button.Root disabled={availabilities.length === 1} onClick={async () => {
                                                await handleDelete(currEditIndex!)
                                                setAvailability(defaultAvailability)
                                                setisEditing(false)
                                                setOpenCreate(false)
                                            }} variant="soft" size="sm" intent="danger">
                                                <Button.Label>Delete Availability</Button.Label>
                                            </Button.Root>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content className='z-50'>
                                                Can't delete your only availability
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </Tooltip.Provider>

                            </Dialog.Close> : <></>}
                            <Dialog.Close asChild >
                                <Button.Root onClick={() => {
                                    isEditing ? uploadAvailability(isEditing, currEditIndex) : uploadAvailability(isEditing)
                                }} size="sm">
                                    <Button.Label>{isEditing ? "Save Changes" : "Upload Availability"}</Button.Label>
                                </Button.Root>
                            </Dialog.Close>
                        </Dialog.Actions>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            <div className='w-full mt-5 flex justify-between gap-6'>
                <Title>Availability</Title>
                <Button.Root className='ml-30 min-w-36' onClick={() => {
                    setisEditing(false)
                    setOpenCreate(true)
                    setisDefault(false)
                    setAvailability(defaultAvailability)
                }}>
                    <Button.Label>+ Create New</Button.Label>
                </Button.Root>
            </div>
            <Separator orientation='horizontal' className='my-2' />
            {/* Map through availabilities */}
            <div className='flex flex-wrap gap-2 w-full'>
                {availabilities.length ? availabilities.map((element: any, index: number) => {
                    return (
                        <div key={index} className='' onClick={() => {

                            handleEdit(index, element)
                            setisDefault(false)
                        }}>
                            <Card variant='outlined' className='w-full pr-20 min-w-max cursor-pointer'>
                                <div className='mb-2'>
                                    <Text className='font-medium'>{element.availability_data.name}</Text>
                                    <Caption className='text-xs italic flex flex-row'>{element.availability_data.week.map((day: any, index: number) => {
                                        return (
                                            <Caption>{`${day.isChecked ? shortCuts[weekDays[index]] + ", " : ""}`}</Caption>
                                        )
                                    })}</Caption>
                                </div>
                                <Caption className='text-xs italic'>Created on: <span className='underline'>{DateTime.fromISO(element.created_at).toFormat('D')}</span></Caption>
                                <Caption className='text-xs italic'>Updated on: <span className='underline'>{DateTime.fromISO(element.updated_at).toFormat('D')}</span></Caption>
                            </Card>
                        </div>
                    )
                }) : <div className='flex justify-center items-center w-full h-full'>
                    <CircularProgress size='sm' />
                </div>}
            </div>
            <Toast.Provider>
                <Toast.Root open={confirmation} onOpenChange={setConfirmation} mixed>
                    <div className='flex justify-between items-center'>
                        <Toast.Title className='flex gap-2 items-center'><CircleCheck color='green' size={16} />{confirmationData.title}</Toast.Title>
                        <Toast.Close aria-label="Close">
                            <span aria-hidden><X size={16} /></span>
                        </Toast.Close>
                    </div>
                    <Toast.Description>{confirmationData.description}</Toast.Description>
                </Toast.Root>

                <Toast.Viewport />
            </Toast.Provider>
        </div>
    )
}







