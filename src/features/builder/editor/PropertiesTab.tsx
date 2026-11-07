'use client'

import { AlertTriangle } from 'lucide-react'
import { FONT_PAIRINGS, resolveTheme } from '@/features/siteBuilder/themes'
import { lowContrast, sectionPalette } from '../palette'
import type { SectionDefinition } from '../sections/types'
import type { Divider, SectionProps, SectionStyle, Size, TextStyle } from '../types'
import { ColorInput, ContentFields, MediaInput, Segmented, Select, Slider, TextInput, Toggle } from './controls'
import { NameLogoFields } from './ThemePanel'
import { useTheme } from './useSection'

const SIZES: { value: Size; label: string }[] = [{ value: 'none', label: 'None' }, { value: 's', label: 'S' }, { value: 'm', label: 'M' }, { value: 'l', label: 'L' }, { value: 'xl', label: 'XL' }]
const DIVIDERS: { value: Divider; label: string }[] = [{ value: 'none', label: 'None' }, { value: 'wave', label: 'Wave' }, { value: 'curve', label: 'Curve' }, { value: 'slant', label: 'Slant' }, { value: 'zigzag', label: 'Zigzag' }]
const FONTS = [...new Set(FONT_PAIRINGS.flatMap(f => [f.heading.family, f.body.family]))].sort()

function Group({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
    return (
        <details className="bld-group" open={open}>
            <summary>{title}</summary>
            <div>{children}</div>
        </details>
    )
}

export function PropertiesTab({ def, props, setContent, setStyle }: {
    def: SectionDefinition
    props: SectionProps
    setContent: (c: Record<string, unknown>) => void
    setStyle: (s: (style: SectionStyle) => Partial<SectionStyle>) => void
}) {
    const { theme: themeProps } = useTheme()
    const theme = resolveTheme(themeProps.templateId, themeProps.scheme, themeProps.customColors, themeProps.fontPairing)
    const { style } = props
    const palette = sectionPalette(theme, style)
    const warning = lowContrast(palette)
    const colors = (c: Partial<SectionStyle['colors']>) => setStyle(s => ({ colors: { ...s.colors, ...c } }))
    const bg = (b: Partial<SectionStyle['background']>) => setStyle(s => ({ background: { ...s.background, ...b } }))
    const buttons = (b: Partial<SectionStyle['buttons']>) => setStyle(s => ({ buttons: { ...s.buttons, ...b } }))
    const spacing = (b: Partial<SectionStyle['spacing']>) => setStyle(s => ({ spacing: { ...s.spacing, ...b } }))

    return (
        <div>
            {(def.type === 'Navbar' || def.type === 'Footer') && (
                <Group title="Name and logo" open>
                    <NameLogoFields />
                    <p className="bld-help">These are site-wide: the menu bar, footer and the rest of the page all use them.</p>
                </Group>
            )}
            {def.fields.length > 0 && (
                <Group title="Content" open>
                    <ContentFields fields={def.fields} content={props.content as Record<string, unknown>} onChange={setContent} />
                </Group>
            )}

            <Group title="Colors">
                <Toggle label="Use the site colors" checked={style.useTheme} onChange={useTheme => setStyle(() => ({ useTheme }))} help="Turn off to pick this section’s own colors." />
                <Toggle label="Invert colors" checked={style.invert} onChange={invert => setStyle(() => ({ invert }))} help="Swaps the background and text colors." />
                <Toggle label="Accent background" checked={!!style.accentBg} onChange={accentBg => setStyle(() => ({ accentBg }))} help="The site’s accent color fills this section." />
                <Toggle label="Tinted background" checked={!!style.tint} onChange={tint => setStyle(() => ({ tint }))} help="A shade darker than the page, to set this section apart." />
                {!style.useTheme && <>
                    <ColorInput label="Background" value={style.colors.bg} placeholder={theme.bg} onChange={v => colors({ bg: v })} />
                    <ColorInput label="Text" value={style.colors.fg} placeholder={theme.fg} onChange={v => colors({ fg: v })} />
                    <ColorInput label="Accent and buttons" value={style.colors.accent} placeholder={theme.accent} onChange={v => colors({ accent: v, button: undefined })} />
                    <ColorInput label="Button text" value={style.colors.buttonText} placeholder={palette.accentFg} onChange={v => colors({ buttonText: v })} />
                    <ColorInput label="Cards" value={style.colors.card} placeholder={palette.card} onChange={v => colors({ card: v })} />
                    <ColorInput label="Lines and borders" value={style.colors.border} placeholder={palette.border} onChange={v => colors({ border: v })} />
                </>}
                {warning && <p className="flex items-start gap-1.5 text-[12px]" style={{ color: '#B45309' }}><AlertTriangle size={14} className="mt-px flex-none" />{warning}</p>}
            </Group>

            <Group title="Background">
                <Segmented label="Background" value={style.background.kind} onChange={kind => bg({ kind })}
                    options={[{ value: 'solid', label: 'Color' }, { value: 'gradient', label: 'Gradient' }, { value: 'image', label: 'Photo' }, { value: 'video', label: 'Video' }]} />
                {style.background.kind === 'gradient' && <>
                    <ColorInput label="From" value={style.background.gradient?.from} placeholder={palette.bg} onChange={from => bg({ gradient: { from: from ?? palette.bg, to: style.background.gradient?.to ?? palette.accent, angle: style.background.gradient?.angle ?? 135 } })} />
                    <ColorInput label="To" value={style.background.gradient?.to} placeholder={palette.accent} onChange={to => bg({ gradient: { from: style.background.gradient?.from ?? palette.bg, to: to ?? palette.accent, angle: style.background.gradient?.angle ?? 135 } })} />
                    <Slider label="Angle" unit="°" value={style.background.gradient?.angle ?? 135} min={0} max={360} step={5}
                        onChange={angle => bg({ gradient: { from: style.background.gradient?.from ?? palette.bg, to: style.background.gradient?.to ?? palette.accent, angle } })} />
                </>}
                {(style.background.kind === 'image' || style.background.kind === 'video') && <>
                    <MediaInput label={style.background.kind === 'video' ? 'Background video' : 'Background photo'} value={style.background.media ?? null} accept={style.background.kind === 'video' ? 'media' : 'image'} onChange={media => bg({ media })} />
                    <ColorInput label="Shade over it" value={style.background.overlay?.color} placeholder="#000000" onChange={color => bg({ overlay: { color: color ?? '#000000', opacity: style.background.overlay?.opacity ?? 40 } })} />
                    <Slider label="Shade strength" unit="%" value={style.background.overlay?.opacity ?? 0} min={0} max={90} step={5} onChange={opacity => bg({ overlay: { color: style.background.overlay?.color ?? '#000000', opacity } })} />
                    <Slider label="Blur" unit="px" value={style.background.blur ?? 0} min={0} max={20} onChange={blur => bg({ blur })} />
                </>}
                <Segmented label="Texture" value={style.background.pattern ?? 'none'} onChange={pattern => bg({ pattern })}
                    options={[{ value: 'none', label: 'None' }, { value: 'dots', label: 'Dots' }, { value: 'grain', label: 'Grain' }, { value: 'lines', label: 'Lines' }]} />
            </Group>

            <Group title="Text">
                {def.textRoles.map(role => (
                    <TextRoleEditor key={role.id} label={role.label} value={style.text[role.id] ?? {}}
                        onChange={t => setStyle(s => ({ text: { ...s.text, [role.id]: t } }))} />
                ))}
            </Group>

            <Group title="Buttons">
                <Segmented label="Style" value={style.buttons.style} onChange={v => buttons({ style: v })}
                    options={[{ value: 'solid', label: 'Solid' }, { value: 'outline', label: 'Outline' }, { value: 'pill', label: 'Pill' }, { value: 'text', label: 'Text link' }]} />
                <Segmented label="Size" value={style.buttons.size} onChange={v => buttons({ size: v })}
                    options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
                <Segmented label="Icon" value={style.buttons.icon} onChange={v => buttons({ icon: v })}
                    options={[{ value: 'none', label: 'None' }, { value: 'arrow', label: 'Arrow' }, { value: 'calendar', label: 'Calendar' }]} />
                <Slider label="Corners" unit="px" value={style.buttons.radius ?? theme.buttonRadius} min={0} max={40}
                    onChange={radius => buttons({ radius })} onReset={style.buttons.radius !== undefined ? () => buttons({ radius: undefined }) : undefined} />
            </Group>

            <Group title="Spacing and size">
                <Segmented label="Space above" value={style.spacing.top} options={SIZES} onChange={top => spacing({ top })} />
                <Segmented label="Space below" value={style.spacing.bottom} options={SIZES} onChange={bottom => spacing({ bottom })} />
                <Segmented label="Content width" value={style.spacing.width} onChange={width => spacing({ width })}
                    options={[{ value: 'narrow', label: 'Narrow' }, { value: 'normal', label: 'Normal' }, { value: 'wide', label: 'Wide' }, { value: 'full', label: 'Full' }]} />
                <Slider label="Photo and card corners" unit="px" value={style.spacing.radius ?? theme.radius} min={0} max={40}
                    onChange={radius => spacing({ radius })} onReset={style.spacing.radius !== undefined ? () => spacing({ radius: undefined }) : undefined} />
                <Toggle label="Shadows on cards" checked={style.spacing.shadow} onChange={shadow => spacing({ shadow })} />
                <Toggle label="Borders on cards" checked={style.spacing.border} onChange={border => spacing({ border })} />
                <Select label="Top edge" value={style.spacing.dividerTop} options={DIVIDERS} onChange={dividerTop => spacing({ dividerTop })} />
                <Select label="Bottom edge" value={style.spacing.dividerBottom} options={DIVIDERS} onChange={dividerBottom => spacing({ dividerBottom })} />
            </Group>

            <Group title="Visibility and link">
                <Toggle label="Hide on phones" checked={style.visibility.hideMobile} onChange={hideMobile => setStyle(s => ({ visibility: { ...s.visibility, hideMobile } }))} />
                <Toggle label="Hide on computers" checked={style.visibility.hideDesktop} onChange={hideDesktop => setStyle(s => ({ visibility: { ...s.visibility, hideDesktop } }))} />
                <TextInput label="Link name" value={style.anchor} max={40} placeholder={def.type.toLowerCase()}
                    onChange={v => setStyle(() => ({ anchor: v.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                    help="Menu buttons that point to this section use it, e.g. #services." />
            </Group>
        </div>
    )
}

function TextRoleEditor({ label, value, onChange }: { label: string; value: TextStyle; onChange: (t: TextStyle) => void }) {
    const set = (p: Partial<TextStyle>) => onChange({ ...value, ...p })
    const changed = Object.values(value).some(v => v !== undefined)
    return (
        <details className="rounded-lg" style={{ border: '1px solid var(--b-line)', background: '#fff' }}>
            <summary className="flex cursor-pointer list-none items-center justify-between px-2.5 py-2 text-[12.5px] font-semibold">
                {label}
                {changed && <span className="bld-tag">Edited</span>}
            </summary>
            <div className="grid gap-3 px-2.5 pb-3">
                <Select label="Font" value={value.font ?? ''} onChange={font => set({ font: font || undefined })}
                    options={[{ value: '', label: 'Site font' }, { value: 'heading', label: 'Site heading font' }, { value: 'body', label: 'Site body font' }, ...FONTS.map(f => ({ value: f, label: f }))]} />
                <Slider label="Size on computers" unit="px" value={value.size ?? 0} min={0} max={120} onChange={size => set({ size: size || undefined })} help={value.size ? undefined : 'Layout default'} />
                <Slider label="Size on phones" unit="px" value={value.sizeMobile ?? 0} min={0} max={80} onChange={sizeMobile => set({ sizeMobile: sizeMobile || undefined })} help={value.sizeMobile ? undefined : 'Scales with the computer size'} />
                <Segmented label="Weight" value={value.weight ?? 0} onChange={w => set({ weight: w || undefined })}
                    options={[{ value: 0, label: 'Default' }, { value: 300, label: 'Light' }, { value: 400, label: 'Regular' }, { value: 600, label: 'Semi' }, { value: 700, label: 'Bold' }]} />
                <Segmented label="Letters" value={value.case ?? 'default'} onChange={c => set({ case: c === 'default' ? undefined : c })}
                    options={[{ value: 'default', label: 'Default' }, { value: 'none', label: 'As typed' }, { value: 'upper', label: 'CAPS' }, { value: 'title', label: 'Title' }]} />
                <Toggle label="Italic" checked={!!value.italic} onChange={italic => set({ italic: italic || undefined })} />
                <Segmented label="Align" value={value.align ?? 'default'} onChange={a => set({ align: a === 'default' ? undefined : a })}
                    options={[{ value: 'default', label: 'Default' }, { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} />
                <Slider label="Letter spacing" unit="em" value={value.tracking ?? 0} min={-0.05} max={0.4} step={0.01} onChange={tracking => set({ tracking: tracking || undefined })} />
                <Slider label="Line height" value={value.leading ?? 0} min={0} max={2.2} step={0.05} onChange={leading => set({ leading: leading || undefined })} help={value.leading ? undefined : 'Layout default'} />
                <ColorInput label="Color" value={value.color} onChange={color => set({ color })} />
                {changed && <button type="button" className="bld-btn" onClick={() => onChange({})}>Reset {label.toLowerCase()}</button>}
            </div>
        </details>
    )
}
