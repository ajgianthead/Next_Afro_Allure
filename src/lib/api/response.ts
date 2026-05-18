import { NextResponse } from 'next/server'

export function apiResponse<T>(data: T, status = 200) {
    return NextResponse.json(data, { status })
}

export function apiError(message: string, status = 500) {
    return NextResponse.json({ error: message }, { status })
}

/** Use for Stripe webhooks — Stripe only needs a 200 with no body. */
export function webhookAck() {
    return new NextResponse(null, { status: 200 })
}
