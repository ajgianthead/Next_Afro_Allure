import { Footer } from "../../types";
import { Fields } from "@puckeditor/core"

export const footerFields: Fields<Footer, {}> = {
    footer: {
        type: 'slot'

    }
}
