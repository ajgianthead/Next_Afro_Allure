import { useContext } from "react";
import { BookingDataContext } from "../context/BookingDataContext";

export function useBooking() {
    return useContext(BookingDataContext)
}
