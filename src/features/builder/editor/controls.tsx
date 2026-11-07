'use client'

// The inputs the inspector is built from. Each is controlled: value in,
// onChange out. Styling lives in editor.css (.bld-*).

import { useId, useRef, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Lock, Plus, Trash2, X } from 'lucide-react'
import { isHexColor } from '@/features/siteBuilder/themes'
import { uploadSiteMedia, UploadError } from '@/features/siteBuilder/uploads'
import type { SiteMedia } from '@/features/siteBuilder/siteData'
import type { FieldSpec, LinkValue, ServicePick } from '../sections/types'
import { useEditor } from './EditorContext'

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif'
const MEDIA_ACCEPT = `${IMAGE_ACCEPT},video/mp4,video/quicktime,video/webm`
const VIDEO_NOTE = 'Videos up to 50 MB play silently on a loop.'

export function Field({ label, help, children, htmlFor }: { label: string; help?: string; children: ReactNode; htmlFor?: string }) {
    return (
        <div className="bld-field">
            <label className="bld-label" htmlFor={htmlFor}>{label}</label>
            {children}
            {help && <p className="bld-help">{help}</p>}
        </div>
    )
}

export function TextInput({ label, value, onChange, placeholder, max, help }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; max?: number; help?: string }) {
    const id = useId()
    return (
        <Field label={label} help={help} htmlFor={id}>
            <input id={id} className="bld-input" value={value ?? ''} maxLength={max} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
        </Field>
    )
}

export function TextArea({ label, value, onChange, placeholder, max, rows = 3, help }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; max?: number; rows?: number; help?: string }) {
    const id = useId()
    return (
        <Field label={label} help={help} htmlFor={id}>
            <textarea id={id} className="bld-textarea" rows={rows} value={value ?? ''} maxLength={max} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
        </Field>
    )
}

export function Select<T extends string>({ label, value, options, onChange, help }: { label: string; value: T; options: { value: T; label: string; locked?: boolean }[]; onChange: (v: T) => void; help?: string }) {
    const id = useId()
    return (
        <Field label={label} help={help} htmlFor={id}>
            <select id={id} className="bld-select" value={value} onChange={e => onChange(e.target.value as T)}>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}{o.locked ? ' · Growth' : ''}</option>)}
            </select>
        </Field>
    )
}

/** A row of small buttons for 2–6 choices. */
export function Segmented<T extends string | number>({ label, value, options, onChange, help }: { label: string; value: T; options: { value: T; label: ReactNode; title?: string; locked?: boolean }[]; onChange: (v: T) => void; help?: string }) {
    return (
        <div className="bld-field" role="group" aria-label={label}>
            <span className="bld-label">{label}</span>
            <div className="bld-seg">
                {options.map(o => (
                    <button key={String(o.value)} type="button" title={o.title} aria-pressed={o.value === value} data-locked={o.locked || undefined} onClick={() => onChange(o.value)}>
                        {o.locked && <Lock size={10} className="mr-1 inline" aria-label="Growth" />}{o.label}
                    </button>
                ))}
            </div>
            {help && <p className="bld-help">{help}</p>}
        </div>
    )
}

export function Toggle({ label, checked, onChange, help, locked }: { label: string; checked: boolean; onChange: (v: boolean) => void; help?: string; locked?: boolean }) {
    return (
        <div className="bld-field">
            <div className="bld-toggle" onClick={() => onChange(!checked)}>
                <span>{locked && <Lock size={11} className="mr-1 inline" aria-label="Growth" />}{label}</span>
                <button type="button" role="switch" aria-checked={checked} aria-label={label} className="bld-switch" onClick={e => { e.stopPropagation(); onChange(!checked) }} />
            </div>
            {help && <p className="bld-help">{help}</p>}
        </div>
    )
}

export function Slider({ label, value, min, max, step = 1, unit = '', onChange, help, onReset }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void; help?: string; onReset?: () => void }) {
    const id = useId()
    return (
        <div className="bld-field">
            <div className="flex items-center justify-between gap-2">
                <label className="bld-label" htmlFor={id}>{label}</label>
                <span className="flex items-center gap-1 text-[11.5px] tabular-nums" style={{ color: 'var(--b-muted)' }}>
                    {value}{unit}
                    {onReset && <button type="button" className="bld-icon-btn !h-5 !w-5" title="Reset" aria-label={`Reset ${label}`} onClick={onReset}><X size={11} /></button>}
                </span>
            </div>
            <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-[#FC6161]" />
            {help && <p className="bld-help">{help}</p>}
        </div>
    )
}

/** A color: swatch picker + hex box. Empty means "follow the theme". */
export function ColorInput({ label, value, onChange, placeholder }: { label: string; value: string | undefined; onChange: (v: string | undefined) => void; placeholder?: string }) {
    const id = useId()
    const [draft, setDraft] = useState<string | null>(null)
    const shown = draft ?? value ?? ''
    return (
        <Field label={label} htmlFor={id}>
            <div className="flex items-center gap-2">
                <input type="color" aria-label={`${label} picker`} value={isHexColor(value) ? value : (placeholder && isHexColor(placeholder) ? placeholder : '#000000')} onChange={e => onChange(e.target.value)}
                    className="h-8 w-9 flex-none cursor-pointer rounded-md border-0 bg-transparent p-0" />
                <input id={id} className="bld-input" value={shown} placeholder={placeholder ? `Theme (${placeholder})` : 'Theme'}
                    onChange={e => { setDraft(e.target.value); if (isHexColor(e.target.value)) onChange(e.target.value) }}
                    onBlur={() => { if (draft !== null && draft.trim() === '') onChange(undefined); setDraft(null) }} />
                {value && <button type="button" className="bld-icon-btn" title="Use the theme color" aria-label={`Reset ${label}`} onClick={() => onChange(undefined)}><X size={14} /></button>}
            </div>
        </Field>
    )
}

// ─── Media ───────────────────────────────────────────────────────────────────

function useUpload() {
    const { businessId } = useEditor()
    const [busy, setBusy] = useState<number | null>(null)
    const [error, setError] = useState('')
    async function upload(file: File): Promise<SiteMedia | null> {
        setError(''); setBusy(0)
        try {
            return await uploadSiteMedia(file, businessId, f => setBusy(f))
        } catch (e) {
            setError(e instanceof UploadError ? e.message : 'That upload didn’t work. Please try again.')
            return null
        } finally { setBusy(null) }
    }
    return { upload, busy, error }
}

function Thumb({ media }: { media: SiteMedia }) {
    return media.kind === 'video'
        ? <video src={media.url} muted playsInline className="h-full w-full object-cover" />
        : <img src={media.url} alt="" className="h-full w-full object-cover" />
}

export function MediaInput({ label, value, onChange, accept = 'image', help }: { label: string; value: SiteMedia | null; onChange: (v: SiteMedia | null) => void; accept?: 'image' | 'media'; help?: string }) {
    const input = useRef<HTMLInputElement>(null)
    const { upload, busy, error } = useUpload()
    return (
        <Field label={label} help={error || (accept === 'media' ? [help, VIDEO_NOTE].filter(Boolean).join(' ') : help)}>
            <div className="flex items-center gap-3">
                <button type="button" onClick={() => input.current?.click()} disabled={busy !== null}
                    className="relative flex h-16 w-24 flex-none items-center justify-center overflow-hidden rounded-lg"
                    style={{ border: '1.5px dashed var(--b-line)', background: '#fff', color: 'var(--b-muted)' }}
                    aria-label={value ? `Replace ${label}` : `Upload ${label}`}>
                    {busy !== null ? <Loader2 size={18} className="animate-spin" /> : value ? <Thumb media={value} /> : <ImagePlus size={18} />}
                </button>
                <div className="flex flex-col items-start gap-1 text-[12px]">
                    <button type="button" className="font-semibold" style={{ color: 'var(--b-coral)' }} onClick={() => input.current?.click()} disabled={busy !== null}>
                        {busy !== null ? `Uploading ${Math.round(busy * 100)}%` : value ? 'Replace' : accept === 'media' ? 'Upload photo or video' : 'Upload photo'}
                    </button>
                    {value && <button type="button" style={{ color: 'var(--b-muted)' }} onClick={() => onChange(null)}>Remove</button>}
                </div>
            </div>
            <input ref={input} type="file" hidden accept={accept === 'media' ? MEDIA_ACCEPT : IMAGE_ACCEPT}
                onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) { const m = await upload(f); if (m) onChange(m) } }} />
        </Field>
    )
}

export function MediaListInput({ label, value, onChange, max, help }: { label: string; value: SiteMedia[]; onChange: (v: SiteMedia[]) => void; max: number; help?: string }) {
    const input = useRef<HTMLInputElement>(null)
    const { upload, busy, error } = useUpload()
    const list = value ?? []
    return (
        <Field label={`${label} (${list.length}/${max})`} help={error || [help, VIDEO_NOTE].filter(Boolean).join(' ')}>
            <div className="grid grid-cols-4 gap-2">
                {list.map((m, i) => (
                    <div key={m.url + i} className="group relative aspect-square overflow-hidden rounded-md" style={{ border: '1px solid var(--b-line)' }}>
                        <Thumb media={m} />
                        {m.kind === 'video' && <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] font-semibold text-white">Video</span>}
                        <button type="button" aria-label={m.kind === 'video' ? 'Remove video' : 'Remove photo'} onClick={() => onChange(list.filter((_, j) => j !== i))}
                            className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"><X size={12} /></button>
                    </div>
                ))}
                {list.length < max && (
                    <button type="button" onClick={() => input.current?.click()} disabled={busy !== null} aria-label={`Add to ${label}`}
                        className="flex aspect-square items-center justify-center rounded-md" style={{ border: '1.5px dashed var(--b-line)', color: 'var(--b-muted)', background: '#fff' }}>
                        {busy !== null ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    </button>
                )}
            </div>
            <input ref={input} type="file" hidden multiple accept={MEDIA_ACCEPT}
                onChange={async e => {
                    const files = [...(e.target.files ?? [])].slice(0, max - list.length); e.target.value = ''
                    let next = list
                    for (const f of files) { const m = await upload(f); if (m) { next = [...next, m]; onChange(next) } }
                }} />
        </Field>
    )
}

// ─── Links ───────────────────────────────────────────────────────────────────

const ANCHORS = [
    ['#about', 'About section'], ['#services', 'Services section'], ['#gallery', 'Gallery section'], ['#reviews', 'Reviews section'],
    ['#hours', 'Hours section'], ['#contact', 'Contact section'], ['#faq', 'FAQ section'], ['#offers', 'Offers section'],
] as const

/** A button: its label and where it goes (booking, a service, a section, or a web link). */
export function LinkInput({ label, value, onChange, help }: { label: string; value: LinkValue; onChange: (v: LinkValue) => void; help?: string }) {
    const { info } = useEditor()
    const v = value ?? { label: '', href: 'book' }
    const kind = v.href === 'book' ? 'book' : v.href.startsWith('book:') ? 'service' : v.href.startsWith('#') ? 'section' : 'web'
    const id = useId()
    return (
        <fieldset className="bld-field rounded-lg p-2.5" style={{ border: '1px solid var(--b-line)' }}>
            <legend className="bld-label px-1">{label}</legend>
            <input id={id} className="bld-input" aria-label={`${label} text`} placeholder="Button text (leave empty to hide)" maxLength={40} value={v.label} onChange={e => onChange({ ...v, label: e.target.value })} />
            <select className="bld-select" aria-label={`${label} goes to`} value={kind} onChange={e => {
                const k = e.target.value
                onChange({ ...v, href: k === 'book' ? 'book' : k === 'service' ? `book:${info.services[0]?.id ?? ''}` : k === 'section' ? '#services' : 'https://' })
            }}>
                <option value="book">Opens booking</option>
                {info.services.length > 0 && <option value="service">Books a service</option>}
                <option value="section">Scrolls to a section</option>
                <option value="web">Opens a link</option>
            </select>
            {kind === 'service' && (
                <select className="bld-select" aria-label="Service" value={v.href.slice(5)} onChange={e => onChange({ ...v, href: `book:${e.target.value}` })}>
                    {info.services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            )}
            {kind === 'section' && (
                <select className="bld-select" aria-label="Section" value={v.href} onChange={e => onChange({ ...v, href: e.target.value })}>
                    {ANCHORS.map(([h, l]) => <option key={h} value={h}>{l}</option>)}
                </select>
            )}
            {kind === 'web' && (
                <input className="bld-input" aria-label="Link address" placeholder="https://, mailto: or tel:" value={v.href} onChange={e => onChange({ ...v, href: e.target.value.trim() })} />
            )}
            {help && <p className="bld-help">{help}</p>}
        </fieldset>
    )
}

// ─── Services ────────────────────────────────────────────────────────────────

export function ServicesInput({ label, value, onChange, help }: { label: string; value: ServicePick; onChange: (v: ServicePick) => void; help?: string }) {
    const { info } = useEditor()
    const v = value ?? { mode: 'all', ids: [], limit: 0 }
    return (
        <div className="bld-field">
            <Segmented label={label} value={v.mode} onChange={mode => onChange({ ...v, mode, ids: mode === 'picked' && !v.ids.length ? info.services.slice(0, 3).map(s => s.id) : v.ids })}
                options={[{ value: 'all', label: 'All services' }, { value: 'picked', label: 'Pick services' }]} />
            {v.mode === 'picked' && (
                <div className="grid gap-1.5">
                    {info.services.map(s => (
                        <label key={s.id} className="flex items-center gap-2 text-[13px]">
                            <input type="checkbox" className="accent-[#FC6161]" checked={v.ids.includes(s.id)}
                                onChange={e => onChange({ ...v, ids: e.target.checked ? [...v.ids, s.id] : v.ids.filter(x => x !== s.id) })} />
                            <span className="min-w-0 flex-1 truncate">{s.name}</span>
                        </label>
                    ))}
                    {!info.services.length && <p className="bld-help">Add services in Services first.</p>}
                </div>
            )}
            {v.mode === 'all' && (
                <Slider label="Most to show" value={v.limit} min={0} max={24} onChange={limit => onChange({ ...v, limit })} help={v.limit === 0 ? 'Showing all of them.' : undefined} />
            )}
            {help && <p className="bld-help">{help}</p>}
            <p className="bld-help">Names, prices and times come from your Services page.</p>
        </div>
    )
}

// ─── Lists (stats, FAQs, team…) ──────────────────────────────────────────────

export function ListInput({ spec, value, onChange }: { spec: Extract<FieldSpec, { kind: 'list' }>; value: Record<string, unknown>[]; onChange: (v: Record<string, unknown>[]) => void }) {
    const list = value ?? []
    const move = (i: number, d: number) => { const n = [...list]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); onChange(n) }
    return (
        <div className="bld-field">
            <span className="bld-label">{spec.label}</span>
            {list.map((item, i) => (
                <div key={i} className="grid gap-2 rounded-lg p-2.5" style={{ border: '1px solid var(--b-line)', background: '#fff' }}>
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold" style={{ color: 'var(--b-muted)' }}>{spec.itemLabel} {i + 1}</span>
                        <span className="flex">
                            <button type="button" className="bld-icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={14} /></button>
                            <button type="button" className="bld-icon-btn" aria-label="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)}><ArrowDown size={14} /></button>
                            <button type="button" className="bld-icon-btn" aria-label={`Remove ${spec.itemLabel}`} onClick={() => onChange(list.filter((_, j) => j !== i))}><Trash2 size={14} /></button>
                        </span>
                    </div>
                    <ContentFields fields={spec.fields} content={item} onChange={patch => onChange(list.map((x, j) => (j === i ? { ...x, ...patch } : x)))} />
                </div>
            ))}
            {list.length < spec.max && (
                <button type="button" className="bld-btn" onClick={() => onChange([...list, structuredClone(spec.empty)])}><Plus size={14} /> Add {spec.itemLabel.toLowerCase()}</button>
            )}
            {spec.help && <p className="bld-help">{spec.help}</p>}
        </div>
    )
}

/** Draws a section's content fields from its FieldSpec list. */
export function ContentFields({ fields, content, onChange }: { fields: FieldSpec[]; content: Record<string, any>; onChange: (patch: Record<string, unknown>) => void }) {
    return (
        <>
            {fields.map(f => {
                // key '' edits the whole item (e.g. a list of links whose items are LinkValues).
                const set = (v: unknown) => onChange(f.key === '' ? (v as Record<string, unknown>) : { [f.key]: v })
                const v = f.key === '' ? content : content[f.key]
                switch (f.kind) {
                    case 'text': return <TextInput key={f.key} label={f.label} value={v ?? ''} onChange={set} placeholder={f.placeholder} max={f.max} help={f.help} />
                    case 'textarea': return <TextArea key={f.key} label={f.label} value={v ?? ''} onChange={set} placeholder={f.placeholder} max={f.max} rows={f.rows} help={f.help} />
                    case 'media': return <MediaInput key={f.key} label={f.label} value={v ?? null} onChange={set} accept={f.accept} help={f.help} />
                    case 'mediaList': return <MediaListInput key={f.key} label={f.label} value={v ?? []} onChange={set} max={f.max} help={f.help} />
                    case 'link': return <LinkInput key={f.key} label={f.label} value={v} onChange={set} help={f.help} />
                    case 'toggle': return <Toggle key={f.key} label={f.label} checked={!!v} onChange={set} help={f.help} />
                    case 'select': return <Select key={f.key} label={f.label} value={v ?? f.options[0]?.value} options={f.options} onChange={set} help={f.help} />
                    case 'number': return <Slider key={f.key} label={f.label} value={Number(v ?? f.min)} min={f.min} max={f.max} step={f.step} onChange={set} help={f.help} />
                    case 'list': return <ListInput key={f.key} spec={f} value={v ?? []} onChange={set} />
                    case 'services': return <ServicesInput key={f.key} label={f.label} value={v} onChange={set} help={f.help} />
                }
            })}
        </>
    )
}
