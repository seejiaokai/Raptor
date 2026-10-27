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
import { NOTICES, noticePass, noticesFor, noticeWords } from '../state/notices'
import { isUnread, noticeSeenLoad } from '../state/noticeseen'
import { commitInputEdit, draftOf } from '../ui/inputedit'
import {
  closeDates, decideRequests, getState, initStore as lwInitStore, lwHistInit, moveRecords, openDates, placeApproved,
  recordsAt, setCell, setCellRange, setPeople, clearCells, decisionTells, type DecideLine, type DecidePart,
} from './state/store'
import { type RequestRec, setMemberTodayForTests } from './engine'
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

/* THE FIXES' M2 (the Opus code read's 2, 28 Oct 26): his war-approved leave was read as ONE notation a date, so on a day
   holding two war-approved halves the later Input hid the earlier — the bell told him "deleted" beside "approved", "bid
   deleted" for an approval, or nothing at all for a put-back. Each case the read lists, and D1422 beside a half. */
describe('a day holding two war-approved halves (M2)', () => {
  const D = DAYS[1]!
  const approve = (code: string, date = D) => {
    expect(setCell('bane', date, code)).toBe(true)
    const r = reqs('bane', date).find(x => x.code === code && x.state === 'pending')!
    return decideRequests([{ personId: 'bane', to: 'approved', parts: [{ date, recId: r.id, code, state: 'pending' }] }])[0]!
  }
  const fresh = () => { NOTICES.length = 0; T(9) }
  /* (a line prints the kind without its half's star — "LL approved" — as every Leave War line does) */

  it('(a) the afternoon approved, then the morning: ONE line, "approved" — never "deleted" beside it', () => {
    approve('LL*')
    fresh()
    expect(approve('*LL').kind).toBe('done')
    expect(lines('bane')).toEqual(['Your leave · Wed 4 Feb · LL approved · Saber'])
  })

  it('(b) an approval that extends an older morning leave, on a day whose afternoon a later leave holds: "approved", not "bid deleted"', () => {
    approve('*LL', DAYS[0]!)          // the older morning leave, K
    approve('LL*')                     // the afternoon leave, A, filed later
    fresh()
    expect(approve('*LL').kind).toBe('done')    // extends K onto D
    expect(lines('bane')).toEqual(['Your leave · Wed 4 Feb · LL approved · Saber'])
  })

  it('(c) one half of a two-half day put back to a bid tells him so, whichever Input is older', () => {
    approve('*LL')
    const pm = approve('LL*')
    fresh()
    const parts = (pm as any).parts as DecidePart[]
    expect(decideRequests([{ personId: 'bane', parts, to: 'pending' }])[0]!.kind).toBe('done')
    expect(lines('bane')).toEqual(['Your leave · Wed 4 Feb · LL put back to a bid · Saber'])
  })

  it('(c, the other half) the older morning put back tells him so too', () => {
    const am = approve('*LL')
    approve('LL*')
    fresh()
    expect(decideRequests([{ personId: 'bane', parts: (am as any).parts, to: 'pending' }])[0]!.kind).toBe('done')
    expect(lines('bane')).toEqual(['Your leave · Wed 4 Feb · LL put back to a bid · Saber'])
  })

  it('"Approve what I enter" beside an approved afternoon (D1422): "added and approved" only', () => {
    approve('LL*')
    fresh()
    placeApproved([{ personId: 'bane', date: D }], '*LL')
    expect(lines('bane')).toEqual(['Your leave · Wed 4 Feb · LL added and approved · Saber'])
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

/* THE FIXES' M9 (the Opus read's 5): the "… approved again" line a Redo writes is the follow-up's own, not the step's, so
   the next Undo never looked at it — unread, it stayed in his bell for an approval that no longer stood (D1216: a line he
   has not read goes with the Undo). */
describe('an unread "again" line and the next Undo (M9 — D1216)', () => {
  const readNewest = () => { mem['sqn142_noticeseen:bane'] = JSON.stringify({ upto: 0, ids: noticesFor('bane').map(n => n.id) }); noticeSeenLoad() }
  it('Undo after a Redo he has not read: the "again" line goes; Redo brings ONE "again" line back', () => {
    bids('bane')
    decideRequests([lineOf('bane', DAYS, 'approved')])
    readNewest()
    T(9); expect(globalUndo().ok).toBe(true)
    T(10); expect(globalRedo().ok).toBe(true)
    expect(lines('bane')[0]).toBe('Your leave · Tue 3 – Thu 5 Feb · LL approved again · Saber')
    T(11); expect(globalUndo().ok).toBe(true)
    expect(lines('bane'), 'the unread "again" line went with the Undo').toEqual(['Your leave · Tue 3 – Thu 5 Feb · Approval of LL taken back · Saber'])
    T(12); expect(globalRedo().ok).toBe(true)
    expect(lines('bane').filter(l => l.includes('approved again')), 'one "again" line, never two').toHaveLength(1)
    expect(lines('bane')[0]).toBe('Your leave · Tue 3 – Thu 5 Feb · LL approved again · Saber')
  })
  it('the twin: an "again" line he HAS read — the next Undo says "taken back" once more', () => {
    bids('bane')
    decideRequests([lineOf('bane', DAYS, 'approved')])
    readNewest()
    T(9); expect(globalUndo().ok).toBe(true)
    T(10); expect(globalRedo().ok).toBe(true)
    readNewest()
    T(11); expect(globalUndo().ok).toBe(true)
    expect(lines('bane')[0]).toBe('Your leave · Tue 3 – Thu 5 Feb · Approval of LL taken back · Saber')
    expect(lines('bane').filter(l => l.includes('approved again')), 'the approval it repeated no longer stands').toHaveLength(0)
  })
})

describe('bidding opened or closed (9.4 — D1214)', () => {
  it('everyone on the war with a sign-in but the admin who did it; four month taps are ONE live line', () => {
    const p = getState().period
    closeDates(p.start, p.end)
    NOTICES.length = 0
    openDates('2026-03-01', '2026-03-31')
    expect(lines('bane')).toEqual(['Leave War · 1 Mar – 31 Mar · Bidding open · Saber'])
    expect(lines('stiff')).toEqual([])
    T(9); openDates('2026-04-01', '2026-04-30')
    T(10); openDates('2026-05-01', '2026-05-31')
    T(11); openDates('2026-06-01', '2026-06-30')
    expect(lines('bane')).toEqual(['Leave War · 1 Mar – 30 Jun · Bidding open · Saber'])
    /* shortening a stretch is ONE line with its new dates (spec 9.4) — the older Mar–Jun line hides under it, so a
       "Jun closed" line alone would leave him not knowing Mar–May is still open (the scenario designer's ★4) */
    T(12); closeDates('2026-06-01', '2026-06-30')
    expect(lines('bane')).toEqual(['Leave War · 1 Mar – 31 May · Bidding open · Saber'])
    /* a stretch closed whole says closed */
    T(13); closeDates('2026-03-01', '2026-05-31')
    expect(lines('bane')).toEqual(['Leave War · 1 Mar – 31 May · Bidding closed · Saber'])
  })
  /* THE WALK'S C-F3 (27 Oct 26): the "its dates ended" line was dated the midnight after the stretch, so a "bidding open"
     line written later (or any open line once the ended line passed its fourteen days) won as the newer line — his bell
     went on saying "bidding open" for dates long gone. Told it opened, he is told it ended, whenever that was. */
  it('a member told a stretch opened is told it ended — never left reading "bidding open" for past dates (walk C-F3)', () => {
    const p = getState().period
    closeDates(p.start, p.end)
    NOTICES.length = 0
    try {
      setMemberTodayForTests('2026-02-20')
      openDates('2026-03-01', '2026-03-31')   // written at 15 Jul by the clock, the war's today 20 Feb
      expect(lines('bane')).toEqual(['Leave War · 1 Mar – 31 Mar · Bidding open · Saber'])
      setMemberTodayForTests('2026-04-02')     // the dates have passed
      expect(lines('bane')).toEqual(['Leave War · 1 Mar – 31 Mar · Bidding closed · its dates ended'])
      setMemberTodayForTests('2026-05-20')     // weeks on: still the ended line, never the old "open" one back
      expect(lines('bane')).toEqual(['Leave War · 1 Mar – 31 Mar · Bidding closed · its dates ended'])
    } finally { setMemberTodayForTests('2000-01-01') }
  })
  it('a month closed out of the middle of a stretch: each piece left open is its own line (★4)', () => {
    const p = getState().period
    closeDates(p.start, p.end)
    openDates('2026-04-01', '2026-06-30')
    NOTICES.length = 0
    T(9); closeDates('2026-05-01', '2026-05-31')
    expect(lines('bane').sort()).toEqual(['Leave War · 1 Apr – 30 Apr · Bidding open · Saber', 'Leave War · 1 Jun – 30 Jun · Bidding open · Saber'])
  })
})

describe('the scenario designer’s faults (★5, ★6, ★7)', () => {
  it('★5 an admin re-typing his pending bid tells him nothing, by the drag window and by the one-day window alike', () => {
    ranger(); bids('bane'); saber()
    NOTICES.length = 0
    T(9)
    expect(setCellRange('bane', DAYS[0]!, DAYS[1]!, 'OL').written).toBeGreaterThan(0)
    expect(setCell('bane', DAYS[2]!, 'OL')).toBe(true)
    expect(reqs('bane', DAYS[0]!).map(r => r.code)).toEqual(['OL'])
    expect(lines('bane'), 'no "LL bid deleted" for a bid that still stands').toEqual([])
  })
  it('★6 "Approve what I enter" placing another kind over his pending bid names the kind placed', () => {
    ranger(); expect(setCell('bane', DAYS[0]!, 'LL')).toBe(true); saber()
    NOTICES.length = 0
    T(9)
    placeApproved([{ personId: 'bane', date: DAYS[0]! }], 'OL')
    expect(lines('bane')).toEqual(['Your leave · Tue 3 Feb · OL added and approved · Saber'])
  })
  it('★7 a remark changed on his war-approved leave from a war window still tells him once', () => {
    const was = { iid: 'L9', person: 'bane', type: 'LL', date: 'Feb 3', yr: 2026, allday: true, remarks: 'a', lw: getState().period.id, by: 'stiff', at: 1 }
    const now = { ...was, remarks: 'family' }
    NOTICES.length = 0
    noticePass(new Map([['L9', was]]), [now], { actor: 'stiff', skipLw: true })
    expect(lines('bane')).toHaveLength(1)
    expect(lines('bane')[0]).toContain('Remark changed')
    /* …while a war door's cut, move or delete of that leave stays the war's own line (B1) */
    NOTICES.length = 0
    noticePass(new Map([['L9', was]]), [{ ...was, date: 'Feb 4' }], { actor: 'stiff', skipLw: true })
    expect(lines('bane')).toEqual([])
  })
})

/* THE BREAK TESTS (28 Oct 26, list lw-m4 #38 and #40): the one body that works out a war command's lines for the bell
   (store.ts decisionTells — every door, today's or tomorrow's, goes through it), asked directly with the state before and
   after a command, so its own two rules are pinned where they live, whatever a later door does:
   · his own change tells nobody — the man who made the change is never told of it (the store's own skip; the notices'
     writer skips whoever did it too, which is why no end-to-end test could see this one go);
   · on a day holding two halves, an approval is matched to the request on ITS half (M2): a command that approves the
     morning bid and takes the afternoon's away reads "LL approved" and "OL bid deleted", never the other way round. */
describe('the bell\u2019s one body for a war command (decisionTells)', () => {
  const day = '2026-02-03'
  const war = (recs: any): any => ({ wars: [{ period: { id: 'w1' }, recs }] })
  it('his own change tells nobody; the same change by another tells him', () => {
    const before = war({ bane: { [day]: [{ id: 'r1', kind: 'request', code: 'LL', state: 'pending' }] } })
    const after = war({ bane: {} })
    expect(decisionTells('lw.clear', before, after, new Map(), new Map(), 'bane')).toEqual([])
    expect(decisionTells('lw.clear', before, after, new Map(), new Map(), 'stiff').map(t => [t.d, t.code])).toEqual([['biddel', 'LL']])
  })
  it('M2 the approval is matched to the request on its own half, never the other half\u2019s', () => {
    const before = war({ bane: { [day]: [
      { id: 'pm', kind: 'request', code: 'OL*', state: 'pending' },
      { id: 'am', kind: 'request', code: '*LL', state: 'pending' },
    ] } })
    const after = war({ bane: {} })
    const leaveAfter = new Map([['bane', new Map([[`${day}|*LL`, '*LL']])]])
    expect(decisionTells('lw.decide', before, after, new Map(), leaveAfter, 'stiff').map(t => [t.d, t.code]))
      .toEqual([['approved', '*LL'], ['biddel', 'OL*']])
  })
})
