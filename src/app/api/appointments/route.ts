import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../lib/database.types";
import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js";
import { data } from "@tailus-ui/visualizations/data";
import { sendBusinessBookingNoti } from "../../../../lib/notifications";
import { Resend } from "resend";
import ConfirmAppointmentTemplate from "../../../../emails/confirm-appointment";
import { reminderTask } from "trigger/reminder";
import { DateTime } from "luxon";
import AppointmentConfirmed from "../../../../emails/appointment-confirmed";
import NewAppointment from "../../../../emails/new-appointment";


const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);


// Edit an appointment
export async function PUT(request: NextRequest) {
    const supabase = createClient<Database>();
    // I dont know man??
    const { id, start, end, status } = await request.json();
    const { data, error } = await supabase.from('appointments').update(
        {
            start: start,
            end: end,
            updated_at: new Date().toISOString(),
            status: status
        }
    ).eq('id', id);
    if (error) {
        throw new Error(error.message)
    }
    return new NextResponse(JSON.stringify({ data: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })

}

// Create an appointment
export async function POST(request: NextRequest) {
    const supabase = createClient<Database>();
    const { business, client_metadata, start, end, service_data, status, require_deposit, policy_id, paid_deposit, deposit_charge_id, reschedules, deposit_price, addons } = await request.json();
    const { data, error } = await supabase.from('appointments').insert([
        {
            business: business,
            client_metadata: client_metadata,
            start: start,
            end: end,
            status: status,
            client: null,
            service_data: service_data,
            policy_id: policy_id,
            require_deposit: require_deposit,
            paid_deposit: paid_deposit,
            deposit_charge_id: deposit_charge_id,
            reschedules: reschedules,
            deposit_price: deposit_price,
            selected_addons: addons
        }
    ]).select("*,business_users(business_name, email)")
    if (data?.length) {
        const res: any = data[0]
        try {
            await resend.emails.send({
                from: 'confirm-appointment <noreply@reminder.afroallure.co>',
                to: res?.client_metadata.email!,
                subject: "Confirm Appointment",
                react: ConfirmAppointmentTemplate({
                    socials: {
                        facebook: "",
                        instagram: "",
                        twitter: ""
                    },
                    clientData: {
                        firstName: res.client_metadata.firstName,
                        lastName: res.client_metadata.lastName,
                    },
                    businessData: {
                        id: res.business,
                        name: res.business_users.business_name,
                        businessAddress: "2800 SW 35th Place, Gainesville, FL"
                    },
                    appointmentData: {
                        id: res.id,
                        start: res.start,
                        end: res.end
                    },
                    serviceName: res.service_data.name
                }),
            });
        } catch (error) {
            return new NextResponse(JSON.stringify({ error: error }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400
            })
        }

    }
    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
    return new NextResponse(JSON.stringify({ data: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
