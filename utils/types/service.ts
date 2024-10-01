import { UUID } from "crypto";

export interface AddOn {
    id: string;
    name: string;
    price: string;
}

export interface Service {
    id: string;
    name: string;
    price: string;
    description: string;
    addOns: Array<AddOn> | undefined;
    length: string;
    imageURL: string | undefined
}
