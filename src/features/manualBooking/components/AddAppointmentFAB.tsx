'use client'

import { Fab } from '@mui/material';
import { Plus } from 'lucide-react';
import { useManualBooking } from '../hooks/useManualBooking';



export default function AddAppointmentFAB() {
    const { manualBookingData, setManualBookingData } = useManualBooking()
    return (
        <Fab
            data-testid='create-appointment-btn'
            color="error"
            variant="circular"
            size="large"
            onClick={() => {
                setManualBookingData!(
                    {
                        ...manualBookingData!,
                        openCreateAppointment: true
                    }
                )
            }}
            sx={{
                position: 'fixed',
                bottom: { xs: 16, sm: 24 },
                right: { xs: 16, sm: 24 },
                zIndex: 999,
                boxShadow: '0 4px 12px rgba(252, 97, 97, 0.3)',
                '&:hover': {
                    backgroundColor: '#ff7b7b',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(252,97,97,0.35)',
                },
            }}
        >
            <div >
                <Plus className='font-bold' />

            </div>
        </Fab>
    );
}
