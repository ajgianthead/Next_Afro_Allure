import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import twilio from 'twilio';
import { Database } from "../../../../lib/database.types";

// Edit an appointment
export async function PUT(request: NextRequest) {
    const supabase = createClient<Database>();
    // I dont know man??
    const { id, start, end, status } = await request.json();
    const { data, error } = await supabase.from('appointments').update(
        {
            start: start,
            end: end,
            updated_at: Date.now().toString(),
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
    const accountSid = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID;
    const authToken = process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken)
    // I dont know man??
    const {business, client_metadata, start, end, service, status} = await request.json();
    const { data, error } = await supabase.from('appointments').insert([
       {
        business: business,
        client_metadata: client_metadata,
        start: start,
        end: end,
        status: status,
        service: service,
        client: null
       }
    ]).select();
    if (data?.length) {
        try {
            await client.messages.create({
                from: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER,
                to: "+17547159659",
                body: `Hello from AfroAllure! Click this link to confirm your appointment with $BUSINESS_NAME: http://localhost:3000/appointment/${data[0].id}/confirm`
            })
            // Also send email
        } catch (twil_error) {
            return new NextResponse(JSON.stringify({ twilio_error: twil_error }), {
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
