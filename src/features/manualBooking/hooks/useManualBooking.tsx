import { useContext } from "react";
import { ManualBookingContext } from "../context/ManualBookingContext";
import { ManualBookingData } from "../types";

export function useManualBooking() {
    return useContext(ManualBookingContext)
}
