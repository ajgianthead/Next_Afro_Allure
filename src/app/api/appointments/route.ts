import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../lib/database.types";
import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js";
import { data } from "@tailus-ui/visualizations/data";

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
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
        username: "api",
        key: process.env.NEXT_PUBLIC_EMAIL_SENDING_API_KEY || "API_KEY",
      });
    const {business, client_metadata, start, end, service_data, status, require_deposit, policy_id, paid_deposit, deposit_charge_id, reschedules, deposit_price, addons} = await request.json();
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
    ]).select();
    if (data?.length) {
        try {
            const res = await mg.messages.create("sandboxe74723706fb54da7853bdbd32f560d50.mailgun.org", {
                from: "Mailgun Sandbox <postmaster@sandboxe74723706fb54da7853bdbd32f560d50.mailgun.org>",
                to: ["Abijah Keith Nesbitt <abijah.nez@gmail.com>"],
                subject: "Booking Confirmation",
                text: `Thank you for booking your appointment. Confirm your appointment by clicking this link: http://localhost:3000/appointment/${data[0].id}/business/${business}/confirm`,
              });
          
              console.log(data);
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
