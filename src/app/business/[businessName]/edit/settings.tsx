
'use client'

import React, { useMemo } from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import * as Popover from '@radix-ui/react-popover'
import {
    AlignLeft, Box, ChevronDown, Columns, Grid2X2, ImageIcon,
    Info, LayoutDashboard, Maximize2, MousePointerClick, Move,
    PaintBucket, Play, Rows, Smartphone, Square, Type, Video,
} from 'lucide-react'

// ─── Info copy for specific fields ─────────────────────────────────────────

const FIELD_INFO: Record<string, string> = {
    objectFit: 'Cover fills and crops the image to fill the space. Contain shows the full image with empty space. Fill stretches it to fit exactly.',
    zIndex: 'Controls which elements appear in front of others. Higher numbers appear on top of lower numbers.',
    padding: 'Space inside the element, between the content and the border.',
    paddingExpanded: 'Space inside the element, between the content and the border.',
    margin: 'Space outside the element that pushes other elements away.',
    marginExpanded: 'Space outside the element that pushes other elements away.',
    firstCellColumnSpan: 'How many grid columns wide this cell should be. On mobile, columns stack to full width.',
    firstCellRowSpan: 'How many grid rows tall this cell should be.',
}

// ─── InfoBubble ─────────────────────────────────────────────────────────────

function InfoBubble({ text }: { text: string }) {
    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button
                    type="button"
                    className="shrink-0 rounded-full flex items-center justify-center hover:text-[#1A1818] transition-colors"
                    style={{ color: '#C9B89A' }}
                    aria-label="More info"
                >
                    <Info size={11} />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    side="top"
                    align="start"
                    sideOffset={4}
                    className="z-[9999] max-w-[220px] rounded-lg px-3 py-2 text-[12px] leading-relaxed shadow-lg"
                    style={{
                        backgroundColor: '#1A1818',
                        color: '#FAF7F2',
                        border: '1px solid rgba(250,247,242,0.1)',
                    }}
                >
                    {text}
                    <Popover.Arrow style={{ fill: '#1A1818' }} />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}

// ─── Section definitions ───────────────────────────────────────────────────

interface Section {
    title: string
    icon: React.ReactNode
    fieldNames: string[]
    collapsedByDefault?: boolean
}

const MOBILE_RESPONSIVE: Section = {
    title: 'Mobile',
    icon: <Smartphone size={12} />,
    fieldNames: ['size', 'spacing', 'mobileLayout', 'mobileWidth', 'mobileVisibility'],
}

const LAYOUT: Section = {
    title: 'Layout',
    icon: <LayoutDashboard size={12} />,
    fieldNames: ['flexDirection', 'mainAxisLayout', 'altAxisLayout', 'grow', 'responsiveDirection', 'hideBelow', 'hideAbove'],
}

const SPACING: Section = {
    title: 'Spacing',
    icon: <Maximize2 size={12} />,
    fieldNames: [
        'gapX', 'gapY',
        'paddingExpanded',
        'marginExpanded',
        'aspectRatio', 'overflow', 'minHeight', 'maxWidth', 'gridTemplateColumns',
    ],
}

const FILL: Section = {
    title: 'Colors',
    icon: <PaintBucket size={12} />,
    fieldNames: ['backgroundColor'],
}

const BORDER: Section = {
    title: 'Border',
    icon: <Square size={12} />,
    fieldNames: ['borderExpanded'],
}

const RADIUS: Section = {
    title: 'Radius',
    icon: <Square size={12} />,
    fieldNames: ['borderRadiusExpanded'],
}

const POSITION: Section = {
    title: 'Advanced',
    icon: <Move size={12} />,
    fieldNames: ['positionType', 'rotation', 'zIndex'],
    collapsedByDefault: true,
}

const TYPOGRAPHY: Section = {
    title: 'Typography',
    icon: <Type size={12} />,
    fieldNames: ['fontFamily', 'fontSize', 'fontWeight', 'style', 'align', 'color', 'lineHeight', 'letterSpacing', 'textTransform', 'maxWidth'],
}

const CONTENT_TEXT: Section = {
    title: 'Content',
    icon: <AlignLeft size={12} />,
    fieldNames: ['text', 'isLink', 'linkType', 'url', 'sections'],
}

const COMPONENT_SECTIONS: Record<string, Section[]> = {
    CustomizableText: [MOBILE_RESPONSIVE, CONTENT_TEXT, TYPOGRAPHY],
    Container: [MOBILE_RESPONSIVE, LAYOUT, SPACING, FILL, BORDER, RADIUS, POSITION],
    Button: [
        MOBILE_RESPONSIVE,
        { title: 'Content', icon: <AlignLeft size={12} />, fieldNames: ['text', 'link', 'action', 'variant'] },
        TYPOGRAPHY,
        LAYOUT,
        SPACING,
        FILL,
        BORDER,
        RADIUS,
        POSITION,
    ],
    Image: [
        MOBILE_RESPONSIVE,
        { title: 'Source', icon: <ImageIcon size={12} />, fieldNames: ['url', 'alt', 'width', 'height', 'objectFit', 'aspectRatio'] },
        BORDER, RADIUS, POSITION,
    ],
    Video: [
        { title: 'Source', icon: <Video size={12} />, fieldNames: ['url'] },
        { title: 'Playback', icon: <Play size={12} />, fieldNames: ['loop', 'controls', 'autoPlay', 'speed'] },
        { title: 'Size', icon: <Maximize2 size={12} />, fieldNames: ['width', 'height'] },
        BORDER, RADIUS, POSITION,
    ],
    Row: [
        MOBILE_RESPONSIVE,
        { title: 'Layout', icon: <Rows size={12} />, fieldNames: ['numberOfRows', 'gap', 'justifyItems'] },
    ],
    Column: [
        MOBILE_RESPONSIVE,
        { title: 'Layout', icon: <Columns size={12} />, fieldNames: ['numberOfColumns', 'gap', 'alignItems'] },
    ],
    Grid: [
        { title: 'Mobile', icon: <Smartphone size={12} />, fieldNames: ['mobileColumns'] },
        { title: 'Layout', icon: <Grid2X2 size={12} />, fieldNames: ['numberOfColumns', 'numberOfRows', 'gapX', 'gapY', 'justifyItems', 'alignItems', 'firstCellRowSpan', 'firstCellColumnSpan'] },
    ],
    Section: [
        { title: 'Settings', icon: <Box size={12} />, fieldNames: ['sectionName'] },
    ],
    Card: [
        { title: 'Content', icon: <AlignLeft size={12} />, fieldNames: ['variant', 'cardCover', 'imageSource', 'videoSource', 'linkToService', 'service'] },
    ],
}

const TEXT_PRESET_NAMES = [
    'HeadingOne', 'HeadingTwo', 'HeadingThree', 'HeadingFour',
    'TitleLarge', 'TitleMedium', 'TitleSmall',
    'BodyLarge', 'BodyMedium', 'BodySmall', 'BodyExtraSmall',
]
TEXT_PRESET_NAMES.forEach(name => { COMPONENT_SECTIONS[name] = [MOBILE_RESPONSIVE, CONTENT_TEXT, TYPOGRAPHY] })

// ─── Component meta ─────────────────────────────────────────────────────────

const COMPONENT_META: Record<string, { label: string; icon: React.ReactNode }> = {
    CustomizableText: { label: 'Text', icon: <Type size={12} className="text-[#6F6863]" /> },
    Container: { label: 'Container', icon: <Box size={12} className="text-[#6F6863]" /> },
    Button: { label: 'Button', icon: <MousePointerClick size={12} className="text-[#6F6863]" /> },
    Image: { label: 'Image', icon: <ImageIcon size={12} className="text-[#6F6863]" /> },
    Video: { label: 'Video', icon: <Video size={12} className="text-[#6F6863]" /> },
    Row: { label: 'Row', icon: <Rows size={12} className="text-[#6F6863]" /> },
    Column: { label: 'Column', icon: <Columns size={12} className="text-[#6F6863]" /> },
    Grid: { label: 'Grid', icon: <Grid2X2 size={12} className="text-[#6F6863]" /> },
    Section: { label: 'Section', icon: <Box size={12} className="text-[#6F6863]" /> },
    Card: { label: 'Card', icon: <Box size={12} className="text-[#6F6863]" /> },
    Navbar: { label: 'Navbar', icon: <LayoutDashboard size={12} className="text-[#6F6863]" /> },
    HeadingOne: { label: 'Heading 1', icon: <Type size={12} className="text-[#6F6863]" /> },
    HeadingTwo: { label: 'Heading 2', icon: <Type size={12} className="text-[#6F6863]" /> },
    HeadingThree: { label: 'Heading 3', icon: <Type size={12} className="text-[#6F6863]" /> },
    HeadingFour: { label: 'Heading 4', icon: <Type size={12} className="text-[#6F6863]" /> },
    TitleLarge: { label: 'Title Large', icon: <Type size={12} className="text-[#6F6863]" /> },
    TitleMedium: { label: 'Title Medium', icon: <Type size={12} className="text-[#6F6863]" /> },
    TitleSmall: { label: 'Title Small', icon: <Type size={12} className="text-[#6F6863]" /> },
    BodyLarge: { label: 'Body Large', icon: <Type size={12} className="text-[#6F6863]" /> },
    BodyMedium: { label: 'Body Medium', icon: <Type size={12} className="text-[#6F6863]" /> },
    BodySmall: { label: 'Body Small', icon: <Type size={12} className="text-[#6F6863]" /> },
    BodyExtraSmall: { label: 'Body XS', icon: <Type size={12} className="text-[#6F6863]" /> },
}

// Fields wide enough to need a full row (not paired)
const FULL_WIDTH_FIELDS = new Set([
    'url', 'alt', 'text', 'link', 'sectionName',
    'fontFamily', 'style', 'align',
    'flexDirection', 'mainAxisLayout', 'altAxisLayout',
    'responsiveDirection', 'hideBelow', 'hideAbove',
    'backgroundColor',
    'paddingExpanded', 'marginExpanded',
    'borderExpanded', 'borderRadiusExpanded',
    'positionType', 'overflow', 'gridTemplateColumns',
    'mobileLayout', 'mobileWidth', 'mobileVisibility',
    'isLink', 'linkType', 'sections',
    'action', 'variant', 'cardCover', 'imageSource', 'videoSource',
    'linkToService', 'service',
    'objectFit', 'aspectRatio', 'width', 'height',
    'size', 'spacing',
    'numberOfColumns', 'numberOfRows', 'justifyItems', 'alignItems',
    'gap', 'rotation', 'zIndex', 'minHeight', 'maxWidth',
    'mobileColumns', 'firstCellRowSpan', 'firstCellColumnSpan',
])

// ─── SectionPanel ────────────────────────────────────────────────────────────

function SectionPanel({ section, fieldMap }: { section: Section; fieldMap: Map<string, React.ReactNode> }) {
    const rows = section.fieldNames
        .map(name => ({ name, el: fieldMap.get(name) }))
        .filter((r): r is { name: string; el: React.ReactNode } => r.el != null)

    if (rows.length === 0) return null

    const isCollapsed = section.collapsedByDefault === true

    return (
        <Accordion.Item
            value={section.title}
            className="border-b last:border-0"
            style={{ borderColor: '#E8E2D6' }}
        >
            <Accordion.Header>
                <Accordion.Trigger
                    className="flex w-full items-center justify-between px-3 py-2 transition-colors [&[data-state=open]>svg]:rotate-180"
                    style={{ backgroundColor: '#FAF7F2', borderBottom: '1px solid #E8E2D6' }}
                >
                    <span className="flex items-center gap-1.5" style={{ color: '#6F6863' }}>
                        <span style={{ opacity: 0.7 }}>{section.icon}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                            {section.title}
                        </span>
                    </span>
                    <ChevronDown
                        size={12}
                        className="shrink-0 transition-transform duration-200"
                        style={{ color: '#C9B89A' }}
                    />
                </Accordion.Trigger>
            </Accordion.Header>

            <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="grid grid-cols-2 gap-x-2 gap-y-0">
                    {rows.map(({ name, el }) => {
                        const isFullWidth = FULL_WIDTH_FIELDS.has(name)
                        const info = FIELD_INFO[name]
                        return (
                            <div
                                key={name}
                                className={isFullWidth ? 'col-span-2' : ''}
                                style={{
                                    padding: '6px 10px',
                                    minHeight: 32,
                                    borderBottom: '1px solid rgba(232,226,214,0.5)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>{el}</div>
                                    {info && <InfoBubble text={info} />}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Accordion.Content>
        </Accordion.Item>
    )
}

// ─── Main Settings component ─────────────────────────────────────────────────

interface SettingsProps {
    fields: React.ReactNode[]
    componentName: string
}

function Settings({ fields, componentName }: SettingsProps) {
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
    const meta = COMPONENT_META[componentName] ?? { label: componentName, icon: <Box size={12} className="text-[#6F6863]" /> }

    // Default open: all sections except those marked collapsedByDefault
    const defaultOpen = sections
        ? sections.filter(s => !s.collapsedByDefault).map(s => s.title)
        : []

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: '#FFFFFF' }}>
            {/* Header */}
            <div
                className="flex items-center gap-2 px-3 py-2 sticky top-0 z-10"
                style={{ borderBottom: '1px solid #E8E2D6', backgroundColor: '#FFFFFF' }}
            >
                <div
                    className="size-5 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#F0EBE3' }}
                >
                    {meta.icon}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1818', lineHeight: 1 }}>
                    {meta.label}
                </span>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto">
                {sections ? (
                    <Accordion.Root type="multiple" defaultValue={defaultOpen}>
                        {sections.map(section => (
                            <SectionPanel key={section.title} section={section} fieldMap={fieldMap} />
                        ))}
                    </Accordion.Root>
                ) : (
                    // Fallback: same row styling as SectionPanel for unmapped components
                    <div>
                        {fields.map((f, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '6px 10px',
                                    minHeight: 32,
                                    borderBottom: '1px solid rgba(232,226,214,0.5)',
                                }}
                            >
                                {f}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Settings
