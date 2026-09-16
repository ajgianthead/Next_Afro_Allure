
'use client'

import React, { useMemo, useState } from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import * as Popover from '@radix-ui/react-popover'
import {
    AlignLeft, Box, ChevronDown, Columns, Eye, Grid2X2, ImageIcon,
    Info, LayoutDashboard, Maximize2, MousePointerClick, Move,
    PaintBucket, Play, Rows, Smartphone, Square, Type, Video,
} from 'lucide-react'
import { ElementHeader } from './components/elementHeader'
import { BoxModelDiagram } from './components/boxModelDiagram'

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

type Tab = 'style' | 'content' | 'advanced'

interface Section {
    title: string
    icon: React.ReactNode
    fieldNames: string[]
    collapsedByDefault?: boolean
    tab?: Tab
    /** Rendered above the section's fields — used for the padding/margin box-model diagram. */
    decoration?: React.ReactNode
}

// The one unified Mobile section — only these 5 fields ever belong here.
// A component with none of them simply doesn't get a Mobile section at all.
const MOBILE_ADVANCED: Section = {
    title: 'Mobile',
    icon: <Smartphone size={12} />,
    fieldNames: ['hideBelow', 'hideAbove', 'mobileLayout', 'mobileWidth', 'mobileColumns'],
    tab: 'advanced',
}

const LAYOUT: Section = {
    title: 'Layout',
    icon: <LayoutDashboard size={12} />,
    fieldNames: ['flexDirection', 'mainAxisLayout', 'altAxisLayout', 'grow', 'responsiveDirection'],
    tab: 'style',
}

const SIZE: Section = {
    title: 'Size',
    icon: <Maximize2 size={12} />,
    fieldNames: ['width', 'height'],
    tab: 'style',
}

const SIZE_LIMITS: Section = {
    title: 'Size Limits',
    icon: <Maximize2 size={12} />,
    fieldNames: ['maxWidth', 'aspectRatio'],
    tab: 'advanced',
}

const SPACING: Section = {
    title: 'Spacing',
    icon: <Maximize2 size={12} />,
    fieldNames: [
        'gapX', 'gapY',
        'paddingExpanded',
        'marginExpanded',
        'gridTemplateColumns',
    ],
    tab: 'style',
    decoration: <BoxModelDiagram />,
}

const FILL: Section = {
    title: 'Colors',
    icon: <PaintBucket size={12} />,
    fieldNames: ['backgroundColor'],
    tab: 'style',
}

const BG_IMAGE: Section = {
    title: 'Background',
    icon: <ImageIcon size={12} />,
    fieldNames: ['backgroundImageUrl'],
    tab: 'style',
}

const APPEARANCE: Section = {
    title: 'Appearance',
    icon: <Eye size={12} />,
    fieldNames: ['opacity'],
    tab: 'style',
}

const BORDER: Section = {
    title: 'Border',
    icon: <Square size={12} />,
    fieldNames: ['borderExpanded'],
    tab: 'style',
}

const RADIUS: Section = {
    title: 'Radius',
    icon: <Square size={12} />,
    fieldNames: ['borderRadiusExpanded'],
    tab: 'style',
}

const POSITION: Section = {
    title: 'Advanced',
    icon: <Move size={12} />,
    fieldNames: ['positionType', 'rotation', 'zIndex'],
    collapsedByDefault: true,
    tab: 'advanced',
}

const TYPOGRAPHY: Section = {
    title: 'Typography',
    icon: <Type size={12} />,
    fieldNames: ['fontFamily', 'fontSize', 'fontWeight', 'style', 'align', 'color', 'lineHeight', 'letterSpacing', 'textTransform', 'size'],
    tab: 'style',
}

const CONTENT_TEXT: Section = {
    title: 'Content',
    icon: <AlignLeft size={12} />,
    fieldNames: ['text', 'isLink', 'linkType', 'url', 'sections'],
    tab: 'content',
}

const COMPONENT_SECTIONS: Record<string, Section[]> = {
    CustomizableText: [
        CONTENT_TEXT,
        TYPOGRAPHY,
        { title: 'Size', icon: <Maximize2 size={12} />, fieldNames: ['maxWidth'], tab: 'style' },
        APPEARANCE,
    ],
    Container: [
        LAYOUT, SIZE, SPACING, FILL, BG_IMAGE, BORDER, RADIUS, APPEARANCE,
        SIZE_LIMITS, MOBILE_ADVANCED, POSITION,
    ],
    Button: [
        { title: 'Content', icon: <AlignLeft size={12} />, fieldNames: ['text', 'isLink', 'linkType', 'url', 'sections'], tab: 'content' },
        { title: 'Typography', icon: <Type size={12} />, fieldNames: ['fontSize', 'fontWeight', 'style', 'align', 'color'], tab: 'style' },
        LAYOUT,
        SPACING,
        FILL,
        BORDER,
        RADIUS,
        APPEARANCE,
        { title: 'Typography', icon: <Type size={12} />, fieldNames: ['fontFamily'], tab: 'advanced' },
        MOBILE_ADVANCED,
        POSITION,
    ],
    Image: [
        { title: 'Source', icon: <ImageIcon size={12} />, fieldNames: ['url', 'alt', 'width', 'height'], tab: 'content' },
        BORDER, RADIUS, APPEARANCE,
        { title: 'Image Fit', icon: <ImageIcon size={12} />, fieldNames: ['objectFit'], tab: 'advanced' },
        POSITION,
        { title: 'More', icon: <Move size={12} />, fieldNames: ['aspectRatio'], tab: 'advanced' },
    ],
    Video: [
        { title: 'Source', icon: <Video size={12} />, fieldNames: ['url'], tab: 'content' },
        { title: 'Playback', icon: <Play size={12} />, fieldNames: ['loop', 'controls', 'autoPlay'], tab: 'content' },
        { title: 'Size', icon: <Maximize2 size={12} />, fieldNames: ['width'], tab: 'style' },
        BORDER, RADIUS, POSITION, APPEARANCE,
    ],
    Row: [
        { title: 'Layout', icon: <Rows size={12} />, fieldNames: ['numberOfRows', 'gap', 'justifyItems'], tab: 'style' },
        APPEARANCE,
        MOBILE_ADVANCED,
    ],
    Column: [
        { title: 'Layout', icon: <Columns size={12} />, fieldNames: ['numberOfColumns', 'gap', 'alignItems'], tab: 'style' },
        APPEARANCE,
        MOBILE_ADVANCED,
    ],
    Grid: [
        { title: 'Layout', icon: <Grid2X2 size={12} />, fieldNames: ['numberOfColumns', 'numberOfRows', 'gapX', 'gapY'], tab: 'style' },
        APPEARANCE,
        MOBILE_ADVANCED,
        { title: 'Cells', icon: <Grid2X2 size={12} />, fieldNames: ['firstCellRowSpan', 'firstCellColumnSpan'], tab: 'advanced' },
        { title: 'Alignment', icon: <Move size={12} />, fieldNames: ['justifyItems', 'alignItems'], tab: 'advanced' },
    ],
    Section: [
        { title: 'Settings', icon: <Box size={12} />, fieldNames: ['sectionName'], tab: 'content' },
        APPEARANCE,
    ],
    Card: [
        { title: 'Content', icon: <AlignLeft size={12} />, fieldNames: ['variant', 'cardCover', 'imageSource', 'videoSource', 'linkToService', 'service'], tab: 'content' },
        { title: 'Size', icon: <Maximize2 size={12} />, fieldNames: ['width', 'height'], tab: 'style' },
        APPEARANCE,
    ],
    Navbar: [
        { title: 'Content', icon: <AlignLeft size={12} />, fieldNames: ['menu'], tab: 'content' },
        { title: 'Spacing', icon: <Maximize2 size={12} />, fieldNames: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'], tab: 'style' },
        { title: 'Colors', icon: <PaintBucket size={12} />, fieldNames: ['backgroundColor'], tab: 'style' },
        { title: 'Border', icon: <Square size={12} />, fieldNames: ['borderBottomWidth', 'borderColor'], tab: 'style' },
        APPEARANCE,
    ],
    Gallery: [
        { title: 'Content', icon: <ImageIcon size={12} />, fieldNames: ['images'], tab: 'content' },
        { title: 'Layout', icon: <Grid2X2 size={12} />, fieldNames: ['columns', 'gap', 'aspectRatio', 'borderRadius'], tab: 'style' },
        APPEARANCE,
    ],
}

const TEXT_PRESET_NAMES = [
    'HeadingOne', 'HeadingTwo', 'HeadingThree', 'HeadingFour',
    'TitleLarge', 'TitleMedium', 'TitleSmall',
    'BodyLarge', 'BodyMedium', 'BodySmall', 'BodyExtraSmall',
]
TEXT_PRESET_NAMES.forEach(name => { COMPONENT_SECTIONS[name] = [CONTENT_TEXT, TYPOGRAPHY, APPEARANCE] })

const TABS: { key: Tab; label: string }[] = [
    { key: 'style', label: 'Style' },
    { key: 'content', label: 'Content' },
    { key: 'advanced', label: 'Advanced' },
]

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
    Gallery: { label: 'Gallery', icon: <ImageIcon size={12} className="text-[#6F6863]" /> },
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
    'backgroundImageUrl', 'backgroundObjectFit', 'backgroundPosition',
    'opacity',
    'width', 'height', 'widthUnit', 'heightUnit',
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

    return (
        <Accordion.Item value={section.title} style={{ backgroundColor: '#FFFFFF' }}>
            <Accordion.Header>
                <Accordion.Trigger
                    className="flex w-full items-center justify-between [&[data-state=open]>svg]:rotate-180"
                    style={{ padding: '8px 12px', backgroundColor: 'transparent' }}
                >
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#6F6863', lineHeight: 1 }}>
                        {section.title}
                    </span>
                    <ChevronDown
                        size={11}
                        className="shrink-0 transition-transform duration-200"
                        style={{ color: '#C9B89A' }}
                    />
                </Accordion.Trigger>
            </Accordion.Header>

            <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div style={{ borderTop: '1px solid rgba(232,226,214,0.6)' }}>
                    {section.decoration}
                    {rows.map(({ name, el }, i) => {
                        const info = FIELD_INFO[name]
                        return (
                            <div
                                key={name}
                                style={{
                                    padding: '5px 12px',
                                    minHeight: 30,
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderBottom: i < rows.length - 1 ? '1px solid rgba(232,226,214,0.4)' : 'none',
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>{el}</div>
                                {info && <InfoBubble text={info} />}
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
    const [activeTab, setActiveTab] = useState<Tab>('style')

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

    const allSections = COMPONENT_SECTIONS[componentName]
    const meta = COMPONENT_META[componentName] ?? { label: componentName, icon: <Box size={12} className="text-[#6F6863]" /> }

    // Only show tabs the component actually has content for.
    const sectionsByTab = useMemo(() => {
        if (!allSections) return null
        const byTab: Record<Tab, Section[]> = { style: [], content: [], advanced: [] }
        allSections.forEach(s => { byTab[s.tab ?? 'style'].push(s) })
        return byTab
    }, [allSections])

    const availableTabs = sectionsByTab ? TABS.filter(t => sectionsByTab[t.key].length > 0) : []
    const currentTab: Tab = availableTabs.some(t => t.key === activeTab) ? activeTab : (availableTabs[0]?.key ?? 'style')
    const visibleSections = sectionsByTab?.[currentTab] ?? []

    return (
        <div
            className="flex flex-col h-full"
            style={{
                backgroundColor: '#FAF7F2',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
        >
            <ElementHeader icon={meta.icon} label={meta.label} />

            {/* Style / Content / Advanced tabs */}
            {availableTabs.length > 1 && (
                <div style={{ display: 'flex', gap: 2, padding: '8px 10px 0', backgroundColor: '#FFFFFF' }}>
                    {availableTabs.map(t => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setActiveTab(t.key)}
                            style={{
                                flex: 1, height: 26, borderRadius: '6px 6px 0 0', fontSize: 11, fontWeight: 600,
                                background: currentTab === t.key ? '#FAF7F2' : 'transparent',
                                color: currentTab === t.key ? '#1A1818' : '#A09790',
                                border: 'none', borderBottom: currentTab === t.key ? '2px solid #FC6161' : '2px solid transparent',
                                cursor: 'pointer', transition: 'color 0.1s',
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Sections */}
            <div
                className="flex-1 overflow-y-auto"
                style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}
            >
                {allSections ? (
                    visibleSections.map(section => (
                        <Accordion.Root
                            key={section.title}
                            type="single"
                            defaultValue={!section.collapsedByDefault ? section.title : undefined}
                            collapsible
                            style={{ border: '1px solid #E8E2D6', borderRadius: 8, overflow: 'hidden' }}
                        >
                            <SectionPanel section={section} fieldMap={fieldMap} />
                        </Accordion.Root>
                    ))
                ) : (
                    // Fallback for unmapped components
                    <div style={{ border: '1px solid #E8E2D6', borderRadius: 8, overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                        {fields.map((f, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '5px 12px',
                                    minHeight: 30,
                                    display: 'flex', alignItems: 'center',
                                    borderBottom: '1px solid rgba(232,226,214,0.4)',
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
