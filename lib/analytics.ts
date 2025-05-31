'use server'
import fetch from 'node-fetch'
import { BetaAnalyticsDataClient } from '@google-analytics/data';

type Params = {
    userId: string;
    businessId: string;
    serviceId: string;
    appointmentType: string;
    reason?: string;
}

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: './config/analytics-key.json', // ← this is the keyFilename
})

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const API_SECRET = process.env.NEXT_PUBLIC_ANALYTICS_API_SECRET
const GA_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`

const propertyId = process.env.NEXT_PUBLIC_ANALYTICS_PROPERTY_ID;

export type ReportFilters = {
    businessId?: string;
    eventName?: string; // Ex. appointment_booked
    startDate?: string; // Ex. 2025-05-03 - So the start of a month and the end of another
    endDate?: string; // Or NdaysAgo,
    businessName?: string;
}

export async function runTrafficSourceReport(filters: ReportFilters){
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
        dateRanges: [{ startDate: filters.startDate, endDate: filters.endDate }],
    });
    
    return response
}

// Page Views
export async function runPageViewReport(filters: ReportFilters){
    const [response] = await analyticsDataClient.runReport({
  property: `properties/${propertyId}`,
  dimensions: [
    { name: 'hostName' },
    { name: 'pagePath' },
  ],
  metrics: [
    { name: 'activeUsers' },
  ],
  dimensionFilter: {
    andGroup: {
      expressions: [
        {
          filter: {
            fieldName: 'hostName',
            stringFilter: {
              value: 'afroallure.co',
              matchType: 'EXACT',
            },
          },
        },
        {
          filter: {
            fieldName: 'pagePath',
            stringFilter: {
              value: `/${filters.businessName}`,
              matchType: 'EXACT',
            },
          },
        },
      ],
    },
  },
  dateRanges: [{ startDate: filters.startDate, endDate: filters.endDate }],
});
return response
}

// Could be used for appointment_booked, appointment_completed, appointment_cancelled, etc.
export async function runTotalReport(filters: ReportFilters) {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dimensions: filters.eventName === 'appointment_cancelled' ? [
      { name: 'customEvent:businessId' },
      { name: 'eventName' },
      { name: 'customEvent:reason'}
    ] : [
      { name: 'customEvent:businessId' },
      { name: 'eventName' },
        ] ,
    metrics: [{ name: 'eventCount' }],
    dateRanges: [{ startDate: filters.startDate, endDate: filters.endDate }],
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
              fieldName: 'customEvent:businessId',
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

  return Number(response.rows?.[0]?.metricValues?.[0]?.value ?? 0);

}

// Give # of appointment_booked byt each service
export async function runServiceReport(filters: ReportFilters) {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dimensions: [
      { name: 'customEvent:serviceId' },
    ],
    metrics: [{ name: 'eventCount' }],
    dateRanges: [{ startDate: filters.startDate, endDate: filters.endDate }],
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
              fieldName: 'customEvent:businessId',
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
        client_id: data.userId, // or a random UUID if you don't have this
        events: [
            {
                name: 'appointment_booked',
                params: {
                business_id: data.businessId,
                service_id: data.serviceId,
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
    return res
}

export const trackAppointmentRescheduled = async (data: Params) => {    
    const payload = {
        client_id: data.userId, // or a random UUID if you don't have this
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
        client_id: data.userId, // or a random UUID if you don't have this
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

export const trackAppointmentAbadonment = async (data: Params) => {    
    const payload = {
        client_id: data.userId, // or a random UUID if you don't have this
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
