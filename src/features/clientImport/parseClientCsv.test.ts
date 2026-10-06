import { describe, expect, it } from 'vitest'
import { ClientCsvError, normalizePhone, parseClientCsv, parseCsv } from './parseClientCsv'

describe('parseCsv', () => {
    it('handles quotes, escaped quotes, embedded commas and newlines, CRLF and a BOM', () => {
        const text = '﻿Name,Notes\r\n"Doe, Jane","said ""hi""\nthen left"\r\nBob,ok\r\n\r\n'
        expect(parseCsv(text)).toEqual([
            ['Name', 'Notes'],
            ['Doe, Jane', 'said "hi"\nthen left'],
            ['Bob', 'ok'],
        ])
    })
})

describe('normalizePhone', () => {
    it('formats US numbers the same way regardless of how they were typed', () => {
        expect(normalizePhone('5551234567')).toBe('(555) 123-4567')
        expect(normalizePhone('+1 555-123-4567')).toBe('(555) 123-4567')
        expect(normalizePhone('1 (555) 123.4567')).toBe('(555) 123-4567')
    })
    it('keeps international numbers as written and drops junk', () => {
        expect(normalizePhone('+44 20 7946 0958')).toBe('+44 20 7946 0958')
        expect(normalizePhone('n/a')).toBe('')
        expect(normalizePhone('   ')).toBe('')
    })
})

describe('parseClientCsv', () => {
    it('reads separate first/last name columns (Acuity, GlossGenius style)', () => {
        const csv = 'First Name,Last Name,Phone,Email,Notes\nkayla,JONES,555-123-4567,Kayla@Example.com,braids\n'
        const result = parseClientCsv(csv)
        expect(result.clients).toEqual([
            { first_name: 'Kayla', last_name: 'Jones', email: 'kayla@example.com', phone_number: '(555) 123-4567' },
        ])
        expect(result.columns).toMatchObject({ firstName: 'First Name', lastName: 'Last Name', email: 'Email', phone: 'Phone' })
    })

    it('splits a single name column, including "Last, First"', () => {
        const csv = 'Client Name,Email Address,Mobile Phone\nMary Ann Smith,mary@x.com,\n"Brown, Tia",,5550001111\nCher,cher@x.com,\n'
        const { clients } = parseClientCsv(csv)
        expect(clients.map(c => [c.first_name, c.last_name])).toEqual([
            ['Mary Ann', 'Smith'],
            ['Tia', 'Brown'],
            ['Cher', ''],
        ])
    })

    it('keeps mixed-case names as typed', () => {
        const { clients } = parseClientCsv('First Name,Last Name,Email\nDeShawn,McKenzie,d@x.com\n')
        expect(clients[0]).toMatchObject({ first_name: 'DeShawn', last_name: 'McKenzie' })
    })

    it('skips rows with no usable contact and duplicates within the file', () => {
        const csv = [
            'Name,Email,Phone',
            'A One,a@x.com,',
            'No Contact,,',
            'Bad Email,not-an-email,',
            'A Again,A@X.com,',
            'B Two,,555 222 3333',
            'B Again,,(555) 222-3333',
        ].join('\n')
        const result = parseClientCsv(csv)
        expect(result.clients.map(c => c.first_name)).toEqual(['A', 'B'])
        expect(result.skippedNoContact).toBe(2)
        expect(result.skippedDuplicates).toBe(2)
    })

    it('finds the header row below a title line', () => {
        const csv = 'Client Export - October 2026\n\nName,Email\nJo Lee,jo@x.com\n'
        expect(parseClientCsv(csv).clients).toHaveLength(1)
    })

    it('explains files it cannot use', () => {
        expect(() => parseClientCsv('Name,Birthday\nJo,1/1\n')).toThrow(ClientCsvError)
        expect(() => parseClientCsv('Name,Email\n')).toThrow(ClientCsvError)
    })
})
