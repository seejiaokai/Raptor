// src/state/weekrows.test.ts
/* [DB-READINESS] group A, phase 1.1 (plan §2.5, §2.9; R2-04, F3-02, F3-08, F3-09) — A WEEK AS ROWS.
   One stored week record becomes: a small week row (the two format stamps), seven day rows (the day and every
   field that names it), one row per ISSUANCE of a day (the Original is issuance 0, an AL its sequence; `~n` counts
   the Unpublishes of that version before it went out) and one row per RETRACTION (an Unpublish). Split then join
   gives back the week; join then split gives back the same bytes; a key or field that names no single day fails
   loudly; an Unpublish ADDS a retraction and never touches the issuance row. Every fixture is made through the
   app's own paths — publish, amend, unpublish, reissue, a saved plan, a taken-off request. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, isPersonal, inpId } from '../engine/inputs'
import { SCHED, signOf, dayCurVer, AMBOOK_VERSION } from '../engine/publish'
import { RID_BOOK_VERSION } from '../engine/rowids'
import { draftDup } from '../engine/drafts'
import { txtSet, unacceptInput } from '../engine/slots'
import { CURWEEK } from '../engine/waves'
import { emptyWeek, weekBundle, setAuthoredWeeks } from '../engine/weeks-data'
import { noteText } from '../engine/note'
import { initStore, weekStashSnap, loadWeek } from './store'
import { commitSetDayApproved, commitPublishALDay, commitUnpublish, schedWrite, SCHED_TYPES } from './sched-commit'
import { setSession } from './auth'
import * as view from './view'
import { splitWeek, joinWeek, parseRowId, RowShapeError } from './weekrows'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const W1 = '13/07/2026', W2 = '20/07/2026'
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const blob = () => JSON.parse(weekStashSnap())
/* what a join must give back: the week as saved, less the two fields that are not stored (`al` — no reader; `un` —
   worked out on read from the requests' own "taken off" mark, F3-02), the amendments in their canonical order (every
   reader sorts them), the muted warnings in the order of their day (a set — nothing reads its order), and nothing a
   JSON round trip would drop */
function retained(b: any) {
  const c = JSON.parse(JSON.stringify(b))
  delete c.al; delete c.un
  c.a = (c.a || []).slice().sort((x: any, y: any) => x.iso === y.iso ? x.seq - y.seq : (x.iso < y.iso ? -1 : 1))
  c.wo = (c.wo || []).map((k: string, i: number) => [k, i] as [string, number])
    .sort((x: any, y: any) => (+x[0].split('|')[0] - +y[0].split('|')[0]) || x[1] - y[1]).map((x: any) => x[0])
  return c
}
const norm = (b: any) => JSON.parse(JSON.stringify(b))

beforeEach(() => {
  if (CURWEEK !== W1) loadWeek(W1)
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  view.WARNOFF.clear()
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop()
  initStore()
})

function roundTrips(b: any, wk: string) {
  const rows = splitWeek(b, wk)
  expect(norm(joinWeek(rows, wk)), 'split then join gives the week back').toEqual(retained(b))
  expect(splitWeek(joinWeek(rows, wk), wk), 'join then split gives back the same bytes (F3-08)').toEqual(rows)
  return rows
}

describe('the row ids', () => {
  it('names the week row, a day row, an issuance and a retraction — an issuance tested before the # its version carries (F3-09)', () => {
    expect(parseRowId('13-07-2026')).toEqual({ week: '13-07-2026', kind: 'week' })
    expect(parseRowId('13-07-2026#3')).toEqual({ week: '13-07-2026', kind: 'day', di: 3 })
    expect(parseRowId('13-07-2026:is:2026-07-13#0~0')).toEqual({ week: '13-07-2026', kind: 'is', ver: '2026-07-13#0', n: 0 })
    expect(parseRowId('13-07-2026:rx:2026-07-14#2~1')).toEqual({ week: '13-07-2026', kind: 'rx', ver: '2026-07-14#2', n: 1 })
    expect(parseRowId('13-07-2026#9')).toBeNull()
    expect(parseRowId('13-07-2026:zz:x')).toBeNull()
    expect(parseRowId('13-07-2026:is:2026-07-13#0')).toBeNull()   // no ~n
  })
})

describe('a week split into rows and joined back', () => {
  it('the first demo week, as it boots', () => {
    const rows = roundTrips(blob(), W1)
    expect(Object.keys(rows)).toEqual(['', '#0', '#1', '#2', '#3', '#4', '#5', '#6'])
    expect(JSON.parse(rows[''])).toEqual({ v: RID_BOOK_VERSION, am: AMBOOK_VERSION })
  })

  it('the second demo week', () => {
    loadWeek(W2)
    roundTrips(blob(), W2)
  })

  it('a week published, amended, and with a second day published — every issuance its own row', () => {
    sign(0); commitSetDayApproved(0, true)
    txtSet('dn:0.0', 'AMENDED'); sign(0); commitPublishALDay(0)
    sign(2); commitSetDayApproved(2, true)
    const rows = roundTrips(blob(), W1)
    const o0 = SCHED.orig[0].id, al1 = dayCurVer(0), o2 = SCHED.orig[2].id
    expect(Object.keys(rows).filter(k => k.startsWith(':')), 'in the order of their day and sequence').toEqual([`:is:${o0}~0`, `:is:${al1}~0`, `:is:${o2}~0`])
    expect(JSON.parse(rows[`:is:${al1}~0`])).toEqual(norm(SCHED.als[0]))
    expect(JSON.parse(rows[`:is:${o0}~0`])).toEqual(norm(SCHED.orig[0]))
    // the day row carries the day's own slice of the book, and nothing of another day's
    const d0 = JSON.parse(rows['#0']), d1 = JSON.parse(rows['#1'])
    expect(d0.ok).toBe(1); expect(d0.cv).toBe(al1)
    expect(Object.keys(d0.c || {}).length).toBeGreaterThan(0)
    expect(d1.ok).toBeUndefined(); expect(d1.c).toBeUndefined()
  })

  it('an Unpublish ADDS a retraction and never touches the issuance row; a reissue is a new issuance, ~1 (R2-04)', () => {
    sign(0); commitSetDayApproved(0, true)
    txtSet('dn:0.0', 'AMENDED'); sign(0); commitPublishALDay(0)
    const al1 = dayCurVer(0)
    const before = splitWeek(blob(), W1)
    commitUnpublish(0)
    const after = roundTrips(blob(), W1)
    expect(after[`:is:${al1}~0`], 'the issuance row is byte-for-byte what it was').toBe(before[`:is:${al1}~0`])
    expect(JSON.parse(after[`:rx:${al1}~0`])).toMatchObject({ logged: false })
    txtSet('dn:0.0', 'CORRECTED'); sign(0); commitPublishALDay(0)
    const re = roundTrips(blob(), W1)
    expect(dayCurVer(0)).toBe(al1)                                   // the same label, reissued
    expect(re[`:is:${al1}~0`]).toBe(before[`:is:${al1}~0`])
    expect(re[`:rx:${al1}~0`]).toBe(after[`:rx:${al1}~0`])
    expect(JSON.parse(re[`:is:${al1}~1`]).snap.d.notes.map(noteText)).toContain('CORRECTED')
    expect(re[`:rx:${al1}~1`]).toBeUndefined()
  })

  it('an Original unpublished and published again', () => {
    sign(1); commitSetDayApproved(1, true)
    const o1 = SCHED.orig[1].id
    commitUnpublish(1)
    sign(1); commitSetDayApproved(1, true)
    const rows = roundTrips(blob(), W1)
    expect(Object.keys(rows).filter(k => k.startsWith(':')).sort()).toEqual([`:is:${o1}~0`, `:is:${o1}~1`, `:rx:${o1}~0`].sort())
  })

  it('the retired record keeps the issued record whole, so the issuance can always be told from it', () => {
    sign(0); commitSetDayApproved(0, true)
    txtSet('dn:0.0', 'AMENDED'); sign(0); commitPublishALDay(0)
    const al1 = dayCurVer(0)
    const live = norm(SCHED.als[0])
    commitUnpublish(0)
    expect(norm(SCHED.retired[`${al1}~1`].rec)).toEqual(live)
  })

  it('a day with saved plans', () => {
    draftDup(3); draftDup(3)
    expect(Object.keys(SCHED.drafts)).toContain('3')
    const rows = roundTrips(blob(), W1)
    expect(JSON.parse(rows['#3']).dr).toBeDefined()
    expect(JSON.parse(rows['#4']).dr).toBeUndefined()
  })

  it('a request taken off the programme — the "taken off" list is not stored; the request keeps its own mark (F3-02)', () => {
    const r = INPUTS.find((x: any) => isPersonal(x.type) && x.acc === 'g')
    expect(r, 'the demo week lands at least one request').toBeDefined()
    const di = DAYS.findIndex((d: any) => (d.ground || []).some((g: any) => g.src === inpId(r)))
    schedWrite(SCHED_TYPES.mutate, () => { unacceptInput(di, r) })
    const b = blob()
    expect(r.acc).toBe('r')
    const rows = roundTrips(b, W1)
    for (const k of Object.keys(rows)) expect(JSON.parse(rows[k]).un).toBeUndefined()
  })

  it('a muted warning rides the day it names', () => {
    view.WARNOFF.add('4|CREW_REST|ignite|x'); view.WARNOFF.add('0|DUP|bane|y')
    const rows = roundTrips(blob(), W1)
    expect(JSON.parse(rows['#4']).wo).toEqual(['4|CREW_REST|ignite|x'])
    expect(JSON.parse(rows['#0']).wo).toEqual(['0|DUP|bane|y'])
    expect(JSON.parse(rows['#1']).wo).toBeUndefined()
  })
})

describe('a key or field that names no single day fails loudly', () => {
  const bad = (f: (b: any) => void) => { const b = blob(); f(b); return () => splitWeek(b, W1) }
  it('a mark keyed to no day', () => expect(bad(b => { b.p = { 'zz:nope': 1 } })).toThrow(RowShapeError))
  it('a mark on a day that is not in the week', () => expect(bad(b => { b.c = { 'dn:9.0': 1 } })).toThrow(RowShapeError))
  it('a day-indexed map with a key that is no day', () => expect(bad(b => { b.ok = { x: 1 } })).toThrow(RowShapeError))
  it('a mute with no day', () => expect(bad(b => { b.wo = ['null|CODE||msg'] })).toThrow(RowShapeError))
  it('a field the split does not know', () => expect(bad(b => { b.zz = 1 })).toThrow(RowShapeError))
  it('a week that is not seven days', () => expect(bad(b => { b.d = b.d.slice(0, 6) })).toThrow(RowShapeError))
  it('an issued record with no version id', () => expect(bad(b => { b.o = { 0: { d: {}, c: {} } } })).toThrow(RowShapeError))
})

describe('rows missing on read', () => {
  it('seven day rows and no week row: the stamps read CURRENT, so the week stays editable, ids intact', () => {
    const rows = splitWeek(blob(), W1)
    delete rows['']
    const j = joinWeek(rows, W1)
    expect(j.v).toBe(RID_BOOK_VERSION); expect(j.am).toBe(AMBOOK_VERSION)
    expect(j.d.map((d: any) => (d.waves || []).map((w: any) => w.rid))).toEqual(DAYS.map((d: any) => (d.waves || []).map((w: any) => w.rid)))
  })

  /* a week's first save writes only the days it changed (the group-wide walk's finding H3, 30 Sep 26), so a day no one
     has saved has no row: it reads as the week UNTOUCHED — the authored demo day here (the demo policy), a blank day on a
     shared store (weekBundle) — never as a blank day in a week that has content */
  it('a missing day row reads as that day untouched — the authored day under the demo policy, blank on a shared store', () => {
    const rows = splitWeek(blob(), W1)
    delete rows['#5']
    expect(joinWeek(rows, W1).d[5]).toEqual(weekBundle(W1).days[5])
    expect(weekBundle(W1).days[5]).not.toEqual(emptyWeek(W1).days[5])
    setAuthoredWeeks(false)
    try { expect(joinWeek(rows, W1).d[5]).toEqual(emptyWeek(W1).days[5]) } finally { setAuthoredWeeks(true) }
  })

  it('a row that will not parse fails the join (the reader keeps that week read-only)', () => {
    const rows = splitWeek(blob(), W1)
    rows['#2'] = '{"d":'
    expect(() => joinWeek(rows, W1)).toThrow()
  })
})
