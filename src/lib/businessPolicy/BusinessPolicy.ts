import { SupabaseClient } from "@supabase/supabase-js"
import { Database } from "../../../lib/database.types"

export enum Level {
    LIGHT = "light",
    MODERATE = "moderate",
    STRICT = 'strict'
}

export enum Type {
    FLAT = "flat",
    PERCENT = "percent"
}

export class BusinessPolicy {
    constructor(
        public id: string,
        public business: string,
        public deposit: {
            enabled: boolean,
            settings: {
                type: Type,
                value: number,
                subtraction: boolean
            }
        },
        public late_fee: {
            enabled: boolean
            fee?: number
        },
        public no_show: {
            enabled: boolean
            level?: Level
        },
        public rescheduleLimit: number,
        public rescheduleDayLimit: number,
        public cancelDayLimit: number,
        public importantInfo: string,
        public readBeforeBooking: string,
        public bookAheadValue: string

    ) { }

    static async createDefault(supabase: SupabaseClient<Database>, businessId: string) {
        try {
            const { data: row, error } = await supabase.from('business_policies').insert({
                business: businessId,
                deposit: {
                    enabled: false,
                    settings: {
                        type: 'percent',
                        value: 20
                    }
                },
                late_fee: {
                    enabled: false
                },
                no_show: {
                    enabled: false,
                    level: "strict"
                }
            }).select().single()
            if (error) throw Error(error.message)
            return BusinessPolicy.fromRow(row!)
        } catch (error: any) {
            throw Error(error.message)
        }

    }
    static fromRow(row: Database['public']['Tables']['business_policies']['Row']) {
        return new BusinessPolicy(
            row.id,
            row.business,
            {
                enabled: (row.deposit as typeof BusinessPolicy.prototype.deposit).enabled,
                settings: (row.deposit as typeof BusinessPolicy.prototype.deposit).settings
            },
            {
                enabled: (row.deposit as typeof BusinessPolicy.prototype.late_fee).enabled
            },
            {
                enabled: (row.deposit as typeof BusinessPolicy.prototype.no_show).enabled,
                level: (row.deposit as typeof BusinessPolicy.prototype.no_show).level
            },
            row.reschedule_limit!,
            row.reschedule_day_limit!,
            row.cancel_day_limit!,
            row.important_info!,
            row.read_before_booking!,
            row.book_ahead_value
        )
    }
    static async fetch(supabase: SupabaseClient<Database>, businessId: string) {
        try {
            const { data: row, error } = await supabase.from('business_policies').select().eq('business', businessId).single()
            if (error) throw Error(error.message)
            return BusinessPolicy.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async update(supabase: SupabaseClient<Database>, policy: typeof BusinessPolicy.prototype) {
        try {
            const { data: row, error } = await supabase.from('business_policies').update({
                deposit: {
                    enabled: policy.deposit.enabled,
                    settings: {
                        type: policy.deposit.settings.type,
                        value: policy.deposit.settings.value,
                        subtraction: policy.deposit.settings.subtraction
                    }
                },
                late_fee: {
                    enabled: policy.late_fee.enabled,
                    fee: policy.late_fee.fee
                },
                no_show: {
                    enabled: policy.no_show.enabled,
                    level: policy.no_show.level
                },
                rescheduleLimit: policy.rescheduleLimit,
                rescheduleDayLimit: policy.rescheduleDayLimit,
                cancelDayLimit: policy.cancelDayLimit,
                importantInfo: policy.importantInfo,
                readBeforeBooking: policy.readBeforeBooking,
                bookAheadValue: policy.bookAheadValue
            }).eq('id', this.id).select().single()
            if (error) throw Error(error.message)
            return BusinessPolicy.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
}
