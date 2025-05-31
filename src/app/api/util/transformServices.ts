import { createClient } from "@utils/supabase/server"
import { Database } from "../../../../lib/database.types"
import { SupabaseClient } from "@supabase/supabase-js"

export const assignAddons = async (supabase: SupabaseClient, services: Service[]) => {
    const uniqueAddonIds = [...new Set(services?.flatMap(service => service.addons))]
    const {data: addons, error} = await supabase.from('service_addons').select("*").in('id', uniqueAddonIds)
    const addonsById = Object.fromEntries((addons ?? []).map(addon => [addon.id, addon]))
    const servicesWithAddons = services?.map(service => ({
        ...service,
        addonDetails: service.addons!.map((id: any) => addonsById[id]).filter(Boolean)
      }));
      return servicesWithAddons
}



