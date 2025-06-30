import mailchimp from '@mailchimp/mailchimp_transactional'
import { Job, Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis();
const mctx = mailchimp(process.env.NEXT_PUBLIC_MAILCHIMP_API_KEY!);

export type AppointmentReminderData = {
    businessId: string;
    businessName?: string;
    appointmentId: string;
    client_metadata: Object;
    service_data: Service;
    appointmentData: {
        start: string;
        end: string;
    }
}

// Create appointment reminder queue
export const appointmentReminders = new Queue('appointmentReminders', { connection });

// Create workers
const sendReminders = new Worker('sendReminder', async (job: Job) => {
    const reminderData: AppointmentReminderData = job.data;
    // Send email and/or SMS appointment reminder
    try {
        const response = await mctx.messages.sendTemplate({ //TODO: Change template and template data
            template_name: 'appointment-reminder',
            template_content: [],
            message: {
                subject: 'Appointment Reminder',
                from_email: 'notifications@afroallure.co',
                from_name: "notifications@afroallure.co",
                to: [{
                    email: 'abijahnesbitt@afroallure.co',
                    type: 'to'
                }],
                "global_merge_vars": [
                    {
                        name: "stylist_name",
                        content: "LadyPlutoLooks" // Insert stylist name
                    },
                    {
                        name: "appointment_date",
                        content: '' // Format Appointment Date
                    },
                    {
                        name: "appointment_time",
                        content: '' // Format Appointment Time
                    },
                    {
                        name: "business_address",
                        content: '' // Insert Business Address
                    },
                    {
                        name: "service_name",
                        content: reminderData.service_data.name // Format Appointment Date
                    },
                    {
                        name: "appointment_id",
                        content: `${reminderData.appointmentId}` // Insert stylist name
                    },
                    {
                        name: "business_id",
                        content: `${reminderData.businessId}` // Insert stylist name
                    },
                    // /appointment/*|APPOINTMENT_ID/business/*|BUSINESS_ID|*/confirm
                    {
                        name: "facebook_url",
                        content: '' // Format Appointment Date
                    },
                    {
                        name: "instagram_url",
                        content: 'https://www.instagram.com/afroallure_/' // Format Appointment Date
                    },
                    {
                        name: "twitter_url",
                        content: '' // Format Appointment Date
                    },
                ],

            }
        })
        return true
    } catch (error) {

    }
}, {
    connection,
})

sendReminders.on('error', err => {
    console.log(err)
})
