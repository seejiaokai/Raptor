/* ROUND 2 — A COURSE, AN OVERSEAS DUTY AND THE UNFORESEEN ABSENCE FILED ON THE LEAVE WAR ([LW-FILE-OD-CRS]; his D1299,
   D1303, D1318, D1324, D1325, D1326 — the design note docs/superpowers/specs/2026-10-24-lw-file-od-cse-una.md; his drawing
   scripts/handpass/lw-round2-odcrs.mjs). Written before the build, red first.
   "OD and course doesnt need an approval, its directly approved like an input. it can go anytime. member can file it too.
   dont need document" (D1318); "UNA can use the same as OD" (D1324); "Ok deep teal" (D1325).
   CSE · OD · UNA stand in the first three places of the row under the leaves, the ⋯ the fourth (an admin's); a tap files
   the input at once — no bid, no approval — for the day, the range or the drag's every cell; one Undo takes it back. */
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { closeDates, fileStraight, initStore, lwHistInit, rawState, setRole, setViewer } from '../state/store'
import { installGlobalUndo } from '../../state/undo-wire'
import { initStore as raptorInitStore } from '../../state/store'
import { setMe, setSession } from '../../state/auth'
import { projectPeople } from '../state/raptorRoster'
import { setPeople } from '../state/store'
import { wireLeaveWarSync } from '../sync'
import { _resetTimeline } from '../../undo/timeline'
import { globalUndo } from '../../undo'
import { kindOf, parseCell, setMemberTodayForTests } from '../engine'
import { warVisible } from '../absences'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'
import { SelectSheet } from './SelectSheet'
import { StageBar } from './Chrome'

const ISNAP = JSON.stringify(INPUTS)
const P = 'dusk'
const D = '2026-02-11'
const cell = (d = D, p = P) => screen.getByTestId(`cell-${p}-${d}`)
const sheet = () => screen.getByTestId('bid-picker')
const filed = (type: string, p = P) => INPUTS.filter((r: any) => r.type === type && (r.person === p || (r.people ?? []).some((x: any) => x.p === p)))
const recsOn = (d = D, p = P) => rawState().wars[0]!.recs[p]?.[d] ?? []

beforeEach(() => {
  try { localStorage.clear() } catch { /* none */ }
  initStore(memoryBackend()); setRole('admin')
  INPUTS.length = 0
  lwHistInit()
})
afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)); setMemberTodayForTests(null) })

describe('round 2 — UNA, a kind of the war', () => {
  it('reads as its own kind, shows on the war, and is a code the war knows', () => {
    expect(kindOf('UNA')).toBe('una')
    expect(parseCell('UNA')).not.toBeNull()
    expect(warVisible('UNA')).toBe(true)
  })
})

describe('round 2 — filed straight (the store)', () => {
  it('an admin files an overseas duty: one input, whole day, no bid, nothing to approve', () => {
    const r = fileStraight([{ personId: P, date: D }], 'OD')
    expect(r.done).toBe(1)
    const od = filed('OD')
    expect(od).toHaveLength(1)
    expect(od[0]).toMatchObject({ allday: true })
    expect(recsOn().filter((x: any) => x.kind === 'request'), 'no bid is made').toHaveLength(0)
  })
  it('carries the window’s words', () => {
    fileStraight([{ personId: P, date: D }], 'UNA', { remarks: 'Family emergency' })
    expect(filed('UNA')[0]).toMatchObject({ remarks: 'Family emergency' })
  })
  it('a member files on his own row on a closed day; never on another man’s', () => {
    act(() => { closeDates('2026-01-01', '2026-12-31') })
    act(() => { setRole('member'); setViewer(P) })
    expect(fileStraight([{ personId: P, date: D }], 'OD').done, 'his own row, closed for bidding').toBe(1)
    expect(fileStraight([{ personId: 'ramp', date: D }], 'OD').done, 'another man’s row').toBe(0)
    expect(filed('OD', 'ramp')).toHaveLength(0)
  })
  it('refuses a code that is not one of the three', () => {
    expect(fileStraight([{ personId: P, date: D }], 'LL').done).toBe(0)
    expect(INPUTS).toHaveLength(0)
  })
})

describe('round 2 — the row under the leaves (D1326)', () => {
  it('the one-day window: CSE · OD · UNA in places 1–3, the ⋯ fourth', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    const row = within(sheet()).getByTestId('bid-extra-row')
    const ids = [...row.querySelectorAll('button')].map(b => b.getAttribute('data-testid'))
    expect(ids.slice(0, 4)).toEqual(['bid-file-CSE', 'bid-file-OD', 'bid-file-UNA', 'bid-more'])
    for (const [c, k] of [['CSE', 'cse'], ['OD', 'od'], ['UNA', 'una']]) {
      const b = within(sheet()).getByTestId(`bid-file-${c}`)
      expect(b.className, `${c} in its kind's colour, filled`).toMatch(new RegExp(`k-${k}\\b.*s-a|s-a.*k-${k}\\b`))
      expect(b.textContent).toBe(c)
    }
  })
  it('a tap on OD files it at once with the words typed, and the window closes', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.change(within(sheet()).getByTestId('bid-remarks'), { target: { value: 'Exercise' } })
    fireEvent.click(within(sheet()).getByTestId('bid-file-OD'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(filed('OD')[0]).toMatchObject({ remarks: 'Exercise', allday: true })
    expect(cell().querySelector('.c.k-od'), 'the grid shows it').toBeTruthy()
  })
  /* the walk's H1c (round 2's check): a tap on the day afterwards opened the window for an entry the Inputs page owns, which
     said "Filed on the Inputs page" — untrue for one filed here. A course, an OD or UNA is changed there wherever it was filed */
  it('a tap on the filed day says where it is changed, never that it was filed on the Inputs page', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('bid-file-UNA'))
    fireEvent.click(cell())
    const note = screen.getByTestId('raptor-note').textContent ?? ''
    expect(note).toBe('Change it on the Inputs page, not here.')
  })
  it('a picked range files every day of it', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('span-range'))
    fireEvent.click(within(sheet()).getByTestId('span-day-2026-02-13'))
    fireEvent.click(within(sheet()).getByTestId('bid-file-CSE'))
    expect(filed('CSE')).toHaveLength(1)
    expect(filed('CSE')[0].endDate).toMatch(/13/)
  })
  it('a member’s window: the three, no ⋯', () => {
    setMemberTodayForTests('2026-01-01')
    act(() => { setRole('member'); setViewer(P) })
    render(<Matrix />)
    fireEvent.click(cell())
    const s = screen.queryByTestId('bid-picker')
    if (!s) return   // a day not open for him: the closed window's test below
    expect(within(s).getByTestId('bid-file-OD')).toBeTruthy()
    expect(within(s).queryByTestId('bid-more')).toBeNull()
  })
  it('a member’s closed day: the note, then the three — a tap files it', () => {
    act(() => { closeDates('2026-01-01', '2026-12-31') })
    act(() => { setRole('member'); setViewer(P) })
    render(<Matrix />)
    fireEvent.click(cell())
    const s = screen.getByTestId('closed-note')
    expect(within(s).getByTestId('closed-note-text')).toBeTruthy()
    fireEvent.click(within(s).getByTestId('closed-file-UNA'))
    expect(screen.queryByTestId('closed-note')).toBeNull()
    expect(filed('UNA')).toHaveLength(1)
  })
  it('the drag window: the same row; a tap files every man’s every day', () => {
    const sel = { people: [P, 'ramp'], from: D, to: '2026-02-12', cells: [P, 'ramp'].flatMap(p => [D, '2026-02-12'].map(date => ({ personId: p, date }))) }
    let done = false
    render(<SelectSheet sel={sel} people={id => id} role="admin" canDecide onDone={() => { done = true }} onMove={() => {}} onClose={() => {}} onPostOut={() => undefined} />)
    const ids = [...screen.getByTestId('sel-extra-row').querySelectorAll('button')].map(b => b.getAttribute('data-testid'))
    /* two men: no Post out, so no ⋯ — its place stays empty (a posting is one man's, the drag window's own rule) */
    expect(ids).toEqual(['sel-file-CSE', 'sel-file-OD', 'sel-file-UNA'])
    fireEvent.click(screen.getByTestId('sel-file-OD'))
    expect(done).toBe(true)
    expect(filed('OD', P)).toHaveLength(1)
    expect(filed('OD', 'ramp')).toHaveLength(1)
  })
  it('the Legend names UNA as "Unavailable: an unforeseen absence", in its own teal box, after the overseas duty', () => {
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('legend-open'))
    const rows = Array.from(screen.getByTestId('legend').querySelectorAll('.leg-row'))
    const at = rows.findIndex(r => r.querySelector('.leg-t')?.textContent === 'Unavailable: an unforeseen absence')
    expect(at, 'a row for UNA').toBeGreaterThan(-1)
    expect(rows[at - 1]!.querySelector('.leg-t')!.textContent).toBe('Overseas duty')
    expect(rows[at]!.querySelector('.leg-box .c')!.className).toMatch(/(^|\s)k-una(\s|$)/)
  })
})

/* the app as signed in: the session the Inputs door asks, the war wired to it, and the top bar's one Undo (D347) — the
   setup the inputs gate's own tests use (inputgate.test.ts) */
describe('round 2 — filed straight, signed in, with the one Undo', () => {
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))   // the seed, before the store reads it
    setSession({ user: 'ad', role: 'admin' })
    raptorInitStore()
    initStore(memoryBackend()); setRole('admin')
    setPeople(projectPeople())
    wireLeaveWarSync()
    _resetTimeline(); lwHistInit(); installGlobalUndo()
  })
  afterEach(() => { _resetTimeline(); setSession(null); setMe('bane') })
  it('three days in a row are one input; one Undo takes it back', () => {
    const days = ['2026-02-10', '2026-02-11', '2026-02-12']
    const r0 = fileStraight(days.map(date => ({ personId: P, date })), 'CSE')
    expect(r0.done).toBe(3)
    const mine = () => filed('CSE').filter((r: any) => r.date === 'Feb 10')
    expect(mine()).toHaveLength(1)
    expect(mine()[0].endDate).toBe('Feb 12')
    act(() => { expect(globalUndo().ok).toBe(true) })
    expect(mine()).toHaveLength(0)
  })
  it('a member signed in files on his own row; never on another man’s', () => {
    setSession({ user: 'dk', role: 'member' }); setMe(P)
    act(() => { setRole('member'); setViewer(P) })
    expect(fileStraight([{ personId: P, date: D }], 'UNA').done).toBe(1)
    expect(filed('UNA')).toHaveLength(1)
    expect(fileStraight([{ personId: 'ramp', date: D }], 'UNA').done).toBe(0)
    expect(filed('UNA', 'ramp')).toHaveLength(0)
    expect(filed('UNA')).toHaveLength(1)
  })
})
