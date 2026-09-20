// WHAT THE MEMBER SEES WHEN SOMETHING LANDS ON HIS LEAVE (CURRENT-STATE item
// A, 20 Sep 26).
//
// Since the owner's ruling that an OIL credit ALWAYS lands, a member who bids
// leave on a weekend he ends up working gets a box showing FO with his bid
// tucked behind the corner mark. To him the day reads as though his leave had
// been thrown out. It has not — nothing is refused for recorded work any more,
// his bid is still live and an admin will decide it.
//
// The sheet behind the mark listed both records all along. What it did NOT do
// was say what that MEANT to him: its one explanatory line was written for an
// admin — "an admin needs to change one" — whoever opened it. This is the
// cheap half of the problem the owner parked the duty-cancels-your-bid feature
// for: tell the man, rather than build machinery to guess for him.

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { initStore, setCell, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

const P = 'slammed'
const SAT = '2026-01-03'

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
  expect(setCell(P, SAT, 'FO')).toBe(true)     // he works the Saturday
  expect(setCell(P, SAT, 'LL')).toBe(true)     // …and had bid leave on it
})

const asMember = () => { setRole('member'); setViewer(P) }

describe('a member reading his own clashed day', () => {
  it('is told his bid is STILL LIVE, by name, and that nothing was thrown out', () => {
    asMember()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${SAT}`))
    const said = screen.getByTestId('daylist-clash').textContent!
    expect(said).toContain('LL')
    expect(said).toContain('still live')
    expect(said).toContain('Nothing has been thrown out')
  })

  it('an ADMIN still gets the instruction, because for him it IS one', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${SAT}`))
    const said = screen.getByTestId('daylist-clash').textContent!
    expect(said).toContain('an admin needs to change one')
    expect(said).not.toContain('still live')
  })

  it('the corner mark on his own row says the same thing before he taps', () => {
    asMember()
    render(<Matrix />)
    expect(screen.getByTestId(`mark-${P}-${SAT}`).getAttribute('title')).toContain('still live')
  })

  it('…and on somebody ELSE’s row it still speaks to the admin', () => {
    render(<Matrix />)
    expect(screen.getByTestId(`mark-${P}-${SAT}`).getAttribute('title')).toContain('needs an admin')
  })

  it('his bid is genuinely there, not just described as there', () => {
    asMember()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${SAT}`))
    expect(screen.getByTestId('daylist').textContent).toContain('bid, not decided yet')
  })
})
