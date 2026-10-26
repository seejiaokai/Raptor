/* THE DECIDED ONE SAYS SO (his D1361 "Solid + word", D1355, 25 Oct 26 — drawn by scripts/handpass/lw-1025-contrast.mjs):
   in the one-day bid window and the day's list, Approve and Refuse rest grey with their words in their colours; the decided
   one is lit (solid, dark words) and reads "Approved" or "Refused"; a second tap on a lit Refuse sends the bid back to
   waiting, as the lit Approve does; a refused bid's leave button is ringed beside the lit Refuse. */
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { initStore, rawState, setBidStates, setCell, setCellRange, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { fileAbsence } from '../testkit'
import { Matrix } from './Matrix'

const ISNAP = JSON.stringify(INPUTS)
const P = 'dusk'
const D = '2026-02-11'
const sheet = () => screen.getByTestId('bid-picker')
const reqOn = (d: string) => rawState().wars[0]!.recs[P]?.[d]?.find(x => x.kind === 'request') as any

beforeEach(() => {
  try { localStorage.clear() } catch { /* none */ }
  initStore(memoryBackend()); setRole('admin')
})
afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

describe('the one-day window — the decided one lit and named (D1361, D1355)', () => {
  it('on a pending bid neither is lit; both are the decide buttons, reading Approve and Refuse', () => {
    setCell(P, D, 'LL')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    const ap = within(sheet()).getByTestId('decide-approve'), rf = within(sheet()).getByTestId('decide-refuse')
    for (const b of [ap, rf]) { expect(b.className).toContain('dec'); expect(b.className).not.toContain('lit') }
    expect(ap.textContent).toBe('Approve')
    expect(rf.textContent).toBe('Refuse')
  })

  it('on an approved leave Approve is lit and reads "Approved"', () => {
    INPUTS.length = 0
    fileAbsence(P, 'LL', D, D, { lw: true })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    const ap = within(sheet()).getByTestId('decide-approve')
    expect(ap.className).toContain('lit')
    expect(ap.textContent).toBe('Approved')
    expect(within(sheet()).getByTestId('decide-refuse').textContent).toBe('Refuse')
  })

  it('on a refused bid Refuse is lit and reads "Refused", the refused leave ringed — and a second tap sends it back to waiting', () => {
    setCell(P, D, 'OL')
    setBidStates([{ personId: P, date: D }], 'refused')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    const rf = within(sheet()).getByTestId('decide-refuse')
    expect(rf.className).toContain('lit')
    expect(rf.getAttribute('aria-pressed')).toBe('true')
    expect(rf.textContent).toBe('Refused')
    expect(within(sheet()).getByTestId('bid-OL').className, 'the refused leave ringed').toContain('lit')
    expect(within(sheet()).getByTestId('bid-LL').className).not.toContain('lit')
    expect(within(sheet()).getByTestId('portion-full').getAttribute('aria-pressed'), 'no half lit for a refused bid').toBe('true')
    fireEvent.click(rf)
    expect(reqOn(D)).toMatchObject({ code: 'OL', state: 'pending' })
  })

  it('over a picked range nothing is lit, and a Refuse over refused days refuses (never a send-back)', () => {
    setCellRange(P, D, '2026-02-12', 'LL')
    setBidStates([{ personId: P, date: D }, { personId: P, date: '2026-02-12' }], 'refused')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    fireEvent.click(within(sheet()).getByTestId('span-range'))
    fireEvent.click(screen.getByTestId('span-day-2026-02-12'))
    const rf = within(sheet()).getByTestId('decide-refuse')
    expect(rf.className).not.toContain('lit')
    expect(rf.textContent).toBe('Refuse')
  })
})

describe('the day’s list — the decided one lit and named (D1361, D1355)', () => {
  const dayWithTwo = () => {
    INPUTS.length = 0
    const ll = fileAbsence(P, '*LL', D, D, { lw: true })
    setCell(P, D, 'LL*')
    setBidStates([{ personId: P, date: D }], 'refused')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    return ll
  }
  it('the approved morning reads "Approved", lit; the refused afternoon reads "Refused", lit', () => {
    const ll = dayWithTwo()
    const req = reqOn(D)
    expect(req?.state).toBe('refused')
    const ap = screen.getByTestId(`dl-approve-${ll.iid}`)
    expect(ap.className).toContain('lit'); expect(ap.textContent).toBe('Approved')
    const rf = screen.getByTestId(`dl-refuse-${req.id}`)
    expect(rf.className).toContain('lit'); expect(rf.textContent).toBe('Refused')
    expect(screen.getByTestId(`dl-approve-${req.id}`).className).not.toContain('lit')
  })
  it('a second tap on the lit Refuse sends the bid back to waiting', () => {
    dayWithTwo()
    const req = reqOn(D)
    fireEvent.click(screen.getByTestId(`dl-refuse-${req.id}`))
    expect(reqOn(D)).toMatchObject({ id: req.id, state: 'pending' })
  })
})
