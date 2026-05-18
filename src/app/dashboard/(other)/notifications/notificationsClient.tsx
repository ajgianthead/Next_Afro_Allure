'use client'

import { Badge, Button, Checkbox, Divider, IconButton, List, ListItem, ListItemButton, ListItemContent, Typography } from '@mui/joy';
import { Caption, Title } from '@tailus-ui/typography';
import React from 'react';
import { deleteNotification, updateNotificationState } from './actions';
import { PostgrestError } from '@supabase/supabase-js';
import { DateTime } from 'luxon';
import { ChevronLeft, Trash2 } from 'lucide-react';

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
        const newSelected = new Set<string>()
        const notiClone = notificationState.map((noti) => {
            if (checked) newSelected.add(noti.id)
            return { ...noti, checked }
        })
        setNotificationState(notiClone)
        setSelectedNotis(newSelected)
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

    const appt = notiData.appointments as any
    const createdAt = DateTime.fromISO(notiData.created_at).toLocaleString(DateTime.DATETIME_MED)
    const serviceName = appt?.service_data?.name
    const clientName = appt?.client_metadata
        ? `${appt.client_metadata.firstName ?? ''} ${appt.client_metadata.lastName ?? ''}`.trim()
        : null
    const apptStart = appt?.start
        ? DateTime.fromISO(appt.start).toLocaleString(DateTime.DATETIME_MED)
        : null

    return (
        <div>
            <div className='p-5'>
                <Title className='mb-2 flex items-center gap-1'>
                    <IconButton onClick={() => setNotiClicked(false)} size='sm'>
                        <ChevronLeft size={18} />
                    </IconButton>
                    {notiData.title}
                </Title>
                <Divider />
                <div className='mt-5 space-y-3 px-1'>
                    <Typography level='body-md'>{notiData.body}</Typography>
                    {clientName && (
                        <Typography level='body-sm'>
                            <span style={{ color: '#6F6863' }}>Client: </span>{clientName}
                        </Typography>
                    )}
                    {serviceName && (
                        <Typography level='body-sm'>
                            <span style={{ color: '#6F6863' }}>Service: </span>{serviceName}
                        </Typography>
                    )}
                    {apptStart && (
                        <Typography level='body-sm'>
                            <span style={{ color: '#6F6863' }}>Appointment: </span>{apptStart}
                        </Typography>
                    )}
                    <Typography level='body-xs' sx={{ color: 'text.tertiary', paddingTop: 1 }}>
                        {createdAt}
                    </Typography>
                    {notiData.appointment_id && (
                        <a
                            href='/dashboard/appointments'
                            style={{ display: 'block', color: '#FC6161', fontSize: 13, paddingTop: 4 }}
                        >
                            View appointment →
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsClient;
