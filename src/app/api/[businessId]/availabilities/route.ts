import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";

export async function PUT(request: NextRequest, { params }: { params: { businessId: string } }) {
    const supabase = createClient<Database>();
    const { businessId } = await params
    const { availability, defaultAvailability, id } = await request.json()
    const { data: oldAvailability, error: availabilityError } = await supabase.from('availabilities').select("id, business_users(default_availability)").eq('id', id)
    if (oldAvailability?.length) {
        const { data, error } = await supabase.from("availabilities").update({
            availability_data: availability,
        }).eq("id", id).select("*").single();

        if (defaultAvailability !== oldAvailability[0].business_users?.default_availability) {
            await supabase.from('business_users').update({
                default_availability: defaultAvailability
            })
        }

        if (error) {
            console.log(error, data);
            return new NextResponse(JSON.stringify({ error: error }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            })
        }
        if (data) {
            return new NextResponse(JSON.stringify({ result: data }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200
            })
        }
    } else {
        return new NextResponse(JSON.stringify({ message: "error" }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }


}
// Create new availability
export async function POST(request: NextRequest) {
    const supabase = createClient<Database>();
    const { businessId, availabilityData } = await request.json()
    const { data, error } = await supabase.from('availabilities').insert([{
        availability_data: availabilityData,
        business_id: businessId,
        id: availabilityData.id
    }]).select().single()

    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    return new NextResponse(JSON.stringify({ result: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
// Get availabilities
export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
    const supabase = createClient<Database>();
    const { businessId } = await params;
    const { data, error } = await supabase.from('availabilities').select('business_users(default_availability), *').eq("business_id", businessId);

    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    if (data) {
        return new NextResponse(JSON.stringify({ result: { availabilities: data, defaultAvailability: data[0].business_users?.default_availability } }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({ result: "No availabilities to update" }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
    })

}

