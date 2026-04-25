'use client'

import { Caption, Link, Text, Title } from '@tailus-ui/typography';
import { CheckCircle, Info, TrendingDown, TrendingUp, XCircle } from 'lucide-react';
import { data } from '@tailus-ui/visualizations/data';
import ScrollArea from "@components/ScrollArea"
import { useEffect, useState } from 'react';
import { useUserContext } from '@/app/utils/context/UserContext';
import { DateTime } from 'luxon';
import { Button, Card, DialogContent, DialogTitle, Divider, IconButton, Modal, ModalClose, ModalDialog, Snackbar, Typography } from '@mui/joy';
import QRCode from "react-qr-code";
import { sendPaymentLink } from 'app/dashboard/(other)/actions';
import { useSearchParams } from 'next/navigation';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

interface PageProps {
  appointments: Appointment[], businessData: Business, dashboardAnalytics: {
    revenue: PostgrestSingleResponse<number>;
    bookings: PostgrestSingleResponse<number>;
    newClients: PostgrestSingleResponse<number>;
    returningRate: PostgrestSingleResponse<number>;
  },
  growth: {
    clients_growth: number;
    clients_last_month: number;
    clients_this_month: number;
    revenue_growth: number;
    revenue_last_month: number;
    revenue_this_month: number;
  } | null;
}


export const StackedCards = ({ appointments, businessData, dashboardAnalytics, growth }: PageProps) => {
  const params = useSearchParams()
  const subscriptionSuccess = params.get('success')
  const [openSuccessModal, setOpenSuccessModal] = useState<boolean>(true)

  return (
    <div>
      {
        (() => {
          if (subscriptionSuccess === 'true') {
            return (
              <Snackbar endDecorator={
                <Button
                  onClick={() => setOpenSuccessModal(false)}
                  size="sm"
                  variant='plain'
                  color="success"
                >
                  Dismiss
                </Button>
              } color='success' startDecorator={<CheckCircle size={24} />} open={openSuccessModal} onClose={() => {
                setOpenSuccessModal(false)
              }}>
                Subscribed successfully.
              </Snackbar>
            )
          }
          else if (subscriptionSuccess === 'false') {
            return (
              <Snackbar endDecorator={
                <Button
                  onClick={() => setOpenSuccessModal(false)}
                  size="sm"
                  variant='plain'
                  color="danger"
                >
                  Dismiss
                </Button>
              } color='danger' startDecorator={<Info size={24} />} open={openSuccessModal} onClose={() => {
                setOpenSuccessModal(false)
              }}>
                Something went wrong.
              </Snackbar>
            )
          }
        })()
      }
      <p className='text-2xl font-medium mb-5'>Welcome, {businessData.business_name}</p>
      <div className='grid grid-cols-4 gap-2 w-full'>
        <RevenueCard growth={growth} dashboardAnalytics={dashboardAnalytics} />
        <Card className='md:col-span-1 col-span-2'>
          <div className='flex justify-between items-center'>
            <p className='text-sm font-medium'>Total Bookings this Month</p>
            <Info className='cursor-pointer' size={16} />
          </div>
          <p className='text-3xl font-semibold'>{dashboardAnalytics.bookings.data}</p>
        </Card>
        <ClientCard growth={growth} dashboardAnalytics={dashboardAnalytics} />
        {/* <Card>
          <div className='flex justify-between items-center'>
            <p className='text-sm font-medium'>Client Return Rate</p>
            <Info className='cursor-pointer' size={16} />
          </div>
          <p className='text-3xl font-semibold'>{Math.round(dashboardAnalytics.returningRate.data! * 100)}%</p>
        </Card> */}
      </div>
      <div className='w-full flex md:flex-row flex-col-reverse lg:w-[calc(100vw-20rem)]'>
        <Card variant="plain" className="md:w-1/2 w-full border-none">
          <Title as="h2" size="lg" weight="medium" className="mb-1 text-slate-500">
            Upcoming Appointments
          </Title>
          {
            appointments.length === 0 ? <div className="p-10 flex justify-center items-center h-max w-full">
              <Caption className='italic'>No upcoming appointments</Caption>
            </div> : <div className="py-2 h-max w-full overflow-x-scroll flex gap-2">
              {
                appointments?.map((appointment, index) => {
                  return (
                    <div key={index}>
                      <AppointmentCard businessData={businessData} appointment={appointment} />
                    </div>
                  )
                })
              }
            </div>
          }
        </Card >
        <Card variant='plain' className="md:w-1/2 w-full">
          <Title as="h2" size="lg" weight="medium" className="mb-1 text-slate-500">Today's Snapshot</Title>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <Stat label="Appointments" value={3} />
            <Stat label="Expected Revenue" value="$420" />

          </div>
        </Card>
      </div>
    </div>

  );
};

type StatProps = {
  label: string;
  value: string | number;
  subtext?: string;
};

export function Stat({ label, value, subtext }: StatProps) {
  return (
    <Card variant='soft'>
      <p className="text-base text-slate-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {subtext && (
        <p className="text-xs text-slate-400">{subtext}</p>
      )}
    </Card>
  );
}

const AppointmentCard = ({ appointment, businessData }: { appointment: any, businessData: Business }) => {
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState<boolean>(false)
  const [emailSent, setEmailSent] = useState<boolean>(false)
  const [sendingEmail, setSendingEmail] = useState<boolean>(false)
  return (
    <div>
      <div>
        <Modal open={appointmentDetailsOpen} onClose={() => {
          setAppointmentDetailsOpen(false)
          setEmailSent(false)
        }}>
          <ModalDialog sx={{
            overflowY: 'scroll',

          }} size='lg' >
            <ModalClose />
            <Typography level='h4' sx={{ display: 'flex', flexDirection: 'column' }}>Appointment Details <Caption>Below are the appointment details, including a link to payment</Caption></Typography>

            <div className='flex flex-col gap-2 mb-2'>
              <div className='w-full flex lg:flex-row text-center lg:text-start flex-col lg:justify-between items-center gap-2'>
                <div className='lg:w-1/2 justify-start flex flex-col'>
                  <Caption className='font-semibold'>Date</Caption>
                  <Text size={"sm"}>{DateTime.fromISO(appointment.start).toFormat('DDDD')}</Text>
                </div>
                <div className='lg:w-1/2 justify-start flex flex-col'>
                  <Caption className='font-semibold'>Time</Caption>
                  <Text size={"sm"}>{`${DateTime.fromISO(appointment.start).toFormat('t')} - ${DateTime.fromISO(appointment.end).toFormat('t')}`}</Text>                </div>
              </div>
              <div className='w-full flex lg:flex-row text-center lg:text-start flex-col lg:justify-between items-center gap-2'>
                <div className='lg:w-1/2 justify-start flex flex-col'>
                  <Caption className='font-semibold'>Service</Caption>
                  <Text size={"sm"}>{appointment.service_data.name}</Text>
                </div>
                <div className='lg:w-1/2 justify-start flex flex-col'>
                  <Caption className='font-semibold'>Price</Caption>
                  <Text size={"sm"}>${appointment.service_data.price / 100}</Text>
                </div>
              </div>
              <div className='w-full flex lg:flex-row text-center lg:text-start flex-col lg:justify-between items-center gap-2'>
                <div className='lg:w-1/2 justify-start flex flex-col'>
                  <Caption className='font-semibold'>Client Name</Caption>
                  <Text size={"sm"}>{appointment.client_metadata.firstName + " " + appointment.client_metadata.lastName}</Text>
                </div>
                <div className='lg:w-1/2 justify-start flex flex-col'>
                  <Caption className='font-semibold'>Client Email</Caption>
                  <Text size={"sm"}>{appointment.client_metadata.email}</Text>
                </div>
              </div>
              <div className='w-full flex lg:flex-row text-center lg:text-start flex-col lg:justify-between items-center gap-2'>
                <div className='lg:w-1/2 justify-start flex flex-col'>
                  <Caption className='font-semibold'>Client Phone Number</Caption>
                  <Text size={"sm"}>{`(${appointment.client_metadata.phoneNumber.slice(0, 3)})` + " " + appointment.client_metadata.phoneNumber.slice(3, 6) + "-" + appointment.client_metadata.phoneNumber.slice(6)}</Text>
                </div>

              </div>
            </div>

            {businessData.completed_stripe_onboarding ? <div><Divider sx={{
              marginX: 0.2
            }} /><div className='text-center'>

                <Caption className='mb-5'>QR Code to pay for appointment</Caption>
                <div style={{ height: 200, margin: "0 auto", width: "100%" }}>
                  <QRCode
                    size={256}
                    style={{ height: "100%", maxWidth: "100%", width: "100%" }}
                    value={`/appointments/${appointment.id}/business/${appointment.business}/eoa-payment`}
                    viewBox={`0 0 256 256`}
                  />

                </div>
                <div className='mt-5'>
                  <Button disabled={sendingEmail} onClick={async () => {
                    setSendingEmail(true)
                    await sendPaymentLink({
                      clientData: {
                        firstName: appointment.client_metadata.firstName,
                        lastName: appointment.client_metadata.lastName,
                        email: appointment.client_metadata.email,
                        phoneNumber: appointment.client_metadata.phoneNumber
                      },
                      businessData: {
                        id: appointment.business,
                        name: businessData.business_name,
                        email: businessData.email
                      },
                      appointmentID: appointment.id,
                      serviceName: appointment.service_data.name
                    })
                    setSendingEmail(false)
                    setEmailSent(true)
                  }}>Send link to client email</Button>
                  {emailSent ? <div>
                    <Typography>Payment Link Sent!</Typography>
                  </div> : <></>}
                </div>
              </div></div> : <></>}
          </ModalDialog>
        </Modal>
        <Card className='w-max' variant='outlined'>
          <Title as='h4' size="lg" weight={"semibold"}>{`${appointment.service_data?.name} with ${appointment.client_metadata?.firstName}`}</Title>
          <Text size={"sm"}>{DateTime.fromISO(appointment.start).toFormat('DDDD')}</Text>
          <Text size={"sm"}>{`${DateTime.fromISO(appointment.start).toFormat('t')} - ${DateTime.fromISO(appointment.end).toFormat('t')}`}</Text>
          <div className='flex gap-2'>
            <Text size={"sm"} className='text-blue-500 cursor-pointer' onClick={() => {
              setAppointmentDetailsOpen(true)
            }}>View Details</Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

const RevenueCard = ({ growth, dashboardAnalytics }: {
  growth: {
    clients_growth: number;
    clients_last_month: number;
    clients_this_month: number;
    revenue_growth: number;
    revenue_last_month: number;
    revenue_this_month: number;
  } | null, dashboardAnalytics: {
    revenue: PostgrestSingleResponse<number>;
    bookings: PostgrestSingleResponse<number>;
    newClients: PostgrestSingleResponse<number>;
    returningRate: PostgrestSingleResponse<number>;
  }
}) => {
  const thisMonth = growth?.revenue_this_month ?? 0;
  const lastMonth = growth?.revenue_last_month ?? 0;
  let displayText;
  let colorClass;
  let Icon;

  if (lastMonth === 0 && thisMonth > 0) {
    displayText = "New";
    colorClass = "text-green-600";
    Icon = TrendingUp;
  } else if (lastMonth === 0 && thisMonth === 0) {
    displayText = "—";
    colorClass = "text-gray-400";
  } else {
    const percent = ((thisMonth - lastMonth) / lastMonth) * 100;
    const isPositive = percent >= 0;

    displayText = `${Math.abs(percent).toFixed(1)}%`;
    colorClass = isPositive ? "text-green-600" : "text-red-600";
    Icon = isPositive ? TrendingUp : TrendingDown;
  }

  return (
    <Card className="md:col-span-2 col-span-4">
      <div className='flex justify-between items-center'>
        <p className='text-sm font-medium text-slate-500'>Total Revenue this Month</p>
        <Info className='cursor-pointer' size={16} />
      </div>
      <p className='text-4xl font-bold text-slate-800'>${((dashboardAnalytics.revenue.data ?? 0) / 100).toLocaleString()}</p>
      <div className={`flex items-center gap-1 ${colorClass} text-sm`}>
        {Icon && <Icon size={14} />}
        <p className='text-xs'>{displayText} vs last month</p>
      </div>
    </Card>
  );
}

const ClientCard = ({ growth, dashboardAnalytics }: {
  growth: {
    clients_growth: number;
    clients_last_month: number;
    clients_this_month: number;
    revenue_growth: number;
    revenue_last_month: number;
    revenue_this_month: number;
  } | null, dashboardAnalytics: {
    revenue: PostgrestSingleResponse<number>;
    bookings: PostgrestSingleResponse<number>;
    newClients: PostgrestSingleResponse<number>;
    returningRate: PostgrestSingleResponse<number>;
  }
}) => {
  const clientsThis = growth?.clients_this_month ?? 0;
  const clientsLast = growth?.clients_last_month ?? 0;
  const percent = growth?.clients_growth;

  let label = "";
  let color = "";
  let Icon = null;

  if (clientsLast === 0 && clientsThis > 0) {
    label = "New";
    color = "text-green-600";
    Icon = TrendingUp;
  } else if (clientsLast === 0 && clientsThis === 0) {
    label = "—";
    color = "text-gray-400";
  } else if (percent !== null && percent !== undefined) {
    const isPositive = percent >= 0;
    label = `${Math.abs(percent).toFixed(1)}%`;
    color = isPositive ? "text-green-600" : "text-red-600";
    Icon = isPositive ? TrendingUp : TrendingDown;
  }
  return (
    <Card className='md:col-span-1 col-span-2'>
      <div className='flex justify-between items-center'>
        <p className='text-sm font-medium'>New Clients this Month</p>
        <Info className='cursor-pointer' size={16} />
      </div>
      <p className='text-3xl font-semibold'>{dashboardAnalytics.newClients.data}</p>
      <div className={`flex items-center gap-1 ${color} text-sm`}>
        {Icon && <Icon size={14} />}
        <p className='text-xs'>{label} vs last month</p>
      </div>
    </Card>
  );
}
