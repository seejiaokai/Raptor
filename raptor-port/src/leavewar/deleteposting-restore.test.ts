/* [LW-DELETE-POSTING-RESTORE] (found 31 Oct 26, built 1 Nov 26) — A POSTING OUT WITH THE DELETE OUTCOME, BEFORE IT HAS RUN:
   Undo and Redo never put back an approval of his leave on a day from his posting-out date, which the live Approve refuses
   (his D1545: "A posting out with the Delete outcome keeps refusing a man's leave from its date — Approve, Approve all, the
   bid windows and Auto-approve all refuse it"; the two doors agree, D754). Every other posting refuses nothing (D1541), so
   its Undo and Redo go back as the live door would.

   The hole: the deleted man's restore refusal (state/person-delete.ts deletedRestoreProblem) asks only of a man already
   deleted; before the Delete posting has run he is not, and nothing else read posting dates — so an approval made before
   the posting was set, undone, then the posting set (it is no Undo step itself, D321 (8)), came back on Redo and wrote
   war-approved leave the live door refuses. A posting can move, be taken back or change its outcome, so this check is asked
   fresh on every Undo and Redo (the timeline's restoreRefusal, never its once-and-kept deadRefusal), from the same date the
   live door refuses from (sync.ts postingOutFrom). The scenario is the 13 tests of the reverted 057ca75ab
   ([LW-POSTED-OUT-RESTORE], which refused for every posting — D1436, replaced by D1541), re-run with the Delete outcome.

   Every set-up goes through the production doors: the war's bid writer (setCell), Approvals' one writer (decideRequests), the
   bid windows' place-and-approve (placeApproved), the bid window's Post out (postOut) and its "Undo post out" (undoPostOut),
   the posting's run (runPoOutcomes), the top bar's Undo / Redo (globalUndo / globalRedo). Runs in the Leave War project (a
   hostile time zone). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS, holds } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import {
  changeAbsenceById, decideRequests, initStore as lwInitStore, lwHistInit, moveCells, placeApproved, recordsAt, setCell, setPeople, type DecideLine,
} from './state/store'
import type { RequestRec } from './engine'
import { setMemberTodayForTests } from './engine/opendates'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, runPoOutcomes, undoPostOut, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
/* today is Wed 15 Jul 26 (the war's own today held there too); his Delete posting is dated Sat 18 Jul (his last day the
   17th), so the war refuses his leave from the 18th (D1545) — AFTER is refused, BEFORE approves as ever */
const PO = '2026-07-18'
const BEFORE = '2026-07-16'
const AFTER = '2026-07-20'
const AFTER2 = '2026-07-21'
const REFUSED = /^Can’t (undo|redo) that — Ranger posts out on 18 Jul, so leave from that day can’t be approved$/

const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const req = (p: string, d: string): RequestRec => {
  const l = recordsAt(p, d).filter((r): r is RequestRec => r.kind === 'request')
  expect(l, `${p} has one request on ${d}`).toHaveLength(1)
  return l[0]!
}
const line = (p: string, d: string, to: DecideLine['to']): DecideLine =>
  ({ personId: p, to, parts: [{ date: d, recId: req(p, d).id, code: req(p, d).code, state: req(p, d).state as any }] })
/* his leave the war approved, by the Inputs' own date words ("Jul 20") */
const warDays = (p: string) => INPUTS.filter((r: any) => holds(r, p) && r.lw).map((r: any) => String(r.date))
const approve = (p: string, d: string) => { expect(decideRequests([line(p, d, 'approved')])[0]!.kind).toBe('done') }
const post = (from = PO, outcome: 'delete' | 'overseas' | 'none' | 'sans' = 'delete') => { expect(postOut('bane', from, outcome)).toBe(true); raptorNotify() }

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  setMemberTodayForTests('2026-07-15')
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  HOOKS.toast = () => {}
  signInAs('ad', 'a')
})
afterEach(() => { setMemberTodayForTests(null); HOOKS.toast = toast; _resetTimeline(); resetSession(null) })

describe('the live door, for comparison (D1545)', () => {
  it('after a Delete posting is set, Approve refuses his day from its date and approves the day before', () => {
    setCell('bane', AFTER, 'LL'); setCell('bane', BEFORE, 'LL')
    post()
    expect(decideRequests([line('bane', AFTER, 'approved')])[0]).toEqual({ kind: 'refused', why: 'He posts out on 18 Jul: refuse or delete it' })
    approve('bane', BEFORE)
    expect(warDays('bane')).toEqual(['Jul 16'])
  })
})

describe('Redo of a war approval after his posting out is set', () => {
  it('approve, Undo, post him out (Delete), Redo: refused in the live door’s terms — no leave written, his bid still pending', () => {
    setCell('bane', AFTER, 'LL')
    approve('bane', AFTER)
    expect(globalUndo().ok).toBe(true)
    expect(warDays('bane')).toEqual([])
    post()
    const r = globalRedo()
    expect(r.ok, 'the Redo is refused').toBe(false)
    expect(r.reason).toMatch(REFUSED)
    expect(r.reason).toMatch(/^Can’t redo that/)
    expect(warDays('bane'), 'no approved leave written for a day the live door refuses').toEqual([])
    expect(req('bane', AFTER).state).toBe('pending')
  })

  /* HIS D1541: every other posting refuses nothing — Overseas Sqn, or no outcome chosen ("off the manpower, nothing else") —
     so the live Approve takes the day and the Redo goes back */
  it('an Overseas Sqn posting, or one with no outcome chosen, refuses nothing: the Redo goes back (D1541)', () => {
    for (const outcome of ['overseas', 'none'] as const) {
      setCell('bane', AFTER, 'LL'); approve('bane', AFTER)
      expect(globalUndo().ok).toBe(true)
      post(PO, outcome)
      expect(globalRedo().ok, `${outcome}: the Redo goes back`).toBe(true)
      expect(warDays('bane'), outcome).toEqual(['Jul 20'])
      /* taken away for the next outcome: the posting undone, the approved leave deleted */
      expect(undoPostOut('bane')).toBe(true); raptorNotify()
      const iid = String((INPUTS.find((r: any) => holds(r, 'bane') && r.lw) as any).iid)
      expect(changeAbsenceById('bane', AFTER, iid, 'removed')).toBeNull()
      expect(warDays('bane')).toEqual([])
    }
  })

  it('his day BEFORE the posting’s date: the Redo puts the approval back', () => {
    setCell('bane', BEFORE, 'LL'); approve('bane', BEFORE)
    expect(globalUndo().ok).toBe(true)
    post()
    expect(globalRedo().ok).toBe(true)
    expect(warDays('bane')).toEqual(['Jul 16'])
  })

  /* once it has run he is deleted, and the deleted man's own refusal holds (deletedRestoreProblem — refusedFrom, the
     posting's date), decided once and kept */
  it('the Delete posting has RUN (dated before today): he is deleted, and the Redo is refused', () => {
    setCell('bane', '2026-07-14', 'LL'); approve('bane', '2026-07-14')
    expect(globalUndo().ok).toBe(true)
    post('2026-07-13')
    runPoOutcomes(); raptorNotify()
    expect((PEOPLE as any).bane.deleted, 'the posting ran: he is deleted').toBe(true)
    expect(globalRedo().ok).toBe(false)
    expect(warDays('bane')).toEqual([])
  })

  it('a SANS posting keeps his leave (D283): the Redo goes back', () => {
    setCell('bane', AFTER, 'LL'); approve('bane', AFTER)
    expect(globalUndo().ok).toBe(true)
    post(PO, 'sans')
    expect(globalRedo().ok).toBe(true)
    expect(warDays('bane')).toEqual(['Jul 20'])
  })

  it('the posting taken back ("Undo post out"): the Redo goes back — asked fresh, never kept', () => {
    setCell('bane', AFTER, 'LL'); approve('bane', AFTER)
    expect(globalUndo().ok).toBe(true)
    post()
    expect(globalRedo().ok, 'refused while he posts out').toBe(false)
    expect(undoPostOut('bane')).toBe(true); raptorNotify()
    expect(globalRedo().ok, 'the posting taken back: the same Redo goes back').toBe(true)
    expect(warDays('bane')).toEqual(['Jul 20'])
  })

  it('the posting moved LATER than the day: the Redo goes back; moved back EARLIER: refused again', () => {
    setCell('bane', AFTER, 'LL'); approve('bane', AFTER)
    expect(globalUndo().ok).toBe(true)
    post()
    expect(globalRedo().ok).toBe(false)
    post('2026-07-25')
    expect(globalRedo().ok, 'his day now falls before the posting').toBe(true)
    expect(warDays('bane')).toEqual(['Jul 20'])
    expect(globalUndo().ok).toBe(true)
    post('2026-07-19')
    expect(globalRedo().ok, 'moved earlier again').toBe(false)
  })

  it('the posting’s outcome changed from Delete to Overseas Sqn: the Redo goes back; to Delete again: refused (D1541, D1545)', () => {
    setCell('bane', AFTER, 'LL'); approve('bane', AFTER)
    expect(globalUndo().ok).toBe(true)
    post()
    expect(globalRedo().ok, 'refused while it is a Delete posting').toBe(false)
    post(PO, 'overseas')
    expect(globalRedo().ok, 'an Overseas posting refuses nothing').toBe(true)
    expect(warDays('bane')).toEqual(['Jul 20'])
    expect(globalUndo().ok).toBe(true)
    post(PO, 'delete')
    expect(globalRedo().ok, 'a Delete posting again').toBe(false)
  })

  it('a place-and-approve (Auto-approve on): placed, Undo, posted out, Redo — refused, nothing placed', () => {
    expect(placeApproved([{ personId: 'bane', date: AFTER }], 'LL').approved).toBe(1)
    expect(globalUndo().ok).toBe(true)
    post()
    expect(globalRedo().ok).toBe(false)
    expect(warDays('bane')).toEqual([])
    expect(recordsAt('bane', AFTER).filter(r => r.kind === 'request'), 'no bid put back either').toHaveLength(0)
  })

  it('an approval of two days, one each side of the date: refused whole — one Redo is one step', () => {
    setCell('bane', '2026-07-17', 'LL'); setCell('bane', PO, 'LL')
    expect(decideRequests([{ personId: 'bane', to: 'approved', parts: [
      { date: '2026-07-17', recId: req('bane', '2026-07-17').id, code: 'LL', state: 'pending' },
      { date: PO, recId: req('bane', PO).id, code: 'LL', state: 'pending' },
    ] }])[0]!.kind).toBe('done')
    expect(globalUndo().ok).toBe(true)
    post()
    expect(globalRedo().ok).toBe(false)
    expect(warDays('bane')).toEqual([])
  })

  it('a move of his approved leave adds no days: its Redo goes back after the posting is set (as the live Move would)', () => {
    setCell('bane', BEFORE, 'LL'); approve('bane', BEFORE)
    expect(moveCells([{ personId: 'bane', date: BEFORE }], 1)).toBe('moved')
    expect(warDays('bane')).toEqual(['Jul 17'])
    expect(globalUndo().ok).toBe(true)
    post()
    expect(globalRedo().ok, 'a move adds no approved days').toBe(true)
    expect(warDays('bane')).toEqual(['Jul 17'])
  })
})

/* THE SCENARIO DESIGNER'S S1 AND F1 (1 Nov 26): the same day's two halves in one step — his refused morning approved, his
   approved afternoon sent back — must not pass as "the day already held leave" */
describe('one step: his refused morning approved and his afternoon of the same day sent back', () => {
  it('Undo, the Delete posting set, Redo: refused — the morning is not approved', () => {
    setCell('bane', AFTER, 'LL*')
    const [a] = decideRequests([line('bane', AFTER, 'approved')])
    expect(a!.kind).toBe('done')
    setCell('bane', AFTER, '*LL')
    const out = decideRequests([line('bane', AFTER, 'approved'), { personId: 'bane', to: 'pending', parts: (a as any).parts }])
    expect(out.map(o => o.kind)).toEqual(['done', 'done'])
    const am = () => INPUTS.some((r: any) => holds(r, 'bane') && r.lw && r.date === 'Jul 20' && (r.half === 'am' || (r.allday === false && Number(r.s) < 720)))
    expect(am(), 'the morning approved').toBe(true)
    expect(globalUndo().ok).toBe(true)
    post()
    const r = globalRedo()
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(REFUSED)
    expect(am()).toBe(false)
  })
})

describe('Undo of a send-back after his posting out is set', () => {
  it('approve, the second tap sends it back, post him out (Delete), Undo: refused — the approval is not put back', () => {
    setCell('bane', AFTER2, 'LL')
    const [a] = decideRequests([line('bane', AFTER2, 'approved')])
    expect(a!.kind).toBe('done')
    expect(decideRequests([{ personId: 'bane', to: 'pending', parts: (a as any).parts }])[0]!.kind).toBe('done')
    post()
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(REFUSED)
    expect(r.reason).toMatch(/^Can’t undo that/)
    expect(warDays('bane')).toEqual([])
    expect(req('bane', AFTER2).state).toBe('pending')
  })

  it('his approved leave deleted on the war, then the Delete posting set, Undo: it comes back — no request taken, no approval', () => {
    setCell('bane', AFTER, 'LL'); approve('bane', AFTER)
    const iid = String((INPUTS.find((r: any) => holds(r, 'bane') && r.lw) as any).iid)
    expect(changeAbsenceById('bane', AFTER, iid, 'removed')).toBeNull()
    expect(warDays('bane')).toEqual([])
    post()
    expect(globalUndo().ok, 'the Undo of a delete is no approval').toBe(true)
    expect(warDays('bane')).toEqual(['Jul 20'])
  })
})
