/**
 * Turns a client-list export from another booking platform (StyleSeat,
 * GlossGenius, Acuity, Square, Vagaro, Booksy, or a hand-made spreadsheet)
 * into rows ready for the clientele table. Pure — no I/O — so the dashboard
 * can preview the result before anything is written.
 */

export interface ImportedClient {
    first_name: string
    last_name: string
    email: string
    phone_number: string
}

export interface ParsedClientList {
    clients: ImportedClient[]
    /** Rows dropped because they had neither an email nor a phone number. */
    skippedNoContact: number
    /** Rows dropped because an earlier row in the file had the same email or phone. */
    skippedDuplicates: number
    /** Which column each field was read from, for the preview. */
    columns: { firstName?: string; lastName?: string; fullName?: string; email?: string; phone?: string }
}

export class ClientCsvError extends Error {}

/** RFC 4180 CSV: quoted fields, escaped quotes, commas and newlines inside quotes, CRLF or LF. */
export function parseCsv(text: string): string[][] {
    const rows: string[][] = []
    let row: string[] = []
    let field = ''
    let inQuotes = false
    const src = text.replace(/^﻿/, '')

    for (let i = 0; i < src.length; i++) {
        const c = src[i]
        if (inQuotes) {
            if (c === '"') {
                if (src[i + 1] === '"') {
                    field += '"'
                    i++
                } else {
                    inQuotes = false
                }
            } else {
                field += c
            }
        } else if (c === '"') {
            inQuotes = true
        } else if (c === ',') {
            row.push(field)
            field = ''
        } else if (c === '\n' || c === '\r') {
            if (c === '\r' && src[i + 1] === '\n') i++
            row.push(field)
            rows.push(row)
            row = []
            field = ''
        } else {
            field += c
        }
    }
    if (field !== '' || row.length > 0) {
        row.push(field)
        rows.push(row)
    }
    return rows.filter(r => r.some(cell => cell.trim() !== ''))
}

const normalizeHeader = (h: string) => h.toLowerCase().replace(/[^a-z]/g, '')

// Header spellings seen in each platform's export, normalized (lowercase, letters only).
const FIRST_NAME = ['firstname', 'first', 'clientfirstname', 'customerfirstname', 'givenname']
const LAST_NAME = ['lastname', 'last', 'clientlastname', 'customerlastname', 'surname', 'familyname']
const FULL_NAME = ['name', 'fullname', 'clientname', 'customername', 'client', 'customer', 'displayname']
const EMAIL = ['email', 'emailaddress', 'clientemail', 'customeremail', 'emailaddr', 'mail']
const PHONE = [
    'phone', 'phonenumber', 'mobile', 'mobilephone', 'mobilenumber', 'cell', 'cellphone', 'cellphonenumber',
    'clientphone', 'customerphone', 'primaryphone', 'telephone', 'tel', 'homephone', 'workphone',
]

function findColumn(headers: string[], candidates: string[]): number {
    const normalized = headers.map(normalizeHeader)
    for (const candidate of candidates) {
        const idx = normalized.indexOf(candidate)
        if (idx !== -1) return idx
    }
    return -1
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** US numbers become "(555) 123-4567" so they match how they read elsewhere; anything else is kept as written. */
export function normalizePhone(raw: string): string {
    const trimmed = raw.trim()
    if (!trimmed) return ''
    const digits = trimmed.replace(/\D/g, '')
    const international = trimmed.startsWith('+') && !trimmed.startsWith('+1')
    if (!international) {
        const national = digits.length === 11 && digits[0] === '1' ? digits.slice(1) : digits
        if (national.length === 10) return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`
    }
    return digits.length >= 7 ? trimmed : ''
}

const titleCase = (s: string) =>
    s.trim().replace(/\s+/g, ' ').replace(/\S+/g, w => (w === w.toUpperCase() || w === w.toLowerCase()
        ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        : w))

function splitFullName(full: string): { first: string; last: string } {
    const clean = full.trim().replace(/\s+/g, ' ')
    // "Last, First" (Square and some spreadsheets)
    if (clean.includes(',')) {
        const [last, first] = clean.split(',', 2).map(s => s.trim())
        return { first: first ?? '', last: last ?? '' }
    }
    const parts = clean.split(' ')
    if (parts.length === 1) return { first: parts[0], last: '' }
    return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] }
}

export const MAX_IMPORT_ROWS = 5000
/** The dashboard sends the parsed file in batches of this size so a large list never hits a request timeout. */
export const IMPORT_BATCH_SIZE = 100

export function parseClientCsv(text: string): ParsedClientList {
    const rows = parseCsv(text)
    if (rows.length < 2) throw new ClientCsvError('That file has no client rows. Export your client list as a CSV and try again.')

    // Some exports put a title line above the headers — use the first row that looks like a header.
    let headerIdx = rows.findIndex(r => findColumn(r, EMAIL) !== -1 || findColumn(r, PHONE) !== -1)
    if (headerIdx === -1) {
        throw new ClientCsvError("Couldn't find an email or phone column. Make sure the first row has column names like \"Email\" and \"Phone\".")
    }
    const headers = rows[headerIdx]
    const body = rows.slice(headerIdx + 1)
    if (body.length > MAX_IMPORT_ROWS) {
        throw new ClientCsvError(`That file has ${body.length.toLocaleString()} rows. Import up to ${MAX_IMPORT_ROWS.toLocaleString()} at a time — split it into smaller files.`)
    }

    const col = {
        firstName: findColumn(headers, FIRST_NAME),
        lastName: findColumn(headers, LAST_NAME),
        fullName: findColumn(headers, FULL_NAME),
        email: findColumn(headers, EMAIL),
        phone: findColumn(headers, PHONE),
    }
    const useFullName = col.firstName === -1 && col.fullName !== -1

    const clients: ImportedClient[] = []
    const seenEmails = new Set<string>()
    const seenPhones = new Set<string>()
    let skippedNoContact = 0
    let skippedDuplicates = 0

    for (const row of body) {
        const cell = (i: number) => (i === -1 ? '' : (row[i] ?? '').trim())

        let email = cell(col.email).toLowerCase()
        if (email && !EMAIL_RE.test(email)) email = ''
        const phone = normalizePhone(cell(col.phone))
        if (!email && !phone) {
            skippedNoContact++
            continue
        }

        const phoneKey = phone.replace(/\D/g, '')
        if ((email && seenEmails.has(email)) || (phoneKey && seenPhones.has(phoneKey))) {
            skippedDuplicates++
            continue
        }
        if (email) seenEmails.add(email)
        if (phoneKey) seenPhones.add(phoneKey)

        let first: string
        let last: string
        if (useFullName) {
            ({ first, last } = splitFullName(cell(col.fullName)))
        } else {
            first = cell(col.firstName)
            last = cell(col.lastName)
        }

        clients.push({
            first_name: titleCase(first),
            last_name: titleCase(last),
            email,
            phone_number: phone,
        })
    }

    const name = (i: number) => (i === -1 ? undefined : headers[i].trim())
    return {
        clients,
        skippedNoContact,
        skippedDuplicates,
        columns: {
            firstName: useFullName ? undefined : name(col.firstName),
            lastName: useFullName ? undefined : name(col.lastName),
            fullName: useFullName ? name(col.fullName) : undefined,
            email: name(col.email),
            phone: name(col.phone),
        },
    }
}
