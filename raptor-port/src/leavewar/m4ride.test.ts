/* THE OVERHAUL'S M4 — THE REST OF THE BUILD (the build spec §1 8.4, §2 9.3a and 9.8, §3's forged "placed by"):
   · a bid replaced by a clashing Inputs-page leave tells its man ONE line, the Inputs door's own — "You were added ·
     replaces your LL bid" — and the war's grid notice keeps the bid's remarks and documents, offered onto the new leave;
   · 9.8 found not to arise: no command of a member's replaces another man's bid, and his command never writes another
     man's war row;
   · "Also since you last looked": a member's withdrawn pending bid and leave filed on the Inputs page;
   · a member never writes who placed a request or a leave as anyone but himself. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { ELOG } from '../engine/editlog'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputs } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { NOTICES, noticesFor, noticeWords } from '../state/notices'
import { noticeSeenLoad } from '../state/noticeseen'
import { ownershipViolation } from '../state/perms'
import { setLeaveRemarks } from '../ui/inputedit'
import { clearCells, getState, initStore as lwInitStore, lwHistInit, recordsAt, setCell, setPeople, setRequestWords } from './state/store'
import { type NoticeRec, type RequestRec } from './engine'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { alsoSince, openWarAt, replacedCarry, wireLeaveWarSync } from './sync'
import { takeLwAsk } from './ui/lwnav'
import { figuresOf } from './approvals'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast

const T = (h: number, day = 15): number => { const d = new Date(2026, 6, day, h, 0, 0); vi.setSystemTime(d); return d.getTime() }
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => signInAs('ad', 'a')        // the admin — person `stiff`
const ranger = () => signInAs('us', 'us')      // a member — person `bane`
const lines = (pid: string) => noticesFor(pid).map(n => { const w = noticeWords(n); return [w.name, w.day, w.what, w.who].filter(Boolean).join(' · ') })
const notices = (p: string, d: string) => recordsAt(p, d).filter((r): r is NoticeRec => r.kind === 'notice')
const reqs = (p: string, d: string) => recordsAt(p, d).filter((r): r is RequestRec => r.kind === 'request')
const D = '2026-02-10'
const leave = (iid: string, people: string[], by: string, extra: any = {}) => ({
  iid, ...(people.length === 1 ? { person: people[0] } : { people: people.map(p => ({ p, by, at: 1 })) }),
  type: 'LL', date: 'Feb 10', yr: 2026, allday: true, remarks: '', mod: '2026-02-01', by, at: Date.now(), ...extra,
})

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  T(8)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  NOTICES.length = 0
  ELOG.rows.length = 0
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  noticeSeenLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  HOOKS.toast = () => {}
  saber()
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); resetSession(null) })

describe('a bid replaced by a clashing Inputs-page leave (9.3a — M3 leftover (7))', () => {
  it('tells him ONE line, the Inputs door’s own, naming the bid; the war writes none', () => {
    expect(setCell('bane', D, 'LL')).toBe(true)
    NOTICES.length = 0
    expect(writeInputs(() => { INPUTS.push(leave('r1', ['bane'], 'stiff')) })).toBe(true)
    expect(reqs('bane', D), 'the bid is gone').toEqual([])
    expect(lines('bane')).toEqual(['LL · Tue 10 Feb · You were added · replaces your LL bid · Saber'])
  })

  it('his own filing over his own bid tells him nothing and leaves no notice (as today)', () => {
    ranger()
    expect(setCell('bane', D, 'LL')).toBe(true)
    NOTICES.length = 0
    expect(writeInputs(() => { INPUTS.push(leave('r2', ['bane'], 'bane')) })).toBe(true)
    expect(lines('bane')).toEqual([])
    expect(notices('bane', D)).toEqual([])
  })

  it('the grid notice keeps the bid’s remarks and documents; one tap puts them onto the new leave', () => {
    expect(setCell('bane', D, 'LL')).toBe(true)
    const r = reqs('bane', D)[0]!
    expect(setRequestWords('bane', D, r.id, { remarks: 'wedding in KL', docIds: ['doc-a'] })).toBeTruthy()
    expect(writeInputs(() => { INPUTS.push(leave('r3', ['bane'], 'stiff', { remarks: 'approved by OC' })) })).toBe(true)
    const n = notices('bane', D)[0]!
    expect([n.remarks, n.docIds, n.iid]).toEqual(['wedding in KL', ['doc-a'], 'r3'])
    const carry = replacedCarry('bane', n)!
    expect(carry.remarks).toBe('approved by OC · wedding in KL')
    expect(carry.docIds).toEqual(['doc-a'])
    expect(setLeaveRemarks(carry.row, carry.remarks, 'bane', carry.docIds)).toBe(true)
    const row = INPUTS.find((x: any) => x.iid === 'r3')
    expect(row.remarks).toBe('approved by OC · wedding in KL')
    expect(replacedCarry('bane', n), 'carried once — not offered again').toBeNull()
  })

  it('a half kept keeps its own words: the notice for the half taken carries none', () => {
    expect(setCell('bane', D, 'LL')).toBe(true)
    const r = reqs('bane', D)[0]!
    setRequestWords('bane', D, r.id, { remarks: 'kept on the half' })
    expect(writeInputs(() => { INPUTS.push(leave('r4', ['bane'], 'stiff', { allday: false, half: 'am', s: 0, e: 720 })) })).toBe(true)
    const n = notices('bane', D)[0]!
    expect(n.remarks).toBeUndefined()
    expect(reqs('bane', D)[0]!.remarks).toBe('kept on the half')
  })
})

/* 9.8 ([LW-M1-READ-LEFTOVERS] (1)) — FOUND NOT TO ARISE, so no permission was widened for it (the build's finding, 27 Oct 26).
   Only a leave or a medical replaces a pending bid; a member may file neither for another man (D655), and a member in a
   shared leave someone else filed may not change it (D763) — so no command of a member's ever replaces another man's bid.
   A member's shared DUTY over another man's bid lands and leaves the bid as it was (memberclash.test.ts). Pinned here: the
   one way left — a member changing a shared leave he is in — is refused whole, nothing on the war written; and a member's
   command that writes another man's war row is refused, whatever it carries. */
describe('a member never replaces another man’s bid (9.8 — it cannot arise)', () => {
  it('his change of a shared leave someone else filed is refused whole: the other man’s bid stays, no notice, no line', () => {
    expect(writeInputs(() => { INPUTS.push({ ...leave('s1', ['bane', 'ammo'], 'stiff'), date: 'Feb 9' }) })).toBe(true)
    expect(setCell('ammo', D, 'LL')).toBe(true)
    ranger()
    NOTICES.length = 0
    expect(writeInputs(() => { const row = INPUTS.find((x: any) => x.iid === 's1'); row.endDate = 'Feb 10' })).toBe(false)
    expect(reqs('ammo', D).map(r => r.state)).toEqual(['pending'])
    expect(notices('ammo', D)).toEqual([])
    expect(lines('ammo')).toEqual([])
  })

  it('a member’s command that writes another man’s war row is refused, a notice of his filing beside it or not', () => {
    const pending = { id: 'q1', kind: 'request', code: 'LL', state: 'pending' }
    const env = (changes: any[]): any => ({ type: 'inputs.write', origin: 'user', actor: { role: 'member', personId: 'bane' }, changes })
    const id = `${getState().period.id}:ammo:${D}`
    const note = (iid?: string) => ({ id: 'n9', kind: 'notice', code: 'LL', was: 'pending', byType: 'LL', byWho: 'Ranger', seq: 1, at: '', ...(iid ? { iid } : {}) })
    expect(ownershipViolation(env([{ collection: 'lw.cell', id, op: 'put', before: [pending], after: [note()] }]))).toContain("another person's war row")
    expect(ownershipViolation(env([{ collection: 'lw.cell', id, op: 'put', before: [pending], after: [note('f1')] }]))).toContain("another person's war row")
  })
})

describe('a member never writes who placed or decided as anyone but himself (the security read’s question, §3)', () => {
  const env = (changes: any[], origin = 'user'): any => ({ type: 'lw.edit', origin, actor: { role: 'member', personId: 'bane' }, changes })
  const cell = (before: any[], after: any[]) => ({ collection: 'lw.cell', id: `${getState().period.id}:bane:${D}`, op: 'put', before, after })
  const req = (extra: any = {}) => ({ id: 'q1', kind: 'request', code: 'LL', state: 'pending', ...extra })
  it('his own bid, placed by him now, passes; a stamp it already had passes; anything else is refused', () => {
    expect(ownershipViolation(env([cell([], [req({ placedBy: 'bane', placedAt: Date.now() })])]))).toBeNull()
    expect(ownershipViolation(env([cell([], [req({ placedBy: 'stiff', placedAt: Date.now() })])]))).toContain('who placed a request')
    expect(ownershipViolation(env([cell([], [req({ placedBy: 'bane', placedAt: Date.now() - 86_400_000 })])])), 'a placed time from yesterday')
      .toContain('who placed a request')
    /* the admin placed it for him; he re-types its kind — a new record keeping the first stamp */
    const was = req({ placedBy: 'stiff', placedAt: 5 })
    expect(ownershipViolation(env([cell([was], [{ ...was, id: 'q2', code: 'OL' }])]))).toBeNull()
    expect(ownershipViolation(env([cell([], [req({ placedBy: 'bane', placedAt: Date.now(), decidedBy: 'stiff', decidedAt: 5 })])]))).toContain('who decided a request')
    /* a change that only CALLS itself a restore is judged as any other (the security read's finding 1): only the Undo
       or Redo the timeline is applying writes an image back — m4sec.test.ts drives his real ones */
    expect(ownershipViolation(env([cell([], [req({ placedBy: 'stiff', placedAt: 5 })])], 'restore')), 'a bare "restore"').toContain('who placed a request')
  })
  it('a member’s input that names who placed a war-approved leave — refused unless one of his command’s own records had it', () => {
    const inp = (extra: any = {}) => ({ iid: 'x1', person: 'bane', type: 'LL', date: 'Feb 10', yr: 2026, allday: true, remarks: '', mod: '2026-02-01', by: 'bane', at: Date.now(), ...extra })
    expect(ownershipViolation(env([{ collection: 'inputs', id: 'x1', op: 'put', before: null, after: inp({ lwBy: 'stiff', lwAt: 5 }) }])))
      .toContain('who placed a leave on the war')
    expect(ownershipViolation(env([{ collection: 'inputs', id: 'x1', op: 'put', before: null, after: inp() }]))).toBeNull()
  })
  it('through the real stores: a member’s bid carries his own name and the moment', () => {
    ranger()
    expect(setCell('bane', D, 'LL')).toBe(true)
    expect(reqs('bane', D).map(r => [r.placedBy, r.placedAt])).toEqual([['bane', Date.now()]])
  })
})

describe('"Also since you last looked" (8.4)', () => {
  it('a member’s withdrawn pending bid — one line a run; his re-typed kind is no withdrawal', () => {
    ranger()
    for (const d of ['2026-02-10', '2026-02-11']) expect(setCell('bane', d, 'LL')).toBe(true)
    expect(setCell('bane', '2026-02-12', 'LL')).toBe(true)
    expect(setCell('bane', '2026-02-12', 'OL'), 're-typed, the same request').toBe(true)
    const since = T(9) - 1
    T(10)
    expect(clearCells([{ personId: 'bane', date: '2026-02-10' }, { personId: 'bane', date: '2026-02-11' }])).toBeTruthy()
    const p = getState().period
    const also = alsoSince(since, p.start, p.end, 'stiff')
    expect(also.map(a => [a.what, a.personId, a.code, a.from, a.to, a.by])).toEqual([['withdrawn', 'bane', 'LL', '2026-02-10', '2026-02-11', 'bane']])
  })

  it('leave filed on the Inputs page lands there; one the war approved, or his own, does not', () => {
    const since = T(9) - 1
    T(10)
    ranger()
    expect(writeInputs(() => { INPUTS.push(leave('a1', ['bane'], 'bane')) })).toBe(true)
    const p = getState().period
    expect(alsoSince(since, p.start, p.end, 'stiff').map(a => [a.what, a.personId, a.from])).toEqual([['inputs', 'bane', D]])
    expect(alsoSince(since, p.start, p.end, 'bane'), 'never what he did himself').toEqual([])
    expect(alsoSince(Date.now(), p.start, p.end, 'stiff'), 'nothing since now').toEqual([])
  })

  it('his own Inputs-page leave over his own pending bid is ONE line, "filed" — the bid it replaced is no withdrawal (designer 11)', () => {
    ranger()
    expect(setCell('bane', D, 'LL')).toBe(true)
    const since = T(9) - 1
    T(10)
    expect(writeInputs(() => { INPUTS.push(leave('a2', ['bane'], 'bane')) })).toBe(true)
    const p = getState().period
    expect(alsoSince(since, p.start, p.end, 'stiff').map(a => a.what)).toEqual(['inputs'])
  })
})

describe('a SANS man while SANS is off the war: his line says so (the scenario designer’s ★10)', () => {
  it('LOWEST AVAIL reads "SANS · not in Avail", not an empty cell', () => {
    const sansId = Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].san && !(PEOPLE as any)[k].archived && !(PEOPLE as any)[k].deleted)!
    expect(sansId, 'the demo has a SANS man').toBeTruthy()
    expect(getState().people.some(x => x.id === sansId), 'SANS is off the war by default (D1215)').toBe(false)
    const line: any = { key: 'k', personId: sansId, code: 'LL', from: D, to: D, parts: [{ date: D, recId: 'x1', state: 'pending' }], docIds: [] }
    expect(figuresOf(line, undefined).sans).toBe(true)
  })
})

describe('a tap on a bell line brings the grid in front (the scenario designer’s 12)', () => {
  it('the OIL tab up over the grid is put away: the grid is asked for', () => {
    takeLwAsk()
    openWarAt(D, 'bane')
    expect(takeLwAsk()).toEqual({ kind: 'grid' })
  })
})
