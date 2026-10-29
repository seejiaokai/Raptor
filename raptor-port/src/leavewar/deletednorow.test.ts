/* [LW-DELETED-NO-ROW-APPROVE] (30 Oct 26) — A DELETED MAN'S LEFTOVER PENDING BID IS NEVER APPROVED, in every door (his D1447,
   reading R21: "a man deleted on Admin → Users keeps the refusal of his leftover pending leave"; R3-6's words, "Posted out —
   refuse or delete it").

   The hole: a man deleted before he ever arrived (his only stint still to come) keeps no row and no posting record on the war
   (store.ts forgetPersonFrom drops both), so the war's own `gone` mark never named him — and a pending bid of his on a day
   already past (the delete keeps everything before its cutoff, D299; an admin may bid a past day, D1211) stayed on Approvals
   and approved, writing a leave input for a man deleted. The app's own delete mark (PEOPLE[id].deleted, D290) is read now.

   And the two doors that ask nothing — Undo and Redo replay a recorded step — must not put such an approval back either: a
   Redo of an approval, or the Undo of a send-back, made after his delete (the scenario list's S1-6).

   Every set-up goes through the production doors: Admin → Users' add (addRosterPerson, with his post-in date — D308) and
   delete (deletePerson), the war's own bid writer (setCell), Approvals' one writer (decideRequests), the bid windows'
   (setBidStates), the top bar's Undo / Redo (globalUndo / globalRedo). Runs in the Leave War project (a hostile time zone). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS, holds } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputs } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { addRosterPerson } from '../state/roster-add'
import { deletePerson } from '../state/person-delete'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import {
  changeAbsenceById, decideRequests, getState, initStore as lwInitStore, lwHistInit, placeApproved, recordsAt, setBidStates, setCell, setPeople, setShowSans, type DecideLine,
} from './state/store'
import type { RequestRec } from './engine'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, runPoOutcomes, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
const POSTED = 'Posted out — refuse or delete it'
const PAST = '2026-07-10'                    // before today (15 Jul 26): the delete keeps it (D299)
const PAST2 = '2026-07-13'

const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const req = (p: string, d: string): RequestRec => {
  const l = recordsAt(p, d).filter((r): r is RequestRec => r.kind === 'request')
  expect(l, `${p} has one request on ${d}`).toHaveLength(1)
  return l[0]!
}
const line = (p: string, d: string, to: DecideLine['to']): DecideLine =>
  ({ personId: p, to, parts: [{ date: d, recId: req(p, d).id, code: req(p, d).code, state: req(p, d).state as any }] })
const warLeave = (p: string) => INPUTS.filter((r: any) => holds(r, p) && r.lw)
/* a man added on Admin → Users with his post-in date still to come — never arrived */
const addIncoming = (cs: string, postIn = '2026-07-20'): string => {
  expect(addRosterPerson({ cs, ini: '', seat: 'FCP', cat: 'C' }, postIn)).toBeNull()
  raptorNotify()
  return Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].cs === cs && !(PEOPLE as any)[k].deleted)!
}

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
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
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); resetSession(null) })

describe('a man deleted before he ever arrived: his leftover pending bid (the item’s own case — S1-1)', () => {
  it('the premise: deleted, he keeps no row and no posting record on the war, and his bid on a past day stays', () => {
    const id = addIncoming('Newby')
    expect(setCell(id, PAST, 'LL')).toBe(true)
    expect(req(id, PAST).state).toBe('pending')
    expect(deletePerson(id)).toBeNull()
    raptorNotify()
    expect((PEOPLE as any)[id].deleted).toBe(true)
    expect(getState().people.find(p => p.id === id), 'no row').toBeUndefined()
    expect(getState().postOuts[id], 'no posting record').toBeUndefined()
    expect(req(id, PAST).state, 'the bid is left on the day').toBe('pending')
  })

  it('Approvals’ Approve is refused with the delete’s words; no leave is written; Refuse still works', () => {
    const id = addIncoming('Newby')
    setCell(id, PAST, 'LL')
    expect(deletePerson(id)).toBeNull()
    raptorNotify()
    expect(decideRequests([line(id, PAST, 'approved')])[0]).toEqual({ kind: 'refused', why: POSTED })
    expect(warLeave(id), 'no leave input for a man deleted').toHaveLength(0)
    expect(decideRequests([line(id, PAST, 'refused')])[0]!.kind, 'Refuse still works (D1436)').toBe('done')
    expect(req(id, PAST).state).toBe('refused')
  })

  it('the bid windows’ door refuses the same, with the same words', () => {
    const id = addIncoming('Newby')
    setCell(id, PAST, 'LL')
    deletePerson(id); raptorNotify()
    const r = setBidStates([{ personId: id, date: PAST }], 'approved')
    expect(r.why).toEqual([POSTED])
    expect(warLeave(id)).toHaveLength(0)
  })

  it('Approve all over a mixed list: his line answers for itself, the others go through, one Undo takes back both (S1-5)', () => {
    const id = addIncoming('Newby')
    setCell(id, PAST, 'LL'); setCell('bane', PAST, 'LL'); setCell('rocky', PAST2, 'OL')
    deletePerson(id); raptorNotify()
    const out = decideRequests([line(id, PAST, 'approved'), line('bane', PAST, 'approved'), line('rocky', PAST2, 'approved')])
    expect(out.map(o => o.kind)).toEqual(['refused', 'done', 'done'])
    expect(warLeave(id)).toHaveLength(0)
    expect(warLeave('bane').some((r: any) => r.date === 'Jul 10')).toBe(true)
    expect(globalUndo().ok).toBe(true)
    expect(req('bane', PAST).state, 'one Undo: both approvals back to pending').toBe('pending')
    expect(req('rocky', PAST2).state).toBe('pending')
    expect(req(id, PAST).state, 'and nothing of his').toBe('pending')
  })

  it('his callsign given to a new man: the new man’s bid approves, the old one stays refused — the rule reads the id (S1-9)', () => {
    const old = addIncoming('Newby')
    setCell(old, PAST, 'LL')
    deletePerson(old); raptorNotify()
    const neo = addIncoming('Newby')
    expect(neo).not.toBe(old)
    setCell(neo, PAST, 'LL')
    expect(decideRequests([line(neo, PAST, 'approved')])[0]!.kind).toBe('done')
    expect(decideRequests([line(old, PAST, 'approved')])[0]).toEqual({ kind: 'refused', why: POSTED })
  })
})

describe('the date rule is not reached by the delete mark (D1447 R20, the reader’s warning)', () => {
  it('a SANS man with SANS off — no row and no record, and no one deleted — still approves (S1-4)', () => {
    expect(setShowSans(true)).toBe(true)
    expect(getState().people.some(p => p.id === 'vinci'), 'the SANS man is on the war').toBe(true)
    setCell('vinci', PAST, 'LL')
    expect(setShowSans(false)).toBe(true)
    expect(getState().people.some(p => p.id === 'vinci'), 'SANS off: his row goes').toBe(false)
    expect(decideRequests([line('vinci', PAST, 'approved')])[0]!.kind).toBe('done')
    expect(warLeave('vinci').length).toBeGreaterThan(0)
  })
})

describe('Undo and Redo never put back an approval for a man since deleted (S1-6)', () => {
  it('(a) approve, Undo, delete him, Redo: refused — no leave written', () => {
    const id = addIncoming('Inco')
    setCell(id, PAST, 'LL')
    expect(decideRequests([line(id, PAST, 'approved')])[0]!.kind).toBe('done')
    expect(warLeave(id)).toHaveLength(1)
    expect(globalUndo().ok).toBe(true)
    expect(warLeave(id)).toHaveLength(0)
    expect(deletePerson(id)).toBeNull(); raptorNotify()
    globalRedo()
    expect(warLeave(id), 'the Redo wrote no leave for a man deleted').toHaveLength(0)
    expect(req(id, PAST).state, 'his bid is still pending').toBe('pending')
  })

  it('(b) approve, the second tap sends it back, delete him, Undo: refused — no leave written', () => {
    const id = addIncoming('Incb')
    setCell(id, PAST, 'LL')
    const [a] = decideRequests([line(id, PAST, 'approved')])
    expect(a!.kind).toBe('done')
    const parts = (a as any).parts
    expect(decideRequests([{ personId: id, to: 'pending', parts }])[0]!.kind, 'the second tap: back to pending').toBe('done')
    expect(warLeave(id)).toHaveLength(0)
    expect(deletePerson(id)).toBeNull(); raptorNotify()
    globalUndo()
    expect(warLeave(id), 'the Undo wrote no leave for a man deleted').toHaveLength(0)
  })

  it('a man NOT deleted: the same Redo puts his approval back (the restore is refused for the delete alone)', () => {
    const id = addIncoming('Stays')
    setCell(id, PAST, 'LL')
    decideRequests([line(id, PAST, 'approved')])
    expect(globalUndo().ok).toBe(true)
    expect(globalRedo().ok).toBe(true)
    expect(warLeave(id)).toHaveLength(1)
  })
})

/* THE REFUSAL IS THE APPROVAL ALONE: a leave of his filed on the Inputs page over his bid — not one the war approved — is
   his past kept when a Redo puts it back after his delete (D299, D321: leave may still be added on a deleted man's past
   days); only the war's approval of his leftover bid is refused (R21) */
describe('a Redo of an Inputs-page leave that replaced his bid still comes back after his delete', () => {
  it('filed over his pending bid, Undo, delete him, Redo: his leave is back, the war never approved it', () => {
    const id = addIncoming('Filed')
    setCell(id, PAST, 'LL')
    const row = { iid: 'dn-in-1', person: id, type: 'LL', date: 'Jul 10', yr: 2026, allday: true, remarks: '', mod: '2026-07-01', by: 'stiff', at: 1 }
    expect(writeInputs(() => { INPUTS.push(row) })).toBe(true)
    expect(recordsAt(id, PAST).some(r => r.kind === 'request'), 'the filing replaced his bid').toBe(false)
    expect(globalUndo().ok).toBe(true)
    expect(deletePerson(id)).toBeNull(); raptorNotify()
    globalRedo()
    expect(INPUTS.some((r: any) => r.iid === 'dn-in-1'), 'his leave filed on the Inputs page is back').toBe(true)
  })
})

/* THE BLIND CODE READ OF 14403cf57 (`docs/handpass/parts/lw-sf1030/read-opus.md`), each claim reproduced here first.
   Finding 1: Auto-approve places AND approves in one gesture (`placeApproved` — the bid window and the drag window), so its
   step takes no request off the war — the restore refusal, which looked for one, let its Redo write approved leave for a man
   deleted since. Finding 2: a Delete POSTING that has run marks him deleted too, and the restore refusal refused his days
   before the posting's date, which the live door approves (D1447 R20, D1436, R3c-1). Every twin path is listed below, a test
   each (the bug-check order §5: Undo AND Redo, each kind of step that can carry his approval). */
describe('the reader’s finding 1: Redo of an Auto-approve placement after his delete', () => {
  const warOn = (p: string, d: string) => warLeave(p).filter((r: any) => r.date === d)
  it('the live door, for comparison: Auto-approve on his past day after his delete lands pending', () => {
    const id = addIncoming('Newby')
    expect(deletePerson(id)).toBeNull(); raptorNotify()
    placeApproved([{ personId: id, date: PAST }], 'LL')
    expect(warLeave(id)).toHaveLength(0)
  })
  it('the bid window, a man never arrived: placed approved, Undo, delete him, Redo — no approved leave', () => {
    const id = addIncoming('Newby')
    expect(placeApproved([{ personId: id, date: PAST }], 'LL').approved).toBe(1)
    expect(globalUndo().ok).toBe(true)
    expect(deletePerson(id)).toBeNull(); raptorNotify()
    globalRedo()
    expect(warLeave(id), 'the Redo wrote no approved leave').toHaveLength(0)
  })
  it('the bid window, a man who had arrived (Ranger): the same', () => {
    expect(placeApproved([{ personId: 'bane', date: PAST }], 'LL').approved).toBe(1)
    expect(globalUndo().ok).toBe(true)
    expect(deletePerson('bane')).toBeNull(); raptorNotify()
    globalRedo()
    expect(warOn('bane', 'Jul 10')).toHaveLength(0)
  })
  it('the drag window: two days of one man placed approved at once, Undo, delete him, Redo — none written', () => {
    const id = addIncoming('Newby')
    expect(placeApproved([{ personId: id, date: '2026-07-09' }, { personId: id, date: PAST }], 'LL').approved).toBe(2)
    expect(globalUndo().ok).toBe(true)
    expect(deletePerson(id)).toBeNull(); raptorNotify()
    globalRedo()
    expect(warLeave(id)).toHaveLength(0)
  })
  it('placed approved over his pending bid already there: Undo, delete, Redo — none written', () => {
    const id = addIncoming('Newbz')
    setCell(id, PAST, 'LL')
    expect(placeApproved([{ personId: id, date: PAST }], 'LL').approved).toBe(1)
    expect(globalUndo().ok).toBe(true)
    expect(deletePerson(id)).toBeNull(); raptorNotify()
    globalRedo()
    expect(warLeave(id)).toHaveLength(0)
  })
  it('an approval that EXTENDS his leave (the day beside approved leave): Undo, delete, Redo — the leave stays one day', () => {
    const id = addIncoming('Ext')
    setCell(id, PAST, 'LL'); setCell(id, '2026-07-11', 'LL')
    expect(decideRequests([line(id, PAST, 'approved')])[0]!.kind).toBe('done')
    expect(decideRequests([line(id, '2026-07-11', 'approved')])[0]!.kind).toBe('done')
    expect(globalUndo().ok).toBe(true)
    expect(deletePerson(id)).toBeNull(); raptorNotify()
    globalRedo()
    expect(warLeave(id).map((r: any) => [r.date, r.endDate ?? r.date]), 'only the first day approved').toEqual([['Jul 10', 'Jul 10']])
  })
  it('Approve → Refuse (D1428), then delete him, Undo: the approval is not put back', () => {
    const id = addIncoming('Swap')
    setCell(id, PAST, 'LL')
    const [a] = decideRequests([line(id, PAST, 'approved')])
    expect(decideRequests([{ personId: id, to: 'refused', parts: (a as any).parts }])[0]!.kind).toBe('done')
    expect(warLeave(id)).toHaveLength(0)
    expect(deletePerson(id)).toBeNull(); raptorNotify()
    globalUndo()
    expect(warLeave(id)).toHaveLength(0)
  })
  it('his approved leave deleted on the war, then he is deleted, Undo: it comes back — his past kept, no request taken', () => {
    const id = addIncoming('Kept')
    setCell(id, PAST, 'LL')
    expect(decideRequests([line(id, PAST, 'approved')])[0]!.kind).toBe('done')
    const iid = String(warLeave(id)[0].iid)
    expect(changeAbsenceById(id, PAST, iid, 'removed')).toBeNull()
    expect(warLeave(id)).toHaveLength(0)
    expect(deletePerson(id)).toBeNull(); raptorNotify()
    expect(globalUndo().ok).toBe(true)
    expect(warLeave(id), 'the Undo of a delete puts his past back').toHaveLength(1)
  })
  it('his approved leave deleted on the war, Undo, then he is deleted, Redo: the delete goes through (no leave added)', () => {
    const id = addIncoming('Gone')
    setCell(id, PAST, 'LL')
    decideRequests([line(id, PAST, 'approved')])
    const iid = String(warLeave(id)[0].iid)
    expect(changeAbsenceById(id, PAST, iid, 'removed')).toBeNull()
    expect(globalUndo().ok).toBe(true)
    expect(deletePerson(id)).toBeNull(); raptorNotify()
    expect(globalRedo().ok).toBe(true)
    expect(warLeave(id)).toHaveLength(0)
  })
})

describe('the reader’s finding 2: a Delete POSTING that has run — the restore agrees with the live door', () => {
  const postRun = () => { expect(postOut('bane', '2026-07-12', 'delete')).toBe(true); runPoOutcomes(); raptorNotify(); expect((PEOPLE as any).bane.deleted).toBe(true) }
  it('the live door, for comparison: after the posting ran, his day before the date approves', () => {
    setCell('bane', PAST, 'LL')
    postRun()
    expect(decideRequests([line('bane', PAST, 'approved')])[0]!.kind).toBe('done')
  })
  it('approved, Undo, the posting runs, Redo: the approval of his day before the date goes back', () => {
    setCell('bane', PAST, 'LL')
    expect(decideRequests([line('bane', PAST, 'approved')])[0]!.kind).toBe('done')
    expect(globalUndo().ok).toBe(true)
    postRun()
    expect(globalRedo().ok).toBe(true)
    expect(warLeave('bane').some((r: any) => r.date === 'Jul 10')).toBe(true)
  })
  it('approved, sent back, the posting runs, Undo: the approval of his day before the date comes back', () => {
    setCell('bane', PAST, 'LL')
    const [a] = decideRequests([line('bane', PAST, 'approved')])
    expect(decideRequests([{ personId: 'bane', to: 'pending', parts: (a as any).parts }])[0]!.kind).toBe('done')
    postRun()
    expect(globalUndo().ok).toBe(true)
    expect(warLeave('bane').some((r: any) => r.date === 'Jul 10')).toBe(true)
  })
  it('placed approved, Undo, the posting runs, Redo: his day before the date is approved again', () => {
    expect(placeApproved([{ personId: 'bane', date: PAST }], 'LL').approved).toBe(1)
    expect(globalUndo().ok).toBe(true)
    postRun()
    expect(globalRedo().ok).toBe(true)
    expect(warLeave('bane').some((r: any) => r.date === 'Jul 10')).toBe(true)
  })
})
