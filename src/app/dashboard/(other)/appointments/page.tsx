
import { createClient } from "@/app/utils/supabase/server";
import { Database } from "../../../../../lib/database.types";
import { fetchBusinessUser, fetchUser } from "../actions";
import { assignAddons } from "./actions";
import { BusinessUser } from "@/lib/businessUser/BusinessUser";
import { DateTime } from "luxon";
import { AppointmentsTable } from "../../../../features/manualBooking/components/AppointmentsTable";
import { AppointmentEvent, AppointmentTableData } from "@/features/manualBooking/types";
import { ToggleAppointmentView } from "@/features/manualBooking/components";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const user = await fetchUser()
    const supabase = await createClient()
    const business = (await BusinessUser.fetchWithUserId(supabase, user?.id!))
    const services = await business.getServices(supabase)
    const appointments = (await business.getAppointments(supabase))
    const policy = (await business.getPolicy(supabase)).toClient()

    let events: AppointmentEvent[] = []
    let tableFormattedData: AppointmentTableData[] = []
    if (Array.isArray(appointments)) {
        events = appointments.map((appointment) => {
            return {
                id: appointment.id,
                status: appointment.status,
                title: `${appointment.serviceData.name} with ${appointment.clientMetadata.firstName}`,
                clientData: {
                    firstName: appointment.clientMetadata.firstName,
                    lastName: appointment.clientMetadata.lastName,
                    email: appointment.clientMetadata.email,
                    phoneNumber: appointment.clientMetadata.phoneNumber
                },
                serviceData: { ...appointment.serviceData.toClient() },
                time: DateTime.fromISO(appointment.start).toFormat('t'),
                start: new Date(appointment.start),
                end: new Date(appointment.end),
                requiresDeposit: appointment.requireDeposit,
                amountDue: appointment.amountDue,
                paidDeposit: appointment.paidDeposit,
                depositPrice: appointment.depositPrice
            }
        })
        tableFormattedData = appointments.map((appointment) => {
            return {
                id: appointment.id,
                serviceName: appointment.serviceData.name,
                date: new Date(appointment.start),
                startTime: DateTime.fromJSDate(new Date(appointment.start)).toFormat('t'),
                status: appointment.status.split('_').join(' '),
                client: `${appointment.clientMetadata.firstName} ${appointment.clientMetadata.lastName}`,
                requiresDeposit: appointment.requireDeposit,
                depositPrice: appointment.depositPrice,
                paidDeposit: appointment.paidDeposit,
                amountDue: appointment.amountDue,
            }
        })
    }
    let serviceClient

    if (Array.isArray(services)) {
        serviceClient = services.map((service) => {
            return service.toClient()
        })
    }
    serviceClient = await assignAddons(supabase, serviceClient as any)
    console.log(serviceClient);

    return <ToggleAppointmentView events={events} policy={policy} services={serviceClient!} data={tableFormattedData} />
}
