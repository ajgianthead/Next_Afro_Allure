import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import twilio from 'twilio';
import { Database } from "../../../../lib/database.types";
import mailchimp from '@mailchimp/mailchimp_transactional'


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
    const mctx = mailchimp(process.env.NEXT_PUBLIC_MAILCHIMP_API_KEY!);
    // I dont know man??
    const {business, client_metadata, start, end, service_data, status, require_deposit, policy_id, paid_deposit, deposit_charge_id, reschedules} = await request.json();
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
        reschedules: reschedules
       }
    ]).select();
    if (data?.length) {
        try {
            // Also send email
            const response = await mctx.messages.sendTemplate({
                template_name: 'confirm-appointment',
                template_content: [],
                message: {
                    subject: 'Confirm your appointment',
                    from_email: 'notifications@afroallure.co',
                    from_name: "notifications@afroallure.co",
                    to: [{
                            email: 'abijahnesbitt@afroallure.co',
                            type: 'to'
                            
                        }],
                        "global_merge_vars": [
                            {
                                name: "stylist_name",
                                content: "LadyPlutoLooks" // Insert stylist name
                            },
                            {
                                name: "appointment_date",
                                content: '' // Format Appointment Date
                            },
                            {
                                name: "appointment_time",
                                content: '' // Format Appointment Time
                            },
                            {
                                name: "business_address",
                                content: '' // Insert Business Address
                            },
                            {
                                name: "service_name",
                                content: service_data.name // Format Appointment Date
                            },
                            {
                                name: "appointment_id",
                                content: `${data[0].id}` // Insert stylist name
                            },
                            {
                                name: "business_id",
                                content: `${business}` // Insert stylist name
                            },
                            // http://localhost:3000/appointment/*|APPOINTMENT_ID/business/*|BUSINESS_ID|*/confirm
                            { 
                                name: "facebook_url",
                                content: '' // Format Appointment Date
                            },
                            {
                                name: "instagram_url",
                                content: 'https://www.instagram.com/afroallure_/' // Format Appointment Date
                            },
                            {
                                name: "twitter_url",
                                content: '' // Format Appointment Date
                            },
                        ],
                       
                }
            })
        console.log(response);
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
