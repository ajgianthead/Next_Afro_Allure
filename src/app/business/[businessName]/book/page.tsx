import { PostgrestError } from "@supabase/supabase-js";

import { BusinessUser } from "@/lib/businessUser/BusinessUser";
import { createAdminClient } from '@/app/utils/supabase/admin'
import { BusinessPolicy, BusinessPolicyType } from "@/lib/businessPolicy/BusinessPolicy";
import { Availability, AvailabilityType } from "@/features/availability/server/models/Availability";
import { getBusyIntervals } from "@/features/shared/appointments/busyIntervals";
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
    const supabase = createAdminClient();

    const business = await BusinessUser.fetchByURLName(supabase, businessName)
    // Everything passed to <BookClient> is embedded in the page HTML, so only
    // send public fields. This used to include every appointment (client
    // names, emails, phones, payments) and the business's private settings.
    const clientBusinessData = business.toPublicBooking()

    const availabilities = (await Availability.fetch(supabase, business.id)) as Availability[]
    let availabilitiesClient: AvailabilityType[] = []
    availabilities.forEach((availability) => {
        availabilitiesClient.push(availability.toClient())
    })

    const busyIntervals = await getBusyIntervals(supabase, business.id)

    const services = (await Service.fetch(supabase, business.id)) as Service[]
    let serviceClient: ServiceType[] = []
    services.forEach((service) => {
        serviceClient.push({ ...service.toClient(), photo_url: service.photo_url.length ? `${service.photo_url}?t=${Date.now()}` : "" })
    })
    serviceClient = await assignAddons(supabase, serviceClient as any) as ServiceType[]

    const policy = (await BusinessPolicy.fetch(supabase, business.id)).toClient()

    const permissions = getBusinessPermissions(business.planType as 'STARTER' | 'GROWTH')
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

    const { data: waitlistRow } = await supabase
        .from('business_users')
        .select('waitlist_enabled')
        .eq('business_id', business.id)
        .maybeSingle()
    const waitlistEnabled = waitlistRow?.waitlist_enabled ?? false

    // Validate ?service= against this business's already-fetched services.
    // serviceClient is already scoped to this business, so a match is sufficient validation.
    const preSelectedServiceId = serviceParam
        ? (serviceClient.find(s => s.id === serviceParam)?.id)
        : undefined

    return <BookClient services={serviceClient} policy={policy} appointments={busyIntervals} businessData={clientBusinessData} availabilities={availabilitiesClient} bookingLimitReached={bookingLimitReached} themeData={themeData} preSelectedServiceId={preSelectedServiceId} waitlistEnabled={waitlistEnabled} />;

}
