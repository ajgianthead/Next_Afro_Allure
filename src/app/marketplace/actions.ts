'use server'

import { createClient } from "@utils/supabase/server"
import { Database } from "../../../lib/database.types"
import { Client } from "@googlemaps/google-maps-services-js";
import { DateTime } from "luxon";
import { number } from "motion/react";


export interface MarketplaceProfile {
    businessId: string
    address: string
    profilePhoto: Blob
    bannerPhoto: Blob
    isLicensed: boolean
    businessBio: string
    galleryPhotos: Blob[]
    categories: string[]
    yearsOfExperience: number
}

export interface Review {
    businessId: string
    name: string | null
    rating: number
    details: string | null
}

export interface FilterProps {
    currentLocation: {
        lat: number,
        lng: number
    };
    radiusKm: number
    filterBy: "stylist" | "service";
    availability?: string[];
    priceRange?: {
        min: number,
        max: number
    };
    serviceName?: string;
    businessName?: string;
    categories?: string[]
}

export const getNearbyBusinesses = async (location: {
    lat: number,
    lng: number
}, businessCoords: any[]) => {
    const miles = 10;
    const maxDistanceMeters = miles * 1609.34;
    try {
        const client = new Client({})
        const destinations = businessCoords.map(business => ({
            lat: business.marketplace_profile[0].location[0],
            lng: business.marketplace_profile[0].location[1],
        }));
        const response = await client.distancematrix({
            params: {
                key: process.env.GOOGLE_MAPS_KEY!,
                origins: [location],
                destinations: destinations,

            },

        })
        const results = response.data.rows[0].elements.map((businesses, index) => ({
            ...businessCoords[index], // 🔑 include full business data here
            distanceMeters: businesses.distance?.value,
            distanceText: businesses.distance?.text,
            durationText: businesses.duration?.text,
        }));
        return results.filter(r => r.distanceMeters && r.distanceMeters <= maxDistanceMeters);
    } catch (error) {
        console.error(error)
    }
}

//TODO: What if address what just a city and a state?
export const getCoordsFromAddress = async (address: string) => {
    try {
        const client = new Client({})
        const response = await client.geocode({
            params: {
                key: process.env.GOOGLE_MAPS_KEY!,
                address: address
            }
        })
        const lat = response.data.results[0].geometry.location.lat;
        const lng = response.data.results[0].geometry.location.lng
        console.log(response.data.results[0].geometry.location);
        return [lat, lng];
    } catch (err) {
        console.error(err);
    }
}

export const getCityAndStateFromCoords = async (latLng: {
    lat: number,
    lng: number
}) => {
    try {
        const client = new Client({})
        const response = await client.reverseGeocode({
            params: {
                latlng: latLng,
                key: process.env.GOOGLE_MAPS_KEY!,
            },
        });
        const addressComponents = response.data.results[0].address_components;
        let city = "";
        let state = "";

        for (const component of addressComponents) {
            const types: string[] = component.types as any;

            if (types.includes("locality")) {
                city = component.long_name;
            }
            if (types.includes("administrative_area_level_1")) {
                state = component.long_name; // usually 2-letter state code
            }
            return { city, state }
        }
    } catch (error) {
        console.error(error)
    }
}

export const getBusinessesInCityAndState = async ({ city, state }: { city: string, state: string }) => {
    const supabase = createClient<Database>()
    const { data, error } = await supabase.from('business_users').select('*, marketplace_profile(*)').eq('has_marketplace_profile', true).eq('account_settings->business_address->>city', city).eq('account_settings->business_address->>state', state)
    if (error) return error
    return data
}

export const getPopularServicesFromBusiness = async (
    businessId: string,
    timezone: string
) => {
    const supabase = createClient<Database>();

    const thirtyDaysAgo = DateTime.now().setZone(timezone).minus({ days: 30 }).toISO();
    const rightNow = DateTime.now().setZone(timezone).toISO();

    const { data, error } = await supabase
        .from("appointments")
        .select("service_data, business_users(*)")
        .eq("business", businessId)
        .gte("created_at", thirtyDaysAgo)
        .lte("created_at", rightNow);
    console.log(data)

    if (error) {
        console.error("Error fetching appointments:", error);
        return [];
    }

    const serviceCounts: Record<string, { count: number; service_data: any, business: any }> = {};

    data?.forEach((appointment: any) => {
        const service = appointment.service_data;
        if (!service?.id) return;

        if (!serviceCounts[service.id]) {
            serviceCounts[service.id] = { count: 0, service_data: service, business: appointment.business_users };
        }

        serviceCounts[service.id].count += 1;
    });

    const popularServices = Object.values(serviceCounts).sort(
        (a, b) => b.count - a.count
    );

    return popularServices;
};


export const getPopularServicesFromMultipleBusinesses = async (
    businessData: any[],
    timezone: string
) => {
    let allServices: any[] = [];

    for (let i = 0; i < businessData.length; i++) {
        const popularServices = await getPopularServicesFromBusiness(
            businessData[i].business_id,
            timezone
        );
        allServices.push(...popularServices);
    }

    // Merge same service IDs across businesses if needed
    const combinedCounts: Record<string, { count: number; service_data: any, business: any }> = {};

    allServices.forEach(({ service_data, count, business }) => {
        const id = service_data.id;
        if (!id) return;

        if (!combinedCounts[id]) {
            combinedCounts[id] = { count: 0, service_data, business };
        }
        combinedCounts[id].count += count;
    });

    return Object.values(combinedCounts).sort((a, b) => b.count - a.count);
};





// Create
export const createMarketplaceProfile = async (profileData: MarketplaceProfile) => {
    const supabase = createClient<Database>();
    const coords = await getCoordsFromAddress(profileData.address)

    const profileImgUrl = await supabase.storage.from('marketplace-profile_photos').upload(`private/${profileData.businessId}/${crypto.randomUUID()}`, profileData.profilePhoto).then((data) => {
        return supabase.storage.from('marketplace-profile_photos').getPublicUrl(data.data?.path!).data.publicUrl
    })
    const bannerImgUrl = await supabase.storage.from('marketplace-profile-banners').upload(`private/${profileData.businessId}/${crypto.randomUUID()}`, profileData.bannerPhoto).then((data) => {
        return supabase.storage.from('marketplace-profile-banners').getPublicUrl(data.data?.path!).data.publicUrl
    })
    let galleryPhotoUrls = [];
    for (let i = 0; i < profileData.galleryPhotos.length; i++) {
        const url = await supabase.storage.from('marketplace-profile-gallery').upload(`private/${profileData.businessId}/${crypto.randomUUID()}`, profileData.galleryPhotos[i]).then((data) => {
            return supabase.storage.from('marketplace-profile-gallery').getPublicUrl(data.data?.path!).data.publicUrl
        })
        galleryPhotoUrls.push(url)
    }

    const { data, error } = await supabase.from('marketplace_profile').insert({
        business_id: profileData.businessId,
        profile_photo_url: profileImgUrl,
        banner_photo_url: bannerImgUrl,
        categories: profileData.categories,
        experience: profileData.yearsOfExperience,
        gallery_photos: galleryPhotoUrls,
        is_licensed: profileData.isLicensed,
        business_bio: profileData.businessBio,
        location: [...coords!]
    }).select().single()

    if (error) return error
    return data
}

// Update
// export const updateMarketplaceProfile = async (marketplaceBusinessId: string, profileData: {
//     businessId: string
//     profilePhoto: Blob | string
//     bannerPhoto: Blob | string
//     isLicensed: boolean
//     businessBio: string
//     galleryPhotos: Blob[] | string[]
//     categories: string[]
//     yearsOfExperience: number
// }) => {
//     const supabase = createClient<Database>();

//     if (profileData.profilePhoto instanceof Blob) {
//         await supabase.storage.from('marketplace-profile_photos').upload(`private/${profileData.businessId}/${crypto.randomUUID()}`, profileData.profilePhoto)
//     }
//     if (profileData.bannerPhoto instanceof Blob) {
//         await supabase.storage.from('marketplace-profile-banners').upload(`private/${profileData.businessId}/${crypto.randomUUID()}`, profileData.bannerPhoto)
//     }
//     // Delete the gallery before adding images
//     let gallery = []
//     for (let i = 0; i < profileData.galleryPhotos.length; i++) {
//         if (profileData.galleryPhotos[i] instanceof Blob) {
//             const url = await supabase.storage.from('marketplace-profile-gallery').upload(`private/${profileData.businessId}/${crypto.randomUUID()}`, profileData.galleryPhotos[i]).then((data) => {
//                 return supabase.storage.from('marketplace-profile-gallery').getPublicUrl(data.data?.path!).data.publicUrl
//             })
//             gallery.push(url)
//         }
//         if (typeof profileData.galleryPhotos[i] === 'string') {
//             gallery.push(profileData.galleryPhotos[i])
//         }
//     }

//     const { data, error } = await supabase.from('marketplace_profile').update({
//         // Update images, if any
//         categories: profileData.categories,
//         experience: profileData.yearsOfExperience,
//         gallery_photos: gallery,
//         is_licensed: profileData.isLicensed,
//         business_bio: profileData.businessBio
//     }).eq('id', marketplaceBusinessId).select().single()

//     if (error) return error
//     return data
// }

// Create Review
export const createReview = async (reviewData: Review) => {
    const supabase = createClient<Database>()
    const { data, error } = await supabase.from('reviews').insert({
        business_id: reviewData.businessId,
        details: reviewData.details,
        rating: reviewData.rating
    }).select().single()
    if (error) return error
    return data
}
// Get Reviews based on business
export const getReviews = async (businessId: string) => {
    const supabase = createClient<Database>()
    const { data, error } = await supabase.from('reviews').select('*').eq('business_id', businessId)
    if (error) return error
    return data
}

export const findNearbyStylists = async (lat: number, lng: number, radius: number) => {
    const supabase = createClient<Database>()
    const { data: businesses, error } = await supabase.rpc('search_stylists_nearby', {
        user_lat: lat,
        user_lon: lng,
        radius_km: radius
    });
    if (error) return error
    return businesses
}

export const stylistFilter = async (filter: FilterProps) => {
    let result;
    const supabase = createClient<Database>()
    if (filter.filterBy === 'stylist') {
        // Get all businesses in the current location
        const { data: businesses, error } = await supabase.rpc('search_stylists_nearby', {
            user_lat: filter.currentLocation.lat,
            user_lon: filter.currentLocation.lng,
            radius_km: filter.radiusKm
        }).select('*, distance_meters');;

    }
    else if (filter.filterBy === 'service') {

    }
}



