import { SupabaseClient } from "@supabase/supabase-js"
import { Database } from "../../../lib/database.types"
import { parseLateFee, type LateFee } from "@/features/lateFees/lateFee"

export enum Level {
    LIGHT = "light",
    MODERATE = "moderate",
    STRICT = 'strict'
}

export enum Type {
    FLAT = "flat",
    PERCENT = "percent"
}

export interface BusinessPolicyType {
    id: string,
    business: string,
    deposit: {
        enabled: boolean,
        settings: {
            type: Type,
            value: number,
            subtraction: boolean
        }
    },
    late_fee: LateFee,
    no_show: {
        enabled: boolean
        level?: Level
    },
    rescheduleLimit: number,
    rescheduleDayLimit: number,
    cancelDayLimit: number,
    importantInfo: string,
    readBeforeBooking: string,
    bookAheadValue: string
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
        public late_fee: LateFee,
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
            parseLateFee(row.late_fee),
            {
                enabled: (row.no_show as typeof BusinessPolicy.prototype.no_show).enabled,
                level: (row.no_show as typeof BusinessPolicy.prototype.no_show).level
            },
            row.reschedule_limit!,
            row.reschedule_day_limit!,
            row.cancel_day_limit!,
            row.important_info!,
            row.read_before_booking!,
            row.book_ahead_value
        )
    }
    toClient() {
        return {
            id: this.id,
            business: this.business,
            deposit: {
                enabled: this.deposit.enabled,
                settings: {
                    type: this.deposit.settings.type,
                    value: this.deposit.settings.value,
                    subtraction: this.deposit.settings.subtraction
                }
            },
            late_fee: { ...this.late_fee },
            no_show: {
                enabled: this.no_show.enabled,
                level: this.no_show.level
            },
            rescheduleLimit: this.rescheduleLimit,
            rescheduleDayLimit: this.rescheduleDayLimit,
            cancelDayLimit: this.cancelDayLimit,
            importantInfo: this.importantInfo,
            readBeforeBooking: this.readBeforeBooking,
            bookAheadValue: this.bookAheadValue
        } as unknown as BusinessPolicyType
    }
    static async fetch(supabase: SupabaseClient<Database, any>, businessId: string) {
        try {
            // Every settings save inserts a new policy row, so load the active
            // one (business_users.booking_policies), else the newest. This used
            // to be `.single()` by business, which errors once a business has
            // saved its settings twice — breaking its booking page.
            const { data: biz } = await supabase.from('business_users').select('booking_policies').eq('business_id', businessId).maybeSingle()
            if (biz?.booking_policies) {
                const { data: active } = await supabase.from('business_policies').select().eq('id', biz.booking_policies).eq('business', businessId).maybeSingle()
                if (active) return BusinessPolicy.fromRow(active)
            }
            const { data: rows, error } = await supabase.from('business_policies').select().eq('business', businessId).order('created_at', { ascending: false }).limit(1)
            if (error) throw Error(error.message)
            if (!rows?.length) throw Error('No booking policy found')
            return BusinessPolicy.fromRow(rows[0])
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async update(supabase: SupabaseClient<Database, any>, policy: typeof BusinessPolicy.prototype) {
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
                late_fee: { ...policy.late_fee },
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
