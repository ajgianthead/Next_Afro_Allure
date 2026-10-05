'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { DateTime } from 'luxon'
import { toast } from 'sonner'
import { Copy, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { openingsCaption, type OpeningDay } from '../openings'
import { getOpenings } from '../server/actions'

type Format = 'post' | 'story'
const SIZES: Record<Format, { w: number; h: number; label: string }> = {
    post: { w: 1080, h: 1350, label: 'Post (4:5)' },
    story: { w: 1080, h: 1920, label: 'Story (9:16)' },
}

/** Readable text colour on top of a background colour. */
function textOn(hex: string): string {
    const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
    if (!m) return '#FFFFFF'
    const [r, g, b] = m.slice(1).map(x => parseInt(x, 16) / 255)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6 ? '#1A1818' : '#FFFFFF'
}

const MAX_DAYS_SHOWN = 7

function draw(canvas: HTMLCanvasElement, opts: {
    format: Format; color: string; businessName: string; serviceName: string; days: OpeningDay[]; link: string
}) {
    const { w, h } = SIZES[opts.format]
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    const fg = textOn(opts.color)
    const soft = fg === '#FFFFFF' ? 'rgba(255,255,255,0.72)' : 'rgba(26,24,24,0.65)'
    const chipBg = fg === '#FFFFFF' ? 'rgba(255,255,255,0.14)' : 'rgba(26,24,24,0.08)'
    const pad = 90
    const serif = 'Georgia, "Times New Roman", serif'
    const sans = 'Arial, Helvetica, sans-serif'

    ctx.fillStyle = opts.color
    ctx.fillRect(0, 0, w, h)

    let y = opts.format === 'story' ? 220 : 140
    ctx.fillStyle = soft
    ctx.font = `600 30px ${sans}`
    ctx.fillText(opts.businessName.toUpperCase(), pad, y)
    y += 110
    ctx.fillStyle = fg
    ctx.font = `400 104px ${serif}`
    ctx.fillText('Openings', pad, y)
    y += 70
    ctx.fillStyle = soft
    ctx.font = `400 36px ${sans}`
    ctx.fillText(opts.serviceName, pad, y, w - pad * 2)
    y += 70

    const shown = opts.days.slice(0, MAX_DAYS_SHOWN)
    if (!shown.length) {
        ctx.fillStyle = fg
        ctx.font = `400 48px ${serif}`
        ctx.fillText('Fully booked — join the waitlist', pad, y + 80, w - pad * 2)
    }
    const footer = 170
    const rowH = Math.min(150, (h - y - footer - 40) / Math.max(1, shown.length))
    for (const day of shown) {
        const label = DateTime.fromISO(day.date).toFormat('ccc LLL d').toUpperCase()
        ctx.fillStyle = fg
        ctx.font = `700 34px ${sans}`
        ctx.fillText(label, pad, y + 44)
        // Time chips
        let x = pad + 270
        ctx.font = `400 34px ${sans}`
        for (const t of day.times) {
            const tw = ctx.measureText(t).width + 44
            if (x + tw > w - pad) break
            ctx.fillStyle = chipBg
            const r = 30, cy = y + 6, ch = 60
            ctx.beginPath()
            ctx.moveTo(x + r, cy)
            ctx.arcTo(x + tw, cy, x + tw, cy + ch, r)
            ctx.arcTo(x + tw, cy + ch, x, cy + ch, r)
            ctx.arcTo(x, cy + ch, x, cy, r)
            ctx.arcTo(x, cy, x + tw, cy, r)
            ctx.fill()
            ctx.fillStyle = fg
            ctx.fillText(t, x + 22, y + 48)
            x += tw + 16
        }
        y += rowH
    }

    ctx.fillStyle = soft
    ctx.font = `400 30px ${sans}`
    ctx.fillText('Book at', pad, h - footer + 40)
    ctx.fillStyle = fg
    ctx.font = `700 40px ${sans}`
    ctx.fillText(opts.link, pad, h - footer + 95, w - pad * 2)
}

export default function OpeningsClient({ services, businessName, brandColor, bookingLink }: {
    services: { id: string; name: string }[]
    businessName: string
    brandColor: string | null
    bookingLink: string
}) {
    const [serviceId, setServiceId] = useState(services[0]?.id ?? '')
    const [span, setSpan] = useState('7')
    const [format, setFormat] = useState<Format>('post')
    const [color, setColor] = useState(brandColor && /^#[0-9a-f]{6}$/i.test(brandColor) ? brandColor : '#1A1818')
    const [days, setDays] = useState<OpeningDay[] | null>(null)
    const [loading, setLoading] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const serviceName = services.find(s => s.id === serviceId)?.name ?? ''

    useEffect(() => {
        if (!serviceId) return
        let active = true
        setLoading(true)
        getOpenings(serviceId, Number(span)).then(res => {
            if (!active) return
            setLoading(false)
            if (res.ok) setDays(res.days)
            else toast.error(res.error)
        })
        return () => { active = false }
    }, [serviceId, span])

    useEffect(() => {
        if (canvasRef.current && days) draw(canvasRef.current, { format, color, businessName, serviceName, days, link: bookingLink })
    }, [days, format, color, businessName, serviceName, bookingLink])

    const caption = useMemo(() => openingsCaption(
        businessName,
        (days ?? []).map(d => ({ label: DateTime.fromISO(d.date).toFormat('ccc L/d'), times: d.times })),
        bookingLink,
    ), [days, businessName, bookingLink])

    const download = () => {
        canvasRef.current?.toBlob(blob => {
            if (!blob) return
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `openings-${format}.png`
            a.click()
            URL.revokeObjectURL(url)
        }, 'image/png')
    }

    const copyCaption = async () => {
        try {
            await navigator.clipboard.writeText(caption)
            toast.success('Caption copied')
        } catch {
            toast.error("Couldn't copy — select the text instead")
        }
    }

    if (!services.length) {
        return <div className="p-6 text-sm text-muted-foreground">Add a service first to share your openings.</div>
    }

    return (
        <div className="px-4 sm:px-6 pb-16">
            <div className="mt-5">
                <h2 className="text-lg font-semibold">Share Openings</h2>
                <p className="text-sm text-muted-foreground max-w-xl">
                    A ready-to-post graphic of your open times, made from your real availability. Download it for Instagram and paste the caption.
                </p>
            </div>
            <Separator className="my-3" />

            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5 text-sm font-medium">
                        Service
                        <Select value={serviceId} onValueChange={setServiceId}>
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-medium">
                        Show
                        <Select value={span} onValueChange={setSpan}>
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Next 7 days</SelectItem>
                                <SelectItem value="14">Next 14 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-medium">
                        Size
                        <Select value={format} onValueChange={v => setFormat(v as Format)}>
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {(Object.keys(SIZES) as Format[]).map(f => <SelectItem key={f} value={f}>{SIZES[f].label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium">
                        Background
                        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-9 w-14 rounded border" />
                    </label>

                    <div className="flex gap-2">
                        <Button onClick={download} disabled={!days || loading}><Download className="size-4" /> Download</Button>
                        <Button variant="outline" onClick={copyCaption} disabled={!days}><Copy className="size-4" /> Copy caption</Button>
                    </div>
                    <textarea readOnly value={caption} className="text-xs rounded-md border p-2 h-40 resize-none" />
                </div>

                <div className="flex justify-center items-start">
                    {loading && !days ? (
                        <Loader2 className="size-6 animate-spin mt-20" />
                    ) : (
                        <canvas
                            ref={canvasRef}
                            className="rounded-xl border shadow-sm w-full h-auto"
                            style={{ maxWidth: format === 'story' ? 320 : 420 }}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
