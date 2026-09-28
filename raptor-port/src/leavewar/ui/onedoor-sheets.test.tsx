// [ONE-DOOR] (27 Sep 26) — THE LEAVE WAR'S TWO POSTING SHEETS, after the one door.
// Round 1 (Fable F1 / Astra 2): a man archived on Admin → Users comes back only by Restore there — his Post out sheet on
// the war is read-only: it says where to go, its date is fixed, and it offers no chips and no Undo.
// D320 (and round 1 — Fable F2 / Astra 1, past stints read-only): the Post in sheet of a man back from a posting says so,
// and its Undo is not offered (clearing his post-in would lay "here from always" over the stint he left).
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PostInSheet, PostOutSheet } from './BidPicker'
import { Matrix } from './Matrix'
import { getState, initStore, openStint, setPostIn, setPostingLockLookup, setPostOut, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'

const noop = () => {}

describe('Fable F1 / Astra 2 — the Post out sheet of a man archived on Admin → Users', () => {
  it('reads only: the reason, the date fixed, no chips, no Undo', () => {
    render(<PostOutSheet callsign="HEX" date="2026-08-01" poFrom="2026-07-15" outcome="overseas" onChange={noop} onUndo={noop}
      onClose={noop} lockedWhy="Hex was archived on Admin → Users — restore him there" />)
    expect(screen.getByTestId('postout-locked').textContent).toBe('Hex was archived on Admin → Users — restore him there')
    expect((screen.getByTestId('postout-date') as HTMLInputElement).disabled).toBe(true)
    expect(screen.queryByTestId('postout-undo')).toBeNull()
    expect(screen.queryByRole('group', { name: /posting/i })).toBeNull()
    expect(screen.queryByTestId('postout-line')).toBeNull()
  })
  it('pinned unchanged: a posting\'s own sheet still has its chips and its Undo', () => {
    render(<PostOutSheet callsign="HEX" date="2026-08-01" poFrom="2026-07-15" outcome="overseas" onChange={noop} onUndo={noop} onClose={noop} />)
    expect(screen.queryByTestId('postout-locked')).toBeNull()
    expect(screen.getByTestId('postout-undo')).toBeTruthy()
    expect((screen.getByTestId('postout-date') as HTMLInputElement).disabled).toBe(false)
  })
})

describe('the walk design (Fable 4.2) — the Post IN sheet of a man archived on Admin → Users', () => {
  it('reads only too: the reason, the date fixed, no Undo', () => {
    render(<PostInSheet callsign="HEX" date="2026-07-01" piFrom="2026-07-10" onChange={noop} onUndo={noop} onClose={noop}
      lockedWhy="Hex was archived on Admin → Users — restore him there" />)
    expect(screen.getByTestId('postin-locked').textContent).toBe('Hex was archived on Admin → Users — restore him there')
    expect((screen.getByTestId('postin-date') as HTMLInputElement).disabled).toBe(true)
    expect(screen.queryByTestId('postin-undo')).toBeNull()
  })
})

describe('D320 — the Post in sheet of a man back from a posting', () => {
  it('says he is back, and offers no Undo', () => {
    render(<PostInSheet callsign="HEX" date="2026-08-01" piFrom="2026-09-01" backFrom="2026-06-15" onChange={noop} onUndo={noop} onClose={noop} />)
    expect(screen.getByTestId('postin-note').textContent).toMatch(/Back from a posting on 15 Jun 26 — on the manpower from 1 Sep 26\. The days between count nobody/)   // day-first ([LW-ISO-DATES])
    expect(screen.queryByTestId('postin-undo')).toBeNull()
  })
  it('pinned unchanged: one stint — its note and its Undo as before', () => {
    render(<PostInSheet callsign="HEX" date="2026-01-15" piFrom="2026-02-01" onChange={noop} onUndo={noop} onClose={noop} />)
    expect(screen.getByTestId('postin-note').textContent).toMatch(/Posted in on 1 Feb 26 — on the manpower from that day/)
    expect(screen.getByTestId('postin-undo')).toBeTruthy()
  })
})

/* …and the GRID mounts them locked: the store's posting lock (installed by the sync as "archived on Admin → Users" —
   here by hand, the grid alone) makes the Post out AND the Post in sheet read only, and both writers refuse
   (the walk's design, Fable 4.2 / 4.3, 27 Sep 26). */
describe('the grid, a man whose posting dates are locked', () => {
  const WHY = 'Hex was archived on Admin → Users — restore him there'
  beforeEach(() => { initStore(memoryBackend()); setRole('admin') })
  afterEach(() => setPostingLockLookup(null))
  it('his Post out sheet and his Post in sheet both read only; the writers refuse', () => {
    const id = getState().people[0]!.id
    expect(setPostIn(id, '2026-06-10')).toBe(true)
    expect(setPostOut(id, '2026-08-10')).toBe(true)
    setPostingLockLookup(x => (x === id ? WHY : null))
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${id}-2026-08-12`))
    expect(screen.getByTestId('postout-locked').textContent).toBe(WHY)
    expect(screen.queryByTestId('postout-undo')).toBeNull()
    fireEvent.click(screen.getByTestId('postout-cancel'))
    fireEvent.click(screen.getByTestId(`cell-${id}-2026-06-05`))
    expect(screen.getByTestId('postin-locked').textContent).toBe(WHY)
    expect(screen.queryByTestId('postin-undo')).toBeNull()
    expect(setPostIn(id, null)).toBe(false)
    expect(setPostOut(id, null)).toBe(false)
    expect(getState().people.find(p => p.id === id)!.from).toBe('2026-06-10')
    expect(getState().people.find(p => p.id === id)!.to).toBe('2026-08-09')
  })
})

/* …and on a day INSIDE his stint the bid sheet offers him no Post out and no Post in (the walk's pictures, 27 Sep 26:
   the button could only be refused, and then said the reason twice) — leave and OIL can still be placed there. */
describe('the grid, a locked man\'s own day', () => {
  beforeEach(() => { initStore(memoryBackend()); setRole('admin') })
  afterEach(() => setPostingLockLookup(null))
  it('the bid sheet has no Post out and no Post in; the leave codes are still there', () => {
    const id = getState().people[0]!.id
    expect(setPostIn(id, '2026-06-10')).toBe(true)
    expect(setPostOut(id, '2026-08-10')).toBe(true)
    setPostingLockLookup(x => (x === id ? 'Hex was archived on Admin → Users — restore him there' : null))
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${id}-2026-07-01`))
    expect(screen.queryByTestId('bid-postout')).toBeNull()
    expect(screen.queryByTestId('bid-postin')).toBeNull()
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
  })
})

/* the grid's row for a man seen only through an EARLIER stint (D320): his current stint starts after the war ends, yet
   the months he was here keep his row (the break tests, 27 Sep 26 — no test watched `rowInWindow`'s past stints) */
describe('the grid, a man whose only stint in this war is an earlier one', () => {
  beforeEach(() => { initStore(memoryBackend()); setRole('admin') })
  it('keeps his row for the months he was here', () => {
    const id = getState().people[0]!.id
    expect(setPostOut(id, '2026-07-01')).toBe(true)
    expect(openStint(id, '2027-02-01')).toBe(true)
    render(<Matrix />)
    expect(screen.getByTestId(`row-${id}`)).toBeTruthy()
  })
})
