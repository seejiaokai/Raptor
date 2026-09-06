import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { initStore, setRole, getState } from '../state/store'
import { memoryBackend } from '../state/storage'
import { FIGURES } from '../engine/counters'
import { parseAmount } from './CreditForm'
import { BalanceBar } from './BalanceBar'

/* THE DOCKED BALANCE BAR (owner, 6 Sep 26) — the panel a drag down a figure
   column raises: one number for the whole run, Save writes one ledger batch.
   Its POSITION and its slide are geometry, so they live in e2e; what this file
   proves is the contract a browser cannot see — the number parser's own rules,
   which pool gets the full form, that a refusal keeps the run standing, and
   that nothing is written by a bar that is merely closed. */

describe('parseAmount — 2 and +2 add, -2 subtracts (owner, 6 Sep 26)', () => {
  it.each([
    ['2', 1, 2], ['+2', 1, 2], ['-2', 1, -2], ['−2', 1, -2], ['2.5', 1, 2.5], ['.5', 1, 0.5],
    ['2', -1, -2], ['+2', -1, 2], ['-2', -1, -2],   // a typed sign beats the chip
    ['', 1, null], ['abc', 1, null], ['2-', 1, null], ['1,5', 1, null],
  ])('%s with sign %s → %s', (raw, sign, want) => {
    expect(parseAmount(raw as string, sign as 1 | -1)).toBe(want)
  })
})

describe('BalanceBar', () => {
  beforeEach(() => { initStore(memoryBackend()); setRole('admin') })
  const ccl = FIGURES.find(f => f.id === 'ccl')! as any
  const oil = FIGURES.find(f => f.id === 'oil')! as any

  it('names the count and the pool, opens EMPTY, and writes one entry per person on Save', () => {
    const onDone = vi.fn()
    render(<BalanceBar figure={ccl} ids={['ramp', 'dusk']} onDone={onDone} onClose={() => {}} />)
    expect(screen.getByTestId('oil-credit-who').textContent).toBe('2 people · +CCL')
    const amt = screen.getByTestId('oil-amt') as HTMLInputElement
    expect(amt.value).toBe('')
    expect(screen.queryByTestId('oil-reason')).toBeNull()   // a plain pool: the number only
    fireEvent.change(amt, { target: { value: '2' } })
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(onDone).toHaveBeenCalledTimes(1)
    const mine = getState().ledger.filter(e => e.counter === 'ccl' && ['ramp', 'dusk'].includes(e.personId))
    expect(mine.map(e => e.amount)).toEqual([2, 2])
  })

  it('refuses and KEEPS the selection: empty, zero, a quarter day', () => {
    const onDone = vi.fn()
    render(<BalanceBar figure={ccl} ids={['ramp']} onDone={onDone} onClose={() => {}} />)
    const amt = screen.getByTestId('oil-amt')
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(screen.getByTestId('oil-credit-err').textContent).toMatch(/days/i)
    fireEvent.change(amt, { target: { value: '0' } }); fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(screen.getByTestId('oil-credit-err').textContent).toBe('The amount must be a number other than 0')
    fireEvent.change(amt, { target: { value: '1.25' } }); fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(screen.getByTestId('oil-credit-err').textContent).toBe('Days come in halves — 1, 1.5, 2 …')
    expect(onDone).not.toHaveBeenCalled()
    expect(screen.getByTestId('balance-bar')).toBeTruthy()
  })

  /* A refusal names what was wrong with the value that WAS typed, so left
     standing over a new one it reads as a fresh rejection of a draft nothing
     has judged yet — the reader's next keystroke is met by an error about the
     keystroke before it (review, 6 Sep 26). Editing the amount clears it; the
     refusal comes back only if Save is pressed again. */
  it('editing the amount clears the last refusal', () => {
    render(<BalanceBar figure={ccl} ids={['ramp']} onDone={() => {}} onClose={() => {}} />)
    const amt = screen.getByTestId('oil-amt')
    fireEvent.change(amt, { target: { value: '1.25' } })
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(screen.getByTestId('oil-credit-err').textContent).toBe('Days come in halves — 1, 1.5, 2 …')
    fireEvent.change(amt, { target: { value: '1.5' } })
    expect(screen.queryByTestId('oil-credit-err'), 'the message goes the moment the draft changes').toBeNull()
    // …and it is a CLEAR, not a silencing: a still-bad value refuses again.
    fireEvent.change(amt, { target: { value: '1.25' } })
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(screen.getByTestId('oil-credit-err').textContent).toBe('Days come in halves — 1, 1.5, 2 …')
  })

  it('the sign chip subtracts on a phone keypad that has no minus', () => {
    render(<BalanceBar figure={ccl} ids={['ramp']} onDone={() => {}} onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('oil-sign'))
    fireEvent.change(screen.getByTestId('oil-amt'), { target: { value: '1' } })
    fireEvent.keyDown(screen.getByTestId('oil-amt'), { key: 'Enter' })
    expect(getState().ledger.filter(e => e.counter === 'ccl' && e.personId === 'ramp').at(-1)!.amount).toBe(-1)
  })

  it('OIL brings the tracker\'s full form and its rules', () => {
    render(<BalanceBar figure={oil} ids={['ramp']} onDone={() => {}} onClose={() => {}} />)
    expect(screen.getByTestId('oil-date')).toBeTruthy()
    expect(screen.getByTestId('oil-reason')).toBeTruthy()
    expect(screen.getByTestId('oil-given')).toBeTruthy()
    fireEvent.change(screen.getByTestId('oil-amt'), { target: { value: '1' } })
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(screen.getByTestId('oil-credit-err').textContent).toBe('Give a reason')
  })

  it('✕ closes without writing, and Escape in the amount box does the same', () => {
    const onClose = vi.fn()
    render(<BalanceBar figure={ccl} ids={['ramp']} onDone={() => {}} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('oil-credit-cancel'))
    fireEvent.keyDown(screen.getByTestId('oil-amt'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
    expect(getState().ledger.some(e => e.counter === 'ccl' && e.personId === 'ramp')).toBe(false)
  })
})
