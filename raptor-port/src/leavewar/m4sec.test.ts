/* THE OVERHAUL'S M4 — THE SECURITY READ'S FOUR HOLES (D1411; docs/handpass/parts/lw-m4/security-read.md), each pinned by the
   reader's own failure case, red before its fix:
   1. a change that only CALLS itself a restore is judged as any other — only the Undo or Redo the timeline is applying,
      record for record, writes back a stamp someone else placed (a war request's, an Input's `lwBy` / `lwAt`);
   2. a member's request carries exactly the stamp of the record it came from: the same record (a move, a half cut) keeps
      its own; a re-typed kind keeps the first of those it replaces; a new one is placed by him, now — never stampless,
      never borrowed from another record, never dated ahead;
   3. "approved by the war" on an Input (`lw`, `lwMoved`) is never a member's to set: his change keeps it or drops it, and a
      new record carries it only as a piece cut from a record of his this same command changed;
   4. a member's notice never carries a Leave War line, and the war's own follow-up notice command is an admin's alone. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { ELOG } from '../engine/editlog'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputs } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { NOTICES } from '../state/notices'
import { noticeSeenLoad } from '../state/noticeseen'
import { cmdAuthorize, ownershipViolation } from '../state/perms'
import { clearCells, getState, initStore as lwInitStore, lwHistInit, recordsAt, setCell, setPeople } from './state/store'
import { type RequestRec } from './engine'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast

const T = (h: number, day = 15): number => { const d = new Date(2026, 6, day, h, 0, 0); vi.setSystemTime(d); return d.getTime() }
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => signInAs('ad', 'a')        // the admin — person `stiff`
const ranger = () => signInAs('us', 'us')      // a member — person `bane`
const reqs = (p: string, d: string) => recordsAt(p, d).filter((r): r is RequestRec => r.kind === 'request')
const D = '2026-02-10', D2 = '2026-02-11'
const BANE = { role: 'member', personId: 'bane' }

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

const cellId = (d: string, p = 'bane') => `${getState().period.id}:${p}:${d}`
const cell = (before: any[], after: any[], d = D) => ({ collection: 'lw.cell', id: cellId(d), op: 'put', before, after })
const req = (extra: any = {}) => ({ id: 'q1', kind: 'request', code: 'LL', state: 'pending', ...extra })
const env = (changes: any[], type = 'lw.edit', origin = 'user'): any => ({ type, origin, actor: BANE, changes })
const inp = (extra: any = {}) => ({ iid: 'x1', person: 'bane', type: 'LL', date: 'Feb 10', yr: 2026, allday: true, remarks: '', mod: '2026-02-01', by: 'bane', at: Date.now(), ...extra })

describe('1. a change that only calls itself a restore is judged as any other', () => {
  it('the reader’s two cases: a forged placed / decided stamp, and an Input’s placer, both refused', () => {
    const bare = (changes: any[]) => ({ type: 'undo.restore', origin: 'restore', actor: BANE, changes } as any)
    expect(ownershipViolation(bare([cell([], [req({ state: 'refused', placedBy: 'stiff', placedAt: 5, decidedBy: 'stiff', decidedAt: 6 })])])))
      .toMatch(/who (placed|decided) a request/)
    expect(ownershipViolation(bare([{ collection: 'inputs', id: 'x1', op: 'put', before: null, after: inp({ lw: true, lwBy: 'stiff', lwAt: 5 }) }])))
      .toBeTruthy()
  })
  it('his real Undo and Redo still write back what they took: a bid the admin placed for him, and his own bid an hour on', () => {
    expect(setCell('bane', D, 'LL')).toBe(true)                       // the admin places it for him, pending
    expect(reqs('bane', D).map(r => [r.state, r.placedBy])).toEqual([['pending', 'stiff']])
    ranger()
    T(9)
    expect(clearCells([{ personId: 'bane', date: D }]).written).toBe(1)
    expect(reqs('bane', D)).toEqual([])
    expect(globalUndo()).toBeTruthy()
    expect(reqs('bane', D).map(r => [r.placedBy, r.placedAt])).toEqual([['stiff', T(8)]])
    T(9)
    expect(setCell('bane', D2, 'LL')).toBe(true)
    const placed = reqs('bane', D2)[0]!.placedAt
    T(11)
    expect(globalUndo()).toBeTruthy()
    expect(reqs('bane', D2)).toEqual([])
    expect(globalRedo()).toBeTruthy()
    expect(reqs('bane', D2).map(r => [r.placedBy, r.placedAt]), 'his Redo two hours on puts his own bid back as it was').toEqual([['bane', placed]])
  })
})

describe('2. a request carries the stamp of the record it came from', () => {
  it('a new bid with no stamp, a borrowed stamp, or his own name at an old or future time — refused', () => {
    expect(ownershipViolation(env([cell([], [req()])]))).toContain('who placed a request')
    /* his Tuesday bid the admin placed rides along unchanged; the new Wednesday bid borrows its stamp */
    const tue = req({ id: 'q0', placedBy: 'stiff', placedAt: 5 })
    expect(ownershipViolation(env([cell([tue], [tue]), cell([], [req({ placedBy: 'stiff', placedAt: 5 })], D2)])))
      .toContain('who placed a request')
    /* …or his own oldest bid's time */
    const old = req({ id: 'q0', placedBy: 'bane', placedAt: 5 })
    expect(ownershipViolation(env([cell([old], [old]), cell([], [req({ placedBy: 'bane', placedAt: 5 })], D2)])))
      .toContain('who placed a request')
    expect(ownershipViolation(env([cell([], [req({ placedBy: 'bane', placedAt: Date.now() + 60_000 })])])), 'a minute ahead')
      .toContain('who placed a request')
  })
  it('a move keeps its record’s own stamp — a bid saved before M4 moves with none; a changed stamp on the way is refused', () => {
    const q = req({ placedBy: 'stiff', placedAt: 5 })
    expect(ownershipViolation(env([cell([q], []), cell([], [q], D2)], 'lw.move'))).toBeNull()
    expect(ownershipViolation(env([cell([q], []), cell([], [{ ...q, placedAt: 4 }], D2)], 'lw.move'))).toContain('who placed a request')
    expect(ownershipViolation(env([cell([q], []), cell([], [{ ...q, placedBy: 'bane', placedAt: Date.now() }], D2)], 'lw.move'))).toContain('who placed a request')
    const bare = req()
    expect(ownershipViolation(env([cell([bare], []), cell([], [bare], D2)], 'lw.move'))).toBeNull()
    expect(ownershipViolation(env([cell([q], []), cell([], [req({ placedBy: undefined, placedAt: undefined })], D2)], 'lw.move')), 'a stamp dropped on the way')
      .toContain('who placed a request')
  })
  it('a re-typed kind keeps the first stamp of those it replaces; a bid saved before M4 re-typed is placed by him now', () => {
    const a = req({ id: 'q1', code: 'LL*', placedBy: 'stiff', placedAt: 7 }), b = req({ id: 'q2', code: '*LL', placedBy: 'bane', placedAt: 5 })
    expect(ownershipViolation(env([cell([a, b], [req({ id: 'q3', code: 'OL', placedBy: 'bane', placedAt: 5 })])]))).toBeNull()
    expect(ownershipViolation(env([cell([a, b], [req({ id: 'q3', code: 'OL', placedBy: 'stiff', placedAt: 7 })])]))).toContain('who placed a request')
    expect(ownershipViolation(env([cell([req()], [req({ id: 'q3', code: 'OL', placedBy: 'bane', placedAt: Date.now() })])]))).toBeNull()
  })
  /* THE FIXES' M10 (the Opus read's 7): two hand-made commands still let a member's new bid borrow an old stamp — sorting
     to the top of Approvals and never showing as "New". A re-typed kind takes the stamp only of a LIVE bid on the half it
     replaces (as the store's setCell does), and "the same record" is one that LEFT its old place, never a copy. */
  it('M10 his old REFUSED request dropped for a new bid carrying its stamp — refused; the other half’s bid’s stamp — refused', () => {
    const refusedOld = req({ id: 'q0', state: 'refused', placedBy: 'stiff', placedAt: 5, decidedBy: 'stiff', decidedAt: 6 })
    expect(ownershipViolation(env([cell([refusedOld], [req({ id: 'q9', placedBy: 'stiff', placedAt: 5 })])])))
      .toContain('who placed a request')
    const am = req({ id: 'q0', code: '*LL', placedBy: 'stiff', placedAt: 5 })
    expect(ownershipViolation(env([cell([am], [req({ id: 'q9', code: 'OL*', placedBy: 'stiff', placedAt: 5 })])])), 'the afternoon borrows the morning’s')
      .toContain('who placed a request')
    /* …while a re-type on the half it replaces keeps its stamp, as before */
    expect(ownershipViolation(env([cell([am], [req({ id: 'q9', code: '*OL', placedBy: 'stiff', placedAt: 5 })])]))).toBeNull()
  })
  it('M10 a copy of his request on another day, the original kept where it was — refused; a real move still passes', () => {
    const q = req({ id: 'q0', placedBy: 'stiff', placedAt: 5 })
    expect(ownershipViolation(env([cell([q], [q]), cell([], [q], D2)], 'lw.edit'))).toContain('who placed a request')
    expect(ownershipViolation(env([cell([q], []), cell([], [q], D2)], 'lw.move'))).toBeNull()
  })
  it('through the real stores: his bid placed, re-typed and moved passes the check', () => {
    ranger()
    expect(setCell('bane', D, 'LL')).toBe(true)
    T(10)
    expect(setCell('bane', D, 'OL')).toBe(true)
    expect(reqs('bane', D).map(r => [r.code, r.placedBy, r.placedAt])).toEqual([['OL', 'bane', T(8)]])
  })
})

describe('3. "approved by the war" on an Input is never a member’s to set', () => {
  it('his own leave filed carrying it, or his change that adds or alters it — refused', () => {
    expect(ownershipViolation(env([{ collection: 'inputs', id: 'x1', op: 'put', before: null, after: inp({ lw: true }) }], 'inputs.write')))
      .toContain('approved on the war')
    expect(ownershipViolation(env([{ collection: 'inputs', id: 'x1', op: 'put', before: inp(), after: inp({ lw: 'w1' }) }], 'inputs.write')))
      .toContain('approved on the war')
    expect(ownershipViolation(env([{ collection: 'inputs', id: 'x1', op: 'put', before: inp({ lw: 'w1' }), after: inp({ lw: 'w2' }) }], 'inputs.write')))
      .toContain('approved on the war')
    expect(ownershipViolation(env([{ collection: 'inputs', id: 'x1', op: 'put', before: inp({ lw: 'w1' }), after: inp({ lw: 'w1', lwMoved: { '2026-02-10': '2026-02-09' } }) }], 'inputs.write')))
      .toContain('approved on the war')
  })
  it('his change that keeps it, or drops it (a re-dated leave), passes; a piece cut from his own war leave carries it', () => {
    const was = inp({ lw: 'w1', date: 'Feb 9', endDate: 'Feb 11', lwMoved: { '2026-02-10': '2026-02-05', '2026-02-11': '2026-02-06' } })
    expect(ownershipViolation(env([{ collection: 'inputs', id: 'x1', op: 'put', before: was, after: { ...was, remarks: 'hi' } }], 'inputs.write'))).toBeNull()
    expect(ownershipViolation(env([{ collection: 'inputs', id: 'x1', op: 'put', before: was, after: { ...was, lw: undefined, lwMoved: undefined, date: 'Feb 12' } }], 'inputs.write'))).toBeNull()
    /* a medical cuts Feb 10 out: the record keeps Feb 9, a new piece holds Feb 11 with its own moved day */
    const head = { ...was, endDate: undefined, lwMoved: undefined }
    const tail = { ...was, iid: 'x2', date: 'Feb 11', endDate: undefined, lwMoved: { '2026-02-11': '2026-02-06' } }
    expect(ownershipViolation(env([{ collection: 'inputs', id: 'x1', op: 'put', before: was, after: head },
      { collection: 'inputs', id: 'x2', op: 'put', before: null, after: tail }], 'inputs.write'))).toBeNull()
    expect(ownershipViolation(env([{ collection: 'inputs', id: 'x1', op: 'put', before: was, after: head },
      { collection: 'inputs', id: 'x2', op: 'put', before: null, after: { ...tail, lwMoved: { '2026-02-11': '2026-01-01' } } }], 'inputs.write')), 'a moved day it never had')
      .toContain('approved on the war')
  })
  it('through the real stores: his medical over his war-approved leave still cuts it', () => {
    expect(writeInputs(() => { INPUTS.push(inp({ iid: 'L1', by: 'stiff', date: 'Feb 9', endDate: 'Feb 11', lw: getState().period.id })) })).toBe(true)
    ranger()
    expect(writeInputs(() => { INPUTS.push({ iid: 'M1', person: 'bane', type: 'OML', date: 'Feb 10', yr: 2026, allday: true, remarks: '', mod: '2026-02-01', by: 'bane', at: Date.now() }) })).toBe(true)
    const left = INPUTS.filter((r: any) => r.person === 'bane' && r.type === 'LL' && r.yr === 2026 && String(r.date).startsWith('Feb'))
    expect(left.length, 'the leave cut around the medical').toBeGreaterThan(0)
    expect(left.every((r: any) => r.lw === getState().period.id)).toBe(true)
  })
})

describe('4. a member’s notice never carries a Leave War line', () => {
  it('the reader’s case: his own new input with a forged "LL refused" line to another man — refused', () => {
    expect(ownershipViolation(env([
      { collection: 'inputs', id: 'x4', op: 'put', before: null, after: inp({ iid: 'x4' }) },
      { collection: 'notices', id: 'n1', op: 'put', before: null, after: { id: 'n1', to: 'ammo', by: 'bane', iid: 'x4', name: 'Your leave', what: [{ k: 'lw', c: 'LL', a: D, b: D, d: 'refused' }] } },
    ], 'inputs.write'))).toContain('notice')
    for (const k of [{ k: 'lwopen', a: D, b: D, open: true }, { k: 'lwback', a: D, b: D, d: 'approved', ref: 'x' }]) {
      expect(ownershipViolation(env([
        { collection: 'inputs', id: 'x4', op: 'put', before: null, after: inp({ iid: 'x4' }) },
        { collection: 'notices', id: 'n1', op: 'put', before: null, after: { id: 'n1', to: 'ammo', by: 'bane', iid: 'x4', name: 'x', what: [k] } },
      ], 'inputs.write')), k.k).toContain('notice')
    }
    /* his ordinary line about his own filing still passes */
    expect(ownershipViolation(env([
      { collection: 'inputs', id: 'x4', op: 'put', before: null, after: inp({ iid: 'x4', type: 'OD', people: [{ p: 'bane', by: 'bane', at: 1 }, { p: 'ammo', by: 'bane', at: 1 }], person: undefined }) },
      { collection: 'notices', id: 'n1', op: 'put', before: null, after: { id: 'n1', to: 'ammo', by: 'bane', iid: 'x4', name: 'OD', what: [{ k: 'in' }] } },
    ], 'inputs.write')) ?? '').not.toMatch(/notice/)
  })
  it('the war’s follow-up notice command is the admin’s alone', () => {
    expect(cmdAuthorize('lw.notice', { role: 'member', personId: 'bane' } as any)).toBe(false)
    expect(cmdAuthorize('lw.notice', { role: 'admin', personId: 'stiff' } as any)).toBe(true)
  })
})
