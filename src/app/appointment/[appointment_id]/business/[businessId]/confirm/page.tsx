import { createClient } from "@/app/utils/supabase/server";
import ConfirmAppClient from "./confirmClient";
import { Database } from "../../../../../../../lib/database.types";
import { Appointment } from "@/features/manualBooking/server/models/Appointment";
import { BusinessUser } from "@/lib/businessUser/BusinessUser";

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { appointment_id: string, businessId: string } }) {
    // Get all my data
    const { businessId, appointment_id } = await params
    const supabase = await createClient()
    const business = await BusinessUser.fetch(supabase, businessId)

    let appointment = await Appointment.fetchById(supabase, appointment_id)
    const appointmentObj = Object.assign({}, appointment)

    if (!Array.isArray(appointmentObj)) {
        return <ConfirmAppClient appointment={appointmentObj} business={business} />;

    }
}
