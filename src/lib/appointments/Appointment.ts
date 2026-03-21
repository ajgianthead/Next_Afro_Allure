import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../lib/database.types";
import { Service } from "@lib/service/Service";
import { AddOn } from "@utils/types/service";

export class Appointment {
    constructor(
        public id: string,
        public businessId: string,
        public createdAt: string,
        public updatedAt: string,
        public start: string,
        public end: string,
        public clientMetadata: {
            firstName: string,
            lastName: string,
            email: string,
            phoneNumber: string
        },
        public status: Database['public']['Enums']['status'],
        public serviceData: typeof Service.prototype,
        public requireDeposit: boolean,
        public depositChargeId: string,
        public paidDeposit: boolean,
        public numberOfReschedules: number,
        public depositPrice: number,
        public cancellationReason: string[],
        public selectedAddons: AddOn[],
        public amountDue: number,
        public servicePaid: boolean,
        public servicePaidType: Database['public']['Enums']['paid_type'],
        public serviceChargeId: string,
        public reminderIds: {
            client: string,
            business: string,
            paymentCheck: string
        },
        public depositTaxTransaction: string,
        public endOfAppointmentTaxTransaction: string,
        public paidAmount: number


    ) { }
    private static fromRows(row: Database['public']['Tables']['appointments']['Row'][] | Database['public']['Tables']['appointments']['Row']) {
        if (Array.isArray(row)) {
            return row.map((item) => new Appointment(
                item.id,
                item.business,
                item.created_at,
                item.updated_at,
                item.start,
                item.end,
                {
                    firstName: (item.client_metadata as any).firstName,
                    lastName: (item.client_metadata as any).lastName,
                    email: (item.client_metadata as any).email,
                    phoneNumber: (item.client_metadata as any).phoneNumber
                },
                item.status,
                new Service(
                    (item.service_data as any).id,
                    (item.service_data as any).name,
                    (item.service_data as any).business,
                    (item.service_data as any).description,
                    (item.service_data as any).length,
                    (item.service_data as any).price,
                    (item.service_data as any).photo_url,
                    (item.service_data as any).imagePath,
                    (item.service_data as any).addons,
                    (item.service_data as any).categories,
                    (item.service_data as any).availability

                ),
                item.require_deposit,
                item.deposit_charge_id!,
                item.paid_deposit,
                item.reschedules,
                item.deposit_price!,
                item.cancellation_reason!,
                item.selected_addons as unknown as AddOn[],
                item.amount_due,
                item.service_paid!,
                item.service_paid_type!,
                item.service_charge_id!,
                {
                    client: (item.reminder_ids as any).client,
                    business: (item.reminder_ids as any).business,
                    paymentCheck: (item.reminder_ids as any).paymentCheck
                },
                item.deposit_tax_transaction!,
                item.eoa_tax_transaction!,
                item.paid_amount

            ))
        }
        return new Appointment(
            row.id,
            row.business,
            row.created_at,
            row.updated_at,
            row.start,
            row.end,
            {
                firstName: (row.client_metadata as any).firstName,
                lastName: (row.client_metadata as any).lastName,
                email: (row.client_metadata as any).email,
                phoneNumber: (row.client_metadata as any).phoneNumber
            },
            row.status,
            new Service(
                (row.service_data as any).id,
                (row.service_data as any).name,
                (row.service_data as any).business,
                (row.service_data as any).description,
                (row.service_data as any).length,
                (row.service_data as any).price,
                (row.service_data as any).photo_url,
                (row.service_data as any).imagePath,
                (row.service_data as any).addons,
                (row.service_data as any).categories,
                (row.service_data as any).availability

            ),
            row.require_deposit,
            row.deposit_charge_id!,
            row.paid_deposit,
            row.reschedules,
            row.deposit_price!,
            row.cancellation_reason!,
            row.selected_addons as unknown as AddOn[],
            row.amount_due,
            row.service_paid!,
            row.service_paid_type!,
            row.service_charge_id!,
            {
                client: (row.reminder_ids as any).client,
                business: (row.reminder_ids as any).business,
                paymentCheck: (row.reminder_ids as any).paymentCheck
            },
            row.deposit_tax_transaction!,
            row.eoa_tax_transaction!,
            row.paid_amount

        )
    }
    static async create(supabase: SupabaseClient<Database>, businessId: string, appointmentData: {
        client_metadata: any, start: string, end: string, service_data: any, status: any, require_deposit: boolean, paid_deposit: boolean, deposit_charge_id: string, reschedules: number, deposit_price: number, selected_addons: any[]
    }) {
        try {
            const { data: row, error } = await supabase.from('appointments').insert({
                business: businessId,
                client_metadata: appointmentData.client_metadata,
                start: appointmentData.start,
                end: appointmentData.end,
                status: appointmentData.status,
                client: null,
                service_data: appointmentData.service_data,
                require_deposit: appointmentData.require_deposit,
                paid_deposit: appointmentData.paid_deposit,
                deposit_charge_id: appointmentData.deposit_charge_id,
                reschedules: appointmentData.reschedules,
                deposit_price: appointmentData.deposit_price,
                selected_addons: appointmentData.selected_addons,
                amount_due: appointmentData.service_data.price
            }).select().single()
            if (error) throw Error(error.message)
            return Appointment.fromRows(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async fetchByStatus(supabase: SupabaseClient<Database>, businessId: string, status: Database['public']['Enums']['status']) {
        try {
            const { data: row, error } = await supabase.from('appointments').select().eq('business', businessId).eq('status', status)
            if (error) {
                throw Error(error.message)
            }
            return Appointment.fromRows(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async fetch(supabase: SupabaseClient<Database>, businessId: string) {
        try {
            const { data: row, error } = await supabase.from('appointments').select().eq('business', businessId)
            if (error) {
                throw Error(error.message)
            }
            return Appointment.fromRows(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async fetchById(supabase: SupabaseClient<Database>, appointmentId: string) {
        try {
            const { data: row, error } = await supabase.from('appointments').select().eq('id', appointmentId).single()
            if (error) {
                throw Error(error.message)
            }
            return Appointment.fromRows(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async reschedule(supabase: SupabaseClient<Database>, appointmentData: {
        start: string
        end: string
    }) {
        try {
            const { data: row, error } = await supabase.from('appointments').update({
                start: appointmentData.start,
                end: appointmentData.end
            }).eq('id', this.id).select().single()
            if (error) throw Error(error.message)
            return Appointment.fromRows(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async changeStatus(supabase: SupabaseClient<Database>, status: Database['public']['Enums']['status']) {
        try {
            const { data: row, error } = await supabase.from('appointments').update({
                status: status
            }).eq('id', this.id).select().single()
            if (error) throw Error(error.message)
            return Appointment.fromRows(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async cancel(supabase: SupabaseClient<Database>) {
        try {
            const { data: row, error } = await supabase.from('appointments').update({
                status: 'CANCELLED'
            }).eq('id', this.id).select().single()
            if (error) throw Error(error.message)
            return Appointment.fromRows(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }

}
