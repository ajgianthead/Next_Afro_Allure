'use client'

import Card from '@tailus-ui/Card';
import { Caption, Link, Text, Title } from '@tailus-ui/typography';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { data } from '@tailus-ui/visualizations/data';
import ScrollArea from "@components/ScrollArea"
import { useEffect, useState } from 'react';
import { useUserContext } from '@utils/context/UserContext';
import { DateTime } from 'luxon';
import { Button, DialogContent, DialogTitle, Divider, Modal, ModalClose, ModalDialog, Typography } from '@mui/joy';
import QRCode from "react-qr-code";
import { sendPaymentLink } from 'app/dashboard/(other)/actions';


export const StackedCards = ({ appointments, businessData }: { appointments: Appointment[], businessData: Business }) => {
  return (
    <Card variant="outlined" className="w-full lg:w-[calc(100vw-20rem)] border-none">
      <Title as="h2" size="lg" weight="medium" className="mb-1">
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
  );
};

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
