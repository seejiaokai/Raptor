// A MEMBER OPENS HIS OWN OIL AWARD, READ ONLY, AT EVERY STAGE (owner, D261, 27 Sep 26 — "3 yes").
//
//   "Should a member be able to open his own OIL award read-only at any time, not only while bidding is open?" → yes.
//
// Inside the bidding window his tap on his own FO / HO opened the bid sheet, whose foot reads the award back (reason,
// given by, days — owner, 21 Sep 26). Outside it — a locked day, bidding closed, the war published — the same tap opened
// NOTHING (the absence-record re-test, W3-F10), though the OIL tracker shows the same facts. Now it opens a read-only
// sheet with those three lines, and nothing to press. Another man's award stays as it was (nothing opens); an admin's
// tap is unchanged.

import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { advanceStage, initStore, reopenStage, setManualCredit, setPostIn, setPostOut, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

const ME = 'ramp'
const OUTSIDE = '2026-05-06'      // after the seeded war's bidding window (1 Jan – 31 Mar)
const INSIDE = '2026-01-06'

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
  setManualCredit(ME, OUTSIDE, 'FO', { note: 'Recall', givenBy: 'OC Ops', days: 3 })
  setManualCredit(ME, INSIDE, 'HO', { note: 'SIM' })
  setManualCredit('dusk', OUTSIDE, 'FO', { note: 'Not yours' })
})

const asMember = () => act(() => { setRole('member'); setViewer(ME) })

/** The read-only award sheet is up, reads the award back, and offers nothing to change it. */
function expectReadOnlyAward(why: string, given: string, days: string) {
  expect(screen.getByTestId('award-sheet')).toBeTruthy()
  expect(screen.getByTestId('oil-detail-why').textContent).toBe(why)
  expect(screen.getByTestId('oil-detail-given').textContent).toBe(given)
  expect(screen.getByTestId('oil-detail-days').textContent).toBe(days)
  for (const t of ['bid-picker', 'bid-oil', 'oil-clear', 'bid-clear', 'bid-LL', 'decide-shift']) expect(screen.queryByTestId(t)).toBeNull()
}

describe('his own award opens read only at every stage (D261)', () => {
  it('OPEN, on a day outside the bidding window', () => {
    asMember()
    render(<Matrix />)
    expect(screen.getByTestId(`cell-${ME}-${OUTSIDE}`).className).toContain('act')   // drawn as tappable
    fireEvent.click(screen.getByTestId(`cell-${ME}-${OUTSIDE}`))
    expectReadOnlyAward('Recall', 'OC Ops', '3 days')
  })

  it('CLOSED', () => {
    advanceStage()
    asMember()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${ME}-${INSIDE}`))
    expectReadOnlyAward('SIM', 'Not given', 'half a day')
  })

  it('PUBLISHED', () => {
    advanceStage(); advanceStage()
    asMember()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${ME}-${OUTSIDE}`))
    expectReadOnlyAward('Recall', 'OC Ops', '3 days')
  })

  it('DRAFT (a war not yet shown to the squadron, if he has it on screen)', () => {
    reopenStage()                                   // open → draft, by the admin
    asMember()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${ME}-${INSIDE}`))
    expectReadOnlyAward('SIM', 'Not given', 'half a day')
  })

  it('its ✕ closes it', () => {
    advanceStage()
    asMember()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${ME}-${OUTSIDE}`))
    fireEvent.click(screen.getByTestId('award-close'))
    expect(screen.queryByTestId('award-sheet')).toBeNull()
  })
})

/* OUTSIDE HIS POSTING DATES (Astra's final read, 3, 27 Sep 26): an award may be given on a day after he posts out or
   before he posts in ("Place leave or OIL here instead…", N12), and the grid drew that day as a bare PO (or blank) and
   let nobody tap it — his own award was hidden from him, and from the admin's eye too. Leave dated there already shows
   with the posting hatch (answer C); an award now does the same, and his tap opens it read only. */
describe('his own award outside his posting dates (the final read)', () => {
  it('after his post-out: the day shows his FO, and his tap opens it read only', () => {
    setPostOut(ME, '2026-05-01', false)
    advanceStage()
    asMember()
    render(<Matrix />)
    const cell = screen.getByTestId(`cell-${ME}-${OUTSIDE}`)
    expect(cell.textContent).toContain('FO')
    fireEvent.click(cell)
    expectReadOnlyAward('Recall', 'OC Ops', '3 days')
  })
  it('before his post-in: the same', () => {
    setPostIn(ME, '2026-06-01')
    advanceStage()
    asMember()
    render(<Matrix />)
    const cell = screen.getByTestId(`cell-${ME}-${OUTSIDE}`)
    expect(cell.textContent).toContain('FO')
    fireEvent.click(cell)
    expectReadOnlyAward('Recall', 'OC Ops', '3 days')
  })
  it('an admin still gets the posting sheet first on such a day, and sees the FO on the grid', () => {
    setPostOut(ME, '2026-05-01', false)
    render(<Matrix />)
    const cell = screen.getByTestId(`cell-${ME}-${OUTSIDE}`)
    expect(cell.textContent).toContain('FO')
    fireEvent.click(cell)
    expect(screen.getByTestId('postout-sheet')).toBeTruthy()
  })
})

describe('what stays as it was', () => {
  it('ANOTHER man’s award opens nothing for a member', () => {
    advanceStage()
    asMember()
    render(<Matrix />)
    expect(screen.getByTestId(`cell-dusk-${OUTSIDE}`).className).not.toContain(' act')
    fireEvent.click(screen.getByTestId(`cell-dusk-${OUTSIDE}`))
    expect(screen.queryByTestId('award-sheet')).toBeNull()
    expect(screen.queryByTestId('bid-picker')).toBeNull()
  })

  it('inside the bidding window his tap still opens the bid sheet, the award read back at its foot', () => {
    asMember()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${ME}-${INSIDE}`))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    expect(screen.getByTestId('oil-detail-why').textContent).toBe('SIM')
    expect(screen.queryByTestId('bid-oil')).toBeNull()          // no +OIL for a member
    expect(screen.queryByTestId('award-sheet')).toBeNull()
  })

  it('an ADMIN’s tap on an award opens the bid sheet with its +OIL, at every stage', () => {
    advanceStage()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${ME}-${OUTSIDE}`))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    expect(screen.getByTestId('bid-oil')).toBeTruthy()
    expect(screen.queryByTestId('award-sheet')).toBeNull()
  })
})
