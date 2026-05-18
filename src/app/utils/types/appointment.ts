import { UUID } from "crypto";

export default interface Appointment {
    start: string;
    end: string;
    service_id: UUID;
    client_id: UUID;
    created_at?: Date;
    updated_at?: Date;
}
