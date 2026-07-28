import { ColorPicker, NumInput } from "../../fieldPrimitives";
import { GradientField } from "../../container/fields";

export const ButtonLinkDefaultProps = {
    fontSize: 1,
    fontWeight: 400,
    letterSpacing: 1.2,
    lineHeight: 1.5,
    color: '#000000',
    style: [],
    fontFamily: 'Inter',
    align: 'start',
    gapX: 0,
    variant: 'solid',
    gapY: 0,
    padding: 0,
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
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    backgroundColor: '#fff',
    borderColor: '#000000',
    borderRadius: 0,
    borderWidth: 0,
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
    flexDirection: 'flex-row',
    mainAxisLayout: 'start',
    altAxisLayout: 'center',
}

const lbl = { fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' as const, minWidth: 56, flexShrink: 0 }
const row = { display: 'flex', alignItems: 'center', gap: 6 }

export const navbarFields = {
    logo: { type: 'slot' },
    menu: {
        label: 'Navigation Menu',
        type: "array",
        arrayFields: {
            item: { type: 'slot' }
        },
        getItemSummary(item: any, index: number) {
            if (item.item) return item.item[0].props.text
        },
        defaultItemProps: {
            item: [{
                type: 'Button',
                props: {
                    action: 'REDIRECT',
                    text: 'Link',
                    link: '/',
                    ...ButtonLinkDefaultProps
                },
            }],
        },
    },
    backgroundColor: {
        type: 'custom',
        label: 'Background',
        render: ({ value, onChange }: any) => <GradientField value={value ?? 'transparent'} onChange={onChange} />,
    },
    paddingTop: {
        type: 'custom',
        label: 'Padding Top',
        render: ({ value, onChange }: any) => (
            <div style={row}>
                <span style={lbl}>Pad Top</span>
                <NumInput value={value ?? 1.25} onChange={onChange} step={0.25} allowNegative={false} className="flex-1" />
                <span style={{ fontSize: 11, color: '#A09790' }}>rem</span>
            </div>
        ),
    },
    paddingBottom: {
        type: 'custom',
        label: 'Padding Bottom',
        render: ({ value, onChange }: any) => (
            <div style={row}>
                <span style={lbl}>Pad Bot</span>
                <NumInput value={value ?? 1.25} onChange={onChange} step={0.25} allowNegative={false} className="flex-1" />
                <span style={{ fontSize: 11, color: '#A09790' }}>rem</span>
            </div>
        ),
    },
    paddingLeft: {
        type: 'custom',
        label: 'Padding Left',
        render: ({ value, onChange }: any) => (
            <div style={row}>
                <span style={lbl}>Pad Left</span>
                <NumInput value={value ?? 2} onChange={onChange} step={0.25} allowNegative={false} className="flex-1" />
                <span style={{ fontSize: 11, color: '#A09790' }}>rem</span>
            </div>
        ),
    },
    paddingRight: {
        type: 'custom',
        label: 'Padding Right',
        render: ({ value, onChange }: any) => (
            <div style={row}>
                <span style={lbl}>Pad Right</span>
                <NumInput value={value ?? 2} onChange={onChange} step={0.25} allowNegative={false} className="flex-1" />
                <span style={{ fontSize: 11, color: '#A09790' }}>rem</span>
            </div>
        ),
    },
    borderBottomWidth: {
        type: 'custom',
        label: 'Border Bottom',
        render: ({ value, onChange }: any) => (
            <div style={row}>
                <span style={lbl}>Border Bot</span>
                <NumInput value={value ?? 0} onChange={onChange} step={1} allowNegative={false} className="flex-1" />
                <span style={{ fontSize: 11, color: '#A09790' }}>px</span>
            </div>
        ),
    },
    borderColor: {
        type: 'custom',
        label: 'Border Color',
        render: ({ value, onChange }: any) => (
            <div style={row}>
                <span style={lbl}>Border Color</span>
                <ColorPicker value={value ?? '#E8E2D6'} onChange={onChange} className="flex-1" />
            </div>
        ),
    },
}
