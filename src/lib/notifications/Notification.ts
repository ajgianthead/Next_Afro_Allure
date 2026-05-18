import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../lib/database.types";

export enum NotificationType {
    NewBooking = 'new-booking',
    CancelledBooking = 'cancelled-booking',
    RescheduledBooking = 'rescheduled-booking',
    BookingConfirmed = 'booking-confirmed',
}

interface NotiData {
    title: string;
    body: string;
    type: NotificationType;
}

export class Notification {
    constructor(
        public id: string,
        public title: string,
        public body: string,
        public createdAt: Date,
        public type: string,
        public businessId: string,
        public appointmentId: string,
        public read: boolean
    ) { }
    static fromRow(row: Database['public']['Tables']['notifications']['Row'] | Database['public']['Tables']['notifications']['Row'][]) {
        if (Array.isArray(row)) {
            return row.map((row) => {
                return new Notification(
                    row.id,
                    row.title,
                    row.body,
                    new Date(row.created_at),
                    row.type,
                    row.business_id,
                    row.appointment_id,
                    row.read
                )
            })
        }
        return new Notification(
            row.id,
            row.title,
            row.body,
            new Date(row.created_at),
            row.type,
            row.business_id,
            row.appointment_id,
            row.read
        )
    }
    static async fetch(supabase: SupabaseClient<Database>, businessId: string) {
        try {
            const { data: row, error } = await supabase.from('notifications').select().eq('business_id', businessId)
            if (error) throw Error(error.message)
            return Notification.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async send(supabase: SupabaseClient<Database>, notiData: NotiData, appointmentId: string, businessId: string) {
        try {
            const { data: row, error } = await supabase.from('notifications').insert({
                read: false,
                title: notiData.title,
                body: notiData.body,
                type: notiData.type,
                appointment_id: appointmentId,
                business_id: businessId
            }).select().single()
            if (error) throw Error(error.message)
            return Notification.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async changeReadStatus(supabase: SupabaseClient<Database>) {
        try {
            const { data: row, error } = await supabase.from('notifications').update({
                read: true
            }).eq('id', this.id).select().single()
            if (error) throw Error(error.message)
            return Notification.fromRow(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async delete(supabase: SupabaseClient<Database>) {
        try {
            const { data: row, error } = await supabase.from('notifications').delete().eq('id', this.id).select().single()
            if (error) throw Error(error.message)
            return true
        } catch (error: any) {
            throw Error(error.message)
        }
    }
}
