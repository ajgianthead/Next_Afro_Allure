
'use client'
import Navbar from '@components/editor/pre-built/Navbar'
import { Text } from '@components/editor/Text'
import Button from '@mui/joy/Button'
import { Caption, Title } from '@tailus-ui/typography'
import { CircleDollarSign, Clock, ShieldBan } from 'lucide-react'
import React from 'react'


export default function TemplateOne({ data }: any) {
  return (
    <div>
      {/* Navbar */}
      <Navbar />
      {/* Hero Section */}
      <div className='w-full flex justify-center items-center'>
        <div className='flex w-[1280px] py-[150px] px-8'>
          <div className='md:w-1/2 w-full flex flex-col gap-6'>
            <Title className='text-4xl md:text-left text-center'>READY. SET. <span className='text-[#60A5FA]'>BOOK!</span></Title>
            <div className='pr-10'><Text className='md:text-left text-center' fontSize={16} text='Welcome to LadyPlutoLooks. Get ready to book with me
              for something. This is just placeholder text for the hero section
              of the home screen.' /></div>
            <div className='flex md:justify-start justify-center'>
              <Button sx={{ backgroundColor: "#60A5FA" }}>Book Appointment</Button>
            </div>
          </div>
          <div className=' hidden md:flex w-1/2 bg-[#60A5FA]'></div>
        </div>
      </div>
      {/* About Section */}
      <div className='bg-[#D1D5DB] flex flex-col jus'>
        <div className='pt-5 flex justify-center'>
          <Caption>About</Caption>
        </div>
        <div id='about' className='w-full flex justify-center items-center '>
          <div className='flex w-[1280px] py-10 px-8'>
            <div className='w-full flex justify-center'>
              <div className='flex w-full md:flex-row flex-col gap-6'>
                <div className='md:flex md:w-1/2 w-full bg-[#60A5FA] h-96'></div>
                <div className='md:w-1/2 w-full flex flex-col justify-start'>
                  <Text className='md:text-left text-center text-wrap' fontSize={16} text='Lorem ipsum odor amet, consectetuer adipiscing elit. Erat sagittis erat 
                  vehicula habitasse curabitur volutpat cursus morbi.
                  Ridiculus eros turpis nisi blandit feugiat in dictumst neque. 
                  Dapibus neque praesent nisl cras inceptos nostra. Praesent magnis 
                  lacus magna mauris iaculis inceptos orci pellentesque. Cras proin 
                  volutpat platea varius vestibulum vitae ultricies. Odio bibendum urna arcu risus in.' />
                  <Text className="underline mt-5 md:text-left text-center" text="Contact Information ->" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='bg-[#FFFFFF] flex flex-col jus'>
        <div className='pt-5 flex justify-center'>
          <Caption>Terms and Conditions</Caption>
        </div>
        <div>

        </div>
        <div id='terms-and-conditions' className='w-full flex justify-center items-center '>
          <div className='flex w-[1280px] flex-col py-10 px-8'>
            <Text className="text-center" text="Lorem ipsum odor amet, consectetuer adipiscing elit. Erat sagittis erat 
                  vehicula habitasse curabitur volutpat cursus morbi.
                  Ridiculus eros turpis nisi blandit feugiat in dictumst neque. 
                  Dapibus neque praesent nisl cras inceptos nostra. Praesent magnis 
                  lacus magna mauris iaculis inceptos orci pellentesque. Cras proin 
                  volutpat platea varius vestibulum vitae ultricies. Odio bibendum urna arcu risus in."/>
            <div className='w-full flex justify-center'>
              <div className='flex w-full md:flex-row flex-col justify-center gap-6'>
                {/* Deposit */}
                <div className='flex md:w-1/3 w-full justify-center p-10'>
                  <div className='flex flex-col text-center justify-start gap-2'>
                    <div className='flex justify-center'>
                      <CircleDollarSign size={50} color='#60A5FA' />
                    </div>
                    <Text className="text-xl font-medium" text="Deposits" />
                    <p className="text-md text-black">Deposits are
                      <strong> REQUIRED </strong>
                      for booking and are 20% of the final</p>
                  </div>
                </div>
                {/* Late Policy */}
                <div className='flex md:w-1/3 w-full justify-center p-10'>
                  <div className='flex flex-col text-center justify-start gap-2'>
                    <div className='flex justify-center'>
                      <Clock size={50} color='#60A5FA' />
                    </div>
                    <Text className="text-xl font-medium" text="Late Policy" />
                    <Text className="text-md" text="If a client is 10 minutes late they will be charged a $10 late fee" />
                  </div>
                </div>
                {/* No-Show Policy */}
                <div className='flex md:w-1/3 w-full justify-center p-10'>
                  <div className='flex flex-col text-center justify-start gap-2'>
                    <div className='flex justify-center'>
                      <ShieldBan size={50} color='#60A5FA' />
                    </div>
                    <Text className="text-xl font-medium" text="No-Show Policy" />
                    <Text className="text-md" text="If clients don't show up to their scheduled appointment without notifying the stylist/professional with result in a ban from booking and future appointments" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='bg-[#D1D5DB] flex flex-col jus'>
        <div className='pt-5 flex justify-center'>
          <Caption>Services</Caption>
        </div>
        <div id='services' className='w-full flex justify-center items-center '>
          <div className='flex w-[1280px] py-10 px-8'>
            <div className='w-full flex justify-center'>
              <div className='flex w-full md:flex-row flex-col gap-6'>
                <div className='md:flex md:w-1/2 w-full bg-[#60A5FA] h-96'></div>
                <div className='md:w-1/2 w-full flex flex-col justify-start'>
                  <Text className='md:text-left text-center text-wrap' fontSize={16} text='Lorem ipsum odor amet, consectetuer adipiscing elit. Erat sagittis erat 
                  vehicula habitasse curabitur volutpat cursus morbi.
                  Ridiculus eros turpis nisi blandit feugiat in dictumst neque. 
                  Dapibus neque praesent nisl cras inceptos nostra. Praesent magnis 
                  lacus magna mauris iaculis inceptos orci pellentesque. Cras proin 
                  volutpat platea varius vestibulum vitae ultricies. Odio bibendum urna arcu risus in.' />
                  <Text className="underline mt-5 md:text-left text-center" text="Contact Information ->" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
