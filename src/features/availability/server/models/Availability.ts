import { Time } from "@internationalized/date"
import { SupabaseClient } from "@supabase/supabase-js"
import { Database } from "@/lib/database.types"

export interface AvailabilityType {
    id: string,
    businessId: string,
    name: string,
    week: {
        isChecked: boolean,
        timeRanges: {
            start: Time,
            end: Time
        }[]
    }[],
    specificDates: any
}

const defaultAvailability = {
    name: "Default",
    week: [{
        isChecked: true,
        timeRanges: [{
            start: new Time(9),
            end: new Time(17)
        }]
    },
    {
        isChecked: true,
        timeRanges: [{
            start: new Time(9),
            end: new Time(17)
        }]
    },
    {
        isChecked: true,
        timeRanges: [{
            start: new Time(9),
            end: new Time(17)
        }]
    },
    {
        isChecked: true,
        timeRanges: [{
            start: new Time(9),
            end: new Time(17)
        }]
    },
    {
        isChecked: true,
        timeRanges: [{
            start: new Time(9),
            end: new Time(17)
        }]
    },
    {
        isChecked: false,
        timeRanges: [{
            start: new Time(9),
            end: new Time(17)
        }]
    },
    {
        isChecked: false,
        timeRanges: [{
            start: new Time(9),
            end: new Time(17)
        }]
    }],
    specificDates: {}
}

export class Availability {
    constructor(
        public id: string,
        public businessId: string,
        public name: string,
        public week: {
            isChecked: boolean,
            timeRanges: {
                start: Time,
                end: Time
            }[]
        }[],
        public specificDates: any
    ) { }


    static async fromRow(row: Database['public']['Tables']['availabilities']['Row'] | Database['public']['Tables']['availabilities']['Row'][]) {
        if (Array.isArray(row)) {
            return row.map((item) => {
                return new Availability(
                    item.id,
                    item.business_id!,
                    (item.availability_data as unknown as typeof Availability.prototype).name,
                    (item.availability_data as unknown as typeof Availability.prototype).week,
                    (item.availability_data as unknown as typeof Availability.prototype).specificDates
                )
            })
        } else {
            return new Availability(
                row.id,
                row.business_id!,
                (row.availability_data as unknown as typeof Availability.prototype).name,
                (row.availability_data as unknown as typeof Availability.prototype).week,
                (row.availability_data as unknown as typeof Availability.prototype).specificDates
            )
        }
    }

    static async createDefault(supabase: SupabaseClient<Database>, businessId: string) {
        const id = crypto.randomUUID()
        const availabilityData = { ...defaultAvailability, id }
        const { availability: row, error } = await supabase.from('availabilities').insert({
            id,
            availability_data: availabilityData as any,
            business_id: businessId
        }).select().single().then(async (res) => {
            const { data: availability, error } = await supabase.from('business_users').update({
                default_availability: res.data?.id
            }).eq('business_id', businessId).select('availabilities(*)').single()
            return { availability, error }
        })
        if (error) throw Error(error.message)

        return Availability.fromRow(row?.availabilities!)
    }

    static async fetch(supabase: SupabaseClient<Database>, businessId: string) {
        try {
            const { data: row, error } = await supabase.from('availabilities').select().eq('business_id', businessId)
            if (error) throw Error(error.message)
            return Availability.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }

    static async fetchById(supabase: SupabaseClient<Database>, availabilityId: string) {
        try {
            const { data: row, error } = await supabase.from('availabilities').select().eq('id', availabilityId).single()
            if (error) throw Error(error.message)
            return Availability.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }

    toClient() {
        return {
            id: this.id,
            businessId: this.businessId,
            name: this.name,
            week: this.week,
            specificDates: this.specificDates
        }
    }

    async update(supabase: SupabaseClient<Database>, availabilityData: typeof Availability.prototype) {
        try {
            const { data: row, error } = await supabase.from('availabilities').update({
                availability_data: availabilityData as any
            }).eq('id', this.id).single()
            if (error) throw Error(error.message)
            return Availability.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }

    async delete(supabase: SupabaseClient<Database>) {
        try {
            const availability = await Availability.fetch(supabase, this.businessId)
            if (!Array.isArray(availability) || availability.length <= 1) {
                throw Error('Unable to delete. Must have at least 1 availability')
            }
            const { data: row, error } = await supabase.from('availabilities').delete().eq('id', this.id).select().single()
            if (error) throw Error(error.message)
            return Availability.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
}
