'use client'

import { Plus } from 'lucide-react'
import { useManualBooking } from '../hooks/useManualBooking'

export default function AddAppointmentFAB() {
    const { manualBookingData, setManualBookingData } = useManualBooking()
    return (
        <button
            data-testid="create-appointment-btn"
            onClick={() => setManualBookingData!({ ...manualBookingData!, openCreateAppointment: true })}
            className="fixed flex items-center justify-center rounded-full transition-all duration-150 hover:-translate-y-0.5 z-50"
            style={{
                bottom: 24,
                right: 24,
                width: 56,
                height: 56,
                backgroundColor: '#FC6161',
                boxShadow: '0 4px 12px rgba(252, 97, 97, 0.35)',
                color: '#FFFFFF',
            }}
            aria-label="Create appointment"
        >
            <Plus size={22} strokeWidth={2.5} />
        </button>
    )
}
