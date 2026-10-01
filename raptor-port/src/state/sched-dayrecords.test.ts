// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 1.4 (plan §2.9; data-model.md §3 "the same grain above the store") — THE SCHEDULE'S
   CHANGE RECORDS FOLLOW THE STORAGE GRAIN. A day's content, its slice of the book (marks, sign-offs, plans, the
   publish state) and its muted warnings are each ONE record per day; the week keeps only its two format stamps; every
   issued version is its own record, written once, and an Unpublish adds a retraction record beside it. So an Undo step
   names days, and another person's change on another day never blocks it (D148). Checked at the ENVELOPE — what the
   command layer says changed — not only in storage. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, dayCurVer, dayApproved } from '../engine/publish'
import { txtGet, txtSet } from '../engine/slots'
import { CURWEEK } from '../engine/waves'
import { initStore, writeText, loadWeek } from './store'
import {
  commitSetDayApproved, commitPublishALDay, commitUnpublish, schedStore, schedWrite, schedWriteValue, SCHED_TYPES,
  schedApplyEnd,
} from './sched-commit'
import { histSnap } from './history'
import { setSession } from './auth'
import * as view from './view'
import { onCommit, type CommitEnvelope } from '../command'
import { commitAs } from '../command/commit'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { _resetDisclosure } from './disclosure'
import { joinParts } from './weekrows'
import { stashClear } from '../engine/weekstash'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const W1 = '13/07/2026', W2 = '20/07/2026'
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const ids = (e: CommitEnvelope) => e.changes.map(c => `${c.op} ${c.collection}/${c.id}`).sort()
const colls = (e: CommitEnvelope) => [...new Set(e.changes.map(c => c.collection))].sort()

let caught: CommitEnvelope[] = []
let unsub: () => void
beforeEach(() => {
  if (CURWEEK !== W1) loadWeek(W1)
  stashClear()
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  view.WARNOFF.clear()
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop()
  initStore()
  _resetDisclosure()
  _resetTimeline()
  installGlobalUndo()
  caught = []
  unsub = onCommit(e => caught.push(e))
})
afterEach(() => { unsub(); _resetTimeline() })

const last = () => caught[caught.length - 1]
const wk = () => CURWEEK

describe('the records one command changes', () => {
  it('a Monday edit changes Monday alone — its day and its book slice, nothing of Tuesday, not the week', () => {
    writeText('dn:0.0', 'MONDAY')
    expect(ids(last())).toEqual([`put days/${wk()}#0`, `put sched.book/${wk()}#0`])
  })

  it('a sign-off on Tuesday changes Tuesday\'s book slice alone', () => {
    schedWrite(SCHED_TYPES.sign, () => { signOf(1).cur = 'ignite' })
    expect(ids(last())).toEqual([`put sched.book/${wk()}#1`])
  })

  it('a muted warning on Friday changes Friday\'s mutes alone', () => {
    schedWriteValue(SCHED_TYPES.warnMute, () => view.toggleWarnOff('4|CREW_REST|ignite|msg'))
    expect(ids(last())).toEqual([`put sched.mutes/${wk()}#4`])
  })

  /* the group-A final read (Fable F4, 30 Sep 26): a command that would leave the loaded week unable to split into its rows
     (a mute naming no day — or a new field with no home in weekrows.ts) is REFUSED and rolled back, never "saved" with
     nothing stored */
  it('a change that would leave the week unable to split into rows is refused, and nothing changes', () => {
    const before = histSnap()
    const n = caught.length
    const r = schedWriteValue(SCHED_TYPES.warnMute, () => view.toggleWarnOff('x|NO_DAY|nobody|msg'))
    expect(r, 'refused').toBeFalsy()
    expect(histSnap(), 'rolled back').toBe(before)
    expect(caught.length, 'no change recorded').toBe(n)
  })

  it('every record is keyed by day or version — none names the whole week but its stamps', () => {
    const keys = [...schedStore.records().keys()].filter(k => !k.startsWith('inputs/') && !k.startsWith('plan/'))
    const week = keys.filter(k => !/#[0-6]$/.test(k) && !/:[^:]+~\d+$/.test(k))
    expect(week).toEqual([`sched.week/${wk()}`])
    expect(keys.filter(k => k.startsWith('sched.book/')).length).toBe(7)
    expect(keys.filter(k => k.startsWith('sched.mutes/')).length).toBe(7)
  })
})

describe('publishing, at the envelope', () => {
  it('a first publish writes ONE issuance (the Original, ~0) and the day\'s book — no week-wide record', () => {
    sign(0); commitSetDayApproved(0, true)
    const o = SCHED.orig[0].id
    expect(colls(last())).toEqual(['days', 'sched.book', 'sched.issuance'].filter(c => last().changes.some(x => x.collection === c)))
    expect(last().changes.find(c => c.collection === 'sched.issuance')).toMatchObject({ op: 'put', id: `${wk()}:${o}~0` })
    expect(last().changes.find(c => c.collection === 'sched.issuance')!.before).toBeUndefined()
    expect(last().changes.every(c => !c.id.includes('#') || c.id.endsWith('#0') || c.collection === 'sched.issuance')).toBe(true)
  })

  it('an amendment is a new issuance; an Unpublish adds a retraction and never touches the issuance; a reissue is ~1', () => {
    sign(0); commitSetDayApproved(0, true)
    writeText('dn:0.0', 'AMENDED'); sign(0); commitPublishALDay(0)
    const al1 = dayCurVer(0)
    expect(last().changes.filter(c => c.collection === 'sched.issuance').map(c => `${c.op} ${c.id}`)).toEqual([`put ${wk()}:${al1}~0`])
    commitUnpublish(0)
    const un = last()
    expect(un.type).toBe('sched.unpublish')
    expect(un.changes.filter(c => c.collection === 'sched.issuance')).toEqual([])
    expect(un.changes.filter(c => c.collection === 'sched.retraction').map(c => `${c.op} ${c.id}`)).toEqual([`put ${wk()}:${al1}~0`])
    writeText('dn:0.0', 'CORRECTED'); sign(0); commitPublishALDay(0)
    expect(last().changes.filter(c => c.collection === 'sched.issuance').map(c => `${c.op} ${c.id}`)).toEqual([`put ${wk()}:${al1}~1`])
  })

  it('Undo and Redo of a publish, an amendment and an Unpublish — each at the envelope', () => {
    sign(0); commitSetDayApproved(0, true)
    const o = SCHED.orig[0].id
    writeText('dn:0.0', 'AMENDED'); sign(0); commitPublishALDay(0)
    const al1 = dayCurVer(0)
    commitUnpublish(0)
    expect(globalUndo().ok, 'undo the Unpublish').toBe(true)
    expect(last().changes.filter(c => c.collection === 'sched.retraction').map(c => `${c.op} ${c.id}`)).toEqual([`delete ${wk()}:${al1}~0`])
    expect(dayCurVer(0)).toBe(al1)
    expect(globalRedo().ok, 'redo it').toBe(true)
    expect(last().changes.filter(c => c.collection === 'sched.retraction').map(c => `${c.op} ${c.id}`)).toEqual([`put ${wk()}:${al1}~0`])
    expect(dayCurVer(0)).toBe(o)
    expect(globalUndo().ok).toBe(true)                              // the Unpublish again
    expect(globalUndo().ok, 'undo the AL').toBe(true)
    expect(last().changes.filter(c => c.collection === 'sched.issuance').map(c => `${c.op} ${c.id}`)).toEqual([`delete ${wk()}:${al1}~0`])
    expect(dayCurVer(0)).toBe(o)
    expect(globalUndo().ok).toBe(true)                              // the amending edit
    expect(globalUndo().ok, 'undo the first publish').toBe(true)
    expect(last().changes.filter(c => c.collection === 'sched.issuance').map(c => `${c.op} ${c.id}`)).toEqual([`delete ${wk()}:${o}~0`])
    expect(dayApproved(0)).toBe(false)
    expect(globalRedo().ok, 'redo the first publish').toBe(true)
    expect(last().changes.filter(c => c.collection === 'sched.issuance').map(c => `${c.op} ${c.id}`)).toEqual([`put ${wk()}:${o}~0`])
    expect(dayApproved(0)).toBe(true)
  })
})

describe('another person\'s change on another day never blocks his Undo (D148)', () => {
  /* someone else's change, arriving from the shared store (a remote envelope, never his step) */
  function remoteTuesday() {
    const r = commitAs({
      type: SCHED_TYPES.text, scope: { module: 'sched', weekId: CURWEEK },
      apply: (txn) => { txn.enlist(schedStore); txtSet('dn:1.0', 'HAWK TUESDAY'); schedApplyEnd() },
    }, { actor: { id: 'hawk', role: 'admin', personId: 'hawk', session: null }, origin: 'remote' })
    expect((r as any).ok).toBe(true)
  }

  it('his Monday edit undoes after a remote Tuesday edit of the same week', () => {
    writeText('dn:0.0', 'MINE MONDAY')
    remoteTuesday()
    const u = globalUndo()
    expect(u.ok, u.reason).toBe(true)
    expect(txtGet('dn:0.0')).not.toBe('MINE MONDAY')
    expect(txtGet('dn:1.0')).toBe('HAWK TUESDAY')
  })

  it('…and after he left the week and came back', () => {
    writeText('dn:0.0', 'MINE MONDAY')
    remoteTuesday()
    loadWeek(W2); loadWeek(W1)
    const u = globalUndo()
    expect(u.ok, u.reason).toBe(true)
    expect(txtGet('dn:0.0')).not.toBe('MINE MONDAY')
    expect(txtGet('dn:1.0')).toBe('HAWK TUESDAY')
  })
})

/* [WARN-HIDE-KEPT] (D469 — "until another person unhides it"; D148): a day's hides are ONE record, so another person's
   hide or flag-again on the SAME day since his own is "someone has changed the same thing" — his Undo refuses and says
   who; one on ANOTHER day never blocks it. The walk could not reach this through the app's doors (this build has no
   server: a second tab learns nothing until its reload, the known two-tabs gap of data-schema.md), so it is pinned here
   with the same remote envelope the test above uses. */
describe('Undo of a hide, after another person changed that day\'s hides (D148, WH11)', () => {
  const hide = (key: string) => schedWriteValue(SCHED_TYPES.warnMute, () => view.toggleWarnOff(key))
  function remoteHide(key: string) {
    const r = commitAs({
      type: SCHED_TYPES.warnMute, scope: { module: 'sched', weekId: CURWEEK },
      apply: (txn) => { txn.enlist(schedStore); view.WARNOFF.add(key); schedApplyEnd() },
    }, { actor: { id: 'wolf', role: 'admin', personId: 'wolf', session: null }, origin: 'remote' })   // Static, a man on the roster
    expect((r as any).ok).toBe(true)
  }

  it('the same day: his Undo refuses and names who; both hides stand', () => {
    hide('1|X|a|mine')
    expect(ids(last())).toEqual([`put sched.mutes/${wk()}#1`])
    remoteHide('1|Y|b|his')
    const u = globalUndo()
    expect(u.ok, 'refused').toBe(false)
    expect(String(u.reason || ''), 'and it says who — never a bare "cannot undo"').toMatch(/^Static changed this after your action/)
    expect([...view.WARNOFF].sort(), 'nothing was taken back').toEqual(['1|X|a|mine', '1|Y|b|his'])
  })

  it('another day: his Undo goes through and leaves the other man\'s hide alone', () => {
    hide('1|X|a|mine')
    remoteHide('2|Y|b|his')
    const u = globalUndo()
    expect(u.ok, u.reason).toBe(true)
    expect([...view.WARNOFF]).toEqual(['2|Y|b|his'])
  })
})

describe('completeness — the stream rebuilds the week (§7 / R4-004)', () => {
  it('folding every change onto the records before gives the live week back, byte for byte', () => {
    const base = new Map<string, any>()
    for (const [k, e] of schedStore.records()) base.set(k, JSON.parse(JSON.stringify(e.value)))
    sign(0); commitSetDayApproved(0, true)
    writeText('dn:0.0', 'AMENDED NOTE'); sign(0); commitPublishALDay(0)
    commitUnpublish(0)
    writeText('dn:0.0', 'AGAIN'); sign(0); commitPublishALDay(0)
    schedWriteValue(SCHED_TYPES.warnMute, () => view.toggleWarnOff('2|X|y|z'))
    for (const env of caught) for (const c of env.changes) {
      const k = `${c.collection}/${c.id}`
      if (c.op === 'delete') base.delete(k); else base.set(k, c.after)
    }
    const w = CURWEEK
    const days = [0, 1, 2, 3, 4, 5, 6].map(di => ({ d: base.get(`days/${w}#${di}`), book: base.get(`sched.book/${w}#${di}`), wo: base.get(`sched.mutes/${w}#${di}`) }))
    const is: Array<[string, any]> = [], rx: Array<[string, any]> = []
    for (const [k, v] of base) {
      if (k.startsWith('sched.issuance/')) is.push([k.slice(k.indexOf(':') + 1), v])
      if (k.startsWith('sched.retraction/')) rx.push([k.slice(k.indexOf(':') + 1), v])
    }
    const week = joinParts({ week: base.get(`sched.week/${w}`), days, is, rx }, w)
    const live = JSON.parse(histSnap())
    const norm = (x: any) => JSON.parse(JSON.stringify(x))
    for (const f of ['d', 'c', 'p', 'ad', 'ok', 'sg', 'sb', 'o', 'cv', 'dr', 'cd', 'v', 'am', 'rt', 'cr']) expect(norm(week[f]), f).toEqual(norm(live[f]))
    expect(norm(week.a)).toEqual(norm(live.a))
    expect([...week.wo].sort()).toEqual([...live.wo].sort())
  })
})
