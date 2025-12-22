import { SlotComponent } from "@measured/puck"
import { heroSectionFields } from "./fields"

export const HeroSectionComponent: any = {
    fields: heroSectionFields,
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
                flexDirection: 'flex-col',
                mainAxisLayout: 'center',
                altAxisLayout: 'start',
                borderWidth: 0,
                gap: 10,
                backgroundColor: '#fff',
                content: [{
                    type: 'HeadingOne',
                    props: {
                        text: 'Title',
                    }
                }, {
                    type: 'BodyMedium',
                    props: {
                        text: 'In ullamco cupidatat ea reprehenderit. Nisi esse commodo esse dolore veniam elit. Nisi elit eu proident ea pariatur est. Amet do amet sint aliquip eu aute velit esse mollit non. Ut quis dolor non adipisicing.'
                    }
                },
                {
                    type: 'Button',
                    props: {
                        text: 'Call to Action'
                    }
                }]
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
