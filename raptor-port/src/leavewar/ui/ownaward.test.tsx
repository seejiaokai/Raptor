// A MEMBER OPENS HIS OWN OIL AWARD, READ ONLY, AT ANY TIME (owner, D261, 27 Sep 26 — "3 yes"; "every stage" until the
// stages went, D1177 — now on any day not open for him).
//
//   "Should a member be able to open his own OIL award read-only at any time, not only while bidding is open?" → yes.
//
// Inside the bidding window his tap on his own FO / HO opened the bid sheet, whose foot reads the award back (reason,
// given by, days — owner, 21 Sep 26). Outside it — a locked day, bidding closed, the war published — the same tap opened
// NOTHING (the absence-record re-test, W3-F10), though the OIL tracker shows the same facts. Now it opens a read-only
// sheet with those three lines, and nothing to press. Another man's award stays as it was (nothing opens); an admin's
// tap is unchanged. Since the stages went (D1177) "closed" is a day outside the open dates, or before his today (D1211).

import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { setMemberTodayForTests } from '../engine'
import { closeDates, initStore, setDayAward, setPostIn, setPostOut, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

const ME = 'ramp'
const OUTSIDE = '2026-05-06'      // after the seeded war's bidding window (1 Jan – 31 Mar)
const INSIDE = '2026-01-06'

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
  setDayAward(ME, OUTSIDE, 3, { note: 'Recall', givenBy: 'OC Ops' })
  setDayAward(ME, INSIDE, 0.5, { note: 'SIM' })
  setDayAward('dusk', OUTSIDE, 1, { note: 'Not yours' })
})

const asMember = () => act(() => { setRole('member'); setViewer(ME) })
/** Every date of the seeded war closed, by the admin (was "bidding closed" — D1177). */
const closeAll = () => act(() => { closeDates('2026-01-01', '2026-12-31') })

/** The read-only award sheet is up, reads the award back, and offers nothing to change it. */
function expectReadOnlyAward(why: string, given: string, days: string) {
  expect(screen.getByTestId('award-sheet')).toBeTruthy()
  expect(screen.getByTestId('oil-detail-why').textContent).toBe(why)
  expect(screen.getByTestId('oil-detail-given').textContent).toBe(given)
  expect(screen.getByTestId('oil-detail-days').textContent).toBe(days)
  for (const t of ['bid-picker', 'bid-oil', 'oil-clear', 'bid-clear', 'bid-LL', 'decide-shift']) expect(screen.queryByTestId(t)).toBeNull()
}

describe('his own award opens read only on any day not open for him (D261)', () => {
  it('on a day outside the open dates', () => {
    asMember()
    render(<Matrix />)
    expect(screen.getByTestId(`cell-${ME}-${OUTSIDE}`).className).toContain('act')   // drawn as tappable
    fireEvent.click(screen.getByTestId(`cell-${ME}-${OUTSIDE}`))
    expectReadOnlyAward('Recall', 'OC Ops', '3 days')
  })

  it('with every date closed', () => {
    closeAll()
    asMember()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${ME}-${INSIDE}`))
    expectReadOnlyAward('SIM', 'Not given', 'half a day')
  })

  /* was PUBLISHED: the stages went (D1177). A day closed while OTHER days of the same period stay open. */
  it('on a day closed while other days stay open', () => {
    act(() => { closeDates('2026-01-01', '2026-01-31') })
    asMember()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${ME}-${INSIDE}`))
    expectReadOnlyAward('SIM', 'Not given', 'half a day')
  })

  /* was DRAFT: the stages went (D1177). The other way a day inside the open dates is shut to him: it is before his
     today (D1211). */
  it('on a day inside the open dates but before his today', () => {
    setMemberTodayForTests('2026-02-01')
    asMember()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${ME}-${INSIDE}`))
    expectReadOnlyAward('SIM', 'Not given', 'half a day')
  })

  it('its ✕ closes it', () => {
    closeAll()
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
    closeAll()
    asMember()
    render(<Matrix />)
    const cell = screen.getByTestId(`cell-${ME}-${OUTSIDE}`)
    expect(cell.textContent).toContain('FO')
    fireEvent.click(cell)
    expectReadOnlyAward('Recall', 'OC Ops', '3 days')
  })
  it('before his post-in: the same', () => {
    setPostIn(ME, '2026-06-01')
    closeAll()
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
    closeAll()
    asMember()
    render(<Matrix />)
    expect(screen.getByTestId(`cell-dusk-${OUTSIDE}`).className).not.toContain(' act')
    fireEvent.click(screen.getByTestId(`cell-dusk-${OUTSIDE}`))
    expect(screen.queryByTestId('award-sheet')).toBeNull()
    expect(screen.queryByTestId('bid-picker')).toBeNull()
  })

  it('inside the open dates his tap still opens the bid sheet, the award read back at its foot', () => {
    asMember()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${ME}-${INSIDE}`))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    expect(screen.getByTestId('oil-detail-why').textContent).toBe('SIM')
    expect(screen.queryByTestId('bid-oil')).toBeNull()          // no +OIL for a member
    expect(screen.queryByTestId('award-sheet')).toBeNull()
  })

  it('an ADMIN’s tap on an award opens the bid sheet with its +OIL, open dates or none', () => {
    closeAll()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${ME}-${OUTSIDE}`))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    expect(screen.getByTestId('bid-oil')).toBeTruthy()
    expect(screen.queryByTestId('award-sheet')).toBeNull()
  })
})
