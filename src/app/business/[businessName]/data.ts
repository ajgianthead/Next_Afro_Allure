import { createAdminClient } from '@/app/utils/supabase/admin'
import { assignAddons } from "app/api/util/transformServices";

/**
 * Data for the public booking site page. Deliberately NOT a server action
 * (no 'use server'): server actions are public endpoints, and this used to be
 * one that returned every appointment (client names, emails, phones) for any
 * business name. Appointments and availabilities aren't needed to render the
 * page, so they're no longer fetched at all.
 */
export const fetchBusinessData = async (businessName: string) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("business_users")
        .select("business_id, business_name, url_name, brand_color, founding_member, founding_member_number, published_site, services(*), web_editors(*)")
        .eq("url_name", `${businessName}`)
        .single();
    if (error) {
        return error
    }
    return { result: { ...data, services: await assignAddons(supabase, data.services as any) } }
}
