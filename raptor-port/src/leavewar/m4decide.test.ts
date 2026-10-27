/* THE OVERHAUL'S M4 — WHO PLACED A REQUEST, AND APPROVALS' ONE WRITER (the build spec
   docs/superpowers/plans/2026-10-27-lw-m4-build-spec.md, 8.3, 8.5, 8.6; D1361, D1330, D1421; the red team's A4 and B8).

   Every request records who placed it and when — kept across a re-typed kind, a move, an approval and a put-back — and
   who refused it. Approve, Refuse, a second tap and Approve all are ONE writer (`decideRequests`): every line checked
   first, written as one command, each line answering for itself with the ids it now has.

   Runs in the Leave War project (a hostile time zone): the stamps are moments, never calendar days. */
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
  absenceDoor, closeDates, decideRequests, getState, initStore as lwInitStore, lwHistInit, moveRecords, openDates,
  recordsAt, setAbsenceDoor, setBidStates, setCell, setPeople, setPostOut, type DecideLine, type DecidePart,
} from './state/store'
import { readRec, setMemberTodayForTests, type RequestRec } from './engine'
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
const openAll = () => { const p = getState().period; openDates(p.start, p.end) }
const closeAll = () => { const p = getState().period; closeDates(p.start, p.end) }
/* a line as the Approvals list draws it: the person's request run, each day by its record and its code (approvals.ts) */
const lineOf = (p: string, dates: string[], to: DecideLine['to']): DecideLine =>
  ({ personId: p, to, parts: dates.map(date => { const r = req(p, date); return { date, recId: r.id, code: r.code, state: r.state as DecidePart['state'] } }) })
const leaveOf = (p: string) => INPUTS.filter((r: any) => holds(r, p) && r.lw && String(r.date).startsWith('Feb'))

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  T(8)
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
  saber()
})
afterEach(() => { HOOKS.toast = toast; setMemberTodayForTests(null); _resetTimeline(); resetSession(null) })

describe('who placed a request (8.6)', () => {
  it('a member’s own bid names him and the moment; an admin’s bid on his row names the admin', () => {
    openAll()
    ranger()
    const t1 = T(9)
    expect(setCell('bane', DAYS[0]!, 'LL')).toBe(true)
    expect(req('bane', DAYS[0]!)).toMatchObject({ placedBy: 'bane', placedAt: t1 })
    saber()
    const t2 = T(10)
    expect(setCell('bane', DAYS[1]!, 'LL')).toBe(true)
    expect(req('bane', DAYS[1]!)).toMatchObject({ placedBy: 'stiff', placedAt: t2 })
  })

  it('a re-typed kind on the same half keeps the first stamp — it is the same request', () => {
    const t1 = T(9)
    setCell('bane', DAYS[0]!, 'LL')
    T(11)
    expect(setCell('bane', DAYS[0]!, 'OL')).toBe(true)
    expect(req('bane', DAYS[0]!)).toMatchObject({ code: 'OL', placedBy: 'stiff', placedAt: t1 })
  })

  it('a move keeps who placed it; a refused bid moved lands pending, without who refused it', () => {
    const t1 = T(9)
    setCell('bane', DAYS[0]!, 'LL')
    expect(decideRequests([lineOf('bane', [DAYS[0]!], 'refused')])[0]!.kind).toBe('done')
    expect(req('bane', DAYS[0]!)).toMatchObject({ state: 'refused', decidedBy: 'stiff' })
    const r = req('bane', DAYS[0]!)
    expect(moveRecords([{ kind: 'request', personId: 'bane', date: DAYS[0]!, id: r.id } as any], 2)).toBe('moved')
    const m = req('bane', '2026-02-05')
    expect(m).toMatchObject({ placedBy: 'stiff', placedAt: t1, state: 'pending' })
    expect(m.decidedBy).toBeUndefined()
  })

  it('kept by the reader across a reload; a request saved before M4 loads without it (D401)', () => {
    const r = readRec({ id: 'r1', kind: 'request', code: 'LL', state: 'refused', placedBy: 'bane', placedAt: 5, decidedBy: 'stiff', decidedAt: 6 })
    expect(r).toMatchObject({ placedBy: 'bane', placedAt: 5, decidedBy: 'stiff', decidedAt: 6 })
    const old = readRec({ id: 'r2', kind: 'request', code: 'LL', state: 'pending' }) as RequestRec
    expect(old.placedBy).toBeUndefined(); expect(old.placedAt).toBeUndefined()
    const bad = readRec({ id: 'r3', kind: 'request', code: 'LL', state: 'pending', placedBy: 7, placedAt: 'x' }) as RequestRec
    expect(bad.placedBy).toBeUndefined(); expect(bad.placedAt).toBeUndefined()
  })
})

describe('Approvals’ one writer (8.3, 8.5)', () => {
  it('approve a three-day line → ONE leave carrying who placed it; a second tap puts it back with the same placer; again', () => {
    openAll(); ranger()
    const t1 = T(9)
    for (const d of DAYS) setCell('bane', d, 'LL')
    saber(); closeAll()
    T(12)
    const [a] = decideRequests([lineOf('bane', DAYS, 'approved')])
    expect(a!.kind).toBe('done')
    const parts = (a as any).parts as DecidePart[]
    expect(parts.every(p => p.state === 'approved' && p.iid)).toBe(true)
    expect(leaveOf('bane')).toHaveLength(1)
    expect(leaveOf('bane')[0]).toMatchObject({ lwBy: 'bane', lwAt: t1, by: 'stiff' })
    /* the second tap on the lit Approve: back to pending, the line re-keyed to the new requests */
    const [b] = decideRequests([{ personId: 'bane', parts, to: 'pending' }])
    expect(b!.kind).toBe('done')
    const back = (b as any).parts as DecidePart[]
    expect(back.map(p => p.state)).toEqual(['pending', 'pending', 'pending'])
    for (const p of back) expect(req('bane', p.date)).toMatchObject({ id: p.recId, placedBy: 'bane', placedAt: t1 })
    expect(req('bane', DAYS[0]!).decidedBy, 'a pending line never reads "Refused by …"').toBeUndefined()
    /* and approved again from the re-keyed line — never read as stale */
    const [c] = decideRequests([{ personId: 'bane', parts: back, to: 'approved' }])
    expect(c!.kind).toBe('done')
    expect(leaveOf('bane')).toHaveLength(1)
  })

  it('refuse → lit; second tap → pending again, "decided" cleared', () => {
    setCell('bane', DAYS[0]!, 'LL')
    const [a] = decideRequests([lineOf('bane', [DAYS[0]!], 'refused')])
    const parts = (a as any).parts as DecidePart[]
    expect(req('bane', DAYS[0]!)).toMatchObject({ state: 'refused', decidedBy: 'stiff' })
    const [b] = decideRequests([{ personId: 'bane', parts, to: 'pending' }])
    expect(b!.kind).toBe('done')
    const r = req('bane', DAYS[0]!)
    expect(r.state).toBe('pending'); expect(r.decidedBy).toBeUndefined(); expect(r.decidedAt).toBeUndefined()
  })

  it('B8 — a line drawn from a state since changed is refused, saying what happened; nothing is written', () => {
    setCell('bane', DAYS[0]!, 'LL'); setCell('bane', DAYS[1]!, 'LL'); setCell('bane', DAYS[2]!, 'LL')
    const gone = lineOf('bane', [DAYS[0]!], 'approved')
    const decided = lineOf('bane', [DAYS[1]!], 'approved')
    const moved = lineOf('bane', [DAYS[2]!], 'approved')
    setCell('bane', DAYS[0]!, '')                                                   // deleted since
    decideRequests([lineOf('bane', [DAYS[1]!], 'refused')])                       // refused since, by Saber
    moveRecords([{ kind: 'request', personId: 'bane', date: DAYS[2]!, id: moved.parts[0]!.recId! } as any], 7)
    const out = decideRequests([gone, decided, moved])
    expect(out).toEqual([
      { kind: 'stale', why: 'No longer there' },
      { kind: 'stale', why: 'Already refused by Saber' },
      { kind: 'stale', why: 'Moved to Thu 12 Feb' },
    ])
    expect(leaveOf('bane')).toHaveLength(0)
  })

  it('Approve all — one line the rules refuse is reported on its line, the rest go through, as ONE command and ONE Undo', () => {
    for (const p of ['bane', 'rocky']) for (const d of DAYS) setCell(p, d, 'LL')
    const door = absenceDoor()!
    setAbsenceDoor({ ...door, approveWhy: it => (it.personId === 'rocky' && it.date === DAYS[1] ? 'Wed 4 Feb is on a locked week — not approved' : door.approveWhy!(it)) })
    try {
      const out = decideRequests([lineOf('bane', DAYS, 'approved'), lineOf('rocky', DAYS, 'approved')])
      expect(out[0]!.kind).toBe('done')
      expect(out[1]).toEqual({ kind: 'refused', why: 'Wed 4 Feb is on a locked week — not approved' })
      expect(leaveOf('bane')).toHaveLength(1)
      expect(reqs('rocky', DAYS[0]!)).toHaveLength(1)
      expect(globalUndo().ok).toBe(true)
      expect(leaveOf('bane'), 'one Undo takes every line back').toHaveLength(0)
      for (const d of DAYS) expect(req('bane', d).state).toBe('pending')
      expect(globalRedo().ok).toBe(true)
      expect(leaveOf('bane')).toHaveLength(1)
    } finally { setAbsenceDoor(door) }
  })

  it('a man whose posting out has run: his Approve is refused on the line; Refuse still works (B12)', () => {
    setCell('bane', DAYS[0]!, 'LL')
    expect(setPostOut('bane', '2026-03-01', 'none')).toBe(true)
    setMemberTodayForTests('2026-03-05')
    const [a] = decideRequests([lineOf('bane', [DAYS[0]!], 'approved')])
    expect(a).toEqual({ kind: 'refused', why: 'Posted out — refuse or delete it' })
    const [b] = decideRequests([lineOf('bane', [DAYS[0]!], 'refused')])
    expect(b!.kind).toBe('done')
    setMemberTodayForTests(null)
  })

  /* his D1436 (27 Oct 26, "all as recommended", question 16): leave on days after a posting-out date still to come is
     refused too — the day before still approves; a posting out as SANS keeps his leave, before and after it runs (D283);
     the bid windows' Approve refuses alike (one body, `sync.ts approveWhy`) */
  it('a posting still to come: Approve refuses leave on days after its date, with the date; a day before approves (D1436)', () => {
    setMemberTodayForTests('2026-01-20')
    for (const d of DAYS) setCell('bane', d, 'LL')
    expect(setPostOut('bane', DAYS[1]!, 'none')).toBe(true)
    const [a] = decideRequests([lineOf('bane', DAYS, 'approved')])
    expect(a).toEqual({ kind: 'refused', why: 'He posts out on 4 Feb: refuse or delete it' })
    expect(leaveOf('bane')).toHaveLength(0)
    const [b] = decideRequests([lineOf('bane', [DAYS[0]!], 'approved')])
    expect(b!.kind, 'the day before his posting-out date approves as ever').toBe('done')
    const [c] = decideRequests([lineOf('bane', [DAYS[2]!], 'refused')])
    expect(c!.kind, 'Refuse still works').toBe('done')
  })

  it('a posting still to come: the bid window refuses the same days (D1436)', () => {
    setMemberTodayForTests('2026-01-20')
    for (const d of DAYS) setCell('bane', d, 'LL')
    expect(setPostOut('bane', DAYS[1]!, 'none')).toBe(true)
    const r = setBidStates(DAYS.map(date => ({ personId: 'bane', date })), 'approved')
    expect(r.skipped, 'his days from 4 Feb are skipped').toBe(2)
    expect(req('bane', DAYS[1]!).state).toBe('pending')
    expect(req('bane', DAYS[2]!).state).toBe('pending')
  })

  it('a posting out as SANS keeps his leave: approved before it runs and after (D1436, D283)', () => {
    setMemberTodayForTests('2026-01-20')
    for (const d of DAYS) setCell('bane', d, 'LL')
    expect(setPostOut('bane', DAYS[1]!, 'sans')).toBe(true)
    const [a] = decideRequests([lineOf('bane', [DAYS[2]!], 'approved')])
    expect(a!.kind, 'before it runs').toBe('done')
    setMemberTodayForTests('2026-02-10')
    const [b] = decideRequests([lineOf('bane', [DAYS[0]!], 'approved')])
    expect(b!.kind, 'after it has run').toBe('done')
  })

  /* THE FIXES' M1 (both code reads, 28 Oct 26): on a day whose other half already holds war-approved leave, the line was
     re-keyed after Approve to the FIRST war-approved leave of that day — the older, other half's — so the second tap or
     Refuse (D1421, D1428) put back or refused leave approved days before, and left the one just approved standing. */
  describe('a day whose other half already holds war-approved leave (M1)', () => {
    const D = DAYS[0]!
    /* the afternoon approved first (the older Input), then a morning bid drawn as its line */
    const pmApprovedThenAmBid = () => {
      expect(setCell('bane', D, 'LL*')).toBe(true)
      expect(decideRequests([lineOf('bane', [D], 'approved')])[0]!.kind).toBe('done')
      expect(setCell('bane', D, '*LL')).toBe(true)
      const pm = leaveOf('bane')[0]
      return { pmIid: String(pm.iid), line: lineOf('bane', [D], 'approved') }
    }
    const halfOf = (iid: string) => { const r = INPUTS.find((x: any) => String(x.iid) === iid); return r ? (r.half ?? (r.allday ? 'full' : '')) : null }

    it('Approve re-keys the line to the morning leave it wrote, never the afternoon', () => {
      const { pmIid, line } = pmApprovedThenAmBid()
      const [a] = decideRequests([line])
      expect(a!.kind).toBe('done')
      const parts = (a as any).parts as DecidePart[]
      expect(parts[0]!.iid, 'the line is the morning’s leave now').not.toBe(pmIid)
      expect(leaveOf('bane')).toHaveLength(2)
    })

    it('the second tap puts back only the morning; the afternoon stays approved', () => {
      const { pmIid, line } = pmApprovedThenAmBid()
      const [a] = decideRequests([line])
      const [b] = decideRequests([{ personId: 'bane', parts: (a as any).parts, to: 'pending' }])
      expect(b!.kind).toBe('done')
      expect(INPUTS.some((x: any) => String(x.iid) === pmIid), 'the afternoon leave still stands').toBe(true)
      expect(leaveOf('bane')).toHaveLength(1)
      expect(req('bane', D)).toMatchObject({ code: '*LL', state: 'pending' })
      expect(halfOf(pmIid)).not.toBeNull()
    })

    it('Refuse after Approve refuses only the morning; the afternoon stays approved', () => {
      const { pmIid, line } = pmApprovedThenAmBid()
      const [a] = decideRequests([line])
      const [b] = decideRequests([{ personId: 'bane', parts: (a as any).parts, to: 'refused' }])
      expect(b!.kind).toBe('done')
      expect(INPUTS.some((x: any) => String(x.iid) === pmIid), 'the afternoon leave still stands').toBe(true)
      expect(req('bane', D)).toMatchObject({ code: '*LL', state: 'refused' })
    })

    it('a morning bid deleted since is "No longer there" — not "Already approved" for the afternoon', () => {
      const { line } = pmApprovedThenAmBid()
      setCell('bane', D, '')
      /* (the delete takes the morning bid only; the afternoon leave is approved and stays) */
      expect(leaveOf('bane')).toHaveLength(1)
      expect(decideRequests([line])).toEqual([{ kind: 'stale', why: 'No longer there' }])
    })

    it('the same tap on a line drawn before any other half was approved still works on a plain day', () => {
      expect(setCell('bane', D, '*LL')).toBe(true)
      const [a] = decideRequests([lineOf('bane', [D], 'approved')])
      expect(a!.kind).toBe('done')
      const [b] = decideRequests([{ personId: 'bane', parts: (a as any).parts, to: 'pending' }])
      expect(b!.kind).toBe('done')
      expect(leaveOf('bane')).toHaveLength(0)
    })
  })

  it('a member reaches none of it', () => {
    setCell('bane', DAYS[0]!, 'LL')
    const line = lineOf('bane', [DAYS[0]!], 'approved')
    ranger()
    expect(decideRequests([line])).toEqual([{ kind: 'refused', why: 'Only an admin decides leave' }])
    expect(req('bane', DAYS[0]!).state).toBe('pending')
  })
})
