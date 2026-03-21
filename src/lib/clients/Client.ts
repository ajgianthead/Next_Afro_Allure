import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../lib/database.types";

export class Client {
    constructor(
        public id: string,
        public firstName: string,
        public lastName: string,
        public email: string,
        public phoneNumber: string
    ) { }
    static fromRow(row: Database['public']['Tables']['client_users']['Row'] | Database['public']['Tables']['client_users']['Row'][]) {
        if (Array.isArray(row)) {
            return row.map((row) => {
                return new Client(
                    row.client_id,
                    row.first_name,
                    row.last_name,
                    row.email,
                    row.phone_number
                )
            })
        }
        return new Client(
            row.client_id,
            row.first_name,
            row.last_name,
            row.email,
            row.phone_number
        )
    }
    static async fetch(supabase: SupabaseClient<Database>, businessId: string) {
        try {
            const { data: row, error } = await supabase.from('business_clients').select("*, client_users(*)").eq('business', businessId).neq('banned', true)
            if (error) throw Error(error.message)
            return Client.fromRow(row.map((client) => {
                return client.client_users
            }))
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async fetchById(supabase: SupabaseClient<Database>, clientId: string) {
        try {
            const { data: row, error } = await supabase.from('client_users').select().eq('client_id', clientId).single()
            if (error) throw Error(error.message)
            return Client.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async fetchBannedClients(supabase: SupabaseClient<Database>, businessId: string) {
        try {
            const { data: row, error } = await supabase.from('business_clients').select("*, client_users(*)").eq('business', businessId).eq('banned', true)
            if (error) throw Error(error.message)
            return Client.fromRow(row.map((client) => {
                return client.client_users
            }))
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async checkClientExist(supabase: SupabaseClient<Database>, email: string, phoneNumber: string) {
        try {
            const { data: row, error } = await supabase.from('client_users').select().or(`email.eq.${email},phone_number.eq.${phoneNumber}`).single()
            if (error) throw Error(error.message)
            if (row) return true
            return false
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async checkClientBusinessRelationExist(supabase: SupabaseClient<Database>, businessId: string, clientId: string) {
        try {
            const { data: row, error } = await supabase.from('business_clients').select().eq('business', businessId).eq('client', clientId).single()
            if (error) throw Error(error.message)
            if (row) return true
            return false
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async isClientBanned(supabase: SupabaseClient<Database>, email: string, phoneNumber: string) {
        try {
            const { data: row, error } = await supabase.from('business_clients').select().eq('banned', true).or(`email.eq.${email},phone_number.eq.${phoneNumber}`).single()
            if (error) throw Error(error.message)
            if (row) return true
            return false
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async create(supabase: SupabaseClient<Database>, client: {
        firstName: string,
        lastName: string,
        email: string,
        phoneNumber: string
    }) {
        try {
            if (await this.checkClientExist(supabase, client.email, client.phoneNumber)) {
                throw Error('Client already exists')
            }
            const { data: row, error } = await supabase.from('client_users').insert({
                first_name: client.firstName,
                last_name: client.lastName,
                email: client.email,
                phone_number: client.phoneNumber
            }).select().single()
            if (error) throw Error(error.message)
            return Client.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async unbanClient(supabase: SupabaseClient<Database>, businessId: string) {
        try {
            const { data: row, error } = await supabase.from('business_clients').update({
                banned: false
            }).eq('business', businessId).eq('client', this.id).select()
            if (error) throw Error(error.message)
            return true
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async banClient(supabase: SupabaseClient<Database>, businessId: string) {
        try {
            const { data: row, error } = await supabase.from('business_clients').update({
                banned: true
            }).eq('business', businessId).eq('client', this.id).select()
            if (error) throw Error(error.message)
            return true
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async update(supabase: SupabaseClient<Database>, client: {
        firstName: string,
        lastName: string,
        email: string,
        phoneNumber: string
    }) {
        try {
            const { data: row, error } = await supabase.from('client_users').update({
                first_name: client.firstName,
                last_name: client.lastName,
                email: client.email,
                phone_number: client.phoneNumber
            }).eq('client_id', this.id).select().single()
            if (error) throw Error(error.message)
            return Client.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async addToBusiness(supabase: SupabaseClient<Database>, businessId: string) {
        try {
            if (await Client.checkClientBusinessRelationExist(supabase, businessId, this.id)) {
                throw Error('Relation exists')
            }
            const { data: row, error } = await supabase.from('business_clients').insert({
                business: businessId,
                client: this.id
            }).select().single()
            if (error) throw Error(error.message)
            return true
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async removeFromBusiness(supabase: SupabaseClient<Database>, businessId: string) {
        try {
            if (!(await Client.checkClientBusinessRelationExist(supabase, businessId, this.id))) {
                throw Error('Relation does not exist')
            }
            const { data: row, error } = await supabase.from('business_clients').delete().eq('business', businessId).eq('client', this.id).select().single()
            if (error) throw Error(error.message)
            return true
        } catch (error: any) {
            throw Error(error.message)
        }
    }

}
