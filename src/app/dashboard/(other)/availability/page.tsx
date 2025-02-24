'use client'
import Checkbox from '@components/Checkbox'
import Label from '@components/Label'
import Card from '@tailus-ui/Card'
import { Caption, Text, Title } from '@tailus-ui/typography'
import { CheckIcon, Plus, X } from 'lucide-react'
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


const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const shortCuts = {
    "Monday": "MON",
    "Tuesday": "TUE",
    "Wednesday": "WED",
    "Thursday": "THU",
    "Friday": "FRI",
    "Saturday": "SAT",
    "Sunday": "SUN"
}

export default function page() {
    const { user } = useUserContext()
    console.log(user);

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
    useEffect(() => {
        const getData = async () => {
            const res = await fetch(`http://localhost:3000/api/${user.business_id}/availabilities`, {
                method: 'GET'
            })
            const result = await res.json()
            const availabilities = result;
            setAvailabilities(availabilities.result === null ? [] : availabilities.result)
        }
        if (user.business_id) {
            (async () => {
                await getData()
            })()
        }

    }, [user]);
    const [openCreate, setOpenCreate] = useState<boolean>(false)
    const [availability, setAvailability] = useState<any>(defaultAvailability)
    const [dates, setDates] = useState<string[]>(Object.keys(availability.specificDates))
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
    const [availabilities, setAvailabilities] = useState<any>([])
    // Send availabilities to API
    // 
    // 
    // 
    const uploadAvailability = async (isEdit: boolean, index?: number) => {
        if (!isEdit) {
            let clone = [...availabilities]
            clone.push(availability)
            setAvailabilities(clone)
            const result = await fetch(`http://localhost:3000/api/${user.business_id}/availabilities`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        availabilities: clone
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            const res = await result.json()
            setConfirmationData({
                title: "Confirmation",
                description: "Availability Created"
            })
            setConfirmation(true)
        } else {
            if (index != undefined) {
                let clone = [...availabilities]
                clone[index] = availability
                setAvailabilities(clone)
                const result = await fetch(`http://localhost:3000/api/${user.business_id}/availabilities`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            availabilities: clone
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
                const res = await result.json()
            }
            setisEditing(false)
            setConfirmationData({
                title: "Confirmation",
                description: "Availability Updated"
            })
            setConfirmation(true)
        }
        setAvailability(defaultAvailability)
    }
    const [isEditing, setisEditing] = useState(false);
    const [currEditIndex, setCurrEditIndex] = useState<number>();
    const handleEdit = (index: number) => {
        console.log(availabilities[index]);

        setCurrEditIndex(index)
        setisEditing(true)
        setAvailability(availabilities[index])
        setOpenCreate(true)
    }
    const handleDelete = async (index: number) => {
        let clone = [...availabilities]
        clone.splice(index, 1)
        setAvailabilities(clone)
        // Update Supabase
        const result = await fetch(`http://localhost:3000/api/${user.business_id}/availabilities`,
            {
                method: "PUT",
                body: JSON.stringify({
                    availabilities: clone
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        const res = await result.json()
        setConfirmationData({
            title: "Confirmation",
            description: "Availability Deleted"
        })
        setConfirmation(true)
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
    return (
        <div className='px-6'>
            <Dialog.Root open={openCreate} onOpenChange={setOpenCreate}>
                <Dialog.Portal>
                    <Dialog.Overlay className='z-40' />
                    <Dialog.Content className="max-w-7xl z-50 overflow-y-scroll">
                        <Dialog.Title>{isEditing ? "Edit" : "Create"} Availability</Dialog.Title>
                        <Caption>Enter your availability</Caption>
                        <Dialog.Description className=''>
                            <Input value={availability.name} onChange={(e) => {
                                setAvailability({
                                    ...availability,
                                    name: e.target.value
                                })
                            }} placeholder='Availability Name' className='mt-5' />

                            <div className='flex mt-2 gap-2'>
                                <Card className=' w-1/3 ' variant='outlined'>
                                    {/* Weekday Component */}
                                    {weekDays.map((day, index) => {
                                        return (
                                            <div className='mb-5'>
                                                <Aligner key={index} className='mb-2'>
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
                                                                console.log(clone);

                                                            }} />
                                                            <Text>-</Text>
                                                            {/* End */}
                                                            <TimeInput minValue={startRange?.add({ minutes: 1 })} maxValue={new Time(23, 59)} variant='bordered' aria-label="TimeInput" value={endRange} size='sm' className='w-[100px] rounded-sm' label={null} onChange={(timeValue) => {
                                                                let clone = { ...availability }
                                                                clone.week[index].timeRanges[rangeIndex].end = timeValue
                                                                setAvailability(clone)
                                                                console.log(clone);

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
                                <Card variant='outlined' className='w-2/3 flex justify-start'>
                                    <div className='w-1/2'>
                                        <Calendar multiple onFocusedDateChange={onDateSelect} />
                                    </div>
                                    <div className='w-1/2'>
                                        {Object.keys(availability.specificDates).map((date, index) => {
                                            return (
                                                <div key={index}>
                                                    {date}
                                                    {availability.specificDates[date].map((range: any, rangeIndex: any) => {
                                                        return (
                                                            <div className='mt-2 flex gap-2 items-center'>
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
                                                                <TimeInput minValue={rangeIndex === 0 ? new Time(0) : availability.specificDates[date][rangeIndex - 1].end?.add({ minutes: 1 })} maxValue={new Time(23, 58)} variant='bordered' aria-label="TimeInput" value={range.start} size='sm' className='w-[100px] rounded-sm' label={null} onChange={(timeValue) => {
                                                                    let clone = { ...availability }
                                                                    clone.specificDates[date][rangeIndex].start = timeValue
                                                                    setAvailability(clone)
                                                                }} />
                                                                <Text>-</Text>
                                                                {/* End */}
                                                                <TimeInput minValue={range.start?.add({ minutes: 1 })} maxValue={new Time(23, 59)} variant='bordered' aria-label="TimeInput" value={range.end} size='sm' className='w-[100px] rounded-sm' label={null} onChange={(timeValue) => {
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
            <Title>Availability</Title>
            <div className='w-full mt-2 flex gap-6'>
                <Input placeholder='Search availability by name' className='' />
                <Button.Root className='ml-30 min-w-36' onClick={() => {
                    setOpenCreate(true)
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
                        <div className='w-1/5' onClick={() => {
                            handleEdit(index)
                        }}>
                            <Card variant='outlined' className='w-full cursor-pointer'>
                                <div className='mb-2'>
                                    <Text className='font-medium'>{element.name}</Text>
                                    <Caption className='text-xs italic'>MON, TUE, WED, FRI</Caption>
                                </div>
                                <Caption className='text-xs'>Created on: <span className='underline'>10/15/2024</span></Caption>
                                <Caption className='text-xs'>Updated on: <span className='underline'>10/15/2024</span></Caption>
                            </Card>
                        </div>
                    )
                }) : <div className='flex justify-center items-center w-full h-full'>
                    <CircularProgress size='sm' />
                </div>}
            </div>
            <Toast.Provider>
                <Toast.Root open={confirmation} onOpenChange={setConfirmation}>
                    <Toast.Title>{confirmationData.title}</Toast.Title>
                    <Toast.Description>{confirmationData.description}</Toast.Description>
                    <Toast.Close />
                </Toast.Root>

                <Toast.Viewport />
            </Toast.Provider>
        </div>
    )
}







