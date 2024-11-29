import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";

// Create a service
export async function POST(request: NextRequest) {
    const supabase = createClient<Database>();
    const {
        name,
            description,
            price,
            length,
            addons ,
            imagePath,
            photo_url,
            business,
            categories
    } = await request.json();
    let { data, error } = await supabase.from('services').insert([
        {
            name: name,
            description: description,
            price: price,
            length: length,
            addons: addons,
            imagePath: imagePath,
            photo_url: photo_url,
            business: business,
            categories: categories
        }
    ]).select().single();
    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    return new NextResponse(JSON.stringify({ data: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
// Update a service
export async function PUT(request: NextRequest) {
    const supabase = createClient<Database>();
    const { id, name, price, description, addons, length, photo_url, business, category } = await request.json();
    let { data, error } = await supabase.from('services').update([
        {
            name: name,
            price: price,
            description: description,
            addons: addons,
            length: length,
            photo_url: photo_url,
            categories: category,
        }
    ]).eq('business', business).eq('id', id).select();
    if (error) {
        throw new Error(error.message)
    }
    return new NextResponse(JSON.stringify({ updatedData: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
// Get all services
export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
    const supabase = createClient<Database>();
    const { businessId } = params;
    let { data, error } = await supabase.from("services").select("*").eq("business", businessId)
    if (error) {
        return new NextResponse(JSON.stringify({ result: error, message: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    if (data?.length) {
        return new NextResponse(JSON.stringify({ result: data, message: "Services found" }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({ result: data, message: "No services found" }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })

}
