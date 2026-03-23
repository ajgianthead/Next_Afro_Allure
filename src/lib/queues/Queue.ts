import { task, Task as TriggerTask, runs } from "@trigger.dev/sdk/v3";

interface ReminderProps {
    serviceName: string;
    delay: string;
    appointmentData: {
        id: string;
        start: string;
        end: string;
    }
    businessData: {
        id: string;
        name: string;
        email: string;
        address: string
    },
    clientData: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    }
}

interface PaymentLinkProps {
    clientData: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    }
    businessData: {
        id: string;
        name: string;
        email: string;
    },
    serviceName: string;
    appointmentID: string;
}

type TaskID = 'remind-appointment-business' | 'remind-appointment-client' | 'send-payment-link'

export class Task {
    constructor(
        public task: TriggerTask<string, ReminderProps | PaymentLinkProps | {
            appointmentId: string
        }, void>,
        public triggered: boolean
    ) { }
    static async create(id: TaskID, callback: (payload: ReminderProps | PaymentLinkProps | {
        appointmentId: string
    }) => Promise<string>) {
        const res = task({
            id: id,
            maxDuration: 300,
            run: async (payload: ReminderProps | PaymentLinkProps | {
                appointmentId: string
            }) => {
                await callback(payload)
            },
        });
        return new Task(res, false)
    }
    static async rescedule(triggerId: string, delay: Date) {
        try {
            const { status, id, error } = await runs.reschedule(triggerId, { delay: delay })
            if (error) throw Error(error.message)
            return status
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async cancel(triggerId: string) {
        try {
            const { id } = await runs.cancel(triggerId)
            return id
        } catch (error: any) {
            throw Error(error.message)
        }
    }

    async triggerPaymentLink(payload: PaymentLinkProps, delay: Date) {
        try {
            if (this.triggered) throw Error('Task already triggered. To update the trigger, reschedule the delay.')
            if (this.task.id === 'send-payment-link') {
                const { id: triggerId } = await this.task.trigger(payload, {
                    delay: delay
                })
                this.triggered = true
                return triggerId
            } else {
                throw Error('Cannot use the method on this type of task')
            }
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async triggerBusinessAppointmentReminder(payload: ReminderProps, delay: Date) {
        try {
            if (this.triggered) throw Error('Task already triggered. To update the trigger, reschedule the delay.')
            if (this.task.id === 'remind-appointment-business') {
                const { id: triggerId } = await this.task.trigger(payload, {
                    delay: delay
                })
                this.triggered = true
                return triggerId
            } else {
                throw Error('Cannot use the method on this type of task')
            }
        } catch (error: any) {
            throw Error(error.message)
        }

    }
    async triggerClientAppointmentReminder(payload: ReminderProps, delay: Date) {
        try {
            if (this.triggered) throw Error('Task already triggered. To update the trigger, reschedule the delay.')
            if (this.task.id === 'remind-appointment-client') {
                const { id: triggerId } = await this.task.trigger(payload, {
                    delay: delay
                })
                this.triggered = true
                return triggerId
            } else {
                throw Error('Cannot use the method on this type of task')
            }
        } catch (error: any) {
            throw Error(error.message)
        }
    }
    async triggerPaymentCheck(payload: {
        appointmentId: string
    }, delay: Date) {
        try {
            if (this.triggered) throw Error('Task already triggered. To update the trigger, reschedule the delay.')
            if (this.task.id === 'checkPaymentStatus') {
                const { id: triggerId } = await this.task.trigger(payload, {
                    delay: delay
                })
                this.triggered = true
                return triggerId
            } else {
                throw Error('Cannot use the method on this type of task')
            }
        } catch (error: any) {
            throw Error(error.message)
        }
    }

}

