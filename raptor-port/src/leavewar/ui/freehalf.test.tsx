// THE FREE HALF BESIDE INPUTS-FILED LEAVE (CURRENT-STATE item D, 20 Sep 26).
//
// The read-only sheet used to speak for the WHOLE day whenever the main record
// was filed on the Inputs page. So a morning LL filed on the form made the
// afternoon unbiddable too, and nothing on screen said why — the tap just
// produced a sheet that said "change it on the Inputs page" about a half the
// form had never touched. Most leave arrives through the form, so this was the
// normal case, not a corner.
//
// The constraint both reviewers put on it, and what the second half of this
// file pins: it opens the FREE half only. It must NOT make the filed leave
// itself editable from the grid, and it must not weaken the lock protecting
// it.

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { fileAbsence } from '../testkit'
import { INPUTS } from '../../engine/inputs'
import { syncAbsences } from '../sync'
import { cellProblem } from '../state/store'
import { Matrix } from './Matrix'

const P = 'slammed'
const D = '2026-02-10'

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
})

/** Morning leave filed on the Inputs page — locked on the war, half the day. */
const fileMorning = () => fileAbsence(P, '*LL', D)

describe('a half filed on the Inputs page leaves the other half biddable', () => {
  it('the tap opens the bid picker on the FREE half, not the read-only sheet', () => {
    fileMorning()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    // Only the afternoon is on offer. The other two are ABSENT, not dimmed —
    // a disabled chip invites a tap and then refuses it.
    expect(screen.getByTestId('portion-pm')).toBeTruthy()
    expect(screen.queryByTestId('portion-am')).toBeNull()
    expect(screen.queryByTestId('portion-full')).toBeNull()
    expect(screen.getByTestId('portion-pm').getAttribute('aria-pressed')).toBe('true')
  })

  it('names what holds the other half and where it is changed', () => {
    fileMorning()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    const said = screen.getByTestId('bid-heldhalf').textContent!
    expect(said).toContain('morning')
    expect(said).toContain('Inputs page')
  })

  it('the bid on the free half actually lands, and both records stand', () => {
    fileMorning()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    fireEvent.click(screen.getByTestId('bid-OL'))
    const v = getState().views[P]?.[D]
    expect(v?.all.filter(c => c.kind === 'request')).toHaveLength(1)
    expect(v?.all.filter(c => c.kind === 'absence')).toHaveLength(1)
    // Two different facts, both let in, and nothing to flag — they do not meet.
    expect(v?.amber).toBe(false)
  })

  it('a WHOLE day filed on the form still opens the read-only sheet', () => {
    fileAbsence(P, 'LL', D)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
  })

  it('the filed leave itself is still not editable here — the lock is untouched', () => {
    fileMorning()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    // The morning is not on offer at all, so the sheet cannot be used to
    // overwrite it; and the store still refuses one if asked directly.
    expect(screen.queryByTestId('portion-am')).toBeNull()
    const before = JSON.stringify(getState().views[P]?.[D]?.all)
    fireEvent.click(screen.getByTestId('bid-clear'))
    expect(JSON.stringify(getState().views[P]?.[D]?.all)).toBe(before)
  })

  it('a MEMBER gets the same free half on their own row, and nothing on anyone else’s', () => {
    fileMorning()
    setRole('member')
    setViewer(P)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    expect(screen.getByTestId('portion-pm')).toBeTruthy()
    expect(screen.queryByTestId('portion-am')).toBeNull()
  })
})

/* A MEDICAL'S REAL HOURS DECIDE WHAT IS FREE (the absence-record re-test, W5-F4, 26 Sep 26 — found by the orders
   walker). An ATT C recorded 09:00–14:00 is DRAWN as a morning (the six-hour rule), so the sheet offered the afternoon
   as the free half — and then refused the bid it offered, by the real hours (§7: real hours decide every clash), with
   "That day is already ATT C". The free half is now read off the same real hours the refusal reads, so a half is
   offered only when it can be taken; and the refusal, wherever it is still reached, gives the medical's hours. */
describe('beside a medical recorded with hours', () => {
  const plantMed = (s: number, e: number) => {
    INPUTS.unshift({ iid: `m${s}`, person: P, type: 'ATT C', date: 'Feb 10', yr: 2026, allday: false, s, e, remarks: '', mod: '2026-01-01' })
    syncAbsences()
  }
  it('09:00–14:00 runs into the afternoon: no half is offered — the tap reads the day, it does not bid', () => {
    plantMed(540, 840)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(screen.getByTestId('raptor-sheet')).toBeTruthy()
  })
  it('08:00–11:00 leaves the afternoon free, and the afternoon bid lands', () => {
    plantMed(480, 660)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    expect(screen.queryByTestId('portion-full')).toBeNull()
  })
  it('a bid refused by the medical names its hours', () => {
    plantMed(540, 840)
    expect(cellProblem(P, D, 'LL*')).toMatch(/ATT C runs 09:00–14:00 that day — leave can.t go over a medical/)
  })
})

/* THE SHEET'S "NOW" SAYS WHAT THE BOX SAYS (the absence-record re-test, W5-F5, 26 Sep 26): the box and the chips read a
   morning as "<LL"; the sheet's heading printed the stored notation, "now *LL". */
describe('the bid sheet heading', () => {
  it('reads the day the way its box does', () => {
    fileMorning()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    const cur = screen.getByTestId('bid-picker').querySelector('.cur')!.textContent || ''
    expect(cur).toContain('<LL')
    expect(cur).not.toContain('*')
  })
})
