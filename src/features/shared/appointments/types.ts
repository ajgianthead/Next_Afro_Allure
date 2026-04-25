import { MetadataParam } from "@stripe/stripe-js";

export enum CheckoutType {
    DEPOSIT = 'deposit',
    EOA = 'eoa'
}

export enum AppointmentType {
    MANUAL = 'manual',
    AUTOMATED = 'automated'
}

export interface PaymentIntentMetadata extends MetadataParam {
    checkoutType: CheckoutType,
    appointment_id: string,
    businessId: string,
    tax_calculation: string,
    appointmentType: AppointmentType
}
