import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../lib/database.types";

export class Addon {
    constructor(
        public id: string,
        public businessId: string,
        public name: string,
        public price: number,
    ) { }
    static fromRow(row: Database['public']['Tables']['service_addons']['Row'][] | Database['public']['Tables']['service_addons']['Row']) {
        if (Array.isArray(row)) {
            return row.map((row) => {
                return new Addon(
                    row.id,
                    row.business_id,
                    row.name,
                    row.price
                )
            })
        }
        return new Addon(
            row.id,
            row.business_id,
            row.name,
            row.price
        )
    }
    static async fetch(supabase: SupabaseClient<Database>, businessId: string) {
        try {
            const { data: row, error } = await supabase.from('service_addons').select().eq('business_id', businessId)
            if (error) throw Error(error.message)
            return Addon.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async fetchByIds(supabase: SupabaseClient<Database>, ids: string[]): Promise<Addon[]> {
        if (ids.length === 0) return []
        const { data, error } = await supabase.from('service_addons').select().in('id', ids)
        if (error) throw new Error(error.message)
        return (data ?? []).map(row => Addon.fromRow(row) as Addon)
    }
    static async fetchById(supabase: SupabaseClient<Database, any>, addOnId: string) {
        try {
            const { data: row, error } = await supabase.from('service_addons').select().eq('id', addOnId).single()
            if (error) throw Error(error.message)
            return Addon.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async create(supabase: SupabaseClient<Database>, data: typeof Addon.prototype) {
        try {
            const { data: row, error } = await supabase.from('service_addons').insert({
                business_id: data.businessId,
                name: data.name,
                price: data.price
            }).select().single()
            if (error) throw Error(error.message)
            return Addon.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async update(supabase: SupabaseClient<Database>, data: typeof Addon.prototype) {
        try {
            const { data: row, error } = await supabase.from('service_addons').update({
                name: data.name,
                price: data.price
            }).eq('id', this.id).select().single()
            if (error) throw Error(error.message)
            return Addon.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async delete(supabase: SupabaseClient<Database>) {
        try {
            const { data: row, error } = await supabase.from('service_addons').delete().eq('id', this.id).select().single()
            if (error) throw Error(error.message)
            return Addon.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
}
