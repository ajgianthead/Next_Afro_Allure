'use client'

import Textarea from '@components/TextArea'
import { Checkbox } from '@mui/joy'
import { CircularProgress } from '@nextui-org/react'
import Button, { Label } from '@tailus-ui/Button'
import Card from '@tailus-ui/Card'
import { Caption, Text, Title } from '@tailus-ui/typography'
import { cancelAppointment } from 'app/business/[businessName]/actions'
import { CheckIcon, CircleCheckBig } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { ChangeEvent, useEffect, useState } from 'react'

export default function CancelClient() {
    const [isChecked, setIsChecked] = useState<boolean>(false)
    const { appointment_id } = useParams()
    const [reasons, setReasons] = useState<Set<string>>(new Set())
    const [otherReason, setOtherReason] = useState<string>("")
    const [appointment, setAppointment] = useState<any>({})

    useEffect(() => {
        (async () => {
            const result = await fetch(`/api/appointments/${appointment_id}`,
                {
                    method: 'GET'
                }
            )
            const res = await result.json()
            setAppointment(res.appointment)
            if (res.appointment.status === 'CANCELLED') {
                setCancelled(true)
            }
            else {
                setCancelled(false)
            }
        })()
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        let clone = new Set([...reasons])
        if (e.target.checked) {
            clone.add(e.target.value)
        } else {
            clone.delete(e.target.value)
        }
        setReasons(clone)

    }
    const [sendingData, setSendingData] = useState<boolean>(false)
    const [cancelled, setCancelled] = useState<boolean | null>(null)
    return (
        <div>
            {cancelled === null ? <div className='w-full h-screen flex justify-center items-center'>
                <CircularProgress />
            </div> : <div>
                {cancelled === false ? <div className='w-full h-screen flex flex-col justify-start items-center'>
                    <Card className='flex items-start flex-col gap-5 mt-20'>
                        <div>
                            <Title>Cancel Appointment</Title>
                            <Caption>Sorry that you're canceling your appointment. Below select why you want to cancel.</Caption>
                        </div>
                        <div className='flex flex-col gap-2 text-slate-950'>
                            <Checkbox onChange={e => handleChange(e)} onClick={() => {

                            }} value={'scheduling-conflict'} label="Scheduling Conflict" />
                            <Checkbox onChange={e => handleChange(e)} value={"found-another-service"} label="Found Another Service" />
                            <Checkbox onChange={e => handleChange(e)} value={"too-expensive"} label="Too Expensive" />
                            <Checkbox onChange={e => handleChange(e)} value={"no-longer-needed"} label="Service No Longer Needed" />
                            <Checkbox onChange={e => handleChange(e)} value={"personal"} label="Personal Reasons" />
                            <Checkbox onChange={e => handleChange(e)} value={"other"} label="Other" checked={isChecked} onClick={() => { setIsChecked(!isChecked) }} />
                            <Textarea className='w-full' value={otherReason} onChange={(e) => {
                                setOtherReason(e.target.value)
                            }} rows={4} disabled={!isChecked}></Textarea>
                        </div>
                        <div className='flex w-full justify-center flex-col md:flex-row md:justify-end gap-2'>
                            <div>
                                <Button.Root disabled={reasons.size === 0 || sendingData} intent='danger' className='w-full md:w-auto' onClick={async () => {
                                    setSendingData(true)
                                    let clone = [...reasons]
                                    if (clone.includes('other')) {
                                        let index = clone.findIndex((value) => value === 'other')
                                        clone.splice(index, 1, otherReason)
                                    }
                                    const res = await fetch(`/api/appointments`, {
                                        method: 'PUT',
                                        body: JSON.stringify({
                                            id: appointment_id,
                                            start: appointment.start,
                                            end: appointment.end,
                                            status: 'CANCELLED',
                                            reason: clone
                                        })
                                    })
                                    if (res.status === 200) {
                                        setCancelled(true)
                                    }
                                    setSendingData(false)

                                }}>
                                    <Button.Label>{!sendingData ? "Cancel Appointment" : <CircularProgress />}</Button.Label>
                                </Button.Root>
                            </div>

                        </div>
                    </Card>
                </div> : <div>
                    <div className='flex h-[500px] gap-2 px-5 flex-col w-screen justify-center items-center'>
                        <div className='flex gap-3'>
                            <CircleCheckBig color='green' />
                            <Title>Appointment has been cancelled</Title></div>
                        <div className='text-center'>
                            <Caption>If you want to book a new appointment contact {appointment.business_users.business_name}</Caption>
                        </div>
                    </div>
                </div>}
            </div>}
        </div>

    )
}
