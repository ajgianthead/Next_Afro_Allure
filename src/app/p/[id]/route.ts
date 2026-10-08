import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/utils/supabase/admin";

// Short pay link for texts (/p/<appointment id>): the full payment URL holds
// two ids and would push a text past one 160-character segment. It reveals
// nothing beyond the payment page the full link already opens.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const home = new URL('/', request.url)
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.redirect(home)

    const { data: appt } = await createAdminClient()
        .from('appointments')
        .select('id, business')
        .eq('id', id)
        .maybeSingle()
    if (!appt) return NextResponse.redirect(home)

    return NextResponse.redirect(new URL(`/appointment/${appt.id}/business/${appt.business}/eoa-payment`, request.url))
}
