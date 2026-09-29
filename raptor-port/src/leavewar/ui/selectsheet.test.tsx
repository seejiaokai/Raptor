import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { advanceStage, getState, initStore, setCell, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { SelectSheet } from './SelectSheet'
import type { Selection } from './select'

// The batched selection sheet (owner, 27 Aug 26). The DRAG that opens it needs
// a real browser and is covered by e2e; here the sheet is rendered directly to
// pin that its chips drive the batch store writers with the right guards.

const cell = (person: string, date: string) => ({ personId: person, date })
const rampTwo: Selection = {
  people: ['ramp'],
  from: '2026-01-06',
  to: '2026-01-07',
  cells: [cell('ramp', '2026-01-06'), cell('ramp', '2026-01-07')],
}
const noop = () => {}
const mount = (sel: Selection, props: Partial<Parameters<typeof SelectSheet>[0]> = {}) =>
  render(
    <SelectSheet
      sel={sel}
      people={id => id}
      role="admin"
      canDecide={false}
      onDone={noop}
      onMove={noop}
      onClose={noop}
      {...props}
    />,
  )

beforeEach(() => { initStore(memoryBackend()); setRole('admin') })

describe('the selection sheet', () => {
  it('fills one code across the whole selection', () => {
    const onDone = vi.fn()
    mount(rampTwo, { onDone })
    fireEvent.click(screen.getByTestId('sel-LL'))
    expect(getState().grid.ramp['2026-01-06']).toBe('LL')
    expect(getState().grid.ramp['2026-01-07']).toBe('LL')
    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('the portion rides the fill — a morning writes the *LL half', () => {
    mount(rampTwo)
    fireEvent.click(screen.getByTestId('sel-portion-am'))
    fireEvent.click(screen.getByTestId('sel-LL'))
    expect(getState().grid.ramp['2026-01-06']).toBe('*LL')
  })

  it('reports a partial write and keeps the sheet up', () => {
    const onDone = vi.fn()
    // tata carries a Raptor-owned OIL on 2026-01-09 (seed) — it must skip
    const sel: Selection = {
      people: ['tata'], from: '2026-01-08', to: '2026-01-09',
      cells: [cell('tata', '2026-01-08'), cell('tata', '2026-01-09')],
    }
    mount(sel, { onDone })
    fireEvent.click(screen.getByTestId('sel-LL'))
    expect(screen.getByTestId('sel-note').textContent).toMatch(/1 written\. 1 skipped/)
    expect(getState().grid.tata['2026-01-09']).toBe('OIL')
  })

  it('delete confirms on a second tap (no undo here)', () => {
    setCell('ramp', '2026-01-06', 'LL')
    setCell('ramp', '2026-01-07', 'LL')
    const onDone = vi.fn()
    mount(rampTwo, { onDone })
    fireEvent.click(screen.getByTestId('sel-delete'))
    expect(screen.getByTestId('sel-delete').textContent).toContain('sure')
    expect(getState().grid.ramp['2026-01-06']).toBe('LL') // not yet
    fireEvent.click(screen.getByTestId('sel-delete'))
    expect(getState().grid.ramp?.['2026-01-06']).toBeUndefined()
    expect(onDone).toHaveBeenCalled()
  })

  it('offers Decide only when told to, and it batch-approves', () => {
    setCell('ramp', '2026-01-06', 'LL')
    setCell('ramp', '2026-01-07', 'LL')
    expect(screen.queryByTestId('sel-approve')).toBeNull() // canDecide false by default
    // the store itself now refuses a decision unless an admin holds it at
    // closed/published (canDecide) — put the war in the state the sheet's
    // canDecide prop claims
    setRole('admin'); advanceStage()
    mount(rampTwo, { canDecide: true })
    fireEvent.click(screen.getByTestId('sel-approve'))
    expect(getState().states.ramp['2026-01-06'].state).toBe('approved')
    expect(getState().states.ramp['2026-01-07'].state).toBe('approved')
  })

  it('the acknowledge decision uses the app word — "Ack"', () => {
    /* One word for one state (owner, 21 Sep 26, renaming his own 27 Aug
       "Pending"): the bulk button, the single-cell window and the legend all
       say Ack. The stored token is still 'acknowledged'. */
    mount(rampTwo, { canDecide: true })
    expect(screen.getByTestId('sel-pending').textContent).toBe('Ack')
  })

  it('no Medical row for anyone, and no Decide row for a member', () => {
    // Medical is member-filed only now (owner, 13 Sep 26) — the batch sheet
    // never offers it, for admin or member.
    setRole('member')
    mount(rampTwo, { role: 'member', canDecide: false })
    expect(screen.queryByTestId('sel-OML')).toBeNull()
    expect(screen.queryByTestId('sel-approve')).toBeNull()
    expect(screen.getByTestId('sel-LL')).toBeTruthy() // but can still fill
  })

  it('hides Delete and Move when the box holds no movable bid (Fill-only)', () => {
    // rampTwo's cells are empty here — nothing to delete or move
    mount(rampTwo)
    expect(screen.queryByTestId('sel-delete')).toBeNull()
    expect(screen.queryByTestId('sel-move')).toBeNull()
    expect(screen.getByTestId('sel-LL')).toBeTruthy() // Fill still offered
  })

  it('shows Delete and Move once the box holds a movable bid', () => {
    setCell('ramp', '2026-01-06', 'LL')   // one input inside the box
    mount(rampTwo)
    expect(screen.getByTestId('sel-delete')).toBeTruthy()
    expect(screen.getByTestId('sel-move')).toBeTruthy()
  })

  it('offers Post-out only for a single-person selection', () => {
    const onPostOut = vi.fn()
    mount(rampTwo, { onPostOut })
    expect(screen.getByTestId('sel-postout')).toBeTruthy()
    const twoPeople: Selection = {
      people: ['ramp', 'dusk'], from: '2026-01-06', to: '2026-01-06',
      cells: [cell('ramp', '2026-01-06'), cell('dusk', '2026-01-06')],
    }
    mount(twoPeople, { onPostOut })
    expect(screen.queryAllByTestId('sel-postout')).toHaveLength(1) // only the first mount's
  })
})

/* THE DRAG-SELECTION'S POST OUT SAYS WHY IT WAS REFUSED (AB5, 26 Sep 26): its confirm called onDone(true) whatever
   the store answered, so a posting that would close before it opens vanished with the sheet. */
describe('a refused post-out on the selection sheet', () => {
  it('keeps the sheet open with the reason, and reports nothing done', () => {
    const onDone = vi.fn()
    const onPostOut = vi.fn(() => 'Posted in on 10 Jan 26 — the post-out has to be after that day.')
    mount(rampTwo, { onDone, onPostOut })
    fireEvent.click(screen.getByTestId('sel-postout'))
    fireEvent.change(screen.getByTestId('sel-po-date'), { target: { value: '2026-01-05' } })
    fireEvent.click(screen.getByTestId('sel-po-confirm'))
    expect(onDone).not.toHaveBeenCalled()
    expect(screen.getByTestId('sel-note').textContent).toMatch(/the post-out has to be after that day/)
  })
})

/* A DRAG THAT WOULD TAKE SOMEONE BELOW ZERO ASKS ONCE FIRST, AS A ONE-DAY BID DOES (his ruling D418, 29 Sep 26 — "Drag
   asks too"). Before, a three-day drag of CCL from a balance of 0 wrote -3 with no word. The sheet asks the matrix what
   each man's balance would read (`wouldLeave`, the one-day sheet's own question) — stubbed here to a plain count so the
   test is about the ASK; the count itself is pinned in state/balanceafter.test.ts and charge.test.ts (withFill), the wiring in the e2e. */
describe('the ask before a drag takes anyone below zero (D418)', () => {
  const zero = (balances: Record<string, number>) =>
    (pid: string, dates: readonly string[], code: string) =>
      code.replace(/\*/g, '') === 'CCL' ? { counter: 'ccl' as const, before: balances[pid] ?? 0, after: (balances[pid] ?? 0) - dates.length } : null
  const two: Selection = {
    people: ['ramp', 'tata'], from: '2026-01-06', to: '2026-01-07',
    cells: [cell('ramp', '2026-01-06'), cell('ramp', '2026-01-07'), cell('tata', '2026-01-06'), cell('tata', '2026-01-07')],
  }

  it('the first tap only asks, naming the man and the figure; the same leave again writes', () => {
    const onDone = vi.fn()
    mount(rampTwo, { onDone, wouldLeave: zero({ ramp: 0 }) })
    fireEvent.click(screen.getByTestId('sel-CCL'))
    expect(screen.getByTestId('sel-note').textContent).toBe('That takes ramp to -2 CCL. Tap the same leave again to go ahead.')
    expect(getState().grid.ramp?.['2026-01-06']).toBeUndefined()
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('sel-CCL'))
    expect(getState().grid.ramp['2026-01-06']).toBe('CCL')
    expect(getState().grid.ramp['2026-01-07']).toBe('CCL')
    expect(onDone).toHaveBeenCalledWith(true)
  })

  it('a block of several men asks ONCE, naming only those it takes below zero', () => {
    mount(two, { wouldLeave: zero({ ramp: 0, tata: 5 }) })
    fireEvent.click(screen.getByTestId('sel-CCL'))
    expect(screen.getByTestId('sel-note').textContent).toBe('That takes ramp to -2 CCL. Tap the same leave again to go ahead.')
    cleanup()
    mount(two, { wouldLeave: zero({ ramp: 0, tata: 1 }) })
    fireEvent.click(screen.getByTestId('sel-CCL'))
    expect(screen.getByTestId('sel-note').textContent).toBe('That takes ramp to -2 CCL and tata to -1 CCL. Tap the same leave again to go ahead.')
  })

  it('a different leave or half asks afresh; a fill that stays at or above zero never asks', () => {
    mount(rampTwo, { wouldLeave: zero({ ramp: 0 }) })
    fireEvent.click(screen.getByTestId('sel-CCL'))
    fireEvent.click(screen.getByTestId('sel-portion-am'))
    fireEvent.click(screen.getByTestId('sel-CCL'))           // *CCL is another code: it asks again
    expect(getState().grid.ramp?.['2026-01-06']).toBeUndefined()
    expect(screen.getByTestId('sel-note').textContent).toContain('Tap the same leave again')
    fireEvent.click(screen.getByTestId('sel-CCL'))
    expect(getState().grid.ramp['2026-01-06']).toBe('*CCL')
  })

  it('a fill that leaves the balance at zero or above writes at once', () => {
    mount(rampTwo, { wouldLeave: zero({ ramp: 2 }) })          // 2 − 2 = 0: not below zero
    fireEvent.click(screen.getByTestId('sel-CCL'))
    expect(screen.queryByTestId('sel-note')).toBeNull()
    expect(getState().grid.ramp['2026-01-07']).toBe('CCL')
  })

  it('Delete after the ask drops it — the leave tapped next asks again', () => {
    setCell('ramp', '2026-01-06', 'LL')
    mount(rampTwo, { wouldLeave: zero({ ramp: 0 }) })
    fireEvent.click(screen.getByTestId('sel-CCL'))
    fireEvent.click(screen.getByTestId('sel-delete'))           // arms Delete, and the leave's ask is dropped
    fireEvent.click(screen.getByTestId('sel-CCL'))
    expect(screen.getByTestId('sel-note').textContent).toContain('Tap the same leave again')
    expect(getState().grid.ramp['2026-01-07']).toBeUndefined()
  })

  it('How much changed away and back drops the ask — the leave asks again (Astra F2)', () => {
    mount(rampTwo, { wouldLeave: zero({ ramp: 0 }) })
    fireEvent.click(screen.getByTestId('sel-CCL'))
    fireEvent.click(screen.getByTestId('sel-portion-am'))
    fireEvent.click(screen.getByTestId('sel-portion-full'))
    fireEvent.click(screen.getByTestId('sel-CCL'))
    expect(getState().grid.ramp?.['2026-01-06']).toBeUndefined()
    expect(screen.getByTestId('sel-note').textContent).toContain('Tap the same leave again')
  })

  it('a Decide between the ask and the leave drops the ask (Astra F2)', () => {
    setCell('ramp', '2026-01-06', 'LL')
    setRole('admin'); advanceStage()
    mount(rampTwo, { canDecide: true, wouldLeave: zero({ ramp: 0 }) })
    fireEvent.click(screen.getByTestId('sel-CCL'))
    fireEvent.click(screen.getByTestId('sel-pending'))               // Ack the one bid — a partial decision keeps the sheet
    fireEvent.click(screen.getByTestId('sel-CCL'))
    expect(getState().grid.ramp['2026-01-07']).toBeUndefined()
    expect(screen.getByTestId('sel-note').textContent).toContain('Tap the same leave again')
  })

  it('a man already below zero whom the fill costs nothing is not asked about (Astra F4)', () => {
    // the stub for a fill that spends nothing: before = after, both in the red
    const flat = () => ({ counter: 'ccl' as const, before: -2, after: -2 })
    mount(rampTwo, { wouldLeave: flat })
    fireEvent.click(screen.getByTestId('sel-CCL'))
    expect(screen.queryByTestId('sel-note')).toBeNull()
    expect(getState().grid.ramp['2026-01-06']).toBe('CCL')
  })

  it('leave that spends nothing never asks', () => {
    mount(rampTwo, { wouldLeave: zero({ ramp: 0 }) })
    fireEvent.click(screen.getByTestId('sel-LL'))               // the stub spends nothing for LL
    expect(screen.queryByTestId('sel-note')).toBeNull()
    expect(getState().grid.ramp['2026-01-06']).toBe('LL')
  })
})
