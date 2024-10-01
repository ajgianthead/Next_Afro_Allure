import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(request: NextRequest) {
    const accountSid = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID;
    const authToken = process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken)
    try {
        let result = await client.messages.create({
            from: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER,
            to: "+17547159659",
            body: "This is a test from Abijah"
        })
        return new NextResponse(JSON.stringify({ message: "SMS message sent successfully", result: result }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
}
