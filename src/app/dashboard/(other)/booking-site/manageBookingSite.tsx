'use client'

import { ExternalLink, Globe, Info, LayoutPanelTop, Loader2, Pencil, PencilRuler, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Database, Json } from '../../../../../lib/database.types';
import { isURLNameAvailable, updateBookingTheme, updateBusinessURL } from './actions';
import { fetchGoogleFonts, GoogleFont } from 'useGoogleFonts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface PageProps {
    urlName: string
    editorData: {
        business_id: string | null;
        created_at: string;
        editor_data: string | null;
        id: string;
        image_objects: Json[] | null;
        section_data: Json[] | null;
        theme_data: {
            primaryColor: string
            secondaryColor: string
            fontFamily: string
        }
        type: Database["public"]["Enums"]["web_editor"] | null;
        updated_at: string | null;
    }
}

interface ThemeSettings {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
}

const ManageBookingSite = ({ urlName, editorData }: PageProps) => {
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
        primaryColor: editorData.theme_data.primaryColor,
        secondaryColor: editorData.theme_data.secondaryColor,
        fontFamily: editorData.theme_data.fontFamily
    })
    const [updatingTheme, setUpdatingTheme] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fonts, setFonts] = useState<GoogleFont[]>([])
    const [editUrlName, setEditUrlName] = useState(false)
    const [newUrlName, setNewUrlName] = useState(urlName)
    const [editedUrlName, setEditedUrlName] = useState(urlName)

    const isCustom = editorData.type === 'CUSTOM'
    const bookingPageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${newUrlName}`
    const editPageLink = isCustom
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/${newUrlName}/edit`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/booking-site/upload-sections`
    const isInvalid = editedUrlName.length > 0 && !/^[a-z]+$/.test(editedUrlName)
    const previewUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${editedUrlName || '…'}`

    useEffect(() => {
        (async () => {
            const fnt = await fetchGoogleFonts()
            setFonts(fnt)
        })()
    }, [])

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
        <div className="max-w-4xl mx-auto px-6 py-10">

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
                            <ul className='list-disc list-inside text-xs text-muted-foreground space-y-0.5'>
                                <li>Lowercase letters only (a–z)</li>
                                <li>No spaces, numbers, or special characters</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <div className='flex items-center gap-1'>
                                <p className='text-sm text-muted-foreground whitespace-nowrap shrink-0'>
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
                        {/* Live preview */}
                        <div className="rounded-lg bg-muted/50 border px-3 py-2.5">
                            <p className="text-xs text-muted-foreground mb-0.5">Preview</p>
                            <p className="text-sm font-mono truncate">{previewUrl}</p>
                        </div>
                    </div>
                    <div className='flex flex-col gap-2 mt-1'>
                        <Button
                            disabled={isInvalid || editedUrlName === newUrlName || loading || editedUrlName.length === 0}
                            onClick={handleUpdateUrl}
                        >
                            {loading && <Loader2 className="size-4 animate-spin mr-2" />}
                            Update URL
                        </Button>
                        <Button variant='outline' onClick={() => {
                            setEditUrlName(false)
                            setEditedUrlName(newUrlName)
                            setError(null)
                        }}>
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Page Header */}
            <div className="flex items-start justify-between mb-8 gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-semibold tracking-tight">Booking Site</h1>
                        <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100 text-xs font-medium px-2 py-0.5">
                            ● Live
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Manage your public booking page, appearance, and editor settings.
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild>
                        <a href={bookingPageUrl} target="_blank" className="flex items-center gap-1.5">
                            <ExternalLink className="size-3.5" />
                            Visit Site
                        </a>
                    </Button>
                    <Button size="sm" asChild>
                        <a href={editPageLink} target="_blank" className="flex items-center gap-1.5">
                            {isCustom
                                ? <PencilRuler className="size-3.5" />
                                : <LayoutPanelTop className="size-3.5" />
                            }
                            Edit Page
                        </a>
                    </Button>
                </div>
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Left — Site Details */}
                <div className="rounded-xl border bg-card p-6 flex flex-col gap-5">
                    <h2 className="text-sm font-semibold">Site Details</h2>
                    <Separator />

                    {/* URL row */}
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Page URL</p>
                        <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <Globe className="size-3.5 text-muted-foreground shrink-0" />
                                <a
                                    href={bookingPageUrl}
                                    target="_blank"
                                    className="text-sm truncate hover:underline"
                                >
                                    {bookingPageUrl}
                                </a>
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 shrink-0"
                                            onClick={() => setEditUrlName(true)}
                                        >
                                            <Pencil className="size-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit URL</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* Editor type row */}
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Editor Type</p>
                        <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2">
                            {isCustom
                                ? <PencilRuler className="size-4 text-muted-foreground" />
                                : <LayoutPanelTop className="size-4 text-muted-foreground" />
                            }
                            <span className="text-sm">{isCustom ? 'Drag & Drop Editor' : 'Section Editor'}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Switch editor */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Want to try the other editor?</p>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-sm" asChild>
                            <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/booking-site?switch-editor=true`}>
                                <RefreshCw className="size-3.5" />
                                Switch editor
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Right — Appearance */}
                <div className="rounded-xl border bg-card p-6 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold">Checkout Appearance</h2>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="size-3.5 text-muted-foreground cursor-pointer" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[220px] text-center text-xs">
                                    These styles apply to the booking checkout page your clients see when scheduling an appointment.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Separator />

                    {/* Colors — side by side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Primary Color
                            </Label>
                            <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2 cursor-pointer">
                                <div className="relative shrink-0">
                                    <div
                                        className="size-5 rounded-sm border shadow-sm"
                                        style={{ backgroundColor: themeSettings.primaryColor }}
                                    />
                                    <input
                                        type="color"
                                        value={themeSettings.primaryColor}
                                        onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                </div>
                                <span className="text-sm font-mono text-muted-foreground">
                                    {themeSettings.primaryColor}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Secondary Color
                            </Label>
                            <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2 cursor-pointer">
                                <div className="relative shrink-0">
                                    <div
                                        className="size-5 rounded-sm border shadow-sm"
                                        style={{ backgroundColor: themeSettings.secondaryColor }}
                                    />
                                    <input
                                        type="color"
                                        value={themeSettings.secondaryColor}
                                        onChange={(e) => setThemeSettings({ ...themeSettings, secondaryColor: e.target.value })}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                </div>
                                <span className="text-sm font-mono text-muted-foreground">
                                    {themeSettings.secondaryColor}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Font */}
                    <div className="flex flex-col gap-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Font Family
                        </Label>
                        <Select
                            value={themeSettings.fontFamily}
                            onValueChange={(value) => setThemeSettings({ ...themeSettings, fontFamily: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a font" />
                            </SelectTrigger>
                            <SelectContent>
                                {fonts.map((font: GoogleFont) => (
                                    <SelectItem key={font.family} value={font.family}>
                                        {font.family}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Save */}
                    <div className="flex justify-end mt-auto pt-2">
                        <Button size="sm" disabled={updatingTheme} onClick={updateTheme}>
                            {updatingTheme && <Loader2 className="size-4 animate-spin mr-2" />}
                            Save Appearance
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ManageBookingSite;
