'use client'

import { ExternalLink, Globe, LayoutPanelTop, LayoutTemplate, Loader2, Pencil, PencilRuler, RefreshCw, X } from 'lucide-react'
import React, { useState } from 'react'
import { Database, Json } from '../../../../../lib/database.types'
import { isURLNameAvailable, updateBookingTheme, updateBusinessURL } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { WebBuilderManageTour } from '@/features/tour/tours/WebBuilderManageTour'
import { TemplateCardList } from '@/app/business/[businessName]/edit/templatePicker'
import { Template } from '@/features/editor/templates'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

const B = {
    bg: '#FAF7F2',
    white: '#FFFFFF',
    border: '#E8E2D6',
    primary: '#FC6161',
    gold: '#C9974A',
    dark: '#1A1818',
    muted: '#6F6863',
    cream: '#F0EBE3',
}

const FONTS = [
    'Inter', 'Fraunces', 'Roboto', 'Lato', 'Playfair Display',
    'Montserrat', 'Poppins', 'DM Sans', 'Nunito', 'Open Sans',
]

const RADIUS_OPTIONS = [
    { label: 'Sharp', value: '4px' },
    { label: 'Rounded', value: '12px' },
    { label: 'Pill', value: '9999px' },
]

const DEFAULT_THEME = {
    primaryColor: '#FC6161',
    secondaryColor: '#C9974A',
    backgroundColor: '#FAF7F2',
    cardColor: '#FFFFFF',
    textColor: '#1A1818',
    fontFamily: 'Fraunces',
    buttonRadius: '12px',
}

interface ThemeSettings {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    cardColor: string
    textColor: string
    fontFamily: string
    buttonRadius: string
}

interface PageProps {
    urlName: string
    editorData: {
        business_id: string | null
        created_at: string
        editor_data: string | null
        id: string
        image_objects: Json[] | null
        section_data: Json[] | null
        theme_data: Record<string, string>
        type: Database['public']['Enums']['web_editor'] | null
        updated_at: string | null
    }
}

function ColorRow({
    label,
    colorKey,
    value,
    onChange,
}: {
    label: string
    colorKey: keyof ThemeSettings
    value: string
    onChange: (key: keyof ThemeSettings, value: string) => void
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: B.muted }}>
                {label}
            </p>
            <div
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                style={{ backgroundColor: B.cream, border: `1.5px solid ${B.border}` }}
            >
                <div className="relative shrink-0">
                    <div
                        className="size-5 rounded-md shadow-sm"
                        style={{ backgroundColor: value, border: `1px solid ${B.border}` }}
                    />
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(colorKey, e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full"
                        style={{ cursor: 'pointer' }}
                    />
                </div>
                <span className="text-sm font-mono" style={{ color: B.dark }}>
                    {value}
                </span>
            </div>
        </div>
    )
}

const ManageBookingSite = ({ urlName, editorData }: PageProps) => {
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
        ...DEFAULT_THEME,
        ...(editorData.theme_data as Partial<ThemeSettings>),
    })
    const [updatingTheme, setUpdatingTheme] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editUrlName, setEditUrlName] = useState(false)
    const [newUrlName, setNewUrlName] = useState(urlName)
    const [editedUrlName, setEditedUrlName] = useState(urlName)
    const [templatePickerOpen, setTemplatePickerOpen] = useState(false)

    const isCustom = editorData.type === 'CUSTOM'
    const bookingPageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${newUrlName}`
    const editPageLink = isCustom
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/${newUrlName}/edit`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/booking-site/upload-sections`
    const isInvalid = editedUrlName.length > 0 && !/^[a-z]+$/.test(editedUrlName)
    const previewUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${editedUrlName || '…'}`

    const setColor = (key: keyof ThemeSettings, value: string) =>
        setThemeSettings(prev => ({ ...prev, [key]: value }))

    const updateTheme = async () => {
        setUpdatingTheme(true)
        try {
            await updateBookingTheme(themeSettings, editorData.business_id!)
            toast.success('Appearance saved')
        } catch {
            toast.error('Failed to save appearance')
        } finally {
            setUpdatingTheme(false)
        }
    }

    const handleUpdateUrl = async () => {
        setLoading(true)
        try {
            const available = await isURLNameAvailable(editedUrlName)
            if (!available) {
                setError('This URL name is already taken')
                return
            }
            const updateError = await updateBusinessURL(editorData.business_id!, editedUrlName)
            if (updateError) throw updateError
            setEditUrlName(false)
            setNewUrlName(editedUrlName)
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: B.bg }} className="px-4 py-10 sm:px-6 sm:py-12">
            <WebBuilderManageTour />

            {/* URL Edit Dialog */}
            <Dialog open={editUrlName} onOpenChange={(open) => {
                if (!open) {
                    setEditedUrlName(newUrlName)
                    setError(null)
                }
                setEditUrlName(open)
            }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Booking Page URL</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>URL slug</Label>
                            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                                <li>Lowercase letters only (a–z)</li>
                                <li>No spaces, numbers, or special characters</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <p className="text-sm text-muted-foreground whitespace-nowrap shrink-0">
                                    {process.env.NEXT_PUBLIC_BASE_URL}/
                                </p>
                                <Input
                                    value={editedUrlName}
                                    onChange={(e) => {
                                        setEditedUrlName(e.target.value)
                                        setError(null)
                                    }}
                                    className={isInvalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                                    placeholder="yourbusiness"
                                />
                            </div>
                            {isInvalid && (
                                <p className="text-xs text-destructive">Only lowercase letters (a–z) allowed</p>
                            )}
                            {error && (
                                <p className="text-xs text-destructive">{error}</p>
                            )}
                        </div>
                        <div className="rounded-lg bg-muted/50 border px-3 py-2.5">
                            <p className="text-xs text-muted-foreground mb-0.5">Preview</p>
                            <p className="text-sm font-mono truncate">{previewUrl}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-1">
                        <Button
                            disabled={isInvalid || editedUrlName === newUrlName || loading || editedUrlName.length === 0}
                            onClick={handleUpdateUrl}
                        >
                            {loading && <Loader2 className="size-4 animate-spin mr-2" />}
                            Update URL
                        </Button>
                        <Button variant="outline" onClick={() => {
                            setEditUrlName(false)
                            setEditedUrlName(newUrlName)
                            setError(null)
                        }}>
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Template Picker Sheet */}
            <Sheet open={templatePickerOpen} onOpenChange={setTemplatePickerOpen}>
                <SheetContent side="left" style={{ width: 520, maxWidth: '90vw', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <SheetHeader style={{ flexShrink: 0 }}>
                        <SheetTitle style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: '#1A1818' }}>
                            Choose a Template
                        </SheetTitle>
                        <p style={{ fontSize: 13, color: '#6F6863', marginTop: 4 }}>
                            Select a template to open in the editor — you can preview and apply it there.
                        </p>
                    </SheetHeader>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <TemplateCardList onSelect={(t: Template) => {
                            setTemplatePickerOpen(false)
                            window.open(`${editPageLink}?template=${t.id}`, '_blank')
                        }} />
                    </div>
                </SheetContent>
            </Sheet>

            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <div data-tour="builder-publish" className="flex items-start justify-between mb-8 gap-4 flex-wrap">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                            <h1
                                className="text-2xl font-medium"
                                style={{ fontFamily: SERIF, color: B.dark }}
                            >
                                Booking Site
                            </h1>
                            <span
                                className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a' }}
                            >
                                <span className="size-1.5 rounded-full bg-current inline-block" />
                                Live
                            </span>
                        </div>
                        <p className="text-sm" style={{ color: B.muted }}>
                            Manage your public booking page, appearance, and editor settings.
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <a
                            href={bookingPageUrl}
                            target="_blank"
                            className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-xl transition-opacity hover:opacity-75"
                            style={{
                                backgroundColor: B.white,
                                border: `1.5px solid ${B.border}`,
                                color: B.dark,
                            }}
                        >
                            <ExternalLink size={14} />
                            Visit Site
                        </a>
                        {isCustom && (
                            <button
                                type="button"
                                onClick={() => setTemplatePickerOpen(true)}
                                className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-xl transition-opacity hover:opacity-75"
                                style={{
                                    backgroundColor: B.white,
                                    border: `1.5px solid ${B.border}`,
                                    color: B.dark,
                                }}
                            >
                                <LayoutTemplate size={14} />
                                Change Template
                            </button>
                        )}
                        <a
                            href={editPageLink}
                            target="_blank"
                            className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-xl transition-opacity hover:opacity-75"
                            style={{ backgroundColor: B.dark, color: B.white }}
                        >
                            {isCustom ? <PencilRuler size={14} /> : <LayoutPanelTop size={14} />}
                            Edit Page
                        </a>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                    {/* Left — Site Details */}
                    <div
                        className="lg:col-span-2 rounded-2xl p-6 flex flex-col gap-5"
                        style={{ backgroundColor: B.white, border: `1.5px solid ${B.border}` }}
                    >
                        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: B.muted }}>
                            Site Details
                        </p>

                        <div className="h-px" style={{ backgroundColor: B.border }} />

                        {/* URL row */}
                        <div className="flex flex-col gap-2">
                            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: B.muted }}>
                                Page URL
                            </p>
                            <div
                                className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5"
                                style={{ backgroundColor: B.cream, border: `1.5px solid ${B.border}` }}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <Globe size={13} style={{ color: B.muted, flexShrink: 0 }} />
                                    <a
                                        href={bookingPageUrl}
                                        target="_blank"
                                        className="text-sm truncate hover:underline"
                                        style={{ color: B.dark }}
                                    >
                                        {bookingPageUrl}
                                    </a>
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                className="shrink-0 p-1.5 rounded-lg transition-opacity hover:opacity-70"
                                                style={{ backgroundColor: B.border }}
                                                onClick={() => setEditUrlName(true)}
                                            >
                                                <Pencil size={11} style={{ color: B.dark }} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit URL</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        {/* Editor type row */}
                        <div className="flex flex-col gap-2">
                            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: B.muted }}>
                                Editor Type
                            </p>
                            <div
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                                style={{ backgroundColor: B.cream, border: `1.5px solid ${B.border}` }}
                            >
                                {isCustom
                                    ? <PencilRuler size={13} style={{ color: B.muted }} />
                                    : <LayoutPanelTop size={13} style={{ color: B.muted }} />
                                }
                                <span className="text-sm" style={{ color: B.dark }}>
                                    {isCustom ? 'Drag & Drop Editor' : 'Section Editor'}
                                </span>
                            </div>
                        </div>

                        <div className="h-px" style={{ backgroundColor: B.border }} />

                        {/* Switch editor */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm" style={{ color: B.muted }}>
                                Want to try the other editor?
                            </p>
                            <a
                                href={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/booking-site?switch-editor=true`}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-75"
                                style={{ border: `1.5px solid ${B.border}`, color: B.dark }}
                            >
                                <RefreshCw size={11} />
                                Switch
                            </a>
                        </div>
                    </div>

                    {/* Right — Booking Flow Appearance */}
                    <div
                        className="lg:col-span-3 rounded-2xl p-6 flex flex-col gap-5"
                        style={{ backgroundColor: B.white, border: `1.5px solid ${B.border}` }}
                    >
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: B.muted }}>
                                Booking Flow Appearance
                            </p>
                            <p className="text-xs" style={{ color: B.muted }}>
                                Controls colors and style on your client-facing booking pages.
                            </p>
                        </div>

                        <div className="h-px" style={{ backgroundColor: B.border }} />

                        {/* Colors */}
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-semibold" style={{ color: B.dark }}>Colors</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <ColorRow label="Primary" colorKey="primaryColor" value={themeSettings.primaryColor} onChange={setColor} />
                                <ColorRow label="Accent" colorKey="secondaryColor" value={themeSettings.secondaryColor} onChange={setColor} />
                                <ColorRow label="Background" colorKey="backgroundColor" value={themeSettings.backgroundColor} onChange={setColor} />
                                <ColorRow label="Card" colorKey="cardColor" value={themeSettings.cardColor} onChange={setColor} />
                                <ColorRow label="Text" colorKey="textColor" value={themeSettings.textColor} onChange={setColor} />
                            </div>
                        </div>

                        <div className="h-px" style={{ backgroundColor: B.border }} />

                        {/* Typography + Shape */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold" style={{ color: B.dark }}>Heading Font</p>
                                <Select
                                    value={themeSettings.fontFamily}
                                    onValueChange={(v) => setThemeSettings(prev => ({ ...prev, fontFamily: v }))}
                                >
                                    <SelectTrigger
                                        style={{
                                            border: `1.5px solid ${B.border}`,
                                            backgroundColor: B.cream,
                                            color: B.dark,
                                            borderRadius: 12,
                                        }}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FONTS.map(f => (
                                            <SelectItem key={f} value={f}>{f}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold" style={{ color: B.dark }}>Button Style</p>
                                <Select
                                    value={themeSettings.buttonRadius}
                                    onValueChange={(v) => setThemeSettings(prev => ({ ...prev, buttonRadius: v }))}
                                >
                                    <SelectTrigger
                                        style={{
                                            border: `1.5px solid ${B.border}`,
                                            backgroundColor: B.cream,
                                            color: B.dark,
                                            borderRadius: 12,
                                        }}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {RADIUS_OPTIONS.map(r => (
                                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Live preview strip */}
                        <div
                            className="rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap"
                            style={{ backgroundColor: themeSettings.backgroundColor, border: `1.5px solid ${B.border}` }}
                        >
                            <p className="text-[10px] font-semibold uppercase tracking-widest shrink-0" style={{ color: B.muted }}>
                                Preview
                            </p>
                            <div
                                className="px-4 py-1.5 text-xs font-semibold"
                                style={{
                                    backgroundColor: themeSettings.primaryColor,
                                    color: '#FFFFFF',
                                    borderRadius: themeSettings.buttonRadius,
                                }}
                            >
                                Book Now
                            </div>
                            <div
                                className="px-3 py-1.5 text-xs border"
                                style={{
                                    backgroundColor: themeSettings.cardColor,
                                    color: themeSettings.textColor,
                                    borderColor: B.border,
                                    borderRadius: themeSettings.buttonRadius,
                                }}
                            >
                                Service Card
                            </div>
                            <span
                                className="text-xs font-medium"
                                style={{ color: themeSettings.secondaryColor }}
                            >
                                {themeSettings.fontFamily}
                            </span>
                        </div>

                        {/* Save */}
                        <div className="flex justify-end">
                            <button
                                disabled={updatingTheme}
                                onClick={updateTheme}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                                style={{ backgroundColor: B.primary, color: B.white }}
                            >
                                {updatingTheme && <Loader2 size={14} className="animate-spin" />}
                                {updatingTheme ? 'Saving…' : 'Save Appearance'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ManageBookingSite
