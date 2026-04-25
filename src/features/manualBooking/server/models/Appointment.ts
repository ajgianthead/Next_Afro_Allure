import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../../../lib/database.types";
import { Service, ServiceType } from "@lib/service/Service";
import { AddOn } from "@/app/utils/types/service";
import { Resend } from "resend";
import NewAppointment from "../../../../../emails/new-appointment";
import { BusinessUser } from "@lib/businessUser/BusinessUser";
import RescheduledAppointment from "../../../../../emails/rescheduled-appointment";
import CancelledAppointment from "../../../../../emails/cancelled-appointment";
import ConfirmAppointmentTemplate from "../../../../../emails/confirm-appointment";
import AppointmentConfirmed from "../../../../../emails/appointment-confirmed";
import AppointmentRescheduled from "../../../../../emails/appointment-rescheduled";
import AppointmentCancelled from "../../../../../emails/appointment-cancelled";
import { Email } from "@lib/appointmentEmails/AppointmentEmails";

export interface AppointmentType {
    id: string,
    businessId: string,
    createdAt: string,
    updatedAt: string,
    start: string,
    end: string,
    clientMetadata: {
        firstName: string,
        lastName: string,
        email: string,
        phoneNumber: string
    },
    status: Database['public']['Enums']['status'],
    serviceData: ServiceType,
    requireDeposit: boolean,
    depositChargeId: string,
    paidDeposit: boolean,
    numberOfReschedules: number,
    depositPrice: number,
    cancellationReason: string[],
    selectedAddons: AddOn[],
    amountDue: number,
    servicePaid: boolean,
    servicePaidType: Database['public']['Enums']['paid_type'],
    serviceChargeId: string,
    reminderIds: {
        client: string,
        business: string,
        paymentCheck: string
    },
    depositTaxTransaction: string,
    endOfAppointmentTaxTransaction: string,
    paidAmount: number,
    subtraction: boolean,
}

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
        public paidAmount: number,
        public subtraction: boolean,


    ) { }
    toClient() {
        return {
            id: this.id,
            businessId: this.businessId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            start: this.start,
            end: this.end,
            clientMetadata: {
                firstName: this.clientMetadata.firstName,
                lastName: this.clientMetadata.lastName,
                email: this.clientMetadata.email,
                phoneNumber: this.clientMetadata.phoneNumber
            },
            status: this.status,
            serviceData: this.serviceData.toClient(),
            requireDeposit: this.requireDeposit,
            depositChargeId: this.depositChargeId,
            paidDeposit: this.paidDeposit,
            numberOfReschedules: this.numberOfReschedules,
            depositPrice: this.depositPrice,
            cancellationReason: this.cancellationReason,
            selectedAddons: this.selectedAddons,
            amountDue: this.amountDue,
            servicePaid: this.servicePaid,
            servicePaidType: this.servicePaidType,
            serviceChargeId: this.serviceChargeId,
            reminderIds: {
                client: this.reminderIds.client,
                business: this.reminderIds.business,
                paymentCheck: this.reminderIds.paymentCheck
            },
            depositTaxTransaction: this.depositTaxTransaction,
            endOfAppointmentTaxTransaction: this.endOfAppointmentTaxTransaction,
            paidAmount: this.paidAmount,
            subtraction: this.subtraction
        }
    }
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
                item.paid_amount,
                item.substraction
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
            row.paid_amount,
            row.substraction
        )
    }
    static async create(supabase: SupabaseClient<Database, any>, businessId: string, appointmentData: {
        client_metadata: any, start: string, end: string, service_data: any, status: any, require_deposit: boolean, paid_deposit: boolean, deposit_charge_id: string, reschedules: number, deposit_price: number, selected_addons: AddOn[], substraction: boolean
    }) {
        try {
            let addOnPrice = 0;
            appointmentData.selected_addons.forEach((addOn) => addOnPrice += Number(addOn.price))
            const { data: row, error } = await supabase.from('appointments').insert({
                business: businessId,
                client_metadata: appointmentData.client_metadata,
                start: appointmentData.start,
                end: appointmentData.end,
                status: appointmentData.status,
                service_data: appointmentData.service_data,
                require_deposit: appointmentData.require_deposit,
                paid_deposit: appointmentData.paid_deposit,
                deposit_charge_id: appointmentData.deposit_charge_id,
                reschedules: appointmentData.reschedules,
                deposit_price: appointmentData.deposit_price,
                selected_addons: appointmentData.selected_addons,
                amount_due: Number(appointmentData.service_data.price) + addOnPrice,
                substraction: appointmentData.substraction
            }).select().single()
            if (error) throw Error(error.message)
            return Appointment.fromRows(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async fetchByStatus(supabase: SupabaseClient<Database, any>, businessId: string, status: Database['public']['Enums']['status']) {
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
    static async fetch(supabase: SupabaseClient<Database, any>, businessId: string) {
        try {
            const { data: row, error } = await supabase.from('appointments').select().eq('business', businessId).order('start', {
                ascending: false
            })
            if (error) {
                throw Error(error.message)
            }
            return Appointment.fromRows(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    static async fetchById(supabase: SupabaseClient<Database, any>, appointmentId: string) {
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
    async reschedule(supabase: SupabaseClient<Database, any>, appointmentData: {
        start: string
        end: string
    }) {
        try {
            const { data: row, error } = await supabase.from('appointments').update({
                start: appointmentData.start,
                end: appointmentData.end,
                reschedules: Math.max(0, this.numberOfReschedules - 1)
            }).eq('id', this.id).select().single()
            if (error) throw Error(error.message)
            return Appointment.fromRows(row)
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async changeStatus(supabase: SupabaseClient<Database, any>, status: Database['public']['Enums']['status']) {
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
    async confirmAppointment(supabase: SupabaseClient<Database>, amountPaid?: number) {
        try {
            if (this.status !== 'PENDING') {
                throw Error("Appointment is not 'PENDING', therefore it can not be 'CONFIRMED'")
            }
            if (this.requireDeposit) {
                const { data: row, error } = await supabase.from('appointments').update({
                    status: 'CONFIRMED',
                    paid_deposit: true,
                    paid_amount: amountPaid,
                    amount_due: this.subtraction ? this.amountDue - amountPaid! : this.amountDue
                }).eq('id', this.id).select().single()
                if (error) throw Error(error.message)
                this.status = row?.status!
                this.paidDeposit = row?.paid_deposit!
                this.amountDue = row?.amount_due!
                return Appointment.fromRows(row)
            } else {
                const { data: row, error } = await supabase.from('appointments').update({
                    status: 'CONFIRMED',
                }).eq('id', this.id).select().single()
                if (error) throw Error(error.message)
                this.status = row?.status!
                return Appointment.fromRows(row)
            }
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async sendBusinessConfirmationEmail(resend: Resend, supabase: SupabaseClient<Database, any>) {
        const business = await BusinessUser.fetch(supabase, this.businessId)
        const businessAddress = business.accountSettings.business_address
        const addressString = businessAddress.no_address ? 'No business address' : `${businessAddress.line_1}, ${businessAddress.line_2}, ${businessAddress.city}, ${businessAddress.state} ${businessAddress.zip_code}`
        return Email.send(resend, NewAppointment({
            socials: {
                instagram: "https://instagram.com/afroallure_",
            },
            serviceName: this.serviceData.name,
            clientData: {
                firstName: this.clientMetadata.firstName,
                lastName: this.clientMetadata.lastName,
            },
            businessData: {
                id: this.businessId,
                name: business.name,
                businessAddress: addressString
            },
            appointmentData: {
                id: this.id,
                start: this.start,
                end: this.end
            }

        }), 'New Booking Alert', business.email)
    }
    async sendBusinessRescheduleEmail(resend: Resend, supabase: SupabaseClient<Database, any>) {
        const business = await BusinessUser.fetch(supabase, this.businessId)
        const businessAddress = business.accountSettings.business_address
        const addressString = businessAddress.no_address ? 'No business address' : `${businessAddress.line_1}, ${businessAddress.line_2}, ${businessAddress.city}, ${businessAddress.state} ${businessAddress.zip_code}`
        return Email.send(resend, RescheduledAppointment({
            socials: {
                instagram: "https://instagram.com/afroallure_",
            },
            serviceName: this.serviceData.name,
            clientData: {
                firstName: this.clientMetadata.firstName,
                lastName: this.clientMetadata.lastName,
            },
            businessData: {
                id: this.businessId,
                name: business.name,
                businessAddress: addressString
            },
            appointmentData: {
                id: this.id,
                start: this.start,
                end: this.end
            }

        }), 'Appointment Rescheduled', business.email)
    }
    async sendBusinessCancellationEmail(resend: Resend, supabase: SupabaseClient<Database, any>) {
        const business = await BusinessUser.fetch(supabase, this.businessId)
        const businessAddress = business.accountSettings.business_address
        const addressString = businessAddress.no_address ? 'No business address' : `${businessAddress.line_1}, ${businessAddress.line_2}, ${businessAddress.city}, ${businessAddress.state} ${businessAddress.zip_code}`
        return Email.send(resend, CancelledAppointment({
            socials: {
                instagram: "https://instagram.com/afroallure_",
            },
            serviceName: this.serviceData.name,
            clientData: {
                firstName: this.clientMetadata.firstName,
                lastName: this.clientMetadata.lastName,
            },
            businessData: {
                id: this.businessId,
                name: business.name,
                businessAddress: addressString
            },
            appointmentData: {
                id: this.id,
                start: this.start,
                end: this.end
            }

        }), 'Appointment Cancelled', business.email)
    }

    async sendConfirmAppointmentEmail(resend: Resend, supabase: SupabaseClient<Database, any>) {
        const business = await BusinessUser.fetch(supabase, this.businessId)
        const businessAddress = business.accountSettings.business_address
        const addressString = businessAddress.no_address ? 'No business address' : `${businessAddress.line_1}, ${businessAddress.line_2}, ${businessAddress.city}, ${businessAddress.state} ${businessAddress.zip_code}`
        return Email.send(resend, ConfirmAppointmentTemplate({
            socials: {
                instagram: "https://instagram.com/afroallure_",
            },
            serviceName: this.serviceData.name,
            clientData: {
                firstName: this.clientMetadata.firstName,
                lastName: this.clientMetadata.lastName,
            },
            businessData: {
                id: this.businessId,
                name: business.name,
                businessAddress: addressString
            },
            appointmentData: {
                id: this.id,
                start: this.start,
                end: this.end
            }

        }), 'Confirm Appointment', this.clientMetadata.email)
    }
    async sendClientConfirmationEmail(resend: Resend, supabase: SupabaseClient<Database, any>) {
        const business = await BusinessUser.fetch(supabase, this.businessId)
        const businessAddress = business.accountSettings.business_address
        const addressString = businessAddress.no_address ? 'No business address' : `${businessAddress.line_1}, ${businessAddress.line_2}, ${businessAddress.city}, ${businessAddress.state} ${businessAddress.zip_code}`
        return Email.send(resend, AppointmentConfirmed({
            socials: {
                instagram: "https://instagram.com/afroallure_",
            },
            serviceName: this.serviceData.name,
            clientData: {
                firstName: this.clientMetadata.firstName,
                lastName: this.clientMetadata.lastName,
            },
            businessData: {
                id: this.businessId,
                name: business.name,
                businessAddress: addressString
            },
            appointmentData: {
                id: this.id,
                start: this.start,
                end: this.end
            }

        }), 'Appointment Confirmed', this.clientMetadata.email)
    }
    async sendClientRescheduleEmail(resend: Resend, supabase: SupabaseClient<Database, any>) {
        const business = await BusinessUser.fetch(supabase, this.businessId)
        const businessAddress = business.accountSettings.business_address
        const addressString = businessAddress.no_address ? 'No business address' : `${businessAddress.line_1}, ${businessAddress.line_2}, ${businessAddress.city}, ${businessAddress.state} ${businessAddress.zip_code}`
        return Email.send(resend, AppointmentRescheduled({
            socials: {
                instagram: "https://instagram.com/afroallure_",
            },
            serviceName: this.serviceData.name,
            clientData: {
                firstName: this.clientMetadata.firstName,
                lastName: this.clientMetadata.lastName,
            },
            businessData: {
                id: this.businessId,
                name: business.name,
                businessAddress: addressString
            },
            appointmentData: {
                id: this.id,
                start: this.start,
                end: this.end
            }

        }), 'Appointment Rescheduled', this.clientMetadata.email)
    }
    async sendClientCancellationEmail(resend: Resend, supabase: SupabaseClient<Database, any>) {
        const business = await BusinessUser.fetch(supabase, this.businessId)
        const businessAddress = business.accountSettings.business_address
        const addressString = businessAddress.no_address ? 'No business address' : `${businessAddress.line_1}, ${businessAddress.line_2}, ${businessAddress.city}, ${businessAddress.state} ${businessAddress.zip_code}`
        return Email.send(resend, AppointmentCancelled({
            socials: {
                instagram: "https://instagram.com/afroallure_",
            },
            serviceName: this.serviceData.name,
            clientData: {
                firstName: this.clientMetadata.firstName,
                lastName: this.clientMetadata.lastName,
            },
            businessData: {
                id: this.businessId,
                name: business.name,
                businessAddress: addressString
            },
            appointmentData: {
                id: this.id,
                start: this.start,
                end: this.end
            }

        }), 'Appointment Cancelled', this.clientMetadata.email)
    }
}

