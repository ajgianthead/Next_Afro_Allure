import { Appointment } from "@lib/appointments/Appointment";
import { JSX } from "react";
import { Resend } from "resend";

export class Email {
    constructor() { }
    static async send(resend: Resend, template: JSX.Element, subject: string, email: string) {
        try {
            const { data, error } = await resend.emails.send({
                from: 'notifications <noreply@reminder.afroallure.co>',
                to: email,
                subject: subject,
                react: template
            })
            if (error) throw Error(error.message)
            return data?.id
        } catch (error: any) {
            throw Error(error.message)
        }
    }
}
