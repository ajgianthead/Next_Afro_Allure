'use client'

import React from 'react'
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';

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
        <div>

        </div>
      </main>
    </div>
  )
}
