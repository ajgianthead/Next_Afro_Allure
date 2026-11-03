import 'server-only'

import { DateTime } from 'luxon'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { computeOpenings } from '@/features/openings/server/compute'
import { describeEarning, describeReward, programFromRow } from '@/features/loyalty/loyalty'
import { describeOffer, describeReferralReward, referralProgramFromRow } from '@/features/referrals/referrals'
import type { SiteInfo } from '@/features/siteBuilder/siteData'
import type { BuilderMetadata } from '../render/context'

type Extras = Pick<BuilderMetadata, 'openings' | 'week' | 'offers'>

/**
 * The live parts of a builder page: the next open times and the coming week
 * (for the first service that has a schedule), and the loyalty and referral
 * offers when those programs are on. Failures leave a part out; the page
 * still renders.
 */
export async function loadBuilderExtras(businessId: string, info: SiteInfo, basePath: string): Promise<Extras> {
    const db = createAdminClient()
    const [openings, offers] = await Promise.all([
        loadOpenings(db, businessId, info, basePath).catch(err => { console.error('builder openings failed:', err?.message); return {} }),
        loadOffers(db, businessId).catch(err => { console.error('builder offers failed:', err?.message); return {} }),
    ])
    return { ...openings, ...offers }
}

async function loadOpenings(db: ReturnType<typeof createAdminClient>, businessId: string, info: SiteInfo, basePath: string): Promise<Extras> {
    for (const service of info.services.slice(0, 3)) {
        const r = await computeOpenings(db, businessId, service.id, 7, 3)
        if (!r) continue
        const href = `${basePath}/book?service=${encodeURIComponent(service.id)}`
        const today = DateTime.now().setZone(r.timezone).startOf('day')
        const openDays = new Set(r.times.map(t => t.date))
        const week = Array.from({ length: 7 }, (_, i) => {
            const d = today.plus({ days: i })
            return { day: i === 0 ? 'Today' : d.toFormat('ccc'), date: d.toFormat('LLL d'), open: openDays.has(d.toISODate()!) }
        })
        const openings = r.times.slice(0, 6).map(t => {
            const d = DateTime.fromISO(t.start, { zone: r.timezone })
            const day = d.hasSame(today, 'day') ? 'Today' : d.hasSame(today.plus({ days: 1 }), 'day') ? 'Tomorrow' : d.toFormat('ccc, LLL d')
            return { label: `${day} · ${d.toFormat('h:mm a').replace(':00', '')}`, href }
        })
        // The first service with a schedule decides; one with no times this week still shows the week as full.
        return { openings, week }
    }
    return {}
}

async function loadOffers(db: ReturnType<typeof createAdminClient>, businessId: string): Promise<Extras> {
    const [{ data: loyaltyRow }, { data: referralRow }] = await Promise.all([
        db.from('loyalty_programs').select('*').eq('business_id', businessId).maybeSingle(),
        db.from('referral_programs').select('*').eq('business_id', businessId).maybeSingle(),
    ])
    const loyalty = programFromRow(loyaltyRow)
    const referral = referralProgramFromRow(referralRow)
    return {
        offers: {
            loyalty: loyalty.enabled ? {
                title: 'Loyalty rewards',
                detail: `${describeReward(loyalty)} ${describeEarning(loyalty)}.`,
                visits: loyalty.earnType === 'visits' ? loyalty.visitsRequired : undefined,
                rewardText: describeReward(loyalty),
            } : null,
            referral: referral.enabled ? {
                title: 'Refer a friend',
                detail: describeOffer(referral),
                rewardText: describeReferralReward(referral),
            } : null,
        },
    }
}
