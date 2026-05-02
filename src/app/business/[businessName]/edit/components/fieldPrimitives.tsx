import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"

export const NumInput = ({ value, onChange, step = 1, icon, className = "w-full" }: {
    value: any; onChange: (v: any) => void; step?: number; icon?: React.ReactNode; className?: string
}) => (
    <div className={`relative ${className}`}>
        {icon && <span className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground flex items-center">{icon}</span>}
        <input
            type="number"
            step={step}
            className={cn("h-6 w-full border border-input rounded-md text-xs bg-background", icon ? "pl-6 pr-2" : "px-2")}
            value={value ?? ''}
            onChange={(e) => onChange(Number(e.target.value))}
        />
    </div>
)

export const SegToggle = ({ value, onChange, options, className = "col-span-3" }: {
    value: any; onChange: (v: any) => void; options: { label: React.ReactNode; value: string }[]; className?: string
}) => (
    <div className={`flex gap-1 ${className}`}>
        {options.map(({ label, value: v }) => (
            <button key={v} type="button" onClick={() => onChange(v)}
                className={cn('flex-1 flex items-center justify-center py-0.5 rounded border text-xs transition-colors',
                    value === v ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:bg-accent')}>
                {label}
            </button>
        ))}
    </div>
)

export const ColorPicker = ({ value, onChange, className = "col-span-3" }: {
    value: any; onChange: (v: any) => void; className?: string
}) => (
    <div className={`flex items-center gap-2 border border-input rounded-md px-2 py-0.5 bg-background cursor-pointer ${className}`}>
        <div className="relative shrink-0">
            <div className="size-4 rounded-sm border shadow-sm" style={{ backgroundColor: value }} />
            <input type="color" value={value ?? '#000000'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
        </div>
        <span className="text-xs font-mono text-muted-foreground truncate">{value}</span>
    </div>
)

export const StrSelect = ({ value, onChange, options, className = "col-span-3" }: {
    value: any; onChange: (v: any) => void; options: string[]; className?: string
}) => (
    <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("h-6 text-xs", className)}><SelectValue /></SelectTrigger>
        <SelectContent>
            {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
    </Select>
)

export const KVSelect = ({ value, onChange, options, className = "col-span-3" }: {
    value: any; onChange: (v: any) => void; options: { label: string; value: string }[]; className?: string
}) => (
    <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn("h-6 text-xs", className)}><SelectValue /></SelectTrigger>
        <SelectContent>
            {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
    </Select>
)
