// @vitest-environment jsdom
/* THE DRAG WINDOW'S WORDS ARE KEPT (his D1339, D1341 — 25 Oct 26; round 3's Q3, option A). "When a user drags a select let's
   say 1-3 dec. It will show as 1 input and 1 remarks will apply to all that 3 days"; "Replace them all". Words typed in the
   drag window's Remarks box are saved onto every dragged day's entry on Approve, Refuse and Move — never dropped — and they
   replace whatever remarks those days held, so the dragged days end with one remark. Nothing typed leaves each entry's own
   words. Before this, the box held the words of a NEW leave only: typed over days that already held bids, then Approve,
   Refuse or Move pressed, they went nowhere (round 3's Q3 picture, `q3-today-typed-*.png`). Red first. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { closeDates, initStore, lwHistInit, placeApproved, recordsAt, setBidState, setCell, setPeople, setRemarksOn, setRole, setViewer } from '../state/store'
import { globalUndo } from '../../undo'
import { initStore as raptorInitStore } from '../../state/store'
import { setSession } from '../../state/auth'
import { projectPeople } from '../state/raptorRoster'
import { wireLeaveWarSync } from '../sync'
import { _resetTimeline } from '../../undo/timeline'
import { installGlobalUndo } from '../../state/undo-wire'
import { holds } from '../../engine/inputs'
import type { RequestRec } from '../engine'
import { memoryBackend } from '../state/storage'
import { SelectSheet } from './SelectSheet'

const ISNAP = JSON.stringify(INPUTS)
const P = 'dusk'
const D1 = '2026-02-10', D2 = '2026-02-11'

/* the war wired to the Inputs page, as reqwords.test.ts wires it — an approval files the leave there */
beforeEach(() => {
  try { localStorage.clear() } catch { /* none */ }
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  initStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  setRole('admin')
})
afterEach(() => { _resetTimeline(); setSession(null); INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

const reqs = (date: string) => recordsAt(P, date).filter((r): r is RequestRec => r.kind === 'request')
const sel = { people: [P], from: D1, to: D2, cells: [{ personId: P, date: D1 }, { personId: P, date: D2 }] }
let moved = false
const mount = () => {
  moved = false
  render(<SelectSheet sel={sel as any} people={() => 'Dusk'} role="admin" canDecide
    onDone={() => {}} onMove={() => { moved = true }} onClose={() => {}} onPostOut={() => undefined} />)
}
/** two separate pending bids: the first with words of its own, the second none */
function twoBids() {
  expect(setCell(P, D1, 'LL', { remarks: 'Wedding' })).toBe(true)
  expect(setCell(P, D2, 'OL')).toBe(true)
  expect(reqs(D1)[0]?.remarks).toBe('Wedding')
}
const type = (v: string) => fireEvent.change(screen.getByTestId('sel-remarks'), { target: { value: v } })

describe('the drag window\'s typed words are kept, replacing the days\' own (D1339, D1341)', () => {
  it('Refuse: every dragged bid refused, each carrying the typed words', () => {
    twoBids()
    mount()
    type('Exercise')
    fireEvent.click(screen.getByTestId('sel-refuse'))
    for (const d of [D1, D2]) {
      expect(reqs(d)[0]?.state, d).toBe('refused')
      expect(reqs(d)[0]?.remarks, d).toBe('Exercise')
    }
  })

  it('Move: the typed words are saved on every dragged bid before the move starts', () => {
    twoBids()
    mount()
    type('Exercise')
    fireEvent.click(screen.getByTestId('sel-move'))
    expect(moved).toBe(true)
    expect(reqs(D1)[0]?.remarks).toBe('Exercise')
    expect(reqs(D2)[0]?.remarks).toBe('Exercise')
  })

  it('Approve: the leave filed on the Inputs page carries the typed words', () => {
    twoBids()
    mount()
    type('Exercise')
    fireEvent.click(screen.getByTestId('sel-approve'))
    const filed = INPUTS.filter((r: any) => holds(r, P) && (r.type === 'LL' || r.type === 'OL') && !ISNAP.includes(`"iid":${JSON.stringify(r.iid)}`))
    expect(filed.length, 'the bids became inputs').toBeGreaterThan(0)
    for (const r of filed) expect((r as any).remarks, (r as any).type).toBe('Exercise')
    expect(reqs(D1), 'no bid left behind').toHaveLength(0)
  })

  /* "never dropped" (D1339): closed with ✕ — as the one-day window keeps a held bid's words on closing — the typed words
     still go onto the days' bids (the night's scenario designer, gap 7) */
  it('✕ with words typed: they are kept on every dragged bid, as the one-day window keeps them', () => {
    twoBids()
    mount()
    type('Exercise')
    fireEvent.click(screen.getByTestId('sel-cancel'))
    expect(reqs(D1)[0]?.remarks).toBe('Exercise')
    expect(reqs(D2)[0]?.remarks).toBe('Exercise')
    expect(reqs(D1)[0]?.state, 'nothing decided').toBe('pending')
  })

  /* the night's scenario designer, gap 5: a day holding two approved leaves — a morning and an afternoon, two entries on
     the Inputs page — gives the typed words to both, not only the first found */
  it('two approved half-day leaves on one dragged day both take the words', () => {
    const one = [{ personId: P, date: D1 }]
    expect(placeApproved(one, '*LL').approved, 'the morning approved').toBe(1)
    expect(placeApproved(one, 'OL*').approved, 'the afternoon approved').toBe(1)
    const mine = () => INPUTS.filter((r: any) => holds(r, P) && (r.type === 'LL' || r.type === 'OL') && !ISNAP.includes(`"iid":${JSON.stringify(r.iid)}`))
    expect(mine()).toHaveLength(2)
    render(<SelectSheet sel={{ people: [P], from: D1, to: D1, cells: one } as any} people={() => 'Dusk'} role="admin" canDecide
      onDone={() => {}} onMove={() => {}} onClose={() => {}} onPostOut={() => undefined} />)
    type('Exercise')
    fireEvent.click(screen.getByTestId('sel-cancel'))
    for (const r of mine()) expect((r as any).remarks, (r as any).type).toBe('Exercise')
  })

  /* the night's code read, R1: one press, one Undo — the words and the decision together */
  it('Refuse with words typed: one Undo takes the press back whole, the days’ own words with it', () => {
    twoBids()
    mount()
    type('Exercise')
    fireEvent.click(screen.getByTestId('sel-refuse'))
    expect(reqs(D1)[0]?.remarks).toBe('Exercise')
    act(() => { globalUndo() })
    expect(reqs(D1)[0]?.state).toBe('pending')
    expect(reqs(D1)[0]?.remarks, 'one Undo').toBe('Wedding')
  })

  /* R2: the window's till choice goes with the press too, not only the words */
  it('the till unticked in the drag window is kept on the bids, with no words typed', () => {
    twoBids()
    mount()
    fireEvent.click(screen.getByTestId('sel-till'))
    fireEvent.click(screen.getByTestId('sel-cancel'))
    expect(reqs(D1)[0]?.till).toBe(false)
    expect(reqs(D1)[0]?.remarks, 'its words untouched').toBe('Wedding')
  })

  /* R3: a member's refused bid on a day closed for him is passed over — his pending bid still takes the words */
  it('a member: a refused bid on a closed day does not refuse the words on his open day', () => {
    expect(setCell(P, D1, 'LL')).toBe(true)
    expect(setCell(P, D2, 'OL')).toBe(true)
    setBidState(P, D2, 'refused')
    closeDates(D2, D2)
    setRole('member'); setViewer(P)
    expect(setRemarksOn([{ personId: P, date: D1 }, { personId: P, date: D2 }], { remarks: 'Back Monday' })).toBeGreaterThan(0)
    expect(reqs(D1)[0]?.remarks).toBe('Back Monday')
  })

  it('nothing typed: each bid keeps its own words', () => {
    twoBids()
    mount()
    fireEvent.click(screen.getByTestId('sel-refuse'))
    expect(reqs(D1)[0]?.remarks).toBe('Wedding')
    expect(reqs(D2)[0]?.remarks ?? '').toBe('')
  })

  /* the agent's reading: an empty box typed nothing, so it never wipes the days' words — a remark is cleared from its own
     window, where the box shows it */
  it('a box typed into and emptied again changes nothing', () => {
    twoBids()
    mount()
    type('x')
    type('')
    fireEvent.click(screen.getByTestId('sel-refuse'))
    expect(reqs(D1)[0]?.remarks ?? '').toBe('Wedding')
  })
})
