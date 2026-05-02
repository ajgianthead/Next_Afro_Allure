'use client'

import React, { useMemo } from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import {
    AlignLeft, Box, ChevronDown, Columns, Grid2X2, ImageIcon,
    LayoutDashboard, Maximize2, MousePointerClick, Move,
    PaintBucket, Play, Rows, Square, Type, Video,
} from 'lucide-react'

// ─── Section definitions ───────────────────────────────────────────────────

interface Section {
    title: string
    icon: React.ReactNode
    fieldNames: string[]
}

const LAYOUT: Section = {
    title: 'Layout',
    icon: <LayoutDashboard size={13} />,
    fieldNames: ['flexDirection', 'mainAxisLayout', 'altAxisLayout', 'grow', 'responsive', 'responsiveDirection', 'hideBelow', 'hideAbove'],
}
const SPACING: Section = {
    title: 'Spacing',
    icon: <Maximize2 size={13} />,
    fieldNames: [
        'gapX', 'gapY',
        'paddingExpanded', 'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
        'marginExpanded', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
        'aspectRatio', 'overflow', 'minHeight', 'maxWidth', 'gridTemplateColumns',
    ],
}
const FILL: Section = {
    title: 'Fill',
    icon: <PaintBucket size={13} />,
    fieldNames: ['backgroundColor'],
}
const BORDER: Section = {
    title: 'Border',
    icon: <Square size={13} />,
    fieldNames: ['borderExpanded', 'borderWidth', 'borderTop', 'borderBottom', 'borderLeft', 'borderRight', 'borderColor', 'borderType'],
}
const RADIUS: Section = {
    title: 'Radius',
    icon: <Square size={13} />,
    fieldNames: ['borderRadiusExpanded', 'borderRadius', 'borderRadiusTopLeft', 'borderRadiusTopRight', 'borderRadiusBottomLeft', 'borderRadiusBottomRight'],
}
const POSITION: Section = {
    title: 'Position',
    icon: <Move size={13} />,
    fieldNames: ['positionType', 'top', 'bottom', 'left', 'right', 'rotation'],
}
const TYPOGRAPHY: Section = {
    title: 'Typography',
    icon: <Type size={13} />,
    fieldNames: ['fontFamily', 'fontSize', 'fontWeight', 'style', 'align', 'color', 'lineHeight', 'letterSpacing', 'textTransform', 'maxWidth'],
}
const CONTENT_TEXT: Section = {
    title: 'Content',
    icon: <AlignLeft size={13} />,
    fieldNames: ['text', 'isLink', 'linkType', 'url', 'sections'],
}

const COMPONENT_SECTIONS: Record<string, Section[]> = {
    CustomizableText: [CONTENT_TEXT, TYPOGRAPHY],
    Container: [LAYOUT, SPACING, FILL, BORDER, RADIUS, POSITION],
    Button: [
        { title: 'Content', icon: <AlignLeft size={13} />, fieldNames: ['text', 'link', 'action', 'variant'] },
        TYPOGRAPHY,
        LAYOUT,
        SPACING,
        FILL,
        BORDER,
        RADIUS,
        POSITION,
    ],
    Image: [
        { title: 'Source', icon: <ImageIcon size={13} />, fieldNames: ['url', 'width', 'objectFit', 'height', 'aspectRatio'] },
        BORDER, RADIUS, POSITION,
    ],
    Video: [
        { title: 'Source', icon: <Video size={13} />, fieldNames: ['url'] },
        { title: 'Playback', icon: <Play size={13} />, fieldNames: ['loop', 'controls', 'autoPlay', 'speed'] },
        { title: 'Size', icon: <Maximize2 size={13} />, fieldNames: ['width', 'height'] },
        BORDER, RADIUS, POSITION,
    ],
    Row: [
        { title: 'Layout', icon: <Rows size={13} />, fieldNames: ['numberOfRows', 'gap', 'justifyItems'] },
    ],
    Column: [
        { title: 'Layout', icon: <Columns size={13} />, fieldNames: ['numberOfColumns', 'gap', 'alignItems'] },
    ],
    Grid: [
        { title: 'Layout', icon: <Grid2X2 size={13} />, fieldNames: ['numberOfColumns', 'numberOfRows', 'gapX', 'gapY', 'justifyItems', 'alignItems', 'firstCellRowSpan'] },
    ],
    Section: [
        { title: 'Settings', icon: <Box size={13} />, fieldNames: ['sectionName'] },
    ],
    Card: [
        { title: 'Content', icon: <AlignLeft size={13} />, fieldNames: ['variant', 'cardCover', 'imageSource', 'videoSource', 'linkToService', 'service'] },
    ],
}

// Text presets share the typography section
const TEXT_PRESET_NAMES = [
    'HeadingOne', 'HeadingTwo', 'HeadingThree', 'HeadingFour',
    'TitleLarge', 'TitleMedium', 'TitleSmall',
    'BodyLarge', 'BodyMedium', 'BodySmall', 'BodyExtraSmall',
]
TEXT_PRESET_NAMES.forEach(name => { COMPONENT_SECTIONS[name] = [CONTENT_TEXT, TYPOGRAPHY] })

// ─── Component labels + icons for the header bar ───────────────────────────

const COMPONENT_META: Record<string, { label: string; icon: React.ReactNode }> = {
    CustomizableText: { label: 'Text', icon: <Type size={13} className="text-slate-500" /> },
    Container: { label: 'Container', icon: <Box size={13} className="text-slate-500" /> },
    Button: { label: 'Button', icon: <MousePointerClick size={13} className="text-slate-500" /> },
    Image: { label: 'Image', icon: <ImageIcon size={13} className="text-slate-500" /> },
    Video: { label: 'Video', icon: <Video size={13} className="text-slate-500" /> },
    Row: { label: 'Row', icon: <Rows size={13} className="text-slate-500" /> },
    Column: { label: 'Column', icon: <Columns size={13} className="text-slate-500" /> },
    Grid: { label: 'Grid', icon: <Grid2X2 size={13} className="text-slate-500" /> },
    Section: { label: 'Section', icon: <Box size={13} className="text-slate-500" /> },
    Card: { label: 'Card', icon: <Box size={13} className="text-slate-500" /> },
    Navbar: { label: 'Navbar', icon: <LayoutDashboard size={13} className="text-slate-500" /> },
    HeadingOne: { label: 'Heading 1', icon: <Type size={13} className="text-slate-500" /> },
    HeadingTwo: { label: 'Heading 2', icon: <Type size={13} className="text-slate-500" /> },
    HeadingThree: { label: 'Heading 3', icon: <Type size={13} className="text-slate-500" /> },
    HeadingFour: { label: 'Heading 4', icon: <Type size={13} className="text-slate-500" /> },
    TitleLarge: { label: 'Title Large', icon: <Type size={13} className="text-slate-500" /> },
    TitleMedium: { label: 'Title Medium', icon: <Type size={13} className="text-slate-500" /> },
    TitleSmall: { label: 'Title Small', icon: <Type size={13} className="text-slate-500" /> },
    BodyLarge: { label: 'Body Large', icon: <Type size={13} className="text-slate-500" /> },
    BodyMedium: { label: 'Body Medium', icon: <Type size={13} className="text-slate-500" /> },
    BodySmall: { label: 'Body Small', icon: <Type size={13} className="text-slate-500" /> },
    BodyExtraSmall: { label: 'Body XS', icon: <Type size={13} className="text-slate-500" /> },
}

// Fields that are compact enough to share a row with a peer
const HALF_WIDTH_FIELDS = new Set([
    'gapX', 'gapY',
    'fontSize', 'fontWeight',
    'lineHeight', 'letterSpacing',
    'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
    'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
    'borderTop', 'borderBottom', 'borderLeft', 'borderRight',
    'borderRadiusTopLeft', 'borderRadiusTopRight',
    'borderRadiusBottomLeft', 'borderRadiusBottomRight',
    'top', 'bottom', 'left', 'right',
    'minHeight', 'maxWidth',
    'height', 'firstCellRowSpan',
])

// ─── SectionPanel ──────────────────────────────────────────────────────────

function SectionPanel({
    section,
    fieldMap,
}: {
    section: Section
    fieldMap: Map<string, React.ReactNode>
}) {
    const rows = section.fieldNames
        .map(name => ({ name, el: fieldMap.get(name) }))
        .filter((r): r is { name: string; el: React.ReactNode } => r.el != null)

    if (rows.length === 0) return null

    return (
        <Accordion.Item
            value={section.title}
            className="border-b border-slate-100 last:border-0"
        >
            <Accordion.Header>
                <Accordion.Trigger className="flex w-full items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors [&[data-state=open]>svg]:rotate-180">
                    <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        <span className="text-slate-400">{section.icon}</span>
                        {section.title}
                    </span>
                    <ChevronDown className="size-3 shrink-0 text-slate-300 transition-transform duration-200" />
                </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 px-3 pb-2 pt-0.5">
                    {rows.map(({ name, el }) => (
                        <div key={name} className={HALF_WIDTH_FIELDS.has(name) ? '' : 'col-span-2'}>
                            {el}
                        </div>
                    ))}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    )
}

// ─── Main Settings component ───────────────────────────────────────────────

interface SettingsProps {
    fields: React.ReactNode[]
    componentName: string
}

function Settings({ fields, componentName }: SettingsProps) {
    // Build a name → element map. Puck sets field keys; React.Children.toArray
    // prefixes them with ".$", so ".$fieldName" → strip to "fieldName".
    const fieldMap = useMemo(() => {
        const map = new Map<string, React.ReactNode>()
        fields.forEach(f => {
            if (React.isValidElement(f) && f.key) {
                const name = String(f.key).replace(/^\.\$?/, '')
                if (name) map.set(name, f)
            }
        })
        return map
    }, [fields])

    const sections = COMPONENT_SECTIONS[componentName]
    const meta = COMPONENT_META[componentName] ?? { label: componentName, icon: <Box size={13} className="text-slate-500" /> }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="size-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                    {meta.icon}
                </div>
                <span className="text-sm font-semibold text-slate-700 leading-none">{meta.label}</span>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto">
                {sections ? (
                    <Accordion.Root
                        type="multiple"
                        defaultValue={sections.map(s => s.title)}
                    >
                        {sections.map(section => (
                            <SectionPanel
                                key={section.title}
                                section={section}
                                fieldMap={fieldMap}
                            />
                        ))}
                    </Accordion.Root>
                ) : (
                    // Fallback for Navbar and other unmapped components
                    <div className="flex flex-col gap-1.5 px-3 py-3">
                        {fields}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Settings
