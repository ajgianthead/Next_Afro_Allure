'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-1">
            <Label className="text-xs">{label}</Label>
            <div className="flex items-center gap-2">
                <div className="relative size-7 rounded-md border overflow-hidden cursor-pointer shrink-0">
                    <div className="absolute inset-0" style={{ backgroundColor: value }} />
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{value.toUpperCase()}</span>
            </div>
        </div>
    )
}

export function HeroForm({ element, index, setEditorState }: { element: any; index: number; setEditorState: any }) {
    const [data, setData] = useState({ ...element.data })

    const update = (key: string, value: any) => {
        const next = { ...data, [key]: value }
        setData(next)
        setEditorState((prev: any[]) => {
            const clone = [...prev]
            clone[index] = { ...prev[index], data: next }
            return clone
        })
    }

    return (
        <div className="space-y-3 py-1">
            <div className="space-y-1">
                <Label className="text-xs">Headline</Label>
                <Input
                    value={data.headline}
                    onChange={(e) => update('headline', e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Book Your Next Look"
                />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">
                    Subheadline <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                    value={data.subheadline}
                    onChange={(e) => update('subheadline', e.target.value)}
                    className="h-8 text-sm"
                    placeholder=""
                />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">Button label</Label>
                <Input
                    value={data.cta_label}
                    onChange={(e) => update('cta_label', e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Book Now"
                />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">
                    Background image URL <span className="text-muted-foreground">(optional — overrides background color)</span>
                </Label>
                <Input
                    value={data.image_url}
                    onChange={(e) => update('image_url', e.target.value)}
                    className="h-8 text-sm font-mono"
                    placeholder="https://..."
                />
            </div>
            <div className="flex gap-6">
                <ColorField label="Background color" value={data.background_color} onChange={(v) => update('background_color', v)} />
                <ColorField label="Text color" value={data.text_color} onChange={(v) => update('text_color', v)} />
            </div>
            {doneButton(index, setEditorState)}
        </div>
    )
}

function doneButton(index: number, setEditorState: any) {
    return (
        <Button
            size="sm"
            onClick={() =>
                setEditorState((prev: any[]) => {
                    const updated = [...prev]
                    updated[index] = { ...prev[index], editing: false }
                    return updated
                })
            }
        >
            Done
        </Button>
    )
}

export function ServicesForm({ element, index, setEditorState }: { element: any; index: number; setEditorState: any }) {
    const [data, setData] = useState({ ...element.data })

    const update = (key: string, value: any) => {
        const next = { ...data, [key]: value }
        setData(next)
        setEditorState((prev: any[]) => {
            const clone = [...prev]
            clone[index] = { ...prev[index], data: next }
            return clone
        })
    }

    return (
        <div className="space-y-3 py-1">
            <div className="space-y-1">
                <Label className="text-xs">Section headline</Label>
                <Input
                    value={data.headline}
                    onChange={(e) => update('headline', e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Services"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={!!data.show_price}
                        onChange={(e) => update('show_price', e.target.checked)}
                        className="rounded"
                    />
                    <span className="text-xs text-muted-foreground">Show price</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={!!data.show_duration}
                        onChange={(e) => update('show_duration', e.target.checked)}
                        className="rounded"
                    />
                    <span className="text-xs text-muted-foreground">Show duration</span>
                </label>
            </div>
            <p className="text-xs text-muted-foreground">
                Your services are pulled automatically from your service list.
            </p>
            {doneButton(index, setEditorState)}
        </div>
    )
}

export function AboutForm({ element, index, setEditorState }: { element: any; index: number; setEditorState: any }) {
    const [data, setData] = useState({ ...element.data })

    const update = (key: string, value: any) => {
        const next = { ...data, [key]: value }
        setData(next)
        setEditorState((prev: any[]) => {
            const clone = [...prev]
            clone[index] = { ...prev[index], data: next }
            return clone
        })
    }

    return (
        <div className="space-y-3 py-1">
            <div className="space-y-1">
                <Label className="text-xs">Your first name or preferred name</Label>
                <Input
                    value={data.display_name}
                    onChange={(e) => update('display_name', e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Aisha"
                />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">
                    Bio <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                    value={data.bio}
                    onChange={(e) => update('bio', e.target.value)}
                    className="text-sm resize-none"
                    rows={4}
                    placeholder="Tell clients a little about yourself..."
                />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">
                    Photo URL <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                    value={data.image_url}
                    onChange={(e) => update('image_url', e.target.value)}
                    className="h-8 text-sm font-mono"
                    placeholder="https://..."
                />
            </div>
            {doneButton(index, setEditorState)}
        </div>
    )
}

export function BookCtaForm({ element, index, setEditorState }: { element: any; index: number; setEditorState: any }) {
    const [data, setData] = useState({ ...element.data })

    const update = (key: string, value: any) => {
        const next = { ...data, [key]: value }
        setData(next)
        setEditorState((prev: any[]) => {
            const clone = [...prev]
            clone[index] = { ...prev[index], data: next }
            return clone
        })
    }

    return (
        <div className="space-y-3 py-1">
            <div className="space-y-1">
                <Label className="text-xs">Headline</Label>
                <Input value={data.headline} onChange={(e) => update('headline', e.target.value)} className="h-8 text-sm" placeholder="Ready to book?" />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">Subheadline <span className="text-muted-foreground">(optional)</span></Label>
                <Input value={data.subheadline} onChange={(e) => update('subheadline', e.target.value)} className="h-8 text-sm" placeholder="" />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">Button label</Label>
                <Input value={data.cta_label} onChange={(e) => update('cta_label', e.target.value)} className="h-8 text-sm" placeholder="Book Now" />
            </div>
            <p className="text-xs text-muted-foreground">Background and button use your brand color.</p>
            {doneButton(index, setEditorState)}
        </div>
    )
}

export function AnnouncementForm({ element, index, setEditorState }: { element: any; index: number; setEditorState: any }) {
    const [data, setData] = useState({ ...element.data })

    const update = (key: string, value: any) => {
        const next = { ...data, [key]: value }
        setData(next)
        setEditorState((prev: any[]) => {
            const clone = [...prev]
            clone[index] = { ...prev[index], data: next }
            return clone
        })
    }

    return (
        <div className="space-y-3 py-1">
            <div className="space-y-1">
                <Label className="text-xs">Announcement text</Label>
                <Textarea
                    value={data.text}
                    onChange={(e) => update('text', e.target.value)}
                    className="text-sm resize-none"
                    rows={3}
                    placeholder="New announcement..."
                />
            </div>
            <div className="flex gap-6">
                <ColorField label="Background" value={data.background_color} onChange={(v) => update('background_color', v)} />
                <ColorField label="Text color" value={data.text_color} onChange={(v) => update('text_color', v)} />
            </div>
            {doneButton(index, setEditorState)}
        </div>
    )
}

export function TestimonialsForm({ element, index, setEditorState }: { element: any; index: number; setEditorState: any }) {
    const [data, setData] = useState({ ...element.data })

    const update = (key: string, value: any) => {
        const next = { ...data, [key]: value }
        setData(next)
        setEditorState((prev: any[]) => {
            const clone = [...prev]
            clone[index] = { ...prev[index], data: next }
            return clone
        })
    }

    const updateItem = (i: number, key: string, value: string) => {
        const items = [...(data.items ?? [])]
        items[i] = { ...items[i], [key]: value }
        update('items', items)
    }

    const addItem = () => update('items', [...(data.items ?? []), { name: '', text: '' }])

    const removeItem = (i: number) => {
        const items = [...(data.items ?? [])]
        items.splice(i, 1)
        update('items', items)
    }

    return (
        <div className="space-y-3 py-1">
            <div className="space-y-1">
                <Label className="text-xs">Section headline</Label>
                <Input value={data.headline} onChange={(e) => update('headline', e.target.value)} className="h-8 text-sm" placeholder="What clients say" />
            </div>
            <div className="flex flex-col gap-2">
                {(data.items ?? []).map((item: any, i: number) => (
                    <div key={i} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Testimonial {i + 1}</Label>
                            <button onClick={() => removeItem(i)} className="text-xs text-destructive hover:underline">Remove</button>
                        </div>
                        <Input value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} className="h-7 text-sm" placeholder="Client name" />
                        <Textarea value={item.text} onChange={(e) => updateItem(i, 'text', e.target.value)} className="text-sm resize-none" rows={2} placeholder="Their review..." />
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={addItem} className="w-full">+ Add Testimonial</Button>
            </div>
            {doneButton(index, setEditorState)}
        </div>
    )
}

export function ContactForm({ element, index, setEditorState }: { element: any; index: number; setEditorState: any }) {
    const [data, setData] = useState({ ...element.data })

    const update = (key: string, value: any) => {
        const next = { ...data, [key]: value }
        setData(next)
        setEditorState((prev: any[]) => {
            const clone = [...prev]
            clone[index] = { ...prev[index], data: next }
            return clone
        })
    }

    return (
        <div className="space-y-3 py-1">
            <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input value={data.email} onChange={(e) => update('email', e.target.value)} className="h-8 text-sm" placeholder="you@example.com" />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">Phone <span className="text-muted-foreground">(optional)</span></Label>
                <Input value={data.phone} onChange={(e) => update('phone', e.target.value)} className="h-8 text-sm" placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">Instagram handle <span className="text-muted-foreground">(without @)</span></Label>
                <Input value={data.instagram} onChange={(e) => update('instagram', e.target.value)} className="h-8 text-sm" placeholder="yourhandle" />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">Facebook page <span className="text-muted-foreground">(username or page name)</span></Label>
                <Input value={data.facebook} onChange={(e) => update('facebook', e.target.value)} className="h-8 text-sm" placeholder="yourpage" />
            </div>
            {doneButton(index, setEditorState)}
        </div>
    )
}

export function LocationForm({ element, index, setEditorState }: { element: any; index: number; setEditorState: any }) {
    const [data, setData] = useState({ ...element.data })

    const update = (key: string, value: any) => {
        const next = { ...data, [key]: value }
        setData(next)
        setEditorState((prev: any[]) => {
            const clone = [...prev]
            clone[index] = { ...prev[index], data: next }
            return clone
        })
    }

    return (
        <div className="space-y-3 py-1">
            <div className="space-y-1">
                <Label className="text-xs">Street address <span className="text-muted-foreground">(optional)</span></Label>
                <Input value={data.street_address} onChange={(e) => update('street_address', e.target.value)} className="h-8 text-sm" placeholder="123 Main St" />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">City, State</Label>
                <Input value={data.city_state} onChange={(e) => update('city_state', e.target.value)} className="h-8 text-sm" placeholder="Atlanta, GA" />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">Directions note <span className="text-muted-foreground">(optional)</span></Label>
                <Input value={data.directions_note} onChange={(e) => update('directions_note', e.target.value)} className="h-8 text-sm" placeholder="Suite 4B, ring the buzzer" />
            </div>
            <p className="text-xs text-muted-foreground">Google Maps link uses street address if provided, otherwise city and state.</p>
            {doneButton(index, setEditorState)}
        </div>
    )
}
