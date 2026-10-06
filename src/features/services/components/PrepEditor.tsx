'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { ServicePrep } from '../pricing'

export const EMPTY_PREP: ServicePrep = { instructions: '', checklist: [], requireAgreement: true }

export function PrepEditor({ value, onChange }: { value: ServicePrep; onChange: (next: ServicePrep) => void }) {
    const [draft, setDraft] = useState('')
    const add = () => {
        const item = draft.trim()
        if (!item || value.checklist.length >= 20) return
        onChange({ ...value, checklist: [...value.checklist, item] })
        setDraft('')
    }
    const hasPrep = value.instructions.trim().length > 0 || value.checklist.length > 0

    return (
        <div className="flex flex-col gap-3 rounded-lg border p-3">
            <div className="flex flex-col gap-0.5">
                <Label>Prep instructions</Label>
                <p className="text-xs text-muted-foreground">
                    Shown before the client books, and repeated in their confirmation and reminder emails.
                </p>
            </div>

            <Textarea
                value={value.instructions}
                onChange={(e) => onChange({ ...value, instructions: e.target.value })}
                placeholder="e.g. Please arrive with your hair washed, detangled and blown out so we can start on time."
                rows={3}
                maxLength={2000}
            />

            <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Checklist</Label>
                {value.checklist.length > 0 && (
                    <ul className="flex flex-col gap-1">
                        {value.checklist.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 rounded-md border px-2 py-1">
                                <input
                                    aria-label={`Checklist item ${i + 1}`}
                                    value={item}
                                    maxLength={200}
                                    onChange={(e) => onChange({ ...value, checklist: value.checklist.map((c, j) => (j === i ? e.target.value : c)) })}
                                    className="flex-1 min-w-0 bg-transparent text-sm outline-none"
                                />
                                <button
                                    type="button"
                                    aria-label={`Remove ${item}`}
                                    onClick={() => onChange({ ...value, checklist: value.checklist.filter((_, j) => j !== i) })}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="flex gap-1.5">
                    <Input
                        value={draft}
                        maxLength={200}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
                        placeholder="e.g. Hair washed and fully dry"
                        className="h-8 text-sm"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={add} disabled={!draft.trim()}>
                        <Plus className="size-3.5" /> Add
                    </Button>
                </div>
            </div>

            {hasPrep && (
                <div className="flex items-start gap-2">
                    <Checkbox
                        id="prep-require-agreement"
                        checked={value.requireAgreement}
                        onCheckedChange={(checked) => onChange({ ...value, requireAgreement: checked === true })}
                    />
                    <label htmlFor="prep-require-agreement" className="text-xs cursor-pointer select-none leading-snug">
                        Client must confirm they&apos;ve read this before booking
                    </label>
                </div>
            )}
        </div>
    )
}
