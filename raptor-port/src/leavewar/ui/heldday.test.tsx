// A DAY FILLED FROM THE INPUTS PAGE STILL TAKES MORE ([LW-HELD-DAY-ADD] — his D1548, D1552, D1553; drawn on the page
// https://claude.ai/artifact/TAKNwJVkxJVcGbf6Kp2QUy, scripts/handpass/lw-held-draw.mjs). Written before the build, red first.
//
// "i cant put anymore inputs when the date is filled from the inputs page. Like if i want to put OIL i also cant do it"
// (D1548). A tap on a day held whole by entries filed on the Inputs page — leave, a medical, an overseas duty, a course, a
// commitment under Unavailable, or a morning and an afternoon both filed there — opens the bid window, one line on top for
// each entry (its box, its half or Whole day, its words, "change it on the Inputs page"), as a course's day already did
// (D1395). Where the war refuses leave over what holds it (leave or a medical) the eight leave buttons are not drawn, and
// Pick a range brings them back (D1552). The entry itself stays the Inputs page's: no Approve, no Delete, no Move here.

import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { getState, initStore, setPostOut, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { syncAbsences } from '../sync'
import { Matrix } from './Matrix'
import { inputsFilledDay } from './matrixrowparts'
import type { Contrib, DayView } from '../engine/dayview'

const ISNAP = JSON.stringify(INPUTS)
const P = 'slammed'
const D = '2026-02-10'
const cell = () => screen.getByTestId(`cell-${P}-${D}`)
const sheet = () => screen.getByTestId('bid-picker')
const lines = () => within(sheet()).getAllByTestId('bid-heldday').map(l => l.textContent ?? '')

/** an entry filed on the Inputs page for P on D — whole day, or a half */
function plant(type: string, remarks = '', o: { half?: 'am' | 'pm'; acc?: 'u'; iid?: string } = {}) {
  INPUTS.unshift({
    iid: o.iid ?? `h-${type}-${o.half ?? 'w'}`, person: P, type, date: 'Feb 10', yr: 2026, remarks, mod: '2026-01-01',
    ...(o.acc ? { acc: o.acc } : {}),
    ...(o.half ? { allday: false, half: o.half, s: o.half === 'am' ? 0 : 721, e: o.half === 'am' ? 720 : 1439 } : { allday: true }),
  })
  syncAbsences()
}

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
  INPUTS.length = 0
})
afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

describe('a whole day held by a medical filed on the Inputs page (his picture — D1548, D1552)', () => {
  it('opens the bid window, never the read-only note, with the OML line on top', () => {
    plant('OML', 'Medical leave — grounded')
    render(<Matrix />)
    fireEvent.click(cell())
    expect(screen.queryByTestId('raptor-sheet'), 'no longer the read-only note').toBeNull()
    expect(lines()).toHaveLength(1)
    const l = lines()[0]!
    expect(l).toContain('OML')
    expect(l).toContain('Whole day')
    expect(l).toContain('Medical leave — grounded')
    expect(l).toContain('change it on the Inputs page')
  })
  it('the eight leave buttons are not drawn; CSE, OD, Grant OIL and ⋯ are', () => {
    plant('OML')
    render(<Matrix />)
    fireEvent.click(cell())
    expect(within(sheet()).queryByTestId('bid-leave-grid'), 'the war refuses leave over a medical').toBeNull()
    for (const t of ['bid-file-CSE', 'bid-file-OD', 'bid-oil', 'bid-more']) expect(within(sheet()).getByTestId(t), t).toBeTruthy()
  })
  it('the medical itself is not this window’s: no Approve, no Delete, no Move', () => {
    plant('OML')
    render(<Matrix />)
    fireEvent.click(cell())
    for (const t of ['decide-approve', 'decide-refuse', 'bid-clear', 'decide-shift']) expect(within(sheet()).queryByTestId(t), t).toBeNull()
  })
  it('Grant OIL gives an award on the day, the medical left as it is', () => {
    plant('OML')
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('bid-oil'))
    fireEvent.change(screen.getByTestId('oil-why'), { target: { value: 'Recall' } })
    fireEvent.click(screen.getByTestId('oil-give'))
    const all = getState().views[P]?.[D]?.all ?? []
    expect(all.filter(c => c.kind === 'credit' && !c.auto), 'the award').toHaveLength(1)
    expect(all.filter(c => c.kind === 'absence' && c.code === 'OML'), 'the medical stays').toHaveLength(1)
  })
  it('Pick a range brings the leave buttons back for the days around it', () => {
    plant('OML')
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('span-range'))
    fireEvent.click(within(sheet()).getByTestId('span-day-2026-02-12'))
    expect(within(sheet()).getByTestId('bid-leave-grid')).toBeTruthy()
  })
})

describe('a whole day of leave filed on the Inputs page', () => {
  it('an admin gets the window with the LL line, no leave buttons, no Approve', () => {
    plant('LL', 'Family wedding')
    render(<Matrix />)
    fireEvent.click(cell())
    expect(lines()[0]).toContain('LL')
    expect(lines()[0]).toContain('Family wedding')
    expect(within(sheet()).queryByTestId('bid-leave-grid')).toBeNull()
    expect(within(sheet()).queryByTestId('decide-approve'), 'the leave is the Inputs page’s, not a bid to decide').toBeNull()
    expect(within(sheet()).getByTestId('bid-oil')).toBeTruthy()
  })
  it('the admin’s Remarks box is for what is added, empty — the leave’s words are read in its line', () => {
    plant('LL', 'Family wedding')
    render(<Matrix />)
    fireEvent.click(cell())
    expect((within(sheet()).getByTestId('bid-remarks') as HTMLInputElement).value).toBe('')
  })
  it('a member on his own row gets the window, his leave’s words in the box he edits today (D1354), no Grant OIL', () => {
    plant('LL', 'Family wedding')
    setRole('member')
    setViewer(P)
    render(<Matrix />)
    fireEvent.click(cell())
    expect(screen.queryByTestId('remarks-sheet'), 'not his remarks-only window any more').toBeNull()
    expect(lines()).toHaveLength(1)
    expect(lines()[0], 'the words are in the box, not repeated in the line').not.toContain('Family wedding')
    expect((within(sheet()).getByTestId('bid-remarks') as HTMLInputElement).value).toBe('Family wedding')
    expect(within(sheet()).queryByTestId('bid-oil'), 'Grant OIL is an admin’s').toBeNull()
    expect(within(sheet()).getByTestId('bid-file-CSE')).toBeTruthy()
    expect(within(sheet()).queryByTestId('bid-leave-grid')).toBeNull()
  })
  it('a member on his own medical day gets the window with its line', () => {
    plant('ATT C', 'Down')
    setRole('member')
    setViewer(P)
    render(<Matrix />)
    fireEvent.click(cell())
    /* its box reads as the grid's box does — "C" for ATT C — in the medical's colour */
    const box = within(sheet()).getByTestId('bid-heldday').querySelector('.c')
    expect(box?.textContent).toBe(screen.getByTestId(`cell-${P}-${D}`).querySelector('.c')?.textContent)
    expect(box?.className).toContain('k-med')
    expect(lines()[0]).toContain('Down')
    expect(within(sheet()).queryByTestId('bid-leave-grid')).toBeNull()
  })
})

describe('over an overseas duty, a course or an Other the war takes leave, so the buttons stay (D1552)', () => {
  it('an overseas duty: its line, and the leave buttons', () => {
    plant('OD', 'Exercise')
    render(<Matrix />)
    fireEvent.click(cell())
    expect(screen.queryByTestId('raptor-sheet')).toBeNull()
    expect(lines()[0]).toContain('OD')
    expect(within(sheet()).getByTestId('bid-leave-grid')).toBeTruthy()
  })
  it('a whole-day Other under Unavailable opens the window, not the day’s list (D1553)', () => {
    plant('Other', 'Station board', { acc: 'u' })
    render(<Matrix />)
    fireEvent.click(cell())
    expect(screen.queryByTestId('daylist-sheet'), 'no longer the day’s list').toBeNull()
    expect(lines()[0]).toContain('OTH')
    expect(lines()[0]).toContain('Station board')
    expect(within(sheet()).getByTestId('bid-oil')).toBeTruthy()
  })
})

describe('a morning and an afternoon both filed on the Inputs page (D1553)', () => {
  it('opens the window with a line each, AM and PM', () => {
    plant('LL', 'Dentist run', { half: 'am' })
    plant('OML', 'Medically down', { half: 'pm' })
    render(<Matrix />)
    fireEvent.click(cell())
    expect(screen.queryByTestId('daylist-sheet')).toBeNull()
    const ls = lines()
    expect(ls).toHaveLength(2)
    expect(ls.find(l => l.includes('LL'))).toContain('AM')
    expect(ls.find(l => l.includes('OML'))).toContain('PM')
    expect(within(sheet()).queryByTestId('bid-leave-grid'), 'leave and a medical hold both halves').toBeNull()
  })
  /* THE SCENARIO DESIGNER'S 1 (the bug check, 1 Nov 26): a morning of leave beside an afternoon overseas duty — leave may go
     over the OD, never over the leave, so the window does what D1543 does beside approved leave: Whole day greyed, the
     afternoon offered and lit, the morning's leave named if pressed */
  it('a morning of leave beside an afternoon OD: Whole day greyed, the afternoon lit, a leave lands there', () => {
    plant('LL', '', { half: 'am' })
    plant('OD', 'Exercise', { half: 'pm', iid: 'h-OD-pm' })
    render(<Matrix />)
    fireEvent.click(cell())
    expect(lines()).toHaveLength(2)
    expect((within(sheet()).getByTestId('portion-full') as HTMLButtonElement).disabled, 'Whole day greyed').toBe(true)
    expect(within(sheet()).getByTestId('portion-pm').getAttribute('aria-pressed'), 'the free-of-leave half lit').toBe('true')
    fireEvent.click(within(sheet()).getByTestId('bid-OL'))
    const all = getState().views[P]?.[D]?.all ?? []
    expect(all.filter(c => c.code === 'OL'), 'the OL landed on the afternoon').toHaveLength(1)
  })
  it('the same, the morning picked: a leave pressed names the morning’s leave, nothing is written', () => {
    plant('LL', '', { half: 'am' })
    plant('OD', 'Exercise', { half: 'pm', iid: 'h-OD-pm' })
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('portion-am'))
    fireEvent.click(within(sheet()).getByTestId('bid-OL'))
    expect(within(sheet()).getByTestId('span-note').textContent).toBe('The morning is LL. Pick PM to place the afternoon.')
    expect((getState().views[P]?.[D]?.all ?? []).filter(c => c.code === 'OL')).toHaveLength(0)
  })
  /* the designer's 4: a member's two halves of his own leave — before, the day's list showed both words read only; one box
     could hold only one of them, so the words stay in their lines, read only, as the list had them */
  it('a member’s own two halves of leave: each line keeps its words, the Remarks box is for what he adds', () => {
    plant('LL', 'Dentist run', { half: 'am' })
    plant('OL', 'Ferry', { half: 'pm', iid: 'h-OL-pm' })
    setRole('member')
    setViewer(P)
    render(<Matrix />)
    fireEvent.click(cell())
    const ls = lines()
    expect(ls.find(l => l.includes('LL'))).toContain('Dentist run')
    expect(ls.find(l => l.includes('OL'))).toContain('Ferry')
    expect((within(sheet()).getByTestId('bid-remarks') as HTMLInputElement).value).toBe('')
  })
})

/* THE DAYS THAT MUST NOT TAKE THIS PATH (the designer's 14, 15): anything the war wrote on the day too, a clash, a spill from
   the night before, a third entry, or leave the war approved — each opens what it opened before */
describe('inputsFilledDay — only a day filled from the Inputs page', () => {
  const abs = (code: string, win: readonly [number, number], o: Partial<Contrib> = {}): Contrib => ({ id: `a-${code}-${win[0]}`, kind: 'absence', code, win, ...o })
  const view = (all: Contrib[], o: Partial<DayView> = {}): DayView => ({ main: all[0] ?? null, all, code: null, state: null, mark: '', amber: false, conflicts: [], clashTails: [], charges: [], away: 0, annualFull: false, ...o } as unknown as DayView)
  const AMw = [0, 720] as const, PMw = [721, 1439] as const, FULLw = [0, 1439] as const
  it('one whole entry, or a morning and an afternoon, filed there: yes', () => {
    expect(inputsFilledDay(view([abs('OML', FULLw)]))?.noLeave).toBe(true)
    expect(inputsFilledDay(view([abs('OD', FULLw)]))?.noLeave).toBe(false)
    expect(inputsFilledDay(view([abs('LL', AMw), abs('OML', PMw)]))?.held.map(h => h.portion)).toEqual(['am', 'pm'])
  })
  it('leave the war approved: no', () => expect(inputsFilledDay(view([abs('LL', FULLw, { lw: true })]))).toBeNull())
  it('beside the app’s own OIL credit, an award, or a bid: no', () => {
    expect(inputsFilledDay(view([abs('OML', FULLw), { id: 'c', kind: 'credit', code: 'FO', win: FULLw, auto: true }]))).toBeNull()
    expect(inputsFilledDay(view([abs('OML', FULLw), { id: 'w', kind: 'credit', code: 'HO', win: AMw }]))).toBeNull()
    expect(inputsFilledDay(view([abs('LL', AMw), { id: 'r', kind: 'request', code: 'OL', win: PMw, state: 'pending' }]))).toBeNull()
  })
  it('a clash, a spill from the night before, three entries, a half left free: no', () => {
    expect(inputsFilledDay(view([abs('OML', FULLw)], { amber: true }))).toBeNull()
    expect(inputsFilledDay(view([abs('OD', FULLw, { spill: true })]))).toBeNull()
    expect(inputsFilledDay(view([abs('LL', AMw), abs('OML', PMw), abs('OD', PMw)]))).toBeNull()
    expect(inputsFilledDay(view([abs('LL', AMw)]))).toBeNull()
  })
})

describe('what stays as it was', () => {
  it('a half held, the other free: the free-half window, unchanged', () => {
    plant('LL', '', { half: 'am' })
    render(<Matrix />)
    fireEvent.click(cell())
    expect(within(sheet()).queryAllByTestId('bid-heldday')).toHaveLength(0)
    expect(within(sheet()).getByTestId('bid-heldhalf')).toBeTruthy()
  })
  /* leave dated outside his time in the squadron opens the day's list, every record on its own line (owner answer C,
     [ARCH-STACK] step 4) — a day filled from the Inputs page there is not this window's (found re-reading the build) */
  it('a member’s own leave dated after his posting out still opens the day’s list', () => {
    plant('LL', 'Clearing leave')
    setPostOut(P, '2026-02-01')
    setRole('member')
    setViewer(P)
    render(<Matrix />)
    fireEvent.click(cell())
    expect(screen.getByTestId('daylist-sheet')).toBeTruthy()
    expect(screen.queryAllByTestId('bid-heldday')).toHaveLength(0)
  })
  it('a member on another man’s filled day gets no window to add to it', () => {
    plant('OML')
    setRole('member')
    setViewer('dusk')
    render(<Matrix />)
    fireEvent.click(cell())
    expect(screen.queryByTestId('bid-picker')).toBeNull()
  })
})
