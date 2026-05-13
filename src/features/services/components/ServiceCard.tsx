'use client'

import Image from 'next/image'
import { formatPrice, formatDuration } from '../utils'

interface ServiceCardProps {
    service: any
    onClick: () => void
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
    return (
        <div
            onClick={onClick}
            className="rounded-lg border bg-card p-4 w-[240px] min-h-[140px] cursor-pointer hover:bg-accent/50 transition-colors flex flex-col gap-2"
        >
            {service.photo_url && (
                <div className="relative w-full h-28 rounded-md overflow-hidden">
                    <Image
                        src={service.photo_url}
                        alt={service.name}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            {service.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {service.categories.map((cat: string, i: number) => (
                        <span
                            key={i}
                            className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                        >
                            {cat}
                        </span>
                    ))}
                </div>
            )}

            <div>
                <p className="font-semibold text-sm leading-tight">{service.name}</p>
                <p className="text-sm text-muted-foreground">{formatPrice(service.price)}</p>
                {service.length > 0 && (
                    <p className="text-xs text-muted-foreground">{formatDuration(service.length)}</p>
                )}
            </div>

            {service.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
            )}
        </div>
    )
}
