// Minimal Twilio Messages API client (no SDK, so it bundles cleanly into
// Trigger.dev tasks). Credentials: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
// and TWILIO_FROM_NUMBER (the shared AfroAllure toll-free number).

/** Twilio's error for a recipient who replied STOP. */
export const TWILIO_UNSUBSCRIBED = 21610

export type TwilioResult = { ok: true; sid: string } | { ok: false; code?: number; message: string }

export function twilioConfigured(): boolean {
    return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER)
}

export async function twilioSend(to: string, body: string): Promise<TwilioResult> {
    const sid = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN
    const from = process.env.TWILIO_FROM_NUMBER
    if (!sid || !token || !from) return { ok: false, message: 'Twilio is not configured' }

    try {
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
        })
        const json: any = await res.json().catch(() => ({}))
        if (!res.ok) return { ok: false, code: json?.code, message: json?.message ?? `Twilio returned ${res.status}` }
        return { ok: true, sid: json.sid }
    } catch (err: any) {
        return { ok: false, message: err?.message ?? 'Twilio request failed' }
    }
}
