import { AddOn } from "@/app/utils/types/service";
import { Database } from "../../../lib/database.types";
import { BusinessPolicyType } from "@/lib/businessPolicy/BusinessPolicy";
import { ServiceType } from "@/lib/service/Service";
import type { StyleSelection } from "@/features/services/pricing";

export interface AppointmentData {
    start: string,
    end: string,
    date: Date,
    serviceId: string,
    clientData: {
        firstName: string,
        lastName: string,
        email: string,
        phoneNumber: string
    }
    deposit: boolean
    selectedAddons: Set<string>
}

/** What the create-appointment modal sends to the server. Times are ISO instants computed in the browser. */
export interface CreateAppointmentPayload {
    startISO: string
    endISO: string
    serviceId: string
    clientData: {
        firstName: string
        lastName: string
        email: string
        phoneNumber: string
    }
    deposit: boolean
    selectedAddons: string[]
    timezone?: string
    /** Size / length / hair for services with style options. */
    styleSelection?: StyleSelection | null
}

export interface WrapperProps {
    appointmentEvents: AppointmentEvent[]
    services: ServiceType[]
    policy: BusinessPolicyType,
    children: any
}

export interface ManualBookingData {
    appointmentEvents: AppointmentEvent[]
    newAppointmentEvent: AppointmentEvent | null
    newAppointmentData: AppointmentData
    services: ServiceType[]
    policy: BusinessPolicyType
    error: {
        hasError: boolean
        message: string
    }
    openCreateAppointment: boolean
    creatingAppointment: boolean
    openRescheduleConfirmation: boolean
    currSelectedEvent: AppointmentEvent | null
}

export interface AppointmentEvent {
    id: string;
    start: Date;
    title: string;
    end: Date;
    clientData: {
        firstName: string
        lastName: string
        email: string
        phoneNumber: string
    };
    serviceData: {
        id: string;
        name: string;
        business: string;
        description: string;
        length: number;
        price: number;
        photo_url: string;
        imagePath: string;
        addons: AddOn[];
        categories: string[];
        availability: string;
    };
    status?: Database['public']['Enums']['status'];
    requiresDeposit: boolean
    paidDeposit: boolean
    depositPrice: number
    amountDue: number
    paidAmount: number
    servicePaid: boolean
    servicePaidType: Database['public']['Enums']['paid_type'] | null
    selectedAddons: { id: string; name: string; price: number }[]
    refundStatus: Database['public']['Enums']['refund_status']
    refundedAmount: number
    /** A deposit or balance was paid through Stripe, so it can be refunded in-app. */
    hasOnlinePayment: boolean
}

export interface AppointmentTableData {
    id: string
    serviceName: string
    date: Date
    startTime: string
    status: string
    client: string
    requiresDeposit: boolean
    depositPrice: number
    paidDeposit: boolean
    amountDue: number
}
