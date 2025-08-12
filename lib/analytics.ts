'use server'
import fetch from 'node-fetch'
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { google } from '@google-analytics/data/build/protos/protos';

type Params = {
    businessId: string;
    serviceId: string;
    serviceName: string;
    servicePrice: number;
    appointmentType: string;
    reason?: string;
}

const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: JSON.parse(process.env.GOOGLE_ANALYTICS_KEY!.split(String.raw`\\n`).join('\\n'))
})

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const API_SECRET = process.env.NEXT_PUBLIC_ANALYTICS_API_SECRET
const GA_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`

const propertyId = process.env.NEXT_PUBLIC_ANALYTICS_PROPERTY_ID;

export type ReportFilters = {
    businessId?: string;
    eventName?: string; // Ex. appointment_booked
    dateRanges: {
        startDate: string;
        endDate: string;
    }[]
    businessName?: string;
}


export type GA4ReportRow = {
    [key: string]: string | number;
};

export async function formatGA4Report(response: google.analytics.data.v1beta.IRunReportResponse) {
    const dimensionHeaders = response.dimensionHeaders?.map((d: any) => d.name) || [];
    const metricHeaders = response.metricHeaders?.map((m: any) => m.name) || [];

    return (response.rows || []).map((row: any) => {
        const formatted: GA4ReportRow = {};

        row.dimensionValues.forEach((dim: any, i: any) => {
            formatted[dimensionHeaders[i]] = dim.value;
        });

        row.metricValues.forEach((metric: any, i: any) => {
            formatted[metricHeaders[i]] = parseFloat(metric.value);
        });

        return formatted;
    });
}

export async function runCancelledReasonReport(filters: ReportFilters) {
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dimensions: [
            { name: 'customEvent:reason' }
        ],
        metrics: [
            { name: 'eventCount' }
        ],
        dimensionFilter: {
            filter: {
                fieldName: 'eventName',
                stringFilter: {
                    value: 'appointment_cancelled',
                    matchType: 'EXACT',
                },
            },
        },
        dateRanges: [
            ...filters.dateRanges
        ],
    });
    return response;
}

export async function runTrafficSourceReport(filters: ReportFilters) {
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dimensions: [
            { name: 'sessionSource' },
            { name: 'sessionMedium' },
            { name: 'pagePath' },
        ],
        metrics: [
            { name: 'activeUsers' }
        ],
        dimensionFilter: {
            filter: {
                fieldName: 'pagePath',
                stringFilter: {
                    value: `/${filters.businessName}`,
                    matchType: 'EXACT',
                },
            },
        },
        dateRanges: [
            ...filters.dateRanges
        ],
    });

    return formatGA4Report(response)
}

// Page Views
export async function runPageViewReport(filters: ReportFilters) {
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dimensions: [
            { name: 'customEvent:business_slug' }, // must match exactly your custom dimension name
        ],
        metrics: [
            { name: 'eventCount' },
        ],
        dimensionFilter: {
            andGroup: {
                expressions: [
                    {
                        filter: {
                            fieldName: 'eventName',
                            stringFilter: {
                                value: 'business_page_view',
                                matchType: 'EXACT',
                            },
                        },
                    },
                    {
                        filter: {
                            fieldName: 'customEvent:business_slug',
                            stringFilter: {
                                value: filters.businessName,
                                matchType: 'EXACT',
                            },
                        },
                    },
                ],
            },
        },
        dateRanges: filters.dateRanges,
    });
    return formatGA4Report(response);
}

// Could be used for appointment_booked, appointment_completed, appointment_cancelled, etc.
export async function runTotalReport(filters: ReportFilters) {
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dimensions: [
            { name: 'customEvent:business_id' },
            { name: 'eventName' },
        ],
        metrics: [{ name: 'eventCount' }],
        dateRanges: [
            ...filters.dateRanges
        ],
        dimensionFilter: {
            andGroup: {
                expressions: [
                    {
                        filter: {
                            fieldName: 'eventName',
                            stringFilter: {
                                value: filters.eventName,
                                matchType: 'EXACT',
                            },
                        },
                    },
                    {
                        filter: {
                            fieldName: 'customEvent:business_id',
                            stringFilter: {
                                value: filters.businessId,
                                matchType: 'EXACT',
                            },
                        },
                    },
                ],
            },
        },
    })
    return formatGA4Report(response);

}

// Give # of appointment_booked byt each service
export async function runServiceReport(filters: ReportFilters) {
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dimensions: [
            { name: 'customEvent:service_name' },
        ],
        metrics: [{ name: 'eventCount' }],
        dateRanges: [
            ...filters.dateRanges
        ],
        dimensionFilter: {
            andGroup: {
                expressions: [
                    {
                        filter: {
                            fieldName: 'eventName',
                            stringFilter: {
                                value: 'appointment_booked',
                                matchType: 'EXACT',
                            },
                        },
                    },
                    {
                        filter: {
                            fieldName: 'customEvent:business_id',
                            stringFilter: {
                                value: filters.businessId,
                                matchType: 'EXACT',
                            },
                        },
                    },
                ],
            },
        },
    })

    return response.rows?.map(row => ({
        serviceId: row.dimensionValues?.[0]?.value,
        bookings: Number(row.metricValues?.[0]?.value),
    })) ?? [];
}


// EVENT TRACKING


export const trackAppointmentBooked = async (data: Params) => {
    const payload = {
        client_id: crypto.randomUUID(), // or a random UUID if you don't have this
        events: [
            {
                name: 'appointment_booked',
                params: {
                    business_id: data.businessId,
                    service_id: data.serviceId,
                    service_price: data.servicePrice,
                    type: data.appointmentType,
                    debug_mode: true,
                },
            },
        ],
    }
    const res = await fetch(GA_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        console.error('Failed to send GA event', await res.text())
    }
    console.log(res);

    return res
}

export const trackAppointmentRescheduled = async (data: Params) => {
    const payload = {
        client_id: crypto.randomUUID(), // or a random UUID if you don't have this
        events: [
            {
                name: 'appointment_rescheduled',
                params: {
                    business_id: data.businessId,
                    service_id: data.serviceId,
                    type: data.appointmentType,
                    debug_mode: true
                },
            },
        ],
    }
    const res = await fetch(GA_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        console.error('Failed to send GA event', await res.text())
    }
    return res
}

export const trackAppointmentCancelled = async (data: Params) => {
    const payload = {
        client_id: crypto.randomUUID(), // or a random UUID if you don't have this
        events: [
            {
                name: 'appointment_cancelled',
                params: {
                    business_id: data.businessId,
                    service_id: data.serviceId,
                    type: data.appointmentType,
                    debug_mode: true,
                    reason: data.reason
                },
            },
        ],
    }
    const res = await fetch(GA_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        console.error('Failed to send GA event', await res.text())
    }
    return res
}

export const trackAppointmentCompletion = async (data: Params) => {
    const payload = {
        client_id: crypto.randomUUID(), // or a random UUID if you don't have this
        events: [
            {
                name: 'appointment_completed',
                params: {
                    business_id: data.businessId,
                    service_id: data.serviceId,
                    type: data.appointmentType,
                    debug_mode: true,
                    reason: data.reason
                },
            },
        ],
    }
    const res = await fetch(GA_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        console.error('Failed to send GA event', await res.text())
    }
    return res
}

export const trackAppointmentAbadonment = async (data: Params) => {
    const payload = {
        client_id: crypto.randomUUID(), // or a random UUID if you don't have this
        events: [
            {
                name: 'appointment_abandoned',
                params: {
                    business_id: data.businessId,
                    service_id: data.serviceId,
                    type: data.appointmentType,
                    debug_mode: true,
                    reason: data.reason
                },
            },
        ],
    }
    const res = await fetch(GA_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        console.error('Failed to send GA event', await res.text())
    }
    return res
}
