// @vitest-environment jsdom
/* [INSIGHTS-WHICH-COPY] (owner D477, D478, 1 Oct 26; rule IN1) — WHICH SCHEDULE THE INSIGHTS WINDOW COUNTS.
   "It should show the latest copy, so if working copy is the only copy then it will use that, unless its published then
   use Original, if theres an AL1 then use AL1 etc." Day by day: a published day is counted as its LATEST PUBLISHED
   version, a day not yet published as the working copy. Changes waiting on a published day — a hidden warning, a seat,
   a cancelled formation, a leave filed since — move NOTHING in the window until they go out; then every figure moves
   together. One rule on every page (Edit Schedule included), and for every figure: the four tiles, the flying load,
   the work hours, who is not flying, conflicts by type, by day. A hidden warning is not counted (D472), by the hides
   that version went out with (D477: "4 issues and 1 is hidden then 3 issues will show").
   Before this build the window worked every number out from the working copy on every page (found by Astra's scenario
   design for [WARN-HIDE-KEPT], its scenario 1).
   Driven through the doors the screens call (latepub.test.tsx's harness): publishing through setDayApproved /
   publishALDay, the hide through the ✕'s own write, the leave through the Inputs page's commitNewInput. */
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { setSlotVal } from '../engine/slots'
import { isStandalone } from '../engine/waves'
import { SCHED, signOf, setDayApproved, publishALDay, dayShownPendCount, dayCurVer } from '../engine/publish'
import { validate, workingWarn } from '../engine/validate'
import { computeInsights } from '../engine/insights'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, DPREV, VWORK, WARNOFF, warnMuteKey, toggleWarnOff, setUnpubArm, setRestArm } from '../state/view'
import { dayIssuedHTML } from './html'
import { insightsHTML } from './Modals'
import { commitNewInput } from './inputedit'

const TUE = 1, WED = 2, TUE_ISO = '2026-07-14'
let pristine: any[], inputs0: string
const FOUR: Array<[string, string]> = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]
const sign = (di: number) => { const g = signOf(di); for (const [r, w] of FOUR) (g as any)[r] = w }
const publishDay = (di: number) => { sign(di); setDayApproved(di, true); validate() }
const amend = (di: number) => { sign(di); publishALDay(di); validate() }
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const warns = (di: number) => (workingWarn().byDay[di] || {}).warns || []
const leaveDraft = (person: string, iso: string, remarks: string) =>
  ({ person, type: 'LL', allday: true, half: '', start: iso, end: '', sTime: '06:00', eTime: '18:00', remarks, sans: null, docIds: [] })
/* everything the window shows, as plain data — so "nothing moved" is one comparison */
const figures = () => JSON.parse(JSON.stringify(computeInsights()))
/* the number View-only Sched prints on a published day's own bar */
const faceIssues = (di: number) => {
  setPage('viewsched')
  try { const m = (el(dayIssuedHTML(di)).textContent || '').match(/⚠\s*(\d+)\s+issue/); return m ? +m[1]! : 0 }
  finally { setPage('editsched') }
}
/* the first crewed seat of a day's ordinary flying, and its formation */
function firstFlown(di: number) {
  const d: any = DAYS[di]
  for (let gi = 0; gi < d.waves.length; gi++) {
    const w = d.waves[gi]; if (isStandalone(w)) continue
    for (let li = 0; li < w.formations.length; li++) {
      const f = w.formations[li]; if (f.cx) continue
      for (let ai = 0; ai < f.aircraft.length; ai++) {
        const a = f.aircraft[ai]; if (!a.cx && a.p) return { key: `${di}.${gi}.${li}.${ai}.p`, id: a.p as string, f }
      }
    }
  }
  throw new Error('no crewed flying seat on day ' + di)
}

beforeAll(() => {
  initStore()
  setSession({ user: 'ad', role: 'admin' } as any)
  pristine = JSON.parse(JSON.stringify(DAYS))
  inputs0 = JSON.stringify(INPUTS)
})
const reset = () => {
  DAYS.length = 0; JSON.parse(JSON.stringify(pristine)).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  DPREV.clear(); VWORK.clear(); WARNOFF.clear()
  setUnpubArm(null); setRestArm(null, null)
  setPage('editsched')
  validate()
}
beforeEach(reset)
afterAll(reset)

describe('IN1 (D478) — a published day is counted as published; what waits on it moves nothing until it goes out', () => {
  it('a hide, a seat, a cancelled formation and a leave waiting on published Tuesday: every figure stays, on both pages — then all move with the amendment', () => {
    publishDay(TUE)
    const before = figures()
    expect(before.dayStats[TUE].warns, 'the window and the published day\'s own bar agree to begin with').toBe(faceIssues(TUE))
    expect(before.dayStats[TUE].warns).toBeGreaterThan(0)

    /* 1 — a warning hidden on the published day (D471: it waits) */
    const long = warns(TUE).find((w: any) => w.code === 'LONGDAY')
    expect(long, 'the demo Tuesday carries a long work day').toBeTruthy()
    toggleWarnOff(warnMuteKey(long)); validate()
    /* 2 — a man taken off a flying seat */
    const seat = firstFlown(TUE)
    setSlotVal(seat.key, ''); validate()
    /* 3 — a formation cancelled */
    seat.f.cx = true; validate()
    /* 4 — a leave filed for a man who is on the programme that day */
    const other = Object.keys(before.hours.reduce((m: any, h: any) => (m[h.id] = 1, m), {})).find(id => id !== seat.id && PEOPLE[id] && !PEOPLE[id].pers)!
    expect(commitNewInput(leaveDraft(other, TUE_ISO, 'FILED AFTER PUBLISHING'))).toBe(true)
    validate()
    expect(dayShownPendCount(TUE), 'all of it is waiting to go out').toBeGreaterThan(0)

    for (const page of ['viewsched', 'editsched']) {
      setPage(page)
      expect(figures(), `on ${page}: nothing in the window has moved`).toEqual(before)
    }
    /* a published day switched to its working draft on View-only Sched is still counted as published (D478 over D477) */
    setPage('viewsched'); VWORK.add(TUE)
    expect(figures(), 'switched to "working draft": still the published day').toEqual(before)
    VWORK.clear(); setPage('editsched')
    expect(figures().dayStats[TUE].warns, 'and it still agrees with the published day\'s bar').toBe(faceIssues(TUE))

    /* the amendment goes out: every figure moves together, to what the day now is */
    amend(TUE)
    expect(dayShownPendCount(TUE)).toBe(0)
    const after = figures()
    expect(after.dayStats[TUE].forms, 'the cancelled formation is gone from the count').toBe(before.dayStats[TUE].forms - 1)
    expect(after.forms).toBe(before.forms - 1)
    expect(after.sorties).toBeLessThan(before.sorties)
    expect(after.dayStats[TUE].ac).toBeLessThan(before.dayStats[TUE].ac)
    const n = (I: any, id: string) => (I.flyers.find((x: any) => x.id === id) || { n: 0 }).n
    expect(n(after, seat.id), 'the man taken off flies one fewer').toBe(n(before, seat.id) - 1)
    const mins = (I: any, id: string) => (I.hours.find((x: any) => x.id === id) || { mins: 0 }).mins
    expect(mins(after, seat.id), 'and works fewer hours').toBeLessThan(mins(before, seat.id))
    expect(after.byType.LONGDAY || 0, 'the hidden warning is out of "by type"').toBeLessThan(before.byType.LONGDAY)
    expect(after.dayStats[TUE].warns, 'and the day agrees with its own bar again').toBe(faceIssues(TUE))
  })

  it('a hide alone (D477): 4 issues with 1 hidden read 3 — but only once the amendment is out', () => {
    publishDay(TUE)
    const n0 = figures().dayStats[TUE].warns, total0 = figures().issues
    toggleWarnOff(warnMuteKey(warns(TUE).find((w: any) => w.code === 'LONGDAY'))); validate()
    expect(figures().dayStats[TUE].warns, 'waiting: the published day still shows it, so it is still counted').toBe(n0)
    expect(figures().issues).toBe(total0)
    amend(TUE)
    expect(figures().dayStats[TUE].warns, 'out: one fewer').toBe(n0 - 1)
    expect(figures().issues).toBe(total0 - 1)
    expect(dayCurVer(TUE), 'as AL1').not.toBeNull()
  })

  it('a day NOT yet published moves at once — beside a published one that does not', () => {
    publishDay(TUE)
    const before = figures()
    const tue = firstFlown(TUE), wed = firstFlown(WED)
    setSlotVal(tue.key, ''); setSlotVal(wed.key, ''); validate()
    wed.f.cx = true; validate()
    const now = figures()
    expect(now.dayStats[TUE], 'published Tuesday: as it went out').toEqual(before.dayStats[TUE])
    expect(now.dayStats[WED].forms, 'draft Wednesday: counted as it stands').toBe(before.dayStats[WED].forms - 1)
    expect(now.forms).toBe(before.forms - 1)
    /* a hide on the draft day is counted at once too (it is the only copy) */
    const w = warns(WED)[0]
    if (w) {
      const n = figures().dayStats[WED].warns
      toggleWarnOff(warnMuteKey(w)); validate()
      expect(figures().dayStats[WED].warns).toBe(n - 1)
    }
  })

  it('with nothing published the window counts the working copy, as it always has', () => {
    const before = figures()
    const s = firstFlown(TUE)
    setSlotVal(s.key, ''); validate()
    const n = (I: any, id: string) => (I.flyers.find((x: any) => x.id === id) || { n: 0 }).n
    expect(n(figures(), s.id)).toBe(n(before, s.id) - 1)
  })
})

describe('the window itself — its tiles read the same count as its lists', () => {
  it('the issues tile is the sum of "By day", and neither moves for a hide waiting on a published day', () => {
    publishDay(TUE)
    const tile = () => +(el(insightsHTML()).querySelectorAll('.itile .n')[3]!.textContent || 'x')
    const sum = () => computeInsights().dayStats.reduce((a: number, s: any) => a + s.warns, 0)
    const t0 = tile()
    expect(t0).toBe(sum())
    toggleWarnOff(warnMuteKey(warns(TUE).find((w: any) => w.code === 'LONGDAY'))); validate()
    for (const page of ['viewsched', 'editsched', 'inputs']) {
      setPage(page)
      expect(tile(), `the tile on ${page}`).toBe(t0)
      expect(sum()).toBe(t0)
    }
    setPage('editsched')
    amend(TUE)
    expect(tile()).toBe(t0 - 1)
    expect(sum()).toBe(t0 - 1)
  })
})
