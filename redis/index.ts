import { Queue } from 'bullmq';

export const redisConnection = {
    host: '127.0.0.1',
    port: 6379,
    password: "123456"
}

export const addToReminderQueue = async (businessId: string, appointmentId: string, appointmentData: Appointment) => {
    const appointmentEndTime = new Date(appointmentData.end).getTime()
    const currentTime = Date.now()
    const reminderOffset =  15 * 60 * 1000;
    const delay =  appointmentEndTime - reminderOffset - currentTime;
    const queue = new Queue(`reminder`)
    await queue.add(`appointment-${appointmentId}`, {
        businessId,
        appointmentId
    }, { delay })
    return 'Reminder added to queue'
}

export const editDelayReminderQueue = async (businessId: string, appointmentId: string, appointmentData: any) => {
    const appointmentEndTime = new Date(appointmentData.end).getTime()
    const currentTime = Date.now()
    const reminderOffset =  15 * 60 * 1000;
    const delay =  appointmentEndTime - reminderOffset - currentTime;
    const queue = new Queue(`reminder`)
    const job = await queue.getJob(appointmentData.jobId)
    await job.changeDelay(delay)
    return 'Job delay changed'
}

export const deleteJobFromQueue = async (jobId: string) => {
    const queue = new Queue(`reminder`)
    const job = await queue.getJob(jobId)
    await job.remove()
    return 'Job deleted'
}
