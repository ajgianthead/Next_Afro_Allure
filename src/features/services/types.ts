export type ServiceData = {
    id: string
    name: string
    description: string
    price: number       // cents
    length: number      // minutes
    addons: string[]    // addon IDs
    categories: string[]
    photo_url: string | null
    imagePath: string | null
    business: string
    availability: string
    /** Size × length grid and hair setting — see src/features/services/pricing.ts */
    style_options?: unknown
    /** Prep instructions / checklist / agreement — see src/features/services/pricing.ts */
    prep?: unknown
    /** Email clients to rebook this many weeks after a visit (null = off). */
    rebook_weeks?: number | null
    created_at?: string
    updated_at?: string
}

export type AddonData = {
    id: string
    name: string
    price: number       // cents
    business_id: string
}
