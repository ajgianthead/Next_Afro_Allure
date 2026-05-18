import { createContext, Dispatch, SetStateAction, useState } from "react";
import { ManualBookingData, WrapperProps } from "../types";


export const ManualBookingContext = createContext<{
    manualBookingData: ManualBookingData | null,
    setManualBookingData: Dispatch<SetStateAction<ManualBookingData>> | null
}>({
    manualBookingData: null,
    setManualBookingData: null
})

export const ManualBookingWrapper = ({ appointmentEvents, services, policy, children }: WrapperProps) => {
    const [manualBookingData, setManualBookingData] = useState<ManualBookingData>({
        appointmentEvents: appointmentEvents,
        newAppointmentEvent: null,
        newAppointmentData: {
            start: "",
            end: "",
            date: new Date(),
            serviceId: '',
            clientData: {
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: ""
            },
            selectedAddons: new Set(),
            deposit: policy.deposit.enabled
        },
        services: services,
        policy: policy,
        error: {
            hasError: false,
            message: "",
        },
        openCreateAppointment: false,
        creatingAppointment: false,
        openRescheduleConfirmation: false,
        currSelectedEvent: null
    })
    return (
        <ManualBookingContext.Provider value={{ manualBookingData, setManualBookingData }}>
            {children}
        </ManualBookingContext.Provider>
    )
}
