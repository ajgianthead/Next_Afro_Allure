import { Fields } from "@measured/puck";
import { Card } from "../../types";

export const cardFields: Fields<Card, {}> = {
    card: {
        type: 'slot'
    }
}
