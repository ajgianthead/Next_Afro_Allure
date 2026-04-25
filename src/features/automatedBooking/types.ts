import { Database } from "../../../lib/database.types"

export interface BookingSessionData {
    id?: string
    businessId: string
    serviceId: string | null
    status: BookingSessionStatus
    clientInfo: {
        firstName: string
        lastName: string
        email: string
        phoneNumber: string
    } | null
    selectDateTime: string | null
    paymentIntentId: string | null
    amountDue: number | null
    currency: string
    metaData: object
    updatedAt: string
    confirmedAt: string | null
    expiresAt: string | null
}

export type BookingSessionStatus = Database['public']['Enums']['booking_session_status']
