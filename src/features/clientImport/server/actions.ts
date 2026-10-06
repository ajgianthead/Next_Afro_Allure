'use server'
import { requireBusinessOwner } from '@/lib/auth/requireBusinessOwner'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { upsertBusinessClient } from '@/features/shared/clients/upsertBusinessClient'
import { IMPORT_BATCH_SIZE, type ImportedClient } from '../parseClientCsv'

const CONCURRENCY = 5

export interface ImportBatchResult {
    added: number
    alreadyClients: number
    banned: number
    failed: number
    /** Newly linked clients, for adding to the table without a reload. */
    clients: { client_id: string; first_name: string; last_name: string; email: string; phone_number: string }[]
}

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function importClientBatch(rows: ImportedClient[], businessId: string): Promise<ImportBatchResult | string> {
    await requireBusinessOwner(businessId)
    if (!Array.isArray(rows) || rows.length === 0) return 'Nothing to import'
    if (rows.length > IMPORT_BATCH_SIZE) return `Send at most ${IMPORT_BATCH_SIZE} clients at a time`

    // Matching people who already exist through another business's bookings
    // needs the service role; ownership is checked above.
    const supabase = createAdminClient()
    const result: ImportBatchResult = { added: 0, alreadyClients: 0, banned: 0, failed: 0, clients: [] }

    const clean = rows.map(r => ({
        first_name: clip(r?.first_name, 100),
        last_name: clip(r?.last_name, 100),
        email: clip(r?.email, 254).toLowerCase(),
        phone_number: clip(r?.phone_number, 40),
    }))

    for (let i = 0; i < clean.length; i += CONCURRENCY) {
        const slice = clean.slice(i, i + CONCURRENCY)
        const outcomes = await Promise.all(slice.map(c => upsertBusinessClient(supabase, c, businessId)))
        outcomes.forEach((outcome, j) => {
            if (outcome.ok) {
                if (outcome.linked) {
                    result.added++
                    result.clients.push({ client_id: outcome.clientId, ...slice[j] })
                } else {
                    result.alreadyClients++
                }
            } else if (outcome.reason === 'banned') {
                result.banned++
            } else {
                result.failed++
            }
        })
    }

    return result
}
