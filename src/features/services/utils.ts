import { ServiceData } from './types'

export function createDefaultService(businessId: string, defaultAvailability: string): ServiceData {
    return {
        id: crypto.randomUUID(),
        name: '',
        description: '',
        price: 0,
        length: 0,
        addons: [],
        categories: [],
        photo_url: null,
        imagePath: null,
        business: businessId,
        availability: defaultAvailability,
    }
}

export function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`
}

export function formatDuration(minutes: number): string {
    if (!minutes) return ''
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h && m) return `${h}h ${m}m`
    if (h) return `${h}h`
    return `${m}m`
}
