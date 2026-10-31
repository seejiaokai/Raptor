/* [LW-OFFER-ONLY-TAKEABLE] — A WINDOW OFFERS ONLY WHAT THE WAR WILL TAKE (his D1543 and D1544, 31 Oct 26 — "Q2-4 as
   recommended"; the walk of 31 Oct 26, R3a and R4, found both). Written before the build, red first.

   D1543: on a day whose morning (or afternoon) holds leave the war APPROVED, the bid window offered Whole day, AM and PM,
   and Whole day with any leave was refused "That time is already taken by LL — clear it first." Now Whole day is greyed
   and cannot be pressed; the held half stays lit, the free half is offered, and a leave pressed while the held half is lit
   says "The morning is LL. Pick PM to place the afternoon." — as leave filed on the Inputs page already offers only the
   free half (freehalf.test.tsx). A pending bid on a half is not this case: it is re-typed from its window, as before.

   D1544: a refused bid with a medical filed over its day since — the window still offered Approve, and pressing it said
   only "already holds leave or a medical". Now Approve is greyed and cannot be pressed while a medical or leave holds that
   time, in the bid window and the day's list alike; Refuse and Delete stay; and the war's one approve refusal for a day
   already held names what holds it — "OML holds 11 Feb, so the bid can't be approved" (the agent's draft, his app's own
   codes; reading 2 of D1544: every door that asks the war's approve rule says it). */
import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { decideRequests, getState, initStore, recordsAt, setBidStates, setCell, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { fileAbsence } from '../testkit'
import type { RequestRec } from '../engine'
import { Matrix } from './Matrix'

const P = 'dusk'
const D = '2026-02-11'
const cell = (d = D) => screen.getByTestId(`cell-${P}-${d}`)
const sheet = () => screen.getByTestId('bid-picker')
const reqOn = (d: string) => recordsAt(P, d).find((r): r is RequestRec => r.kind === 'request')!

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
})

describe('D1543 — a half held by leave the war approved: Whole day greyed, the free half offered', () => {
  it('a morning approved: AM lit, Whole day greyed and not pressable, PM offered', () => {
    INPUTS.length = 0
    fileAbsence(P, '*LL', D, D, { lw: true })
    render(<Matrix />)
    fireEvent.click(cell())
    const s = within(sheet())
    expect(s.getByTestId('portion-am').getAttribute('aria-pressed')).toBe('true')
    const full = s.getByTestId('portion-full') as HTMLButtonElement
    expect(full.disabled, 'Whole day cannot be pressed').toBe(true)
    fireEvent.click(full)
    expect(s.getByTestId('portion-am').getAttribute('aria-pressed'), 'a press on the greyed Whole day changes nothing').toBe('true')
    expect((s.getByTestId('portion-pm') as HTMLButtonElement).disabled, 'the free half is offered').toBe(false)
  })

  it('a leave pressed with the held morning lit says which half to pick — and writes nothing', () => {
    INPUTS.length = 0
    fileAbsence(P, '*LL', D, D, { lw: true })
    const before = JSON.stringify(INPUTS)
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('bid-OL'))
    expect(sheet().textContent).toContain('The morning is LL. Pick PM to place the afternoon.')
    expect(sheet().textContent).not.toContain('clear it first')
    expect(JSON.stringify(INPUTS), 'the approved morning is untouched').toBe(before)
    expect(recordsAt(P, D).filter(r => r.kind === 'request'), 'no bid placed').toHaveLength(0)
  })

  it('the afternoon held reads the other way round: "The afternoon is LL. Pick AM to place the morning."', () => {
    INPUTS.length = 0
    fileAbsence(P, 'LL*', D, D, { lw: true })
    render(<Matrix />)
    fireEvent.click(cell())
    const s = within(sheet())
    expect(s.getByTestId('portion-pm').getAttribute('aria-pressed')).toBe('true')
    expect((s.getByTestId('portion-full') as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(s.getByTestId('bid-LL'))
    expect(sheet().textContent).toContain('The afternoon is LL. Pick AM to place the morning.')
  })

  it('the free half picked, a leave lands there as a bid beside the approved morning', () => {
    INPUTS.length = 0
    fileAbsence(P, '*LL', D, D, { lw: true })
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('bid-approve-tick'))   // Auto-approve off: a pending bid
    fireEvent.click(within(sheet()).getByTestId('portion-pm'))
    fireEvent.click(within(sheet()).getByTestId('bid-OL'))
    expect(reqOn(D)).toMatchObject({ code: 'OL*', state: 'pending' })
    expect(INPUTS.some((r: any) => r.lw && r.type === 'LL'), 'the approved morning stands').toBe(true)
  })

  it('a PENDING bid on a half is not greyed: Whole day stays pressable and re-types it, as before', () => {
    setCell(P, D, '*LL')
    render(<Matrix />)
    fireEvent.click(cell())
    const full = within(sheet()).getByTestId('portion-full') as HTMLButtonElement
    expect(full.disabled).toBe(false)
  })

  it('a whole day approved keeps its window as it was: Whole day lit', () => {
    INPUTS.length = 0
    fileAbsence(P, 'LL', D, D, { lw: true })
    render(<Matrix />)
    fireEvent.click(cell())
    const full = within(sheet()).getByTestId('portion-full') as HTMLButtonElement
    expect(full.getAttribute('aria-pressed')).toBe('true')
    expect(full.disabled).toBe(false)
  })
})

describe('D1544 — Approve on a refused bid under a medical: greyed, and the refusal names the holder', () => {
  /* a bid, refused; then a medical filed over its day on the Inputs page — the refused bid stays as history beside it */
  const refusedUnderMedical = () => {
    INPUTS.length = 0
    setCell(P, D, 'LL')
    setBidStates([{ personId: P, date: D }], 'refused')
    expect(reqOn(D)).toMatchObject({ state: 'refused' })
    fileAbsence(P, 'OML', D)
    expect(reqOn(D), 'the refused bid is kept under the medical').toMatchObject({ state: 'refused' })
  }

  it('the war\'s approve refusal names what holds the day: "OML holds 11 Feb, so the bid can\'t be approved"', () => {
    refusedUnderMedical()
    const r = reqOn(D)
    const [out] = decideRequests([{ personId: P, to: 'approved', parts: [{ date: D, recId: r.id, code: r.code, state: 'refused' }] }])
    expect(out).toEqual({ kind: 'refused', why: 'OML holds 11 Feb, so the bid can’t be approved' })
  })

  it('a half-day holder is named with its half: "OML (AM) holds 11 Feb, …"', () => {
    INPUTS.length = 0
    setCell(P, D, '*LL')
    setBidStates([{ personId: P, date: D }], 'refused')
    fileAbsence(P, '*OML', D)
    const r = reqOn(D)
    const [out] = decideRequests([{ personId: P, to: 'approved', parts: [{ date: D, recId: r.id, code: r.code, state: 'refused' }] }])
    expect(out).toEqual({ kind: 'refused', why: 'OML (AM) holds 11 Feb, so the bid can’t be approved' })
  })

  it('wherever the refused bid\'s Approve stands — the bid window or the day\'s list — it is greyed; Refuse and Delete stay', () => {
    refusedUnderMedical()
    render(<Matrix />)
    fireEvent.click(cell())
    const r = reqOn(D)
    /* the day holds two entries (the medical and the refused bid): whichever window opens, its Approve for the bid */
    const ap = (screen.queryByTestId(`dl-approve-${r.id}`) ?? screen.queryByTestId('decide-approve')) as HTMLButtonElement | null
    expect(ap, 'the refused bid still shows its Approve').not.toBeNull()
    expect(ap!.disabled, 'greyed: it cannot be pressed').toBe(true)
    expect(ap!.title).toBe('OML holds 11 Feb, so the bid can’t be approved')
    fireEvent.click(ap!)
    expect(reqOn(D)).toMatchObject({ state: 'refused' })
    const rf = (screen.queryByTestId(`dl-refuse-${r.id}`) ?? screen.queryByTestId('decide-refuse')) as HTMLButtonElement
    expect(rf.disabled, 'Refuse stays').toBe(false)
    expect(screen.queryByTestId(`dl-clear-${r.id}`) ?? screen.queryByTestId('sel-clear') ?? screen.queryByText('Delete'), 'Delete stays').not.toBeNull()
  })

  it('a refused bid with nothing over it keeps Approve pressable', () => {
    INPUTS.length = 0
    setCell(P, D, 'LL')
    setBidStates([{ personId: P, date: D }], 'refused')
    render(<Matrix />)
    fireEvent.click(cell())
    const r = reqOn(D)
    const ap = (screen.queryByTestId(`dl-approve-${r.id}`) ?? screen.queryByTestId('decide-approve')) as HTMLButtonElement
    expect(ap.disabled).toBe(false)
    fireEvent.click(ap)
    expect(getState().views[P]?.[D]?.all.some(c => c.kind === 'absence'), 'approved: it became leave').toBe(true)
  })
})
