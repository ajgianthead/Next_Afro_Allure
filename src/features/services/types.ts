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
    created_at?: string
    updated_at?: string
}

export type AddonData = {
    id: string
    name: string
    price: number       // cents
    business_id: string
}
