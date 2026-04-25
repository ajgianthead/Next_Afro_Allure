'use client'

import { createClient } from "@/app/utils/supabase/client";
import { UserAuthContext } from "@/app/utils/types/user";
import { createContext, useContext, useEffect, useState } from "react";
import { Database, Json } from "../../../../lib/database.types";
import { BusinessType } from "@/lib/businessUser/BusinessUser";
import { AvailabilityType } from "@/features/availability/server/models/Availability";
import { AppointmentType } from "@/features/manualBooking/server/models/Appointment";
import { ServiceType } from "@/lib/service/Service";
import { BusinessPolicyType } from "@/lib/businessPolicy/BusinessPolicy";
import { BookingSessionData } from "../types";

export const BookingDataContext = createContext<any>(false);

type Props = {
    businessData: BusinessType,
    availabilities: AvailabilityType[],
    children: any,
    appointments: AppointmentType[],
    services: ServiceType[],
    policy: BusinessPolicyType
}
export type BookingData = {
    business_id: string;
    availabilities: AvailabilityType[];
    booking_policy: BusinessPolicyType
    appointments?: AppointmentType[];
    services: ServiceType[];
    stripe_id: string;
    selectedService: string;
    selectedAddons: string[];
    selectedDateTime: {
        start?: string,
        end?: string
    },
    clientInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    }
    options: {
        clientSecret: any,
        onComplete?: any
    }
    bookingSession: BookingSessionData | null
}

export function BookingWrapper({ children, businessData, availabilities, appointments, services, policy }: Props) {
    let [data, setData] = useState<BookingData>({
        business_id: businessData.id,
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
            phoneNumber: ""
        },
        selectedService: "",
        selectedDateTime: {},
        bookingSession: null
    });
    return (
        <BookingDataContext.Provider value={{ data, setData }}>
            {children}
        </BookingDataContext.Provider>
    )
}


