'use client'

import { Badge, Button, Divider, IconButton, List, ListDivider, ListItem, ListItemButton, ListItemContent, Typography } from '@mui/joy';
import { Caption, Title } from '@tailus-ui/typography';
import React, { useEffect } from 'react';
import { updateNotificationState } from './actions';
import { PostgrestError } from '@supabase/supabase-js';
import ConfirmAppointmentTemplate from '../../../../../emails/confirm-appointment';
import RescheduledAppointment from '../../../../../emails/rescheduled-appointment';
import { DateTime } from 'luxon';
import CancelledAppointment from '../../../../../emails/cancelled-appointment';
import { ChevronLeft } from 'lucide-react';
import { pretty, render } from '@react-email/components';
import NewAppointment from '../../../../../emails/new-appointment';

interface AppointmentNotification extends BusinessNotification {
    appointments: Appointment
}

interface PageProps {
    notifications: AppointmentNotification[]
}

const NotificationsClient = ({ notifications }: PageProps) => {
    const [notificationState, setNotificationState] = React.useState<AppointmentNotification[]>(notifications)
    const [notiClicked, setNotiClicked] = React.useState<boolean>(false)
    const [noti, setNoti] = React.useState<AppointmentNotification | null>(null)
    return (
        <div>

            {!notiClicked ? <div className='p-5'>
                <Title className='mb-2'>Notifications</Title>
                <Divider />
                <div className='mt-2'>
                    <List>
                        {notificationState.length ? notificationState.map((noti, index) => {
                            return (
                                <ListItem key={index}>
                                    <ListItemButton onClick={async () => {
                                        const res = await updateNotificationState(noti.id)
                                        console.log(res)
                                        if (res instanceof PostgrestError) {
                                            console.log(res.message);
                                        } else {
                                            let clone = [...notificationState]
                                            clone.splice(index, 1, res!)
                                            console.log(clone);

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
                                            <div className='flex gap-5'>
                                                <Typography level="title-sm">{noti.title}</Typography>
                                                <Typography level="body-sm" noWrap>
                                                    {noti.body}
                                                </Typography>
                                            </div>
                                        </ListItemContent>
                                    </ListItemButton>
                                </ListItem>
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
    console.log(notiData)
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
