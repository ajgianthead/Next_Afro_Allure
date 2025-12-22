import { SlotComponent } from "@measured/puck"
import { cardFields } from "./fields"


export const CardComponent: any = {
    fields: cardFields,
    render: (({ card: Card }: { card: SlotComponent }) => {
        return (
            <div>
                <Card />
            </div>

        )
    }),
    defaultProps: {
        card: [{
            type: 'Container',
            props: {
                gapX: 0,
                gapY: 3,
                draggable: true,
                padding: 1,
                borderRadiusExpanded: 'false',
                borderRadiusTopLeft: 0,
                borderRadiusTopRight: 0,
                borderRadiusBottomLeft: 0,
                borderRadiusBottomRight: 0,
                paddingExpanded: "false",
                marginExpanded: "false",
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                marginTop: 0,
                margin: 0,
                paddingBottom: 2,
                paddingLeft: 2,
                paddingRight: 2,
                paddingTop: 2,
                backgroundColor: '#fff',
                borderColor: '#eee',
                borderRadius: 8,
                borderWidth: 1,
                borderBottom: 0,
                borderExpanded: 'false',
                borderLeft: 0,
                borderRight: 0,
                borderTop: 0,
                numOfCols: 3,
                numOfRows: 3,
                borderType: 'solid',
                positionType: 'relative',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                responsive: true,
                flexDirection: 'flex-col',
                mainAxisLayout: 'start',
                altAxisLayout: 'start',
                content: [
                    {
                        type: 'HeadingOne',
                        props: {

                            text: 'Title'
                        }
                    },
                    {
                        type: 'TitleLarge',
                        props: {

                            text: 'Subtitle'
                        }
                    },
                    {
                        type: 'BodyMedium',
                        props: {

                            text: 'Description'
                        }
                    },
                ]
            }
        }]
    }
}
