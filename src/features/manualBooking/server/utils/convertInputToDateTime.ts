import { DateTime } from "luxon"

export const convertInputToDateTime = (date: Date, start: string, end: string) => {
    const startDateToDateTime = DateTime.fromJSDate(date).set({ hour: Number(start.split(':')[0]), minute: Number(start.split(':')[1]) })
    const endDateToDateTime = DateTime.fromJSDate(date).set({ hour: Number(end.split(':')[0]), minute: Number(end.split(':')[1]) })
    return { startDateToDateTime, endDateToDateTime }
}
