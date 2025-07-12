'use server'

import { stripe } from "@lib/utils";
import { createClient } from "@utils/supabase/server";
import { Database } from "../../../../../lib/database.types";

export const checkCompletedOnboarding = async (businessId: string) => {
    const supabase = createClient<Database>();
    const isOnboarded = (await supabase.from('business_users').select("completed_stripe_onboarding").eq('business_id', businessId).single()).data?.completed_stripe_onboarding!
    return isOnboarded
}
