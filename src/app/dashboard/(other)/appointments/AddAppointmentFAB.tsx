'use client'

import { Fab } from '@mui/material';
import { Plus } from 'lucide-react';



export default function AddAppointmentFAB() {
    return (
        <Fab
            color="error"
            variant="circular"
            size="large"
            onClick={() => { }}
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
