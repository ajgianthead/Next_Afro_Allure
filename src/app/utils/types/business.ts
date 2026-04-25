import { UUID } from "crypto";
import { Service } from "./service";
import Client from "./client";
import Appointment from "./appointment";
import Availability from "./availability";

export default interface Business {
    id: UUID;
    user_id: UUID;
    business_name: string;
    url: string;
    services: Array<Service>;
    clients: Array<Client>;
    appointments: Array<Appointment>;
    availabilities: Array<Availability>;
    booking_policies: Object;
    stripe_acc_id: string;
    email: string;
}
