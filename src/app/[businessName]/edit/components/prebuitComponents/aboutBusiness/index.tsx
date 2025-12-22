import { SlotComponent } from "@measured/puck"
import { aboutSectionFields } from "./fields"

export const AboutBusinessComponent: any = {
    fields: aboutSectionFields,
    defaultProps: {
        sectionOne: [{
            type: 'Container',
            props: {
                padding: 2,
                margin: 0,
                marginExpanded: false,
                marginTop: 0,
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                paddingExpanded: false,
                paddingRight: 2,
                paddingLeft: 2,
                paddingTop: 2,
                paddingBottom: 2,
                flexDirection: 'flex-row',
                mainAxisLayout: 'center',
                altAxisLayout: 'start',
                borderWidth: 0,
                backgroundColor: '#fff',
                content: [{
                    type: 'BodyMedium',
                    props: {
                        text: 'Aute Lorem id veniam aliqua aliqua nulla. Qui qui laboris excepteur laborum labore minim sit duis eiusmod pariatur in quis aliquip. Ipsum in mollit enim dolore consectetur nisi laboris cillum cupidatat id consectetur officia incididunt.'
                    }
                },
                ]
            }
        }],
        sectionTwo: []
    },
    render: (({ sectionOne: SectionOne, sectionTwo: SectionTwo }: { sectionOne: SlotComponent, sectionTwo: SlotComponent }) => {
        return (
            <div className="p-10 w-full flex gap-10 lg:flex-row flex-col">
                <div className="lg:w-1/2 w-full">
                    <SectionOne />
                </div>
                <div className="lg:w-1/2 w-full">
                    <SectionTwo />
                </div>
            </div>
        )
    })
}
