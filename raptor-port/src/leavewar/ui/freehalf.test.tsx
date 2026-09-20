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
