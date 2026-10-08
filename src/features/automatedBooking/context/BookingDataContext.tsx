'use client'

import { createClient } from "@/app/utils/supabase/client";
import { UserAuthContext } from "@/app/utils/types/user";
import { createContext, useContext, useEffect, useState } from "react";
import { Database, Json } from "../../../../lib/database.types";
import { PublicBusinessType } from "@/lib/businessUser/BusinessUser";
import type { BusyInterval } from "@/features/shared/appointments/busyIntervals";
import type { StyleSelection } from "@/features/services/pricing";
import { AvailabilityType } from "@/features/availability/server/models/Availability";
import { ServiceType } from "@/lib/service/Service";
import { BusinessPolicyType } from "@/lib/businessPolicy/BusinessPolicy";
import { BookingSessionData } from "../types";

export const BookingDataContext = createContext<any>(false);

type Props = {
    businessData: PublicBusinessType,
    availabilities: AvailabilityType[],
    children: any,
    appointments: BusyInterval[],
    services: ServiceType[],
    policy: BusinessPolicyType
    waitlistEnabled?: boolean
    smsEnabled?: boolean
}
export type BookingData = {
    business_id: string;
    /** Clients can join the cancellation waitlist. */
    waitlist_enabled?: boolean;
    /** Clients can opt in to appointment texts. */
    sms_enabled?: boolean;
    availabilities: AvailabilityType[];
    booking_policy: BusinessPolicyType
    /** Busy times only (start/end) — never full appointment records. */
    appointments?: BusyInterval[];
    services: ServiceType[];
    stripe_id: string;
    selectedService: string;
    selectedAddons: string[];
    /** Size / length / hair for services with style options. */
    styleSelection: StyleSelection | null;
    /** Client confirmed the service's prep instructions. */
    acknowledged: boolean;
    selectedDateTime: {
        start?: string,
        end?: string
    },
    clientInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        /** Agreed to appointment texts (only used by businesses with the SMS add-on). */
        smsConsent: boolean;
    }
    options: {
        clientSecret: any,
        onComplete?: any
    }
    bookingSession: BookingSessionData | null
}

export function BookingWrapper({ children, businessData, availabilities, appointments, services, policy, waitlistEnabled, smsEnabled }: Props) {
    let [data, setData] = useState<BookingData>({
        business_id: businessData.id,
        waitlist_enabled: !!waitlistEnabled,
        sms_enabled: !!smsEnabled,
        availabilities: availabilities,
        appointments: appointments,
        services: services,
        booking_policy: policy,
        stripe_id: businessData.stripeAccountId,
        options: {
            clientSecret: ""
        },
        selectedAddons: [],
        clientInfo: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            smsConsent: false
        },
        selectedService: "",
        styleSelection: null,
        acknowledged: false,
        selectedDateTime: {},
        bookingSession: null
    });
    return (
        <BookingDataContext.Provider value={{ data, setData }}>
            {children}
        </BookingDataContext.Provider>
    )
}


