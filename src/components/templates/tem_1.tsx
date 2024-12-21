'use client'

import React from 'react'
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import { Caption, Text, Title } from '@tailus-ui/typography';

export default function TemplateOne({ data }: any) {
  return (
    <div>
      {/* Navbar */}
      <nav className='p-8 flex justify-center'>
        <div className='flex w-[1280px] justify-between'>
          <div>LOGO</div>
          <div className='flex gap-24 items-center'>
            <Typography level='body-sm'>About</Typography>
            <Typography level='body-sm'>Policies</Typography>
            <Typography level='body-sm'>Services</Typography>
            <Typography level='body-sm'>Contact</Typography>
            <div className='flex gap-2 items-center'>
              <Button variant='outlined'>Login</Button>
              <Button variant='solid'>Sign up</Button>
            </div>
          </div>
        </div>
      </nav>
      <main>
        {/* Hero Section/Call to Action */}
        <div className='w-full  flex justify-center'>
          <div className='w-[1280px] h-[400px] flex items-center justify-center'>
            <div className='flex flex-col gap-2 w-full justify-center items-center'>
              <Title className='text-6xl flex'>READY. SET.<span><Title className='text-6xl text-pink-500'>BOOK!</Title></span></Title>
              <Text>This is a description of this business to convince to book.</Text>
              <div className='flex gap-2'>
                <Button>Book Appointment</Button>
              </div>
            </div>

          </div>
        </div>
        {/* About the Business */}
        <div className='w-full py-5 flex justify-center bg-slate-400'>
          <div className='w-[1280px] flex flex-col items-center'>
            <Caption className='pb-5 text-white font-medium'>About the Business</Caption>
            <div className='flex gap-72'>
              <div className='w-1/2'>
                <div className='w-96 h-96 bg-gray-600'>

                </div>
              </div>
              <div className='w-1/2'>
                <Text>Hello my name is Abijah. I'm the CEO of HAIRSTYLIST.</Text>
              </div>
            </div>
          </div>
        </div>
        {/* Terms and Conditions/Policies */}
        <div className='w-full py-5 flex justify-center'>
          <div className='w-[1280px] flex flex-col items-center'>
            <Caption className='pb-5'>Terms and Conditions</Caption>
            <div className='flex gap-72'>
              <div className='w-1/2'>
                <div className='w-96 h-96 bg-gray-600'>

                </div>
              </div>
              <div className='w-1/2'>
                <Text>Hello my name is Abijah. I'm the CEO of HAIRSTYLIST.</Text>
              </div>
            </div>
          </div>
        </div>
        {/* Services */}
        <div className='w-full py-5 flex justify-center'>
          <div className='w-[1280px] flex flex-col items-center'>
            <Caption className='pb-5'>Services</Caption>
            <div className='flex gap-72'>
              <div className='w-1/2'>
                <div className='w-96 h-96 bg-gray-600'>

                </div>
              </div>
              <div className='w-1/2'>
                <Text>Hello my name is Abijah. I'm the CEO of HAIRSTYLIST.</Text>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
