import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React, { useEffect, useRef, useState } from "react"

const inputBase = "h-[26px] w-full rounded-[3px] text-[11px] bg-[#F4F1EC] border-0 outline-none focus:ring-1 focus:ring-[#FC6161]/50 text-[#1A1818] placeholder:text-[#A09790]"

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
        className={cn("flex items-center gap-1.5 rounded-[3px] px-1.5 cursor-pointer", className)}
        style={{ height: 26, background: '#F4F1EC', minWidth: 80 }}
    >
        <div className="relative shrink-0">
            <div className="size-3.5 rounded-[2px] border border-black/10 shadow-sm" style={{ backgroundColor: value ?? '#000000' }} />
            <input type="color" value={value ?? '#000000'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
        </div>
        <span className="text-[11px] font-mono truncate flex-1" style={{ color: '#A09790' }}>{value}</span>
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
