// @vitest-environment jsdom
/* A REQUEST'S ROW AND ITS FILING ON A PUBLISHED DAY (25 Sep 26) — the owner's two answers on D114's look card, built on
   their own branch before accounts (D175's order):
     · D174 ("1. Yes") — a request that was not there when the day was published, filed since and then taken off, is no
       pending change: the day reads 0, the request stays silenced (26 Aug 26), and the four sign-offs hold (D103, AM11).
     · D175 ("2. Ok") — a load or a plan switch never puts a request on a second day: it leaves that row out and says so.
   Pinned through the production functions the screens call (acceptInput / autoAcceptInput / unacceptInput / the load /
   the switch), and through the screens' own counts. The backlog items: OUTSTANDING.md [REQ-DECLINED-PENDING] and
   [REQ-TWO-ROWS]; the reads that found them: docs/handpass/2026-09-25-d114-fable-read.md O1, -astra-read.md Finding 2. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, inpId } from '../engine/inputs'
import { acceptInput, autoAcceptInput, unacceptInput } from '../engine/slots'
import { loadVersionToWorkingCopy, draftDup, draftSelect, dayDrafts, ROWSLEFT, rowsLeftSaid } from '../engine/drafts'
import { SCHED, signOf, setSign, setDayApproved, dayDelta, dayDiscardCount, dayShownPendCount, dayCurVer, daySigned, notYetSigned, dayHasChanges } from '../engine/publish'
import { validate } from '../engine/validate'
import { HOOKS } from '../engine/hooks'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, DPREV, VWORK, setUnpubArm, setRestArm } from '../state/view'
import { dayHTML, dayInfoHTML } from './html'
import { PEOPLE } from '../engine/people'
import { boardSignHTML, switchDraft } from './board'
import { pendListHTML } from './pendlist'

const MON = 0, TUE = 1
let pristine: any[], inputs0: string
const FOUR: Array<[string, string]> = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]
const sign = (di: number) => { const g = signOf(di); for (const [r, w] of FOUR) (g as any)[r] = w }
const publishDay = (di: number) => { sign(di); setDayApproved(di, true) }
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const weekEdit = (di: number) => { setPage('editsched'); return el(dayHTML(di, true, true)) }
const boardStrip = (di: number) => { setPage('editsched'); return el(boardSignHTML(di)) }
const num = (t: string | null | undefined) => { const m = String(t || '').match(/\d+/); return m ? +m[0] : 0 }
const withToasts = (fn: () => void) => {
  const said: string[] = []
  const real = HOOKS.toast
  HOOKS.toast = (m: any) => { said.push(String(m)) }
  try { fn() } finally { HOOKS.toast = real }
  return said
}
/* a Meeting for Bane — one day, or Monday and Tuesday */
const request = (two = false): any => {
  const inp: any = { person: 'bane', date: 'Jul 13', allday: true, type: 'Meeting', remarks: 'req one row', mod: '2026-07-01' }
  if (two) inp.endDate = 'Jul 14'
  INPUTS.push(inp); return inp
}
/* every loaded day carrying a row for this request — one request, one row */
const rowsOf = (inp: any) => DAYS.flatMap((d: any, di: number) => ((d && d.ground) || []).filter((r: any) => r && r.src === inpId(inp)).map(() => di))
/* the day's count as each surface reads it */
const counts = (di: number) => ({
  engine: dayShownPendCount(di),
  week: num(weekEdit(di).querySelector('.dpend')?.textContent),
  board: num(boardStrip(di).querySelector('.dpend')?.textContent),
  info: num(el(dayInfoHTML(di)).querySelector('.dip-pend')?.textContent),
  list: el(pendListHTML(di)).querySelectorAll('.pl-item').length,
})

beforeAll(() => {
  initStore()
  setSession({ user: 'ad', role: 'admin' } as any)
  pristine = JSON.parse(JSON.stringify(DAYS))
  inputs0 = JSON.stringify(INPUTS)
})
beforeEach(() => {
  DAYS.length = 0; JSON.parse(JSON.stringify(pristine)).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  DPREV.clear(); VWORK.clear()
  setUnpubArm(null); setRestArm(null, null)
  setPage('editsched')
  validate()
})

describe('D174 — a request not there when the day was published, filed since and taken off, is no pending change', () => {
  it('filed live on a published Monday (it lands as pending), then ✕: every count reads 0, and the request stays silenced', () => {
    publishDay(MON)
    const inp = request()
    expect(autoAcceptInput(inp, true), 'the live filing lands it on the working copy (16 Sep 26)').toBe(true)
    expect(counts(MON), 'filed: one change waiting').toEqual({ engine: 1, week: 1, board: 1, info: 1, list: 1 })
    unacceptInput(MON, inp)
    expect(inp.acc, 'taken off — dormant, flags nothing (26 Aug 26), unchanged').toBe('r')
    expect(dayDelta(MON), 'nothing differs from what was published').toEqual([])
    expect(counts(MON), 'back to what was published: 0 everywhere (D98)').toEqual({ engine: 0, week: 0, board: 0, info: 0, list: 0 })
    expect(dayHasChanges(MON), 'no AL is offered').toBe(false)
    expect(notYetSigned(MON), 'and no working-copy marker').toBe(false)
    expect(weekEdit(MON).querySelector('.nysmark'), 'on the week').toBeNull()
  })
  it('the four sign-offs fall when it is filed and come back when it is taken off (D103, AM11)', () => {
    publishDay(MON)
    for (const [r, w] of FOUR) setSign(MON, r, w)
    expect(daySigned(MON), 'signed with nothing waiting').toBe(true)
    const inp = request()
    autoAcceptInput(inp, true)
    expect(daySigned(MON), 'a change waiting wipes them (D103)').toBe(false)
    unacceptInput(MON, inp)
    expect(daySigned(MON), 'put back: the four hold again (AM11)').toBe(true)
  })
  it('filed under Unavailable instead, then taken back out: 0 too — and the four hold (Fable S8)', () => {
    publishDay(MON)
    for (const [r, w] of FOUR) setSign(MON, r, w)
    const inp = request()
    expect(acceptInput(MON, inp, 'u')).toBe(true)
    expect(dayShownPendCount(MON)).toBe(1)
    expect(daySigned(MON), 'filed: the four fall').toBe(false)
    unacceptInput(MON, inp)
    expect(inp.acc).toBe('r')
    expect(dayShownPendCount(MON)).toBe(0)
    expect(daySigned(MON), 'taken back out: they hold again').toBe(true)
  })
  it('a two-day request filed after both days were published, then ✕: Monday and Tuesday both read 0', () => {
    publishDay(MON); publishDay(TUE)
    const inp = request(true)
    autoAcceptInput(inp, true)
    expect(rowsOf(inp)).toEqual([MON])
    unacceptInput(MON, inp)
    expect(dayShownPendCount(MON), 'Monday').toBe(0)
    expect(dayShownPendCount(TUE), 'Tuesday — its published face never had it either').toBe(0)
  })
  /* Fable's code read F1 (25 Sep 26), checked and NOT taken: an accepted request still SPEAKS on every other day it
     covers — the man's hours close there, the crew picker and the warnings read it (events.ts inpShow: "every other
     covered day keeps the input's voice"). Published without it, that day's face reads it dormant (world.ts fileAcc),
     so while it stands on another day's programme it IS a difference on this one — only a dormant request (✕) is not.
     Pinned, so D174's rule cannot swallow it (bug-check order §8.7). */
  it('a request filed since that stands on ANOTHER day still counts on this one — it speaks here; only ✕ silences it', () => {
    publishDay(MON); publishDay(TUE)
    for (const di of [MON, TUE]) for (const [r, w] of FOUR) setSign(di, r, w)
    const inp = request(true)
    autoAcceptInput(inp, true)
    expect(rowsOf(inp)).toEqual([MON])
    expect([dayShownPendCount(MON), dayShownPendCount(TUE)], 'its row on Monday; its voice on Tuesday').toEqual([1, 1])
    expect(daySigned(TUE), "Tuesday's four fall with it").toBe(false)
    unacceptInput(MON, inp)
    expect([dayShownPendCount(MON), dayShownPendCount(TUE)], 'taken off: silent on both (D174)').toEqual([0, 0])
    expect([daySigned(MON), daySigned(TUE)]).toEqual([true, true])
    expect(acceptInput(TUE, inp, 'g')).toBe(true)
    expect([dayShownPendCount(MON), dayShownPendCount(TUE)], 'its voice on Monday; its row on Tuesday').toEqual([1, 1])
    expect(loadVersionToWorkingCopy(MON, dayCurVer(MON))).toBe(true)
    expect(rowsOf(inp), 'the load never moves it').toEqual([TUE])
  })
  /* the half the ruling leaves as it is (bug-check order §8.7): pinned so the change cannot absorb it */
  it('unchanged: a request that WAS there when published — waiting, or on the programme — still counts one taken off', () => {
    const fresh = request()                         // there when published, not yet actioned: the issued face shows it
    publishDay(MON)
    acceptInput(MON, fresh, 'g'); unacceptInput(MON, fresh)
    expect(dayShownPendCount(MON), 'fresh when published, taken off since').toBe(1)
    expect(dayDelta(MON).map(e => [e.kind, e.from, e.to])).toEqual([['input', '', 'r']])
  })
  it('unchanged: on the programme when published, ✕ on its row — one change (D114)', () => {
    const inp = request()
    acceptInput(MON, inp, 'g'); publishDay(MON)
    unacceptInput(MON, inp)
    expect(dayShownPendCount(MON)).toBe(1)
  })
  it('"Load onto working copy" leaves such a request silenced — it never brings it back as a fresh one that flags', () => {
    publishDay(MON)
    const inp = request()
    autoAcceptInput(inp, true); unacceptInput(MON, inp)
    expect(dayDiscardCount(MON), 'nothing to discard: the day is as published').toBe(0)
    expect(loadVersionToWorkingCopy(MON, dayCurVer(MON))).toBe(true)
    expect(inp.acc, 'still taken off — not fresh again').toBe('r')
    expect(dayShownPendCount(MON)).toBe(0)
  })
})

describe('D176 — a request "taken off" when the day was published, and since deleted or re-dated off the day, is no change', () => {
  /* taken off before Monday is published: its record holds it "taken off" (dormant — the published face shows nothing) */
  const declined = () => {
    const inp = request()
    acceptInput(MON, inp, 'g'); unacceptInput(MON, inp)
    expect(inp.acc).toBe('r')
    publishDay(MON)
    for (const [r, w] of FOUR) setSign(MON, r, w)
    expect([dayShownPendCount(MON), daySigned(MON)]).toEqual([0, true])
    return inp
  }
  it('deleted on the Inputs page: 0 on every count, and the four hold', async () => {
    const { removeInput } = await import('./inputedit')
    const inp = declined()
    expect(removeInput(inp)).toBe(true)
    expect(dayDelta(MON), 'nothing differs from what was published').toEqual([])
    expect(counts(MON)).toEqual({ engine: 0, week: 0, board: 0, info: 0, list: 0 })
    expect(daySigned(MON), 'the four hold').toBe(true)
  })
  it('re-dated off the day (to Wednesday, not published): Monday reads 0 and keeps its four', async () => {
    const { commitInputEdit, draftOf } = await import('./inputedit')
    const inp = declined()
    const d: any = draftOf(inp); d.start = '2026-07-15'; d.end = ''
    expect(commitInputEdit(inp, d)).toBe(true)
    expect(dayShownPendCount(MON)).toBe(0)
    expect(daySigned(MON)).toBe(true)
  })
  /* the other doors a dormant request can leave the day by (Fable's D176 read, "tests worth pinning") */
  it('a two-day dormant request shortened off Tuesday, re-dated onto another published day, or re-assigned: 0 on each day, the four hold', async () => {
    const { commitInputEdit, draftOf, reassignInput } = await import('./inputedit')
    const two = request(true)
    acceptInput(MON, two, 'g'); unacceptInput(MON, two)
    const one = request(); one.remarks = 'req one row B'
    acceptInput(MON, one, 'g'); unacceptInput(MON, one)
    const who = request(); who.remarks = 'req one row C'
    acceptInput(MON, who, 'g'); unacceptInput(MON, who)
    for (const di of [MON, TUE, 2]) { publishDay(di); for (const [r, w] of FOUR) setSign(di, r, w) }
    const d1: any = draftOf(two); d1.end = ''                              // Mon–Tue → Mon only
    expect(commitInputEdit(two, d1)).toBe(true)
    const d2: any = draftOf(one); d2.start = '2026-07-15'; d2.end = ''     // Mon → Wed, published without it
    expect(commitInputEdit(one, d2)).toBe(true)
    reassignInput(who.iid, 'stiff')                                        // to another man, still dormant
    for (const di of [MON, TUE, 2]) expect([di, dayShownPendCount(di), daySigned(di)]).toEqual([di, 0, true])
  })
  /* the half the ruling leaves as it is (§8.7): the same request still on the day and woken — retyped, so it is a live
     request that flags again — IS a change */
  it('unchanged: retyped on the same day (it wakes and flags again) still counts one', async () => {
    const { commitInputEdit, draftOf } = await import('./inputedit')
    const inp = declined()
    const d: any = draftOf(inp); d.type = 'Training'
    expect(commitInputEdit(inp, d)).toBe(true)
    expect(inp.acc, 'woken').toBeUndefined()
    expect(dayShownPendCount(MON)).toBe(1)
    expect(daySigned(MON)).toBe(false)
  })
})

describe('D175 — a load or a plan switch never puts a request on a second day: the row is left out, and said', () => {
  /* Astra's six steps (d114 read, Finding 2): a two-day request on Monday, both days published, ✕ on Monday, accepted
     onto Tuesday — then Monday's issued version, which still holds the row, loaded onto the working copy */
  const sixSteps = () => {
    const inp = request(true)
    acceptInput(MON, inp, 'g')
    publishDay(MON); publishDay(TUE)
    unacceptInput(MON, inp)
    expect(acceptInput(TUE, inp, 'g'), 'accepted onto Tuesday instead').toBe(true)
    expect(rowsOf(inp)).toEqual([TUE])
    return inp
  }
  it('the load leaves Monday\'s copy of the row out: one row, on Tuesday; neither day\'s count moves; the load names it', () => {
    const inp = sixSteps()
    const mon = dayShownPendCount(MON), tue = dayShownPendCount(TUE)
    expect(dayDiscardCount(MON), 'the load will not replace Monday\'s ✕ — it cannot put that row back').toBe(0)
    expect(loadVersionToWorkingCopy(MON, dayCurVer(MON))).toBe(true)
    expect(rowsOf(inp), 'one request, one row').toEqual([TUE])
    expect(inp.acc, 'still on the programme — on Tuesday').toBe('g')
    expect(ROWSLEFT.map(x => x.id), 'the load says which').toEqual([inpId(inp)])
    expect(ROWSLEFT[0]!.days).toEqual(['Tuesday'])
    const said = rowsLeftSaid(ROWSLEFT)
    expect(said, 'whose, what, and where it is').toContain((PEOPLE as any).bane.cs)
    expect(said).toMatch(/Meeting/)
    expect(said).toMatch(/Tuesday/)
    expect(dayShownPendCount(MON), 'Monday as before the load').toBe(mon)
    expect(dayShownPendCount(TUE), 'Tuesday untouched (AM1)').toBe(tue)
  })
  /* Fable's code read F3: the pending list is where a scheduler looks after the load's sentence has gone — Monday's line
     for the row that now stands on Tuesday read "Ground · MEETING · item → removed", naming nobody and nowhere (D99) */
  it('the pending lists name it: Monday "whose · what: on the programme → on Tuesday\'s programme"; Tuesday whose · what', () => {
    const inp = sixSteps()
    loadVersionToWorkingCopy(MON, dayCurVer(MON))
    const cs = (PEOPLE as any).bane.cs
    const mon = el(pendListHTML(MON))
    expect(mon.querySelectorAll('.pl-item').length).toBe(1)
    expect(mon.querySelector('.pl-where')?.textContent, 'whose and what').toMatch(new RegExp(`${cs}[\\s\\S]*Meeting`))
    expect(mon.querySelector('.pl-chg')?.textContent, 'where it stands now').toMatch(/on the programme[\s\S]*on Tuesday's programme/)
    const tue = el(pendListHTML(TUE))
    expect(tue.querySelector('.pl-where')?.textContent, "Tuesday's line names it too").toMatch(new RegExp(`${cs}[\\s\\S]*Meeting`))
    expect(inp.acc).toBe('g')
  })
  it('then ✕ on the one row: no row left anywhere, and no day reads the orphan\'s two', () => {
    const inp = sixSteps()
    loadVersionToWorkingCopy(MON, dayCurVer(MON))
    unacceptInput(TUE, inp)
    expect(rowsOf(inp)).toEqual([])
    expect(dayShownPendCount(MON), 'Monday: its issued row gone and the request taken off — one act').toBe(1)
    expect(dayShownPendCount(TUE), 'Tuesday: the request its issued face had on the programme, taken off').toBe(1)
  })
  it('with a real edit on Monday too, "Discard N edits" counts that edit only, and the load replaces it (Fable S2)', () => {
    const inp = sixSteps()
    DAYS[MON].notes = [...(DAYS[MON].notes || []), 'a real edit']   // a day note typed on the working copy
    expect(dayDiscardCount(MON), 'the note — never the row the load cannot put back').toBe(1)
    loadVersionToWorkingCopy(MON, dayCurVer(MON))
    expect(DAYS[MON].notes || [], 'the note replaced').not.toContain('a real edit')
    expect(rowsOf(inp)).toEqual([TUE])
    expect(ROWSLEFT.map(x => x.id)).toEqual([inpId(inp)])
  })
  it('a load that brings back nothing twice says nothing extra', () => {
    const inp = request()
    acceptInput(MON, inp, 'g'); publishDay(MON)
    unacceptInput(MON, inp)
    loadVersionToWorkingCopy(MON, dayCurVer(MON))
    expect(rowsOf(inp), 'its one row back where the version had it (D98)').toEqual([MON])
    expect(ROWSLEFT).toEqual([])
    expect(rowsLeftSaid(ROWSLEFT)).toBe('')
  })
  it('a plan switch on a day not yet published: the parked plan\'s copy of the row is left out, and the switch says so', () => {
    const inp = request(true)
    acceptInput(MON, inp, 'g')
    draftDup(MON)                                         // Plan A parked with the row; the live day is Plan B
    const planA = dayDrafts(MON)[0]!.id
    unacceptInput(MON, inp)
    acceptInput(TUE, inp, 'g')
    const said = withToasts(() => { expect(switchDraft(MON, planA)).toBe(true) })
    expect(rowsOf(inp), 'one request, one row').toEqual([TUE])
    expect(ROWSLEFT.map(x => x.id)).toEqual([inpId(inp)])
    expect(said.join(' | '), 'the switch names it').toMatch(/Meeting[\s\S]*Tuesday/)
    expect(dayDrafts(MON)[0]!.d.ground.some((r: any) => r.src === inpId(inp)), 'the parked record itself is untouched until it is left').toBe(true)
  })
  it('a plan switch on a published day: the same, and Monday reads the removal it already had', () => {
    const inp = request(true)
    acceptInput(MON, inp, 'g')
    publishDay(MON); publishDay(TUE)
    draftDup(MON)
    const planA = dayDrafts(MON)[0]!.id
    unacceptInput(MON, inp)
    acceptInput(TUE, inp, 'g')
    const tue = dayShownPendCount(TUE)
    expect(draftSelect(MON, planA)).toBe(true)
    expect(rowsOf(inp)).toEqual([TUE])
    expect(dayShownPendCount(MON), 'the row gone from Monday against its published version').toBe(1)
    expect(dayShownPendCount(TUE), 'Tuesday untouched').toBe(tue)
  })
  /* Fable's G4, pinned as intended: a plan is what you leave it as. Once switched to, the plan IS the live day —
     without the row — so leaving it again stows it without the row, and it does not come back later. The issued
     version is a record and keeps its row for good. */
  it('a plan switched to and left again keeps the day as it was left — the row does not come back later', () => {
    const inp = request(true)
    acceptInput(MON, inp, 'g')
    draftDup(MON)
    const [planA, planB] = dayDrafts(MON).map((t: any) => t.id)
    unacceptInput(MON, inp); acceptInput(TUE, inp, 'g')
    draftSelect(MON, planA)                               // row left out
    draftSelect(MON, planB)                               // leave Plan A: it is stowed as it was left
    expect(dayDrafts(MON).find((t: any) => t.id === planA)!.d.ground.some((r: any) => r.src === inpId(inp)), 'Plan A as it was left').toBe(false)
    unacceptInput(TUE, inp)                               // Tuesday's row gone too
    draftSelect(MON, planA)
    expect(rowsOf(inp), 'nothing brings it back but Accept').toEqual([])
  })
})
