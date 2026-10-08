// @vitest-environment jsdom
import React, { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { choiceForTip, TipPicker } from './TipPicker'

afterEach(cleanup)

/**
 * Mirrors the payment page: onChange saves (here, a controllable fake),
 * `saving` locks the picker meanwhile, and the confirmed tip flows back in.
 */
function Harness({ save, initialTip = 0, base = 10000 }: {
    save: (cents: number) => Promise<{ ok: boolean; error?: string }>
    initialTip?: number
    base?: number
}) {
    const [tip, setTip] = useState(initialTip)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    return (
        <>
            <TipPicker
                baseCents={base}
                tipCents={tip}
                saving={saving}
                error={error}
                onChange={async cents => {
                    setSaving(true)
                    setError('')
                    const res = await save(cents)
                    setSaving(false)
                    if (!res.ok) { setError(res.error ?? 'failed'); return false }
                    setTip(cents)
                    return true
                }}
            />
            <output data-testid="tip">{tip}</output>
        </>
    )
}

const pressed = () => screen.getAllByRole('button').filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.textContent)

describe('TipPicker', () => {
    it('shows preset amounts worked out on the appointment total', () => {
        render(<Harness save={async () => ({ ok: true })} />)
        expect(screen.getByRole('button', { name: /15%/ }).textContent).toContain('$15.00')
        expect(screen.getByRole('button', { name: /20%/ }).textContent).toContain('$20.00')
        expect(screen.getByRole('button', { name: /25%/ }).textContent).toContain('$25.00')
        expect(pressed()).toEqual(['No tip'])
    })

    it('saves a preset and highlights it', async () => {
        const save = vi.fn(async () => ({ ok: true }))
        render(<Harness save={save} />)
        fireEvent.click(screen.getByRole('button', { name: /20%/ }))
        await waitFor(() => expect(screen.getByTestId('tip').textContent).toBe('2000'))
        expect(save).toHaveBeenCalledWith(2000)
        expect(pressed()[0]).toContain('20%')
    })

    it('locks every button while a tip is saving, so only one change is in flight', async () => {
        let finish!: (v: { ok: boolean }) => void
        const save = vi.fn(() => new Promise<{ ok: boolean }>(r => { finish = r }))
        render(<Harness save={save} />)
        fireEvent.click(screen.getByRole('button', { name: /15%/ }))
        await waitFor(() => expect((screen.getByRole('button', { name: /25%/ }) as HTMLButtonElement).disabled).toBe(true))
        fireEvent.click(screen.getByRole('button', { name: /25%/ }))
        expect(save).toHaveBeenCalledTimes(1)
        finish({ ok: true })
        await waitFor(() => expect((screen.getByRole('button', { name: /25%/ }) as HTMLButtonElement).disabled).toBe(false))
        expect(screen.getByTestId('tip').textContent).toBe('1500')
    })

    it('goes back to the previous choice and shows the error when saving fails', async () => {
        const save = vi.fn(async () => ({ ok: false, error: 'This appointment is already paid.' }))
        render(<Harness save={save} />)
        fireEvent.click(screen.getByRole('button', { name: /20%/ }))
        await screen.findByText('This appointment is already paid.')
        expect(pressed()).toEqual(['No tip'])
        expect(screen.getByTestId('tip').textContent).toBe('0')
    })

    it('does not re-save when the same amount is picked again', async () => {
        const save = vi.fn(async () => ({ ok: true }))
        render(<Harness save={save} />)
        fireEvent.click(screen.getByRole('button', { name: 'No tip' }))
        expect(save).not.toHaveBeenCalled()
    })

    it('accepts a custom amount in dollars', async () => {
        const save = vi.fn(async () => ({ ok: true }))
        render(<Harness save={save} />)
        fireEvent.click(screen.getByRole('button', { name: 'Custom' }))
        fireEvent.change(screen.getByLabelText('Custom tip in dollars'), { target: { value: '12.50' } })
        fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
        await waitFor(() => expect(screen.getByTestId('tip').textContent).toBe('1250'))
        expect(save).toHaveBeenCalledWith(1250)
    })

    it.each([
        ['abc', /Enter a dollar amount/],
        ['-5', /Enter a dollar amount/],
        ['1.234', /Enter a dollar amount/],
        ['100.01', /limited to \$100\.00/],
    ])('rejects a bad custom amount (%s) without saving', async (value, message) => {
        const save = vi.fn(async () => ({ ok: true }))
        render(<Harness save={save} />)
        fireEvent.click(screen.getByRole('button', { name: 'Custom' }))
        fireEvent.change(screen.getByLabelText('Custom tip in dollars'), { target: { value } })
        fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
        expect(await screen.findByText(message)).toBeTruthy()
        expect(save).not.toHaveBeenCalled()
    })

    it('treats an empty custom field as no tip', async () => {
        const save = vi.fn(async () => ({ ok: true }))
        render(<Harness save={save} initialTip={1500} />)
        fireEvent.click(screen.getByRole('button', { name: 'Custom' }))
        fireEvent.change(screen.getByLabelText('Custom tip in dollars'), { target: { value: '' } })
        fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
        await waitFor(() => expect(screen.getByTestId('tip').textContent).toBe('0'))
        expect(save).toHaveBeenCalledWith(0)
    })

    it('starts the custom field from the current tip', () => {
        render(<Harness save={async () => ({ ok: true })} initialTip={2000} />)
        fireEvent.click(screen.getByRole('button', { name: 'Custom' }))
        expect((screen.getByLabelText('Custom tip in dollars') as HTMLInputElement).value).toBe('20.00')
    })

    it('shows a tip saved before a reload on the right button', () => {
        expect(choiceForTip(0, 10000)).toBe('none')
        expect(choiceForTip(2000, 10000)).toBe(20)
        expect(choiceForTip(1234, 10000)).toBe('custom')
        render(<Harness save={async () => ({ ok: true })} initialTip={1234} />)
        expect(pressed()).toEqual(['Custom'])
        expect((screen.getByLabelText('Custom tip in dollars') as HTMLInputElement).value).toBe('12.34')
    })

    it('never submits the payment form it sits in when applying a custom tip', async () => {
        const save = vi.fn(async () => ({ ok: true }))
        const pay = vi.fn((e: React.FormEvent) => e.preventDefault())
        render(<form onSubmit={pay}><Harness save={save} /></form>)
        fireEvent.click(screen.getByRole('button', { name: 'Custom' }))
        const input = screen.getByLabelText('Custom tip in dollars')
        fireEvent.change(input, { target: { value: '5' } })
        fireEvent.keyDown(input, { key: 'Enter' })
        await waitFor(() => expect(screen.getByTestId('tip').textContent).toBe('500'))
        fireEvent.change(input, { target: { value: '7' } })
        fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
        await waitFor(() => expect(screen.getByTestId('tip').textContent).toBe('700'))
        expect(pay).not.toHaveBeenCalled()
        for (const b of screen.getAllByRole('button')) expect(b.getAttribute('type')).toBe('button')
    })

    it('can be locked from outside while a payment is submitting', () => {
        render(<TipPicker baseCents={10000} tipCents={0} saving error="" onChange={async () => true} />)
        for (const b of screen.getAllByRole('button')) expect((b as HTMLButtonElement).disabled).toBe(true)
    })
})
