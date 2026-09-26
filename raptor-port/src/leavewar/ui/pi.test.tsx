// POST IN (PI) — owner, 20 Sep 26: "We need a post in button just like post
// out." The mirror of `po.test.tsx`.
//
// Before this the app had no joining date at all: `Person.from` existed and
// every manning path already read it, but nothing ever wrote it — the Raptor
// projection has no joining date to give — so every person read as having
// always been here. Two rulings had nothing to stand on because of it: answer
// C's "a pre-joining day may be FILED OR BID" (there were no pre-joining
// days), and item B's row span.
//
// The second half of the same ruling is the one that is easy to lose: "Because
// those dates are official dates. But they can be for e.g still taking leave
// after or before they post in or out." So the window decides MANNING and
// nothing else — a record outside it is allowed, shown and charged, and the
// row stretches to reach it (`span.test.ts`). Setting the dates must never
// become a way of refusing a record.

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, setPostIn, setPostOut, setRole } from '../state/store'
import { countsFor, inSquadron } from '../engine'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'
import { fileAbsence } from '../testkit'

beforeEach(() => {
  initStore(memoryBackend())
})

const anId = () => getState().people[0]!.id
const person = (id: string) => getState().people.find(x => x.id === id)!

describe('setPostIn (owner, 20 Sep 26 — "a post in button just like post out")', () => {
  it('posts a person in from the given day — that day is their FIRST in — admin only', () => {
    const id = anId()
    setRole('member')
    expect(setPostIn(id, '2026-06-15')).toBe(false)
    setRole('admin')
    expect(person(id).from).toBeNull()                  // nothing ever set one before
    expect(setPostIn(id, '2026-06-15')).toBe(true)
    expect(person(id).from).toBe('2026-06-15')
    expect(inSquadron(person(id), '2026-06-14')).toBe(false)  // not here yet
    expect(inSquadron(person(id), '2026-06-15')).toBe(true)   // here from the tapped day
    expect(setPostIn(id, null)).toBe(true)              // undo
    expect(person(id).from).toBeNull()
  })

  it('keeps the person OUT of the manning counts before the day they post in', () => {
    const id = anId()
    const g = () => getState()
    const total = (d: string) => {
      const c = countsFor(g().people, g().grid, g().states, d)
      return c.byCategory.IP + c.byCategory.OPSP + c.byCategory.IWSO + c.byCategory.OPSW
    }
    const before = total('2026-06-14')
    setRole('admin')
    setPostIn(id, '2026-06-15')
    expect(total('2026-06-14')).toBe(before - 1)
    expect(total('2026-06-15')).toBe(before)
  })

  it('takes any real date and refuses only a malformed one', () => {
    const id = anId()
    setRole('admin')
    expect(setPostIn(id, '2025-03-10')).toBe(true)
    expect(person(id).from).toBe('2025-03-10')
    expect(setPostIn(id, '2031-01-01')).toBe(true)
    expect(setPostIn(id, 'June 15')).toBe(false)
    expect(setPostIn(id, '')).toBe(false)
    expect(person(id).from).toBe('2031-01-01')
  })

  it('refuses a window that closes before it opens, from either end', () => {
    // Not a decision, a typo — and it would hide the person on EVERY date at
    // once, since `inSquadron` would answer false on both sides.
    const id = anId()
    setRole('admin')
    expect(setPostIn(id, '2026-06-15')).toBe(true)
    expect(setPostOut(id, '2026-06-10')).toBe(false)    // last day in would be 9 June
    expect(person(id).to).toBeNull()
    expect(setPostOut(id, '2026-09-01')).toBe(true)     // last day in is 31 Aug
    expect(setPostIn(id, '2026-10-01')).toBe(false)
    expect(person(id).from).toBe('2026-06-15')
  })

  it('a record outside the window is still allowed, shown and charged — the dates are OFFICIAL, not a gate', () => {
    // The owner's own second sentence: "those dates are official dates. But
    // they can be for e.g still taking leave after or before they post in or
    // out." Nothing in the posting path may refuse a record, and nothing
    // downstream may read the window as permission.
    const id = anId()
    setRole('admin')
    setPostIn(id, '2026-06-15')
    setPostOut(id, '2026-09-01')          // last day in is 31 Aug
    fileAbsence(id, 'LL', '2026-03-02')   // months before he joined
    fileAbsence(id, 'LL', '2026-11-03')   // months after he left
    expect(inSquadron(person(id), '2026-03-02')).toBe(false)
    expect(inSquadron(person(id), '2026-11-03')).toBe(false)
    // Both show on the war…
    expect(getState().grid[id]?.['2026-03-02']).toBe('LL')
    expect(getState().grid[id]?.['2026-11-03']).toBe('LL')
    // …and both are charged, which is exactly why they have to be visible.
    expect(getState().views[id]?.['2026-03-02']?.charges.length).toBe(1)
    expect(getState().views[id]?.['2026-11-03']?.charges.length).toBe(1)
    // The official dates did not move an inch to accommodate them.
    expect(person(id).from).toBe('2026-06-15')
    expect(person(id).to).toBe('2026-08-31')
  })
})

describe('placing and managing PI from the grid', () => {
  it('an admin taps a day, opens the PI controls, confirms; a pre-joining day manages it', () => {
    const id = anId()
    const day = '2026-06-15'
    setRole('admin')
    render(<Matrix />)

    fireEvent.click(screen.getByTestId(`cell-${id}-${day}`))
    expect(screen.queryByTestId('pi-confirm')).toBeNull()   // folded behind one button
    fireEvent.click(screen.getByTestId('bid-postin'))
    expect((screen.getByTestId('pi-date') as HTMLInputElement).value).toBe(day)
    fireEvent.click(screen.getByTestId('pi-confirm'))
    expect(person(id).from).toBe(day)

    // The day BEFORE now reads as not-yet-arrived, and an admin's tap there
    // manages the posting — the same split the post-out end already makes.
    const before = '2026-06-14'
    expect(screen.getByTestId(`cell-${id}-${before}`).className).toContain('gone')
    fireEvent.click(screen.getByTestId(`cell-${id}-${before}`))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect((screen.getByTestId('postin-date') as HTMLInputElement).value).toBe(day)
    fireEvent.change(screen.getByTestId('postin-date'), { target: { value: '2026-06-20' } })
    expect(person(id).from).toBe('2026-06-20')
    fireEvent.click(screen.getByTestId('postin-undo'))
    expect(person(id).from).toBeNull()
  })

  it('a pre-joining day is TAPPABLE (owner answer C, 20 Sep 26 — the 18 Aug "nothing there to act on" is dead)', () => {
    const id = anId()
    setRole('admin')
    setPostIn(id, '2026-06-15')
    render(<Matrix />)
    const cell = screen.getByTestId(`cell-${id}-2026-06-10`)
    expect(cell.className).toContain('act')
  })

  it('a member sees no PI controls at all', () => {
    const id = anId()
    setRole('member')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${id}-2026-06-15`))
    expect(screen.queryByTestId('bid-postin')).toBeNull()
  })
})

/* A REFUSED POSTING SAYS WHY (the absence-record re-test, AB5, 26 Sep 26 — Fable F5, reproduced on screen). The store
   refuses a window that closes before it opens (above), and every sheet swallowed the refusal: the bid sheet's
   confirm closed as if it had worked, the posting sheets' date box snapped back, and nothing was said. The robustness
   doctrine: a refused value is put back AND the person is told. */
describe('a posting that would close before it opens is refused with its reason', () => {
  it('the bid sheet: a PO dated before the PI keeps the sheet open and says why', () => {
    const id = anId()
    setRole('admin')
    setPostIn(id, '2026-06-15')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${id}-2026-07-01`))
    fireEvent.click(screen.getByTestId('bid-postout'))
    fireEvent.change(screen.getByTestId('po-date'), { target: { value: '2026-06-01' } })
    fireEvent.click(screen.getByTestId('po-confirm'))
    expect(person(id).to).toBeNull()
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    expect(screen.getByTestId('post-err').textContent).toMatch(/Posted in on 2026-06-15 — the post-out has to be after that day/)
  })

  it('the bid sheet: a PI dated after the PO keeps the sheet open and says why', () => {
    const id = anId()
    setRole('admin')
    setPostOut(id, '2026-08-01')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${id}-2026-07-01`))
    fireEvent.click(screen.getByTestId('bid-postin'))
    fireEvent.change(screen.getByTestId('pi-date'), { target: { value: '2026-09-01' } })
    fireEvent.click(screen.getByTestId('pi-confirm'))
    expect(person(id).from).toBeNull()
    expect(screen.getByTestId('post-err').textContent).toMatch(/Posted out from 2026-08-01 — the post-in has to be before that day/)
  })

  it('the Post out sheet: moving the date before the PI is refused with the reason', () => {
    const id = anId()
    setRole('admin')
    setPostIn(id, '2026-06-15'); setPostOut(id, '2026-08-01')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${id}-2026-08-05`))
    fireEvent.change(screen.getByTestId('postout-date'), { target: { value: '2026-06-01' } })
    expect(person(id).to).toBe('2026-07-31')
    expect(screen.getByTestId('postout-err').textContent).toMatch(/Posted in on 2026-06-15/)
  })

  it('the Post in sheet: moving the date after the PO is refused with the reason', () => {
    const id = anId()
    setRole('admin')
    setPostIn(id, '2026-06-15'); setPostOut(id, '2026-08-01')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${id}-2026-06-10`))
    fireEvent.change(screen.getByTestId('postin-date'), { target: { value: '2026-09-01' } })
    expect(person(id).from).toBe('2026-06-15')
    expect(screen.getByTestId('postin-err').textContent).toMatch(/Posted out from 2026-08-01/)
  })
})
