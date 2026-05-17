import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"

const inputBase = "h-[26px] w-full rounded-[3px] text-[11px] bg-[#F4F1EC] border-0 outline-none focus:ring-1 focus:ring-[#C9974A]/50 text-[#1A1818] placeholder:text-[#A09790]"
const spinnerOff = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"

export const NumInput = ({ value, onChange, step = 1, icon, className = "w-full" }: {
    value: any; onChange: (v: any) => void; step?: number; icon?: React.ReactNode; className?: string
}) => (
    <div className={`relative ${className}`}>
        {icon && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center" style={{ color: '#A09790', fontSize: 12 }}>
                {icon}
            </span>
        )}
        <input
            type="number"
            step={step}
            className={cn(inputBase, spinnerOff, icon ? "pl-7 pr-1.5" : "px-2")}
            value={value ?? ''}
            onChange={(e) => onChange(Number(e.target.value))}
        />
    </div>
)

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
