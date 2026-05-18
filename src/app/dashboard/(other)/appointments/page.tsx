
import { createClient } from "@/app/utils/supabase/server";
import { Database } from "../../../../../lib/database.types";
import { fetchBusinessUser, fetchUser } from "../actions";
import { assignAddons } from "./actions";
import { BusinessUser } from "@/lib/businessUser/BusinessUser";
import { DateTime } from "luxon";
import { AppointmentsTable } from "../../../../features/manualBooking/components/AppointmentsTable";
import { AppointmentEvent, AppointmentTableData } from "@/features/manualBooking/types";
import { AppointmentsClient } from "@/features/manualBooking/components";
import { getBusinessPermissions } from "@/lib/permissions";

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
                depositPrice: appointment.depositPrice,
                paidAmount: appointment.paidAmount,
                servicePaid: appointment.servicePaid,
                servicePaidType: appointment.servicePaidType,
                selectedAddons: (appointment.selectedAddons ?? []).map((a: any) => ({
                    id: a.id, name: a.name, price: a.price
                })),
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

    const [planRes, monthlyCountRes] = await Promise.all([
        supabase.from('business_users').select('plan_type, had_trial, stripe_customer_id').eq('business_id', business.id).single(),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('business', business.id).neq('status', 'CANCELLED').gte('created_at', DateTime.now().startOf('month').toISO()),
    ])
    const planType = (planRes.data?.plan_type ?? 'STARTER') as 'STARTER' | 'GROWTH'
    const monthlyBookingCount = monthlyCountRes.count ?? 0
    const hadTrial = planRes.data?.had_trial ?? false
    const stripeCustomerId = planRes.data?.stripe_customer_id ?? null

    return <AppointmentsClient
        events={events}
        policy={policy}
        services={serviceClient!}
        data={tableFormattedData}
        planType={planType}
        monthlyBookingCount={monthlyBookingCount}
        hadTrial={hadTrial}
        stripeCustomerId={stripeCustomerId}
        businessId={business.id}
    />
}
