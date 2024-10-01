import type { Database } from "../../lib/database.types";

declare global {
    type Service = Database['public']['Tables']['services']['Row']
    type Appointment = Database['public']['Tables']['appointments']['Row']
    type Client = Database['public']['Tables']['client_users']['Row']
    type Business = Database['public']['Tables']['business_users']['Row']
}
