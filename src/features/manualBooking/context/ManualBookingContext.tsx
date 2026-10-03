import { createContext, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
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
    // Server data changes (router.refresh after an action, a client confirming
    // from their email) arrive as new props — sync them into context so the
    // views update without a full page reload.
    const firstRender = useRef(true)
    useEffect(() => {
        if (firstRender.current) { firstRender.current = false; return }
        setManualBookingData(prev => ({ ...prev, appointmentEvents, services, policy }))
    }, [appointmentEvents, services, policy])

    return (
        <ManualBookingContext.Provider value={{ manualBookingData, setManualBookingData }}>
            {children}
        </ManualBookingContext.Provider>
    )
}
