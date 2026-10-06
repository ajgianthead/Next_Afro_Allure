'use client'

import { FileUp, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ClientCsvError, IMPORT_BATCH_SIZE, parseClientCsv, type ParsedClientList } from '../parseClientCsv'
import { importClientBatch, type ImportBatchResult } from '../server/actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const MAX_FILE_BYTES = 5 * 1024 * 1024

type ImportedRow = ImportBatchResult['clients'][number]
type Totals = Omit<ImportBatchResult, 'clients'>

// Where each platform keeps its export. Menus move around, so every tip ends
// with the fallback that always works: ask their support for a CSV.
const EXPORT_TIPS: { name: string; tip: string }[] = [
    { name: 'StyleSeat', tip: 'In the StyleSeat app, open Clients, tap ⋯ in the top corner, choose Export Client List, and it emails you a CSV. Do this before you cancel — the export only works while your Pro subscription is active.' },
    { name: 'GlossGenius', tip: 'In GlossGenius on the web, open Clients and choose Export. Support can also send it.' },
    { name: 'Acuity', tip: 'In Acuity, go to Clients, then Import/Export, and export your client list as CSV.' },
    { name: 'Square, Vagaro, Booksy', tip: 'Look for Export in the Customers or Clients section.' },
    { name: 'Spreadsheet or phone contacts', tip: 'Any CSV works if the first row has column names such as Name, Email and Phone.' },
]

export function ImportClientsDialog({
    open,
    onOpenChange,
    businessId,
    onImported,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    businessId: string
    onImported: (clients: ImportedRow[]) => void
}) {
    const fileInput = useRef<HTMLInputElement>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const [parsed, setParsed] = useState<ParsedClientList | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState<number | null>(null)
    const [totals, setTotals] = useState<Totals | null>(null)

    const importing = progress !== null && totals === null

    const reset = () => {
        setFileName(null)
        setParsed(null)
        setError(null)
        setProgress(null)
        setTotals(null)
        if (fileInput.current) fileInput.current.value = ''
    }

    const handleFile = async (file: File | undefined) => {
        reset()
        if (!file) return
        setFileName(file.name)
        if (file.size > MAX_FILE_BYTES) {
            setError('That file is over 5 MB. Split it into smaller files and import them one at a time.')
            return
        }
        if (/\.(xlsx?|numbers)$/i.test(file.name)) {
            setError('That is a spreadsheet file. Open it and use File → Save As (or Download) → CSV, then upload the CSV.')
            return
        }
        try {
            setParsed(parseClientCsv(await file.text()))
        } catch (err) {
            setError(err instanceof ClientCsvError ? err.message : "We couldn't read that file. Make sure it's a CSV export.")
        }
    }

    const runImport = async () => {
        if (!parsed) return
        const rows = parsed.clients
        const sum: Totals = { added: 0, alreadyClients: 0, banned: 0, failed: 0 }
        setProgress(0)
        for (let i = 0; i < rows.length; i += IMPORT_BATCH_SIZE) {
            let res: ImportBatchResult | string
            try {
                res = await importClientBatch(rows.slice(i, i + IMPORT_BATCH_SIZE), businessId)
            } catch {
                res = 'Connection lost'
            }
            if (typeof res === 'string') {
                sum.failed += Math.min(IMPORT_BATCH_SIZE, rows.length - i)
            } else {
                sum.added += res.added
                sum.alreadyClients += res.alreadyClients
                sum.banned += res.banned
                sum.failed += res.failed
                if (res.clients.length) onImported(res.clients)
            }
            setProgress(Math.min(rows.length, i + IMPORT_BATCH_SIZE))
        }
        setTotals(sum)
        if (sum.added) toast.success(`Imported ${sum.added} client${sum.added === 1 ? '' : 's'}`)
    }

    const preview = parsed?.clients.slice(0, 5) ?? []
    const total = parsed?.clients.length ?? 0

    return (
        <Dialog
            open={open}
            onOpenChange={v => {
                if (importing) return
                if (!v) reset()
                onOpenChange(v)
            }}
        >
            <DialogContent className="rounded-2xl w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto" style={{ borderColor: '#E8E2D6' }}>
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: SERIF, color: '#1A1818', fontSize: '1.1rem' }}>
                        Import your clients
                    </DialogTitle>
                    <DialogDescription style={{ color: '#6F6863' }}>
                        Bring your client list from StyleSeat, GlossGenius, Acuity or any spreadsheet. Clients you already have are skipped, and nobody gets an email or text.
                    </DialogDescription>
                </DialogHeader>

                {totals ? (
                    <div className="flex flex-col gap-3 mt-1">
                        <div className="rounded-xl p-4 flex flex-col gap-1.5" style={{ backgroundColor: '#FAF7F2', border: '1px solid #E8E2D6' }}>
                            <p className="text-sm font-medium" style={{ color: '#1A1818' }}>
                                {totals.added} new client{totals.added === 1 ? '' : 's'} added
                            </p>
                            {totals.alreadyClients > 0 && (
                                <p className="text-xs" style={{ color: '#6F6863' }}>{totals.alreadyClients} were already in your clientele</p>
                            )}
                            {totals.banned > 0 && (
                                <p className="text-xs" style={{ color: '#6F6863' }}>{totals.banned} skipped because they are on your banned list</p>
                            )}
                            {totals.failed > 0 && (
                                <p className="text-xs" style={{ color: '#FC6161' }}>{totals.failed} couldn&apos;t be saved. Import the file again to retry them; anyone already added will be skipped.</p>
                            )}
                        </div>
                        <Button
                            className="w-full rounded-xl"
                            style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontSize: '13px' }}
                            onClick={() => {
                                reset()
                                onOpenChange(false)
                            }}
                        >
                            Done
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 mt-1">
                        <input
                            ref={fileInput}
                            type="file"
                            accept=".csv,text/csv"
                            className="hidden"
                            onChange={e => handleFile(e.target.files?.[0])}
                        />
                        <button
                            type="button"
                            disabled={importing}
                            onClick={() => fileInput.current?.click()}
                            className="rounded-xl border-2 border-dashed px-4 py-6 flex flex-col items-center gap-2 transition-colors hover:bg-[#FAF7F2]"
                            style={{ borderColor: '#E8E2D6' }}
                        >
                            <FileUp size={22} style={{ color: '#C9974A' }} />
                            <span className="text-sm font-medium" style={{ color: '#1A1818' }}>
                                {fileName ?? 'Choose a CSV file'}
                            </span>
                            <span className="text-xs" style={{ color: '#6F6863' }}>
                                {fileName ? 'Choose a different file' : 'Needs an email or phone column'}
                            </span>
                        </button>

                        {error && <p className="text-sm" style={{ color: '#FC6161' }}>{error}</p>}

                        {parsed && (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm" style={{ color: '#1A1818' }}>
                                    Found <strong>{total}</strong> client{total === 1 ? '' : 's'}
                                    {parsed.skippedNoContact + parsed.skippedDuplicates > 0 && (
                                        <span style={{ color: '#6F6863' }}>
                                            {' '}(skipping {[
                                                parsed.skippedNoContact && `${parsed.skippedNoContact} with no email or phone`,
                                                parsed.skippedDuplicates && `${parsed.skippedDuplicates} repeated`,
                                            ].filter(Boolean).join(', ')})
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs" style={{ color: '#6F6863' }}>
                                    Reading names from{' '}
                                    {parsed.columns.fullName
                                        ? `“${parsed.columns.fullName}”`
                                        : [parsed.columns.firstName, parsed.columns.lastName].filter(Boolean).map(c => `“${c}”`).join(' and ') || 'no column'}
                                    , email from {parsed.columns.email ? `“${parsed.columns.email}”` : 'no column'}, phone from{' '}
                                    {parsed.columns.phone ? `“${parsed.columns.phone}”` : 'no column'}.
                                </p>
                                {preview.length > 0 && (
                                    <ul className="rounded-xl overflow-hidden" style={{ border: '1px solid #E8E2D6' }}>
                                        {preview.map((c, i) => (
                                            <li
                                                key={i}
                                                className="px-3 py-2 text-xs flex flex-col sm:flex-row sm:gap-3"
                                                style={{ borderBottom: i < preview.length - 1 ? '1px solid #F0EBE3' : undefined }}
                                            >
                                                <span className="font-medium sm:w-36 truncate" style={{ color: '#1A1818' }}>
                                                    {`${c.first_name} ${c.last_name}`.trim() || '(no name)'}
                                                </span>
                                                <span className="truncate flex-1" style={{ color: '#6F6863' }}>{c.email}</span>
                                                <span style={{ color: '#6F6863' }}>{c.phone_number}</span>
                                            </li>
                                        ))}
                                        {total > preview.length && (
                                            <li className="px-3 py-2 text-xs italic" style={{ color: '#6F6863', borderTop: '1px solid #F0EBE3' }}>
                                                and {total - preview.length} more
                                            </li>
                                        )}
                                    </ul>
                                )}
                                {importing && (
                                    <div className="flex flex-col gap-1.5">
                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F0EBE3' }}>
                                            <div
                                                className="h-full transition-all"
                                                style={{ width: `${total ? ((progress ?? 0) / total) * 100 : 0}%`, backgroundColor: '#C9974A' }}
                                            />
                                        </div>
                                        <p className="text-xs" style={{ color: '#6F6863' }}>
                                            Importing {progress} of {total}. Keep this window open.
                                        </p>
                                    </div>
                                )}
                                <Button
                                    disabled={importing || total === 0}
                                    className="w-full rounded-xl"
                                    style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontSize: '13px' }}
                                    onClick={runImport}
                                >
                                    {importing && <Loader2 size={14} className="animate-spin mr-1.5" />}
                                    {total === 0 ? 'No clients to import' : `Import ${total} client${total === 1 ? '' : 's'}`}
                                </Button>
                            </div>
                        )}

                        {!parsed && (
                            <details className="rounded-xl px-3 py-2" style={{ backgroundColor: '#FAF7F2' }}>
                                <summary className="text-xs font-medium cursor-pointer" style={{ color: '#1A1818' }}>
                                    How do I get my client list?
                                </summary>
                                <ul className="mt-2 flex flex-col gap-2">
                                    {EXPORT_TIPS.map(t => (
                                        <li key={t.name} className="text-xs" style={{ color: '#6F6863' }}>
                                            <span className="font-medium" style={{ color: '#1A1818' }}>{t.name}:</span> {t.tip}
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ImportClientsDialog
