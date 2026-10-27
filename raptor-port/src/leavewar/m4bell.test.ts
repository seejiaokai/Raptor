/* THE OVERHAUL'S M4, BATCH 9 — THE BELL'S LEAVE WAR LINES (the build spec §2; owner D1142, D1214, D1216, D1422; the red
   team's B1).

   A decision on a man's leave tells him, one line a decision, naming who did it — a run of days one line; his own change
   tells nobody; the Inputs page's copy of a war-approved leave never tells him a second time (B1); Undo takes an unread
   line back and leaves "taken back" for one he had read, and Redo then writes a fresh line; bidding opened or closed
   tells everyone on the war but the admin who did it, one live line a stretch. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS, holds } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { NOTICES, noticesFor, noticeWords } from '../state/notices'
import { isUnread, noticeSeenLoad } from '../state/noticeseen'
import { commitInputEdit, draftOf } from '../ui/inputedit'
import {
  closeDates, decideRequests, getState, initStore as lwInitStore, lwHistInit, moveRecords, openDates, placeApproved,
  recordsAt, setCell, setPeople, clearCells, type DecideLine, type DecidePart,
} from './state/store'
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

const reqs = (p: string, d: string): RequestRec[] => recordsAt(p, d).filter((r): r is RequestRec => r.kind === 'request')
const req = (p: string, d: string): RequestRec => { const l = reqs(p, d); expect(l, `${p} has one request on ${d}`).toHaveLength(1); return l[0]! }
const DAYS = ['2026-02-03', '2026-02-04', '2026-02-05']
const lineOf = (p: string, dates: string[], to: DecideLine['to']): DecideLine =>
  ({ personId: p, to, parts: dates.map(date => { const r = req(p, date); return { date, recId: r.id, state: r.state as DecidePart['state'] } }) })
/* his lines, in words — newest first */
const lines = (pid: string) => noticesFor(pid).map(n => { const w = noticeWords(n); return [w.name, w.day, w.what, w.who].filter(Boolean).join(' · ') })
const leaveOf = (p: string) => INPUTS.filter((r: any) => holds(r, p) && r.lw && String(r.date).startsWith('Feb'))
const bids = (p: string, code = 'LL') => { for (const d of DAYS) expect(setCell(p, d, code)).toBe(true) }

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

describe('a decision on his leave — one line, naming who (9.1, 9.2)', () => {
  it('a run approved together is ONE line; the Inputs page’s copy of it tells nothing beside it (B1)', () => {
    bids('bane')
    decideRequests([lineOf('bane', DAYS, 'approved')])
    expect(lines('bane')).toEqual(['Your leave · Tue 3 – Thu 5 Feb · LL approved · Saber'])
    expect(lines('stiff'), 'whoever did it is never told').toEqual([])
  })

  it('refused · put back to a bid · deleted · moved — each one line, never two', () => {
    bids('bane')
    decideRequests([lineOf('bane', DAYS, 'refused')])
    expect(lines('bane')[0]).toBe('Your leave · Tue 3 – Thu 5 Feb · LL refused · Saber')
    decideRequests([lineOf('bane', DAYS, 'pending')])
    expect(lines('bane')[0]).toBe('Your leave · Tue 3 – Thu 5 Feb · LL back to pending · Saber')
    const [a] = decideRequests([lineOf('bane', DAYS, 'approved')])
    T(9)
    decideRequests([{ personId: 'bane', parts: (a as any).parts, to: 'pending' }])
    expect(lines('bane')[0]).toBe('Your leave · Tue 3 – Thu 5 Feb · LL put back to a bid · Saber')
    expect(lines('bane')).toHaveLength(4)
    decideRequests([lineOf('bane', DAYS, 'approved')])
    T(10)
    const iid = String(leaveOf('bane')[0].iid)
    expect(moveRecords(DAYS.map(date => ({ kind: 'absence', personId: 'bane', date, id: iid })) as any, 7)).toBe('moved')
    expect(lines('bane')[0]).toBe('Your leave · Tue 3 – Thu 5 Feb · LL moved to Tue 10 – Thu 12 Feb · Saber')
    T(11)
    clearCells(['2026-02-10', '2026-02-11', '2026-02-12'].map(date => ({ personId: 'bane', date })))
    expect(lines('bane')[0]).toBe('Your leave · Tue 10 – Thu 12 Feb · LL deleted · Saber')
    expect(lines('bane'), 'one line a decision').toHaveLength(7)
  })

  it('his pending bid moved or deleted by an admin tells him (9.7); his own move or delete tells nobody', () => {
    bids('bane')
    const r = req('bane', DAYS[0]!)
    expect(moveRecords([{ kind: 'request', personId: 'bane', date: DAYS[0]!, id: r.id } as any], 6)).toBe('moved')
    expect(lines('bane')[0]).toBe('Your leave · Tue 3 Feb · LL bid moved to Mon 9 Feb · Saber')
    T(9)
    setCell('bane', DAYS[1]!, '')
    expect(lines('bane')[0]).toBe('Your leave · Wed 4 Feb · LL bid deleted · Saber')
    /* his own */
    const p = getState().period; openDates(p.start, p.end)
    const before = noticesFor('bane').length
    ranger()
    setCell('bane', DAYS[2]!, '')
    expect(noticesFor('bane'), 'his own delete tells nobody').toHaveLength(before)
  })

  it('leave placed on his row already approved (D1422): "LL added and approved"', () => {
    placeApproved(DAYS.map(date => ({ personId: 'bane', date })), 'LL')
    expect(lines('bane')).toEqual(['Your leave · Tue 3 – Thu 5 Feb · LL added and approved · Saber'])
  })

  it('a change made on the Inputs page to the same leave still tells him through the Inputs door, once (D1166)', () => {
    bids('bane')
    decideRequests([lineOf('bane', DAYS, 'approved')])
    T(9)
    const row = leaveOf('bane')[0]
    expect(commitInputEdit(row, { ...draftOf(row), remarks: 'family' })).toBe(true)
    const all = lines('bane')
    expect(all).toHaveLength(2)
    expect(all[0]).toContain('Remark changed')
  })
})

describe('Undo (9.3 — D1216)', () => {
  it('an unread line goes with the Undo; a read one leaves "taken back"; Redo then writes a fresh line, unread', () => {
    bids('bane')
    decideRequests([lineOf('bane', DAYS, 'approved')])
    expect(globalUndo().ok).toBe(true)
    expect(lines('bane'), 'unread: it simply went').toEqual([])
    expect(globalRedo().ok).toBe(true)
    expect(lines('bane')).toEqual(['Your leave · Tue 3 – Thu 5 Feb · LL approved · Saber'])
    /* he reads it — on his own phone: his read record arrives on the admin's device (Undo is per sign-in, so the admin
       stays signed in here) */
    mem['sqn142_noticeseen:bane'] = JSON.stringify({ upto: 0, ids: [noticesFor('bane')[0]!.id] }); noticeSeenLoad()
    T(9)
    expect(globalUndo().ok).toBe(true)
    expect(lines('bane')).toEqual(['Your leave · Tue 3 – Thu 5 Feb · Approval of LL taken back · Saber'])
    T(10)
    expect(globalRedo().ok).toBe(true)
    const now = noticesFor('bane')
    expect(lines('bane')[0]).toBe('Your leave · Tue 3 – Thu 5 Feb · LL approved again · Saber')
    expect(isUnread(now[0]!, 'bane'), 'the fresh line is unread').toBe(true)
    expect(globalUndo().ok, 'the follow-up line is no Undo step: Undo takes the approval again').toBe(true)
    expect(leaveOf('bane')).toHaveLength(0)
  })
})

describe('bidding opened or closed (9.4 — D1214)', () => {
  it('everyone on the war with a sign-in but the admin who did it; four month taps are ONE live line', () => {
    const p = getState().period
    closeDates(p.start, p.end)
    NOTICES.length = 0
    openDates('2026-03-01', '2026-03-31')
    expect(lines('bane')).toEqual(['Leave War · 1 Mar – 31 Mar · bidding open · Saber'])
    expect(lines('stiff')).toEqual([])
    T(9); openDates('2026-04-01', '2026-04-30')
    T(10); openDates('2026-05-01', '2026-05-31')
    T(11); openDates('2026-06-01', '2026-06-30')
    expect(lines('bane')).toEqual(['Leave War · 1 Mar – 30 Jun · bidding open · Saber'])
    T(12); closeDates('2026-06-01', '2026-06-30')
    expect(lines('bane')[0]).toBe('Leave War · 1 Jun – 30 Jun · bidding closed · Saber')
  })
})
