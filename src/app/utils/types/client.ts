import { UUID } from "crypto";

export default interface Client {
    id: string;
    user_id: UUID,
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
}
