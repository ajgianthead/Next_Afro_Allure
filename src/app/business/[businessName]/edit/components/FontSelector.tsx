'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { loadGoogleFont } from 'useGoogleFonts'
import { useEditorContext } from '@/app/utils/context/EditorContext'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const POPULAR_FONTS = [
    'Inter', 'Fraunces', 'Playfair Display', 'Lato', 'Montserrat',
    'Raleway', 'Open Sans', 'Merriweather', 'Poppins', 'Nunito',
    'Source Sans Pro', 'Oswald', 'Roboto', 'Work Sans', 'DM Sans',
    'DM Serif Display', 'Cormorant Garamond', 'Libre Baskerville',
    'Josefin Sans', 'Quicksand',
]

// Single request for all 20 default fonts
const DEFAULT_FONTS_URL =
    'https://fonts.googleapis.com/css2?' +
    POPULAR_FONTS.map(f => `family=${f.replace(/ /g, '+')}:wght@400;700`).join('&') +
    '&display=swap'

export function FontSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const { editorState } = useEditorContext()

    // Batch-load all popular fonts on first mount
    useEffect(() => {
        if (typeof document === 'undefined') return
        if (!document.querySelector(`link[data-fonts="popular"]`)) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = DEFAULT_FONTS_URL
            link.dataset.fonts = 'popular'
            document.head.appendChild(link)
        }
    }, [])

    // Load current value if it's not in the default 20
    useEffect(() => {
        if (value && !POPULAR_FONTS.includes(value)) {
            loadGoogleFont(value)
        }
    }, [value])

    const allFonts = (editorState.fonts ?? []).map(f => f.family)
    const searchLower = search.toLowerCase().trim()

    const visibleFonts = searchLower.length > 0
        ? allFonts.filter(f => f.toLowerCase().includes(searchLower)).slice(0, 20)
        : POPULAR_FONTS

    // Load fonts when search results change so they render in the list
    useEffect(() => {
        if (searchLower.length > 0) {
            visibleFonts.forEach(family => loadGoogleFont(family))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleFonts.join(',')])

    const select = (family: string) => {
        loadGoogleFont(family)
        onChange(family)
        setOpen(false)
        setSearch('')
    }

    return (
        <div className="col-span-2 flex flex-col gap-1.5">
            <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch('') }}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="flex items-center justify-between w-full h-7 border border-[#E8E2D6] rounded-md px-2 text-xs bg-[#FAF7F2] hover:bg-[#F0EBE3] transition-colors"
                    >
                        <span
                            className="truncate text-[#1A1818] text-[13px]"
                            style={{ fontFamily: value || 'inherit' }}
                        >
                            {value || 'Select font…'}
                        </span>
                        <ChevronDown className="size-3 shrink-0 text-[#6F6863] ml-1" />
                    </button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-56 p-0 border-[#E8E2D6] shadow-lg"
                    align="start"
                    side="bottom"
                    sideOffset={4}
                >
                    {/* Search row */}
                    <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-[#E8E2D6]">
                        <Search className="size-3 shrink-0 text-[#6F6863]" />
                        <input
                            autoFocus
                            placeholder="Search fonts…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex-1 text-xs bg-transparent outline-none text-[#1A1818] placeholder:text-[#6F6863]"
                        />
                    </div>

                    {/* Section label */}
                    {searchLower.length === 0 && (
                        <p className="px-2.5 pt-2 pb-1 text-[10px] font-mono uppercase tracking-[0.12em] text-[#6F6863]">
                            Popular
                        </p>
                    )}

                    {/* Font list */}
                    <div className="max-h-52 overflow-y-auto py-0.5">
                        {visibleFonts.length === 0 ? (
                            <p className="px-3 py-4 text-center text-xs text-[#6F6863]">No fonts found</p>
                        ) : (
                            visibleFonts.map(family => (
                                <button
                                    key={family}
                                    type="button"
                                    onClick={() => select(family)}
                                    className={cn(
                                        'w-full text-left flex items-center justify-between px-2.5 py-1.5 text-[13px] transition-colors hover:bg-[#FAF7F2]',
                                        value === family ? 'bg-[#F0EBE3]' : ''
                                    )}
                                    style={{ fontFamily: family }}
                                >
                                    <span className="truncate">{family}</span>
                                    {value === family && (
                                        <Check className="size-3 shrink-0 text-[#FC6161] ml-1" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {/* Live preview */}
            {value && (
                <p
                    className="text-[13px] text-[#6F6863] truncate leading-none"
                    style={{ fontFamily: value }}
                >
                    The quick brown fox
                </p>
            )}
        </div>
    )
}
