import { SupabaseClient } from "@supabase/supabase-js";
import { AddOn } from "@utils/types/service";
import { Database } from "../../../lib/database.types";

export class Service {
    constructor(
        public id: string,
        public name: string,
        public business: string,
        public description: string,
        public length: number,
        public price: number,
        public photo_url: string,
        public imagePath: string,
        public addons: AddOn[],
        public categories: string[],
        public availability: string
    ) { }
    static async createDefault(supabase: SupabaseClient<Database>, businessId: string, availabilityId: string) {
        const { data: row, error } = await supabase.from('services').insert([
            {
                name: "Box Braids",
                business: businessId,
                description: "This is an example service",
                length: 180,
                price: 8000,
                photo_url: "",
                imagePath: "",
                addons: [],
                categories: ["test", "default", "service"],
                availability: availabilityId
            }
        ]).select("*").single()
        if (error) throw Error(error.message)
        return Service.fromRow(row)
    }
    static fromRow(row: Database['public']['Tables']['services']['Row'] | Database['public']['Tables']['services']['Row'][]) {
        if (Array.isArray(row)) {
            return row.map((row) => {
                return new Service(
                    row.id,
                    row.name,
                    row.business,
                    row.description,
                    row.length,
                    row.price,
                    row.photo_url!,
                    row.imagePath!,
                    row.addons as unknown as AddOn[],
                    row.categories!,
                    row.availability
                )
            })
        }
        return new Service(
            row.id,
            row.name,
            row.business,
            row.description,
            row.length,
            row.price,
            row.photo_url!,
            row.imagePath!,
            row.addons as unknown as AddOn[],
            row.categories!,
            row.availability
        )
    }
    static async create(supabase: SupabaseClient<Database>, serviceData: {
        name: string
        business: string
        description: string
        length: number
        price: number
        photoUrl: string
        imagePath: string
        addons: AddOn[]
        categories: string[]
        availability: string
    }, availabilityId: string) {
        try {
            const { data: row, error } = await supabase.from('services').insert({
                name: serviceData.name,
                business: serviceData.business,
                description: serviceData.description,
                length: serviceData.length,
                price: serviceData.price,
                photo_url: serviceData.photoUrl,
                imagePath: serviceData.imagePath,
                addons: serviceData.addons as any,
                categories: serviceData.categories,
                availability: availabilityId
            }).select().single()
            if (error) throw Error(error.message)
            return Service.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async fetch(supabase: SupabaseClient<Database>, businessId: string) {
        try {
            const { data: row, error } = await supabase.from('services').select().eq('business', businessId)
            if (error) throw Error(error.message)
            return Service.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async fetchById(supabase: SupabaseClient<Database>, serviceId: string) {
        try {
            const { data: row, error } = await supabase.from('services').select().eq('id', serviceId).single()
            if (error) throw Error(error.message)
            return Service.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async update(supabase: SupabaseClient<Database>, updatedService: Service) {
        try {
            const { data: row, error } = await supabase.from('services').update({
                name: updatedService.name,
                business: updatedService.business,
                description: updatedService.description,
                length: updatedService.length,
                price: updatedService.price,
                photo_url: updatedService.photo_url,
                imagePath: updatedService.imagePath,
                addons: updatedService.addons as any,
                categories: updatedService.categories,
                availability: updatedService.availability
            }).eq('id', this.id).select().single()
            if (error) throw Error(error.message)
            return Service.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async delete(supabase: SupabaseClient<Database>) {
        try {
            const services = await Service.fetch(supabase, this.business)
            if (Array.isArray(services)) {
                if (services.length === 1) {
                    throw Error('Unable to delete only service')
                }
            }
            const { data: row, error } = await supabase.from('services').delete().eq('id', this.id).select().single()
            if (error) throw Error(error.message)
            return Service.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
}
