'use server'

import { AppointmentData } from "../types"
import { cancelAppointment, confirmAppointment, createNewManualAppointment, rescheduleAppointment } from "./domain"

export const createManualAppointmentAction = async (data: AppointmentData) => {
    return await createNewManualAppointment(data)
}
export const rescheduleAppointmentAction = async (data: {
    start: string
    end: string
    date: Date
    appointmentId: string
}) => {
    return await rescheduleAppointment(data)
}

export const confirmAppointmentAction = async (appointmentId: string, depositChargeId: string) => {
    return await confirmAppointment(appointmentId, depositChargeId)
}

export const cancelAppointmentAction = async (appointmentId: string) => {
    return await cancelAppointment(appointmentId)
}
