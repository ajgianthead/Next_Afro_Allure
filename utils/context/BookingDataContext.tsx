'use client'

import { createClient } from "@utils/supabase/client";
import { UserAuthContext } from "@utils/types/user";
import { createContext, useContext, useEffect, useState } from "react";
import { Database, Json } from "../../lib/database.types";

const BookingDataContext = createContext<any>(false);
const supabase = createClient<Database>()
export type BookingData = {
    business_id: string;
    availabilities: Json | null;
    booking_policy: any
    appointments?: Json[];
    services: Json[];
    stripe_id: string;
    selectedService: string,
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
}

export function BookingWrapper({ children, businessName }: any) {
    let [data, setData] = useState<BookingData>({
        business_id: "",
        availabilities: {},
        services: [],
        booking_policy: null,
        stripe_id: "",
        options: {
            clientSecret: ""
        },
        clientInfo: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: ""
        },
        selectedService: "",
        selectedDateTime: {},
    });
    useEffect(() => {
        const fetchBusiness = async () => {
            const res = await fetch(`http://localhost:3000/api/businessUsers/${businessName}`, {
                method: "GET"
            })
            const businessData = await res.json();
            let availability = []
            if (businessData.result != "Business doesn't exist") {
                availability = businessData.result.availabilities.filter((element: any) => element.id === "4fe7f32b-246e-4214-bccf-8fd898317363")
            }
            return {
                business_id: businessData.result.business_id,
                availabilities: availability[0],
                booking_policies: businessData.result.booking_policies,
                stripe_id: businessData.result.stripe_acc_id
            }
        }
        // Get policy
        const getPolicy = async (businessData: any) => {
            const response = await fetch(`http://localhost:3000/api/policies/policy/${businessData.booking_policies}`, {
                method: "GET",
            });
            if (!response.ok) {
                // Handle errors on the client side here
                const { error } = await response.json();
                throw new Error("An error occurred: ", error);
            } else {
                const result = await response.json();
                return result.policy
            }
        }
        // Get services
        const getServices = async (businessID: string) => {
            const res = await fetch(`http://localhost:3000/api/${businessID}/services`, {
                method: "GET",
            })
            const services = await res.json();
            return services.result
        }

        fetchBusiness().then(async (res: any) => {
            if (res !== "Business doesn't exist") {
                await getPolicy(res).then(async (policy: any) => {
                    await getServices(res.business_id).then(async (services: any) => {
                        // Get appointments
                        const result = await fetch(`http://localhost:3000/api/${res.business_id}/appointments`, {
                            method: "GET"
                        })
                        const appointments = await result.json();
                        setData({
                            ...data,
                            business_id: res.business_id,
                            services: services,
                            availabilities: res.availabilities,
                            stripe_id: res.stripe_id,
                            appointments: appointments.appointments,
                            booking_policy: policy
                        })
                    })
                })

            } else {
                // Return something like 404 business
                console.log("error");
            }

        })

    }, [])
    return (
        <BookingDataContext.Provider value={{ data, setData }}>
            {children}
        </BookingDataContext.Provider>
    )
}

export function useBooking() {
    return useContext(BookingDataContext)
}
