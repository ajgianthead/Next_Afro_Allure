import { configure, schedules } from "@trigger.dev/sdk";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { runRebookReminders } from "../features/rebooking/server/run";

configure({
  secretKey: process.env.NEXT_PUBLIC_TRIGGER_API_KEY,
});

// Daily at 14:00 UTC (morning across US timezones): email clients whose
// maintenance cycle is up and who haven't rebooked.
export const rebookReminders = schedules.task({
  id: "rebook-reminders",
  cron: "0 14 * * *",
  run: async () => {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ROLE_SECRET_KEY!
    );
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await runRebookReminders(supabase, resend);
    console.log("Rebook reminders:", result);
    return result;
  },
});
