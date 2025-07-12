import { Button } from '@mui/joy'
import React from 'react'
import BookingSiteClient from './bookingSiteClient'
import { fetchBusinessUser, fetchUser } from '../actions';


export const metadata = {
    title: 'Booking Site | AfroAllure',
};

export default async function Page() {
    const user = await fetchUser()
    const business = await fetchBusinessUser(user!.id)
    return (
        <div>
            <BookingSiteClient businessId={business?.business_id!} />
        </div>
    )
}


