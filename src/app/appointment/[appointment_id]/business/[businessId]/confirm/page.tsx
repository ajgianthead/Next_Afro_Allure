import { createAdminClient } from '@/app/utils/supabase/admin'
import ConfirmAppClient from "./confirmClient";
import { Database } from "../../../../../../../lib/database.types";
import { Appointment } from "@/features/manualBooking/server/models/Appointment";
import { BusinessUser } from "@/lib/businessUser/BusinessUser";

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { appointment_id: string, businessId: string } }) {
    // Get all my data
    const { businessId, appointment_id } = await params
    const supabase = createAdminClient()
    const business = await BusinessUser.fetch(supabase, businessId)

    let appointment = await Appointment.fetchById(supabase, appointment_id) as Appointment
    const appointmentObj = Object.assign({}, appointment)

    if (!Array.isArray(appointmentObj)) {
        return <ConfirmAppClient appointment={appointment.toClient()} business={business.toClient()} />;

    }

}
