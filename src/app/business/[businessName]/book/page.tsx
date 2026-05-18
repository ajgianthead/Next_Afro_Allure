import { PostgrestError } from "@supabase/supabase-js";
import { fetchBusinessData, fetchBusinessPolicies } from "../actions";
import { BusinessUser } from "@/lib/businessUser/BusinessUser";
import { createClient } from "@/app/utils/supabase/server";
import { BusinessPolicy, BusinessPolicyType } from "@/lib/businessPolicy/BusinessPolicy";
import { Availability, AvailabilityType } from "@/features/availability/server/models/Availability";
import { Appointment, AppointmentType } from "@/features/manualBooking/server/models/Appointment";
import { Service, ServiceType } from "@/lib/service/Service";
import { BookClient } from "@/features/automatedBooking/components";
import { assignAddons } from "@/app/dashboard/(other)/appointments/actions";
import { getBusinessPermissions } from "@/lib/permissions";
import { DateTime } from "luxon";
import type { BookingTheme } from "@/features/automatedBooking/types/theme";

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Schedule Appointment',
};

export default async function Page({ params, searchParams }: {
    params: { businessName: string }
    searchParams: Promise<{ service?: string }>
}) {

    const { businessName } = await params
    const { service: serviceParam } = await searchParams
    const supabase = await createClient();

    const business = await BusinessUser.fetchByURLName(supabase, businessName)
    const clientBusinessData = business.toClient()

    const availabilities = (await Availability.fetch(supabase, business.id)) as Availability[]
    let availabilitiesClient: AvailabilityType[] = []
    availabilities.forEach((availability) => {
        availabilitiesClient.push(availability.toClient())
    })

    const appointments = (await Appointment.fetch(supabase, business.id)) as Appointment[]
    let appointmentsClient: AppointmentType[] = []
    appointments.forEach((appointment) => {
        appointmentsClient.push(appointment.toClient())
    })

    const services = (await Service.fetch(supabase, business.id)) as Service[]
    let serviceClient: ServiceType[] = []
    services.forEach((service) => {
        serviceClient.push({ ...service.toClient(), photo_url: service.photo_url.length ? `${service.photo_url}?t=${Date.now()}` : "" })
    })
    serviceClient = await assignAddons(supabase, serviceClient as any) as ServiceType[]

    const policy = (await BusinessPolicy.fetch(supabase, business.id)).toClient()

    const permissions = getBusinessPermissions(clientBusinessData.planType as 'STARTER' | 'GROWTH')
    let bookingLimitReached = false
    if (permissions.maxMonthlyBookings !== Infinity) {
        const { count } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('business', business.id)
            .neq('status', 'CANCELLED')
            .gte('created_at', DateTime.now().startOf('month').toISO())
        bookingLimitReached = (count ?? 0) >= permissions.maxMonthlyBookings
    }

    const { data: webEditorRow } = await supabase
        .from('web_editors')
        .select('theme_data')
        .eq('business_id', business.id)
        .single()
    const themeData = (webEditorRow?.theme_data ?? null) as BookingTheme | null

    // Validate ?service= against this business's already-fetched services.
    // serviceClient is already scoped to this business, so a match is sufficient validation.
    const preSelectedServiceId = serviceParam
        ? (serviceClient.find(s => s.id === serviceParam)?.id)
        : undefined

    return <BookClient services={serviceClient} policy={policy} appointments={appointmentsClient} businessData={clientBusinessData} availabilities={availabilitiesClient} bookingLimitReached={bookingLimitReached} themeData={themeData} preSelectedServiceId={preSelectedServiceId} />;

}
