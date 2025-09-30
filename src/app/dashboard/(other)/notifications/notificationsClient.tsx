'use client'

import { Badge, Button, Checkbox, Divider, IconButton, List, ListDivider, ListItem, ListItemButton, ListItemContent, Typography } from '@mui/joy';
import { Caption, Title } from '@tailus-ui/typography';
import React, { useEffect } from 'react';
import { deleteNotification, updateNotificationState } from './actions';
import { PostgrestError } from '@supabase/supabase-js';
import ConfirmAppointmentTemplate from '../../../../../emails/confirm-appointment';
import RescheduledAppointment from '../../../../../emails/rescheduled-appointment';
import { DateTime } from 'luxon';
import CancelledAppointment from '../../../../../emails/cancelled-appointment';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { pretty, render } from '@react-email/components';
import NewAppointment from '../../../../../emails/new-appointment';

interface AppointmentNotification extends BusinessNotification {
    appointments: Appointment,
    checked?: boolean
}

interface PageProps {
    notifications: AppointmentNotification[]
}

const NotificationsClient = ({ notifications }: PageProps) => {
    const [notificationState, setNotificationState] = React.useState<AppointmentNotification[]>(notifications)
    const [notiClicked, setNotiClicked] = React.useState<boolean>(false)
    const [noti, setNoti] = React.useState<AppointmentNotification | null>(null)
    const [selectedNotis, setSelectedNotis] = React.useState<Set<string>>(new Set())
    const handleSelectAll = (e: any) => {
        const checked = e.target.checked
        let notiClone = [...notificationState]
        let selectedClone = new Set([...selectedNotis])
        if (checked) {
            notiClone.forEach((noti) => {
                noti.checked = true
                selectedNotis.add(noti.id)
            })
        } else {
            notiClone.forEach((noti) => {
                noti.checked = false
                selectedNotis.delete(noti.id)

            })
        }
        setNotificationState(notiClone)


    }
    const [loading, setLoading] = React.useState<boolean>(false)
    return (
        <div>
            {!notiClicked ? <div className='p-5'>
                <Title className='mb-2'>Notifications</Title>
                {selectedNotis.size > 0 ? <div className='flex pl-3 gap-5 w-full justify-between mb-2'>
                    <Checkbox onChange={e => {
                        handleSelectAll(e)
                    }} size='sm' label="Select all" className='mt-2' />
                    <Button loading={loading} onClick={async () => {
                        setLoading(true)
                        const res = await deleteNotification(selectedNotis)
                        let clone = [...notificationState]
                        const notiArray = Array.from(selectedNotis)
                        for (let i = 0; i < notiArray.length; i++) {
                            const index = clone.findIndex((noti) => notiArray[i] === noti.id)
                            clone.splice(index, 1)
                        }
                        setNotificationState(clone)
                        setLoading(false)
                    }} disabled={selectedNotis.size === 0}
                        startDecorator={<Trash2 size={20} />} variant='outlined' color='danger'>Delete</Button>
                </div> : <></>}
                <Divider />
                <div className='mt-2'>
                    <List>
                        {notificationState.length ? notificationState.map((noti, index) => {
                            return (
                                <div key={index} className='overflow-x-hidden'>
                                    <ListItem>
                                        <Checkbox checked={noti.checked || selectedNotis.has(noti.id)} onChange={(e) => {
                                            const isChecked = e.target.checked
                                            let clone = [...notificationState]
                                            clone[index].checked = isChecked
                                            let selected = new Set([...selectedNotis])
                                            if (isChecked) {
                                                selected.add(noti.id)
                                            } else {
                                                selected.delete(noti.id)
                                            }
                                            setSelectedNotis(selected)
                                        }} className='mr-2' />
                                        <ListItemButton onClick={async () => {
                                            const res = await updateNotificationState(noti.id)

                                            if (res instanceof PostgrestError) {

                                            } else {
                                                let clone = [...notificationState]
                                                clone.splice(index, 1, res!)


                                                setNotificationState(clone)
                                                setNoti(noti)
                                                setNotiClicked(true)
                                            }
                                        }} sx={{
                                            borderRadius: 8
                                        }}>
                                            <ListItemContent sx={{
                                                display: 'flex',
                                                gap: 3,
                                                alignItems: 'center',
                                                padding: 2
                                            }}>

                                                {!noti.read ? <Badge size='sm' /> : <></>}
                                                <div className='flex lg:gap-5 gap-1 lg:flex-row flex-col'>
                                                    <Typography level="title-sm">{noti.title}</Typography>
                                                    <Typography level="body-sm" noWrap>
                                                        {noti.body}
                                                    </Typography>
                                                </div>
                                            </ListItemContent>
                                        </ListItemButton>
                                    </ListItem>
                                </div>
                            )
                        }) : <div className='mt-5 w-full flex justify-center'>
                            <Caption className='italic'>You have no current notifications</Caption>
                        </div>}
                    </List>
                </div>
            </div> : <IndividualNoti notiData={noti} notiClicked setNotiClicked={setNotiClicked} />}
        </div>
    );
}

const IndividualNoti = ({ notiData, notiClicked, setNotiClicked }: { notiData: AppointmentNotification | null, notiClicked: boolean, setNotiClicked: React.Dispatch<React.SetStateAction<boolean>> }) => {
    if (!notiData) return null;
    const [html, setHtml] = React.useState<string>()
    useEffect(() => {
        (async () => {
            setHtml(await pretty(await render(notiToTemplate[notiData.type as keyof typeof notiToTemplate])))
        })()
    }, []);
    const res = notiData.appointments as any;

    const commonProps = {
        socials: { facebook: "", instagram: "", twitter: "" },
        clientData: {
            firstName: res.client_metadata?.firstName,
            lastName: res.client_metadata.lastName,
        },
        businessData: {
            id: res.business,
            name: res.business_users.business_name,
            businessAddress: "2800 SW 35th Place, Gainesville, FL"
        },
        appointmentData: {
            id: res.id,
            start: DateTime.fromISO(res.start).toISO()!,
            end: DateTime.fromISO(res.end).toISO()!
        },
        serviceName: res.service_data.name
    };

    const notiToTemplate = {
        'new-booking': NewAppointment(commonProps),
        'rescheduled-booking': RescheduledAppointment(commonProps),
        'cancelled-booking': CancelledAppointment(commonProps)
    };

    return (
        <div>
            <div>
                <Title className='mb-2 flex items-center'>{notiClicked ? <div>
                    <IconButton onClick={() => {
                        setNotiClicked(false)
                    }}>
                        <ChevronLeft />
                    </IconButton>
                </div> : <></>}{notiData.title}</Title>
                <Divider />
                <div className='w-full flex justify-center'>
                    <div className='mt-16 md:w-1/2 w-full px-10'>
                        <List>
                            <div dangerouslySetInnerHTML={{ __html: html! }} />
                        </List>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NotificationsClient;
