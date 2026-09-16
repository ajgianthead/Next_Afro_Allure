import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React, { useEffect, useRef, useState } from "react"
import { ColorPickerPopover } from "./colorPickerPopover"
import { FontBoldIcon, FontItalicIcon, UnderlineIcon } from "@radix-ui/react-icons"

const inputBase = "h-[26px] w-full rounded-[3px] text-[11px] bg-[#F4F1EC] border-0 outline-none focus:ring-1 focus:ring-[#FC6161]/50 text-[#1A1818] placeholder:text-[#A09790]"

// Plain-English value labels — the underlying value stays a raw CSS-ish
// token (number/string); only what the stylist reads changes.
export const FONT_WEIGHT_OPTIONS = [
    { label: 'Thin', value: '100' },
    { label: 'Extra Light', value: '200' },
    { label: 'Light', value: '300' },
    { label: 'Normal', value: '400' },
    { label: 'Medium', value: '500' },
    { label: 'Semi Bold', value: '600' },
    { label: 'Bold', value: '700' },
    { label: 'Extra Bold', value: '800' },
    { label: 'Black', value: '900' },
]

export const TEXT_TRANSFORM_OPTIONS = [
    { label: 'Normal', value: 'none' },
    { label: 'ALL CAPS', value: 'uppercase' },
    { label: 'all lowercase', value: 'lowercase' },
    { label: 'Title Case', value: 'capitalize' },
]

export const NumInput = ({ value, onChange, step = 1, allowNegative = true, icon, className = "w-full" }: {
    value: any
    onChange: (v: any) => void
    step?: number
    allowNegative?: boolean
    icon?: React.ReactNode
    className?: string
}) => {
    const [display, setDisplay] = useState(value != null ? String(value) : '')
    const dragRef = useRef<{ startX: number; startVal: number } | null>(null)
    const isDragging = useRef(false)

    // Sync display when the external value changes (e.g. undo/redo)
    useEffect(() => {
        if (!isDragging.current) {
            setDisplay(value != null ? String(value) : '')
        }
    }, [value])

    const commit = (raw: string) => {
        if (raw === '' || raw === '-') return
        const n = parseFloat(raw)
        if (isNaN(n)) { setDisplay(value != null ? String(value) : ''); return }
        const clamped = allowNegative ? n : Math.max(0, n)
        setDisplay(String(clamped))
        onChange(clamped)
    }

    const applyDrag = (e: React.PointerEvent<any>) => {
        if (!dragRef.current) return
        const dx = e.clientX - dragRef.current.startX
        const multiplier = e.shiftKey ? 10 : e.altKey ? 0.1 : 1
        const raw = dragRef.current.startVal + dx * multiplier * step
        const next = Math.round(raw)
        const clamped = allowNegative ? next : Math.max(0, next)
        setDisplay(String(clamped))
        onChange(clamped)
    }

    // ── Icon drag (existing behaviour, unchanged) ─────────────────────────────
    const onIconPointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        dragRef.current = { startX: e.clientX, startVal: parseFloat(display) || 0 }
        isDragging.current = false
        document.body.style.cursor = 'ew-resize'
    }

    const onIconPointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
        if (!dragRef.current) return
        const dx = e.clientX - dragRef.current.startX
        if (Math.abs(dx) < 2 && !isDragging.current) return
        isDragging.current = true
        applyDrag(e)
    }

    const onIconPointerUp = (e: React.PointerEvent<HTMLSpanElement>) => {
        e.currentTarget.releasePointerCapture(e.pointerId)
        dragRef.current = null
        isDragging.current = false
        document.body.style.cursor = ''
    }

    // ── Input-level drag (activates when no icon is present) ─────────────────
    const onInputPointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
        if (icon) return
        dragRef.current = { startX: e.clientX, startVal: parseFloat(display) || 0 }
        isDragging.current = false
    }

    const onInputPointerMove = (e: React.PointerEvent<HTMLInputElement>) => {
        if (!dragRef.current || icon) return
        const dx = e.clientX - dragRef.current.startX
        if (Math.abs(dx) < 3 && !isDragging.current) return
        if (!isDragging.current) {
            isDragging.current = true
            e.currentTarget.setPointerCapture(e.pointerId)
            e.currentTarget.blur()
            document.body.style.cursor = 'ew-resize'
        }
        applyDrag(e)
    }

    const onInputPointerUp = (e: React.PointerEvent<HTMLInputElement>) => {
        if (icon) return
        if (isDragging.current) {
            e.currentTarget.releasePointerCapture(e.pointerId)
            document.body.style.cursor = ''
        }
        dragRef.current = null
        isDragging.current = false
    }

    return (
        <div className={`relative ${className}`}>
            {icon && (
                <span
                    className="absolute left-0 top-0 bottom-0 flex items-center pl-1.5 pr-1 select-none touch-none z-10"
                    style={{ color: '#A09790', fontSize: 11, cursor: 'ew-resize' }}
                    onPointerDown={onIconPointerDown}
                    onPointerMove={onIconPointerMove}
                    onPointerUp={onIconPointerUp}
                >
                    {icon}
                </span>
            )}
            <input
                type="text"
                inputMode="decimal"
                className={cn(inputBase, icon ? "pl-6 pr-1.5" : "px-2")}
                style={!icon ? { cursor: 'ew-resize' } : undefined}
                value={display}
                onChange={e => setDisplay(e.target.value)}
                onBlur={e => commit(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') { commit(display); (e.target as HTMLInputElement).blur() }
                    if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        const next = (parseFloat(display) || 0) + step
                        const clamped = allowNegative ? next : Math.max(0, next)
                        setDisplay(String(clamped)); onChange(clamped)
                    }
                    if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        const next = (parseFloat(display) || 0) - step
                        const clamped = allowNegative ? next : Math.max(0, next)
                        setDisplay(String(clamped)); onChange(clamped)
                    }
                }}
                onPointerDown={onInputPointerDown}
                onPointerMove={onInputPointerMove}
                onPointerUp={onInputPointerUp}
            />
        </div>
    )
}

export const Checkbox = ({ checked, onChange, label }: {
    checked: boolean; onChange: (v: boolean) => void; label?: React.ReactNode
}) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            style={{
                width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                border: checked ? 'none' : '1.5px solid #DAD3CB',
                background: checked ? '#FC6161' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0, cursor: 'pointer',
            }}
        >
            {checked && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.2 5.7L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </button>
        {label != null && <span style={{ fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' }}>{label}</span>}
    </label>
)

// [B] [I] [U] multi-toggle used by every text-style control (Button,
// CustomizableText, text presets).
export const StyleToggle = ({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) => {
    const current: string[] = Array.isArray(value) ? value : []
    const toggle = (v: string) => {
        const next = current.includes(v) ? current.filter(s => s !== v) : [...current, v]
        onChange(next)
    }
    return (
        <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 4, background: '#EEEBE4', width: '100%' }}>
            {([
                { v: 'bold', icon: <FontBoldIcon /> },
                { v: 'italic', icon: <FontItalicIcon /> },
                { v: 'underline', icon: <UnderlineIcon /> },
            ] as const).map(({ v, icon }) => (
                <button
                    key={v}
                    type="button"
                    onClick={() => toggle(v)}
                    style={{
                        flex: 1, height: 22, borderRadius: 3, fontSize: 12,
                        background: current.includes(v) ? '#FC6161' : 'transparent',
                        color: current.includes(v) ? '#fff' : '#A09790',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    {icon}
                </button>
            ))}
        </div>
    )
}

export const SegToggle = ({ value, onChange, options, className = "col-span-3" }: {
    value: any; onChange: (v: any) => void; options: { label: React.ReactNode; value: string }[]; className?: string
}) => (
    <div className={`flex gap-0.5 p-0.5 rounded-[4px] ${className}`} style={{ background: '#EEEBE4' }}>
        {options.map(({ label, value: v }) => (
            <button
                key={v}
                type="button"
                onClick={() => onChange(v)}
                className="flex-1 flex items-center justify-center rounded-[3px] text-[11px] transition-colors"
                style={{ height: 22, background: value === v ? '#FC6161' : 'transparent', color: value === v ? '#fff' : '#A09790', border: 'none' }}
            >
                {label}
            </button>
        ))}
    </div>
)

export const ColorPicker = ({ value, onChange, className }: {
    value: any; onChange: (v: any) => void; className?: string
}) => (
    <div
        className={cn("flex items-center rounded-[3px] px-1.5", className)}
        style={{ height: 26, background: '#F4F1EC', minWidth: 80 }}
    >
        <ColorPickerPopover value={value ?? '#000000'} onChange={onChange} className="w-full" />
    </div>
)

export const StrSelect = ({ value, onChange, options, className }: {
    value: any; onChange: (v: any) => void; options: string[]; className?: string
}) => (
    <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("h-[26px] text-[11px] !bg-[#F4F1EC] !border-0 !shadow-none rounded-[3px] !text-[#1A1818]", className)}>
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            {options.map(o => <SelectItem key={o} value={o} className="text-[11px]">{o}</SelectItem>)}
        </SelectContent>
    </Select>
)

export const KVSelect = ({ value, onChange, options, className }: {
    value: any; onChange: (v: any) => void; options: { label: string; value: string }[]; className?: string
}) => (
    <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("h-[26px] text-[11px] !bg-[#F4F1EC] !border-0 !shadow-none rounded-[3px] !text-[#1A1818]", className)}>
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            {options.map(o => <SelectItem key={o.value} value={o.value} className="text-[11px]">{o.label}</SelectItem>)}
        </SelectContent>
    </Select>
)
