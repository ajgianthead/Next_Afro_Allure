import { Fields } from "@puckeditor/core";
import { Gallery } from "../../types";

export const galleryFields: Fields<Gallery, {}> = {
    gallery: {
        type: 'slot'
    }
}
