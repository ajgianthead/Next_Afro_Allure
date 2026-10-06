import { configure, schedules } from "@trigger.dev/sdk";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

configure({
  secretKey: process.env.TRIGGER_API_KEY,
});

// Daily at 13:00 UTC: businesses whose free early access has run out and who
// haven't subscribed move to the Starter plan. A business that subscribed or
// redeemed a code no longer has subscription_status = 'complimentary' (the
// subscription webhook overwrites it), so it is never touched here.
export const endComplimentaryAccess = schedules.task({
  id: "end-complimentary-access",
  cron: "0 13 * * *",
  run: async () => {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ROLE_SECRET_KEY!
    );
    const { data, error } = await supabase
      .from("business_users")
      .update({ plan_type: "STARTER", subscription_status: "complimentary_ended" })
      .eq("subscription_status", "complimentary")
      .lt("complimentary_until", new Date().toISOString())
      .select("business_id");
    if (error) throw error;
    console.log(`Ended complimentary access for ${data?.length ?? 0} businesses`);
    return { ended: data?.length ?? 0 };
  },
});
