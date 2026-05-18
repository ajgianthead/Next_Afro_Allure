"use server"

import { createClient } from "@/app/utils/supabase/server";
import { BookingSessionData } from "../types";
import { attachPaymentIntent, createBookingSession, getBookingSession, updateBookingSession } from "./domain";
import { DateTime } from "luxon";
import { Addon } from "@/lib/addons/AddOn";

// Function to check if data has already been updated
// Update the booking data context after each session update
// Create react hook to store the functions for all of this

// Get the session and store it in local storage
export const createBookingSessionAction = async (businessId: string, serviceId: string) => {
    try {
        const newSession = await createBookingSession({
            selectDateTime: null,
            clientInfo: {
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: ""
            },
            paymentIntentId: null,
            confirmedAt: null,
            expiresAt: DateTime.now().plus({ hours: 1 }).toISO(),
            serviceId: serviceId,
            businessId: businessId,
            status: 'initiated',
            currency: 'usd',
            amountDue: null,
            metaData: {},
            updatedAt: DateTime.now().toISO(),
        });
        return newSession;

    } catch (error: any) {
        throw new Error(error.message);
    }
}

export const getTotalAmountDue = async (selectedAddons: string[], serviceId: string) => {
    try {
        const supabase = await createClient()
        const { data: serviceData, error: serviceError } = await supabase.from('services').select('price').eq('id', serviceId).single()
        if (serviceError) throw new Error(serviceError.message)
        const servicePrice = serviceData?.price || 0
        let addOnPrice = 0;
        for (const addOnId of selectedAddons) {
            // Fetch addon data and sum up the prices
            const addon = await Addon.fetchById(supabase, addOnId) as Addon
            addOnPrice += addon.price
        }

        return servicePrice + addOnPrice;

    } catch (error: any) {
        throw new Error(error.message);
    }
}


export const updateDateTimeAction = async (sessionId: string, dateTime: string) => {
    try {
        const session = await getBookingSession(sessionId);
        if (!session) throw new Error("Session not found");
        const updatedSession = await updateBookingSession({
            id: session.id,
            businessId: session.businessId,
            serviceId: session.serviceId,
            selectDateTime: dateTime,
            clientInfo: session.clientInfo as any,
            status: 'date_selected',
            metaData: session.metaData ?? {},
            amountDue: session.amountDue,
            currency: 'usd',
            updatedAt: DateTime.now().toISO(),
            expiresAt: session.expiresAt,
            confirmedAt: session.confirmedAt,
            paymentIntentId: session.paymentIntentId
        });
        return updatedSession;
    } catch (error: any) {
        throw new Error(error.message);
    }
}
export const updateClientInfoAction = async (sessionId: string, clientInfo: BookingSessionData['clientInfo']) => {
    try {
        const session = await getBookingSession(sessionId);
        if (!session) throw new Error("Session not found");
        const updatedSession = await updateBookingSession({
            id: session.id,
            businessId: session.businessId,
            serviceId: session.serviceId,
            selectDateTime: session.selectDateTime,
            clientInfo: {
                firstName: clientInfo!.firstName,
                lastName: clientInfo!.lastName,
                email: clientInfo!.email,
                phoneNumber: clientInfo!.phoneNumber
            },
            status: 'details_completed',
            metaData: {},
            amountDue: session.amountDue,
            currency: 'usd',
            updatedAt: DateTime.now().toISO(),
            expiresAt: session.expiresAt,
            confirmedAt: session.confirmedAt,
            paymentIntentId: session.paymentIntentId
        });
        return updatedSession;
    } catch (error: any) {
        throw new Error(error.message);
    }
}
export const createPaymentIntentAction = async (sessionId: string, selectedService: string, selectedAddons: string[]) => {
    try {
        const session = await attachPaymentIntent(sessionId, selectedService, selectedAddons);
        return session;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export const confirmBookingSessionAction = async (sessionId: string) => {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('booking_sessions')
            .update({ status: 'confirmed', confirmed_at: DateTime.now().toISO() })
            .eq('id', sessionId)
        if (error) throw new Error(error.message)
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const getBookingSessionAction = async (id: string) => {
    try {
        return await getBookingSession(id);
    } catch (error: any) {
        throw new Error(error.message);
    }
}

