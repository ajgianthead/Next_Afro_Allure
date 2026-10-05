import { createAdminClient } from '@/app/utils/supabase/admin'
import { clientPrepFor, serviceLabel } from '@/features/services/pricing'

/**
 * Style options and prep for an appointment's emails: the service name is
 * extended with the chosen options ("Knotless braids — Small · Waist"), and
 * client emails get the prep checklist. Server-only; never throws (emails
 * still send with the plain service name if the lookup fails).
 */
export async function getAppointmentEmailDetails(appointmentId: string, fallbackServiceName: string) {
    try {
        const { data } = await createAdminClient()
            .from('appointments')
            .select('selected_options, service_data')
            .eq('id', appointmentId)
            .maybeSingle()
        return {
            serviceName: serviceLabel(fallbackServiceName, data?.selected_options),
            prep: clientPrepFor(data?.service_data, data?.selected_options),
        }
    } catch {
        return { serviceName: fallbackServiceName, prep: null }
    }
}
