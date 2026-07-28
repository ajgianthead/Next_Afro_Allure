'use client'

import { useEffect, useRef, useState } from 'react'
import { galleryFields } from './fields'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const PH = 'https://jappbqntqogmnoluifzx.supabase.co/storage/v1/object/public/editor-media-pool/placeholder_photo.jpg'

const defaultImages = [
    { url: PH, alt: '' },
    { url: PH, alt: '' },
    { url: PH, alt: '' },
    { url: PH, alt: '' },
    { url: PH, alt: '' },
    { url: PH, alt: '' },
]

export const GalleryComponent: any = {
    fields: galleryFields,
    defaultProps: {
        images: defaultImages,
        columns: 3,
        gap: 8,
        borderRadius: 8,
        aspectRatio: '1/1',
    },
    render: ({ puck, images = defaultImages, columns = 3, gap = 8, borderRadius = 8, aspectRatio = '1/1' }: any) => {
        const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
        const [modal, setModal] = useState<{ open: boolean; index: number }>({ open: false, index: 0 })

        useEffect(() => {
            if (!modal.open) return
            const onKey = (e: KeyboardEvent) => {
                if (e.key === 'ArrowLeft') setModal(m => ({ ...m, index: (m.index - 1 + images.length) % images.length }))
                if (e.key === 'ArrowRight') setModal(m => ({ ...m, index: (m.index + 1) % images.length }))
                if (e.key === 'Escape') setModal(m => ({ ...m, open: false }))
            }
            window.addEventListener('keydown', onKey)
            return () => window.removeEventListener('keydown', onKey)
        }, [modal.open, images.length])

        return (
            <div ref={puck.dragRef} className="w-full">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap,
                }}>
                    {images.map((img: { url: string; alt: string }, i: number) => (
                        <img
                            key={i}
                            src={img.url || PH}
                            alt={img.alt ?? ''}
                            style={{
                                width: '100%',
                                aspectRatio,
                                objectFit: 'cover',
                                borderRadius,
                                cursor: 'zoom-in',
                                display: 'block',
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                                transform: hoveredIndex === i ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: hoveredIndex === i ? '0 8px 24px rgba(0,0,0,0.18)' : 'none',
                            }}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => setModal({ open: true, index: i })}
                        />
                    ))}
                </div>

                {modal.open && (
                    <div
                        style={{
                            position: 'fixed', inset: 0, zIndex: 99999,
                            background: 'rgba(0,0,0,0.88)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        onClick={() => setModal(m => ({ ...m, open: false }))}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); setModal(m => ({ ...m, open: false })) }}
                            style={{
                                position: 'absolute', top: 20, right: 20, zIndex: 1,
                                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 6,
                                color: '#fff', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center',
                            }}
                        >
                            <X size={20} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); setModal(m => ({ ...m, index: (m.index - 1 + images.length) % images.length })) }}
                            style={{
                                position: 'absolute', left: 16, zIndex: 1,
                                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 6,
                                color: '#fff', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center',
                            }}
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <img
                            src={images[modal.index]?.url || PH}
                            alt={images[modal.index]?.alt ?? ''}
                            style={{
                                maxWidth: '90vw', maxHeight: '85vh',
                                objectFit: 'contain', borderRadius: 8,
                                userSelect: 'none',
                            }}
                            onClick={e => e.stopPropagation()}
                        />

                        <button
                            onClick={(e) => { e.stopPropagation(); setModal(m => ({ ...m, index: (m.index + 1) % images.length })) }}
                            style={{
                                position: 'absolute', right: 16, zIndex: 1,
                                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 6,
                                color: '#fff', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center',
                            }}
                        >
                            <ChevronRight size={24} />
                        </button>

                        <div style={{
                            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
                            color: 'rgba(255,255,255,0.7)', fontSize: 13, userSelect: 'none',
                        }}>
                            {modal.index + 1} / {images.length}
                        </div>
                    </div>
                )}
            </div>
        )
    },
}
