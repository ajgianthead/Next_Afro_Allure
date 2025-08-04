'use server'

import { DateTime } from "luxon";

export const formatAppointmentAnalyticalData = async (data: Appointment[]) => {
    const groupedByMonth: Record<string, any[]> = {};

    data?.forEach((appointment) => {
        const monthKey = DateTime.fromISO(appointment.created_at).toFormat('MMMM');

        if (!groupedByMonth[monthKey]) {
            groupedByMonth[monthKey] = [];
        }

        groupedByMonth[monthKey].push(appointment);
    });

    const result = Object.entries(groupedByMonth).map(([month, appointments]) => {
        // Convert "2025-02" => "February"
        const monthName = DateTime.fromFormat(month, 'MMMM').toFormat('LLLL');

        return {
            name: monthName,
            Bookings: appointments.length,
        };
    });
    return result
}
