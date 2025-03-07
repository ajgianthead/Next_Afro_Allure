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

export default function Page() {
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
    useEffect(() => {
        const getData = async () => {
            const res = await fetch(`http://localhost:3000/api/${user.business_id}/availabilities`, {
                method: 'GET'
            })
            const result = await res.json()
            const availabilities = result;
            setAvailabilities(availabilities.result.availabilities === null ? [] : availabilities.result.availabilities)
            setDefaultAvailable(availabilities.result.default)
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
                title: "Success",
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
                            availabilities: clone,
                            defaultAvailability: isDefault ? availability.id : defaultAvailable
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
                title: "Success",
                description: "Availability Updated"
            })
            setConfirmation(true)
        }
        setAvailability(defaultAvailability)
    }
    const [isEditing, setisEditing] = useState(false);
    const [currEditIndex, setCurrEditIndex] = useState<number>();
    const [defaultAvailable, setDefaultAvailable] = useState("")
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
            title: "Success",
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
    const [isDefault, setisDefault] = useState(false);
    return (
        <div className='px-6'>
            <Dialog.Root open={openCreate} onOpenChange={setOpenCreate}>
                <Dialog.Portal>
                    <Dialog.Overlay className='z-40' />
                    <Dialog.Content className="max-w-7xl z-50 overflow-y-scroll">
                        {/* <Dialog.Title>{isEditing ? "Edit" : "Create"} Availability</Dialog.Title>
                        <Caption>Enter your availability</Caption> */}
                        <Dialog.Description className=''>
                            <div className='mb-2'>
                                <Title>{isEditing ? "Edit" : "Create New"} Availability</Title>
                            </div>
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
                    console.log(element);

                    return (
                        <div className='' onClick={() => {
                            handleEdit(index)
                            setisDefault(false)
                        }}>
                            <Card variant='outlined' className='w-full pr-20 min-w-max cursor-pointer'>
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







