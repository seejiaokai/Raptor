// D2014 (owner, 13 Nov 26) — A PUBLISHED DAY'S OIL FOLLOWS THE "FULL DAY OF OIL" IT WAS PUBLISHED UNDER: a change to
// that setting on the Logic page reaches the day's OIL only from its next amendment, as every other Logic setting does
// (D2005), and agrees with D48 (an issued day keeps the rule and the OIL it went out with). Whether the day reads pending
// follows D592 (4): a value that WOULD move somebody's OIL is one pending change until the day goes out again.
//
// The roll-call of [RULES-CHECK-FIXES]'s small batch found this already true as built — the [OIL-WORK-START] build
// (D592 (4), 5 Oct 26) keeps the full-day line with the report lead and the debrief in each published version's OIL
// block (engine/oilev.ts `rv`). This file pins the ruling END TO END, by its own number, on one published weekend
// across a change of the setting, both ways, through the app's own commands (commitSetDayApproved,
// commitPublishALDay, the one Undo), read on every surface that draws or counts a published day's OIL: the Leave War's
// cell and its worked times (the OIL tracker's and the grid's source), the OIL balance (Balances, the OIL tracker),
// the published face's FO / HO (View-only Sched's green edge, OIL Earn), the working copy's (Edit Schedule), the
// pending count on the week and in the To go out list, and the sign-offs. Then the five gotcha families of the
// rules-engine doctrine. OIL is earned leave, time off banked — never pay.
// Evidence: docs/handpass/2026-11-13-rules-check-small-batch.md. The older pins: oilworkstart-published.test.ts (OWS6–
// OWS12), src/ui/oilworkstart.test.tsx.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { SCHED, signOf, setSign, dayShownPendCount, daySigned, daySnapOf, dayCurVer, dayDelta } from '../engine/publish'
import { VCONF } from '../engine/rules'
import { validate, WARN, officialWarn, workingWarn } from '../engine/validate'
import { ensureRowIds } from '../engine/rowids'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore, loadWeek } from '../state/store'
import { commitSetDayApproved, commitPublishALDay, commitUnpublish } from '../state/sched-commit'
import { setSession } from '../state/auth'
import { setPage } from '../state/view'
import { withDaySnap, dayHTML } from '../ui/html'
import { pendListHTML } from '../ui/pendlist'
import { oilDayFigures } from '../ui/oilmode'
import { oilLedgerOf } from './engine'
import { projectPeople } from './state/raptorRoster'
import { figureCtxOf, getState, initStore as lwInitStore, lwHistInit, setDayEvent, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { recsAt } from './engine/warrecs'
import { runOilPass, wireLeaveWarSync } from './sync'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const RULES0 = { reportLead: VCONF.reportLead, debrief: VCONF.debrief, oilFullMin: VCONF.oilFullMin }
const SAT = 5, SUN = 6, TUE = 1
const ISO: Record<number, string> = { [TUE]: '2026-07-14', [SAT]: '2026-07-18', [SUN]: '2026-07-19' }

beforeEach(() => {
  Object.assign(VCONF, RULES0)
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  setSession({ user: 'ad', role: 'admin' } as any)
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  setPage('editsched')
})
afterEach(() => { Object.assign(VCONF, RULES0); _resetTimeline(); setSession(null) })

const FOUR: Array<[string, string]> = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]
/* the four sign-offs, bound to what they signed (the Shell's one write path), so a pending change can take them down */
const signBound = (di: number) => { for (const [r, w] of FOUR) setSign(di, r, w) }
/* published (or amended) on the four, then signed again against what went out — so a later change that reads pending
   is seen to take them down (D103), as OWS7 does */
const publish = (di: number) => { signBound(di); const r = commitSetDayApproved(di, true); signBound(di); runOilPass(); return r }
const amend = (di: number) => { signBound(di); const r = commitPublishALDay(di); signBound(di); runOilPass(); return r }
/* "the Logic page": the setting written, the schedule checked again, the OIL pass run — as ruleApply and the sync do */
const setFullDay = (min: number) => { VCONF.oilFullMin = min; validate(); runOilPass() }

const jet = (p: string) => ({ p, w: '', area: '', rmks: '', opts: {} })
/* a weekend day holding exactly this: Bane on a flying line (take-off 10:00, landing 11:15 — 07:00 to 13:15, six and a
   quarter hours) and Stiff on a six-hour desk, 08:00–14:00. Under the standard line (6h01) Bane earns a full day, Stiff
   a half. */
const build = (di: number, to = '10:00', ld = '11:15', desk: [string, string] = ['0800', '1400']) => {
  Object.assign(DAYS[di], {
    waves: [{ label: 'WAVE 1', intimes: [], formations: [{ cs: 'VL', msn: 'X', to, ld, br: '', aircraft: [jet('bane')] }] }],
    dutywaves: [{ label: 'Duty', rows: [{ role: 'SDO', id: 'stiff', str: desk[0], end: desk[1] }] }],
    sims: { amt: [], oft: [] }, ground: [], allhands: [],
  })
  ensureRowIds(DAYS)
}

/* every surface, for one day: the Leave War (cell and worked times — the grid, the OIL tracker), the balance (Balances,
   the OIL tracker), the published face's figures, the working copy's, the pending count and the four sign-offs */
const cellOf = (p: string, di: number) => getState().wars[0].grid[p]?.[ISO[di]]
const worked = (p: string, di: number) => recsAt(getState().wars[0].recs, p, ISO[di]).filter((r: any) => r.oil === 'auto').map((r: any) => r.spans)
const balance = (p: string) => oilLedgerOf({ ...figureCtxOf(), asOf: '2027-12-31' }, p).balance
const face = (di: number) => withDaySnap(di, dayCurVer(di), () => oilDayFigures(di))
const keptOn = (di: number) => (daySnapOf(di, dayCurVer(di)) as any).d.oilev.rv
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const weekChip = (di: number) => { const t = el(dayHTML(di, true, true)).querySelector('.dpend:not(.dnew):not(.dchg)')?.textContent; const m = String(t || '').match(/\d+/); return m ? +m[0] : 0 }
const listText = (di: number) => el(pendListHTML(di)).querySelector('.pl-list')?.textContent || ''
const DESK = String((PEOPLE as any).stiff.cs), FLYER = String((PEOPLE as any).bane.cs)
const moves = (who: string, from: string, to: string) => `${who} · OIL as published, under today's values${from} → ${to}`
const state = (di: number) => ({
  lw: [cellOf('bane', di), cellOf('stiff', di)], face: face(di), work: oilDayFigures(di),
  pending: dayShownPendCount(di), week: weekChip(di), signed: daySigned(di),
})

describe('D2014 — "Full day of OIL" lowered under a published Saturday: nothing moves until the next amendment', () => {
  it('published, the setting lowered 6h01 → 5h: every surface keeps the half day; one pending change names him; the amendment gives the full day', () => {
    build(SAT)
    publish(SAT)
    const was = balance('stiff')
    expect(state(SAT)).toEqual({ lw: ['FO', 'HO'], face: { bane: 'FO', stiff: 'HO' }, work: { bane: 'FO', stiff: 'HO' }, pending: 0, week: 0, signed: true })

    setFullDay(300)
    expect(state(SAT), 'the published day keeps the line it went out with; the working copy shows what would go out').toEqual({
      lw: ['FO', 'HO'], face: { bane: 'FO', stiff: 'HO' }, work: { bane: 'FO', stiff: 'FO' }, pending: 1, week: 1, signed: false })
    expect(balance('stiff'), 'his OIL balance does not move').toBe(was)
    expect(worked('stiff', SAT)).toEqual([[[480, 840]]])
    expect(listText(SAT), 'the To go out list says what changed and whom it would move').toContain('Full-day OIL threshold')
    expect(listText(SAT)).toContain(moves(DESK, 'half day · 08:00–14:00', 'full day · 08:00–14:00'))
    expect(listText(SAT), 'a man whose OIL would not move is not named').not.toContain(FLYER)
    expect(keptOn(SAT).oilFullMin, 'the version keeps its own line').toBe(361)

    expect((amend(SAT) as any).ok).toBe(true)
    expect(state(SAT), 'the amendment brings the new line').toEqual({
      lw: ['FO', 'FO'], face: { bane: 'FO', stiff: 'FO' }, work: { bane: 'FO', stiff: 'FO' }, pending: 0, week: 0, signed: true })
    expect(balance('stiff')).toBe(was + 0.5)
    expect(keptOn(SAT).oilFullMin).toBe(300)
  })
  it('the amendment undone puts the half day back and the day reads pending again; redone, the full day', () => {
    build(SAT)
    publish(SAT)
    const was = balance('stiff')
    setFullDay(300)
    amend(SAT)
    expect(cellOf('stiff', SAT)).toBe('FO')
    globalUndo(); runOilPass()
    expect(cellOf('stiff', SAT), 'undone: the version before, with its own line').toBe('HO')
    expect(balance('stiff')).toBe(was)
    expect(face(SAT)).toEqual({ bane: 'FO', stiff: 'HO' })
    expect(keptOn(SAT).oilFullMin).toBe(361)
    expect(dayShownPendCount(SAT), 'the setting is still 5h — the day reads pending again').toBe(1)
    globalRedo(); runOilPass()
    expect(cellOf('stiff', SAT)).toBe('FO')
    expect(balance('stiff')).toBe(was + 0.5)
    expect(dayShownPendCount(SAT)).toBe(0)
  })
})

describe('D2014 — raised: a published full day stays full until the next amendment', () => {
  it('published, the setting raised 6h01 → 8h: his full day holds everywhere; pending names him; the amendment makes it half', () => {
    build(SAT)
    publish(SAT)
    const was = balance('bane')
    setFullDay(480)
    expect(state(SAT)).toEqual({ lw: ['FO', 'HO'], face: { bane: 'FO', stiff: 'HO' }, work: { bane: 'HO', stiff: 'HO' }, pending: 1, week: 1, signed: false })
    expect(balance('bane')).toBe(was)
    expect(listText(SAT)).toContain(moves(FLYER, 'full day · 07:00–13:15', 'half day · 07:00–13:15'))
    amend(SAT)
    expect(state(SAT)).toEqual({ lw: ['HO', 'HO'], face: { bane: 'HO', stiff: 'HO' }, work: { bane: 'HO', stiff: 'HO' }, pending: 0, week: 0, signed: true })
    expect(balance('bane')).toBe(was - 0.5)
  })
})

describe('D2014 — older versions: each keeps its own line (Astra\'s scenarios 2 and 4)', () => {
  it('Original under 6h01, AL1 under 8h, today 5h: withdrawing AL1 brings back the Original\'s own full day; Undo and Redo follow', () => {
    build(SAT)
    publish(SAT)
    setFullDay(480)
    amend(SAT)                                                       // AL1: Bane's 6h15 is now half a day
    expect([cellOf('bane', SAT), keptOn(SAT).oilFullMin]).toEqual(['HO', 480])
    setFullDay(300)
    expect(cellOf('bane', SAT), 'today\'s 5h does not reach AL1').toBe('HO')
    expect((commitUnpublish(SAT) as any).ok).toBe(true); runOilPass()
    expect([cellOf('bane', SAT), keptOn(SAT).oilFullMin], 'the Original again, with the line it went out with — not today\'s').toEqual(['FO', 361])
    expect(face(SAT)).toEqual({ bane: 'FO', stiff: 'HO' })
    globalUndo(); runOilPass()
    expect([cellOf('bane', SAT), keptOn(SAT).oilFullMin]).toEqual(['HO', 480])
    globalRedo(); runOilPass()
    expect([cellOf('bane', SAT), keptOn(SAT).oilFullMin]).toEqual(['FO', 361])
  })
})

describe('D2014 — beside it: other days, the working copy, a holiday made after publication', () => {
  it('another day published after the change goes out under today\'s line; the first keeps its own', () => {
    build(SAT); build(SUN)
    publish(SAT)
    setFullDay(300)
    publish(SUN)
    expect(keptOn(SUN).oilFullMin).toBe(300)
    expect([cellOf('stiff', SUN), cellOf('stiff', SAT)], 'Sunday full under 5h; Saturday still its half').toEqual(['FO', 'HO'])
    expect(dayShownPendCount(SUN)).toBe(0)
    expect(dayShownPendCount(SAT), 'publishing Sunday does not amend Saturday').toBe(1)
    expect(keptOn(SAT).oilFullMin).toBe(361)
  })
  it('the working copy edited after the change is worked out on today\'s line; the face and the credit wait for the amendment', () => {
    build(SAT)
    publish(SAT)
    setFullDay(300)
    ;(DAYS[SAT] as any).dutywaves[0].rows[0].end = '1300'           // Stiff's desk now 08:00–13:00, five hours
    validate(); runOilPass()
    expect(oilDayFigures(SAT).stiff, 'five hours on the working copy: a full day under 5h').toBe('FO')
    expect(face(SAT).stiff, 'the face: six hours under 6h01, as published').toBe('HO')
    expect(cellOf('stiff', SAT)).toBe('HO')
    expect(worked('stiff', SAT)).toEqual([[[480, 840]]])
    amend(SAT)
    expect(cellOf('stiff', SAT)).toBe('FO')
    expect(worked('stiff', SAT)).toEqual([[[480, 780]]])
  })
  it('a Tuesday published as a working day, then made a holiday, with the line changed meanwhile: the amber line says why, and the amendment earns under today\'s line', () => {
    INPUTS.length = 0                                                // the seed's Tuesday requests would land rows of their own
    build(TUE)
    publish(TUE)
    expect(cellOf('stiff', TUE), 'a working day earns nothing').toBeFalsy()
    setFullDay(300)
    expect(dayShownPendCount(TUE), 'nothing earned, nothing to move').toBe(0)
    expect(keptOn(TUE), 'a day that earned nothing keeps no OIL values (OWS7)').toBeUndefined()
    setRole('admin')
    setDayEvent(ISO[TUE], 0, 'PH')
    validate()
    const codes = ((WARN.byDay[TUE] && WARN.byDay[TUE].warns) || []).map((w: any) => w.code)
    expect(codes, 'D2003\'s amber line').toContain('OIL_STALE_DAY')
    expect(dayShownPendCount(TUE)).toBe(1)
    expect(cellOf('stiff', TUE), 'nothing lands before the day goes out again (D2)').toBeFalsy()
    amend(TUE)
    expect([cellOf('bane', TUE), cellOf('stiff', TUE)], 'six hours under 5h: both full').toEqual(['FO', 'FO'])
    expect(keptOn(TUE).oilFullMin).toBe(300)
  })
})

describe('D2014 — the five gotcha families', () => {
  it('people not following the format: a "TBD" landing earns the flyer nothing, before and after; the change moves only the desk', () => {
    build(SAT, '10:00', 'TBD')
    publish(SAT)
    expect(cellOf('bane', SAT)).toBeFalsy()
    setFullDay(300)
    expect(cellOf('bane', SAT)).toBeFalsy()
    expect(listText(SAT)).not.toContain(FLYER)
    expect(listText(SAT)).toContain(moves(DESK, 'half day · 08:00–14:00', 'full day · 08:00–14:00'))
  })
  it('missing input: a published Saturday nobody works earns nothing and a change raises nothing', () => {
    Object.assign(DAYS[SAT], { waves: [], dutywaves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [] })
    publish(SAT)
    setFullDay(300)
    expect(dayShownPendCount(SAT)).toBe(0)
    expect(daySigned(SAT)).toBe(true)
    expect(dayDelta(SAT)).toEqual([])
  })
  it('a user error put right: the line changed and changed back before any amendment — nothing pending, the four stand, nothing moved', () => {
    build(SAT)
    publish(SAT)
    setFullDay(300)
    expect(daySigned(SAT)).toBe(false)
    setFullDay(361)
    expect(state(SAT)).toEqual({ lw: ['FO', 'HO'], face: { bane: 'FO', stiff: 'HO' }, work: { bane: 'FO', stiff: 'HO' }, pending: 0, week: 0, signed: true })
  })
  it('a deletion on the working copy after the change: the published credit holds until the amendment takes it', () => {
    build(SAT)
    publish(SAT)
    setFullDay(300)
    ;(DAYS[SAT] as any).dutywaves[0].rows.splice(0, 1)
    validate(); runOilPass()
    expect(cellOf('stiff', SAT), 'the published half day stands').toBe('HO')
    amend(SAT)
    expect(cellOf('stiff', SAT), 'the amendment takes him off the day, and the day\'s OIL with him (D142)').toBeFalsy()
  })
  it('sync between copies: the week off screen and back — the published line is kept, the change still waits', () => {
    build(SAT)
    publish(SAT)
    try {
      loadWeek('20/07/2026')
      setFullDay(300)
      expect(cellOf('stiff', SAT), 'off screen').toBe('HO')
    } finally { loadWeek('13/07/2026') }
    validate(); runOilPass()
    expect(keptOn(SAT).oilFullMin).toBe(361)
    expect(cellOf('stiff', SAT)).toBe('HO')
    expect(face(SAT).stiff).toBe('HO')
    expect(dayShownPendCount(SAT)).toBe(1)
  })
})

/* THE "NO USABLE TIMES" WARNING ON A PUBLISHED FACE (the blind Opus read of this job, finding 1 — D2014, D1991, D2013).
   The warning says "nobody on it earns OIL for this day", and it is one of the few drawn LIVE on the published face
   (validate.ts LIVE_ON_FACE, D2002). It was worked out with today's report lead and debrief while the credit read the
   values the day was published under, so a Logic change raised it (or cleared it) on the published face at once while
   the Leave War went on crediting the day as published: the face said nobody earns while somebody did. A published day
   is now judged by the values its OIL block kept; the working copy, which reads pending, shows the next amendment (D2013). */
describe('D2014 — the "no usable times" warning follows the values the day was published under', () => {
  const blindOn = (b: any) => (((b.byDay || [])[SAT] || {}).warns || []).some((w: any) => w.code === 'OIL_NO_TIMES')
  it('lowered: a line typed take-off = landing earns on its debrief; the debrief set to 0 does not raise the red line on the published face until the amendment', () => {
    VCONF.reportLead = 0
    build(SAT, '10:00', '10:00')
    publish(SAT)
    expect(cellOf('bane', SAT), 'the premise: 10:00 to the 2h debrief earns a half day (D49)').toBe('HO')
    expect(blindOn(officialWarn()), 'the premise: no red line').toBe(false)
    VCONF.debrief = 0; validate(); runOilPass()
    expect(cellOf('bane', SAT), 'the credit holds').toBe('HO')
    expect(blindOn(officialWarn()), 'the published face keeps saying what its OIL is: no red line').toBe(false)
    expect(dayShownPendCount(SAT), 'the change waits').toBe(1)
    expect(blindOn(workingWarn()), 'the working copy shows the next amendment (D2013)').toBe(true)
    amend(SAT)
    expect(cellOf('bane', SAT), 'the amendment takes the half day').toBeFalsy()
    expect(blindOn(officialWarn()), 'and now the published face says so').toBe(true)
  })
  it('raised: published with the debrief at 0 (the red line, nothing credited), the debrief raised does not clear it from the published face until the amendment', () => {
    VCONF.reportLead = 0; VCONF.debrief = 0
    build(SAT, '10:00', '10:00')
    publish(SAT)
    expect(cellOf('bane', SAT), 'the premise: nothing credited').toBeFalsy()
    expect(blindOn(officialWarn()), 'the premise: the red line').toBe(true)
    VCONF.debrief = 120; validate(); runOilPass()
    expect(cellOf('bane', SAT), 'still nothing credited').toBeFalsy()
    expect(blindOn(officialWarn()), 'the red line stays on the published face').toBe(true)
    amend(SAT)
    expect(cellOf('bane', SAT)).toBe('HO')
    expect(blindOn(officialWarn())).toBe(false)
  })
  /* the narrow read of the fix, finding 1: the case D2014 exists for most — nobody's OIL moves, so nothing reads
     pending and the working copy too judges the day by its kept values (validate.ts untouchedKept) */
  it('nothing credited on the day ("No OIL earned" on): the debrief set to 0 raises the red line on neither the published face nor the working copy, and nothing reads pending', () => {
    VCONF.reportLead = 0
    build(SAT, '10:00', '10:00')
    ;(DAYS[SAT] as any).oild = { blanket: true }
    publish(SAT)
    expect(cellOf('bane', SAT), 'the premise: nothing credited').toBeFalsy()
    expect(blindOn(officialWarn()), 'the premise: no red line').toBe(false)
    VCONF.debrief = 0; validate(); runOilPass()
    expect(dayShownPendCount(SAT), 'no OIL moves, so nothing waits').toBe(0)
    expect(blindOn(officialWarn()), 'the published face: no red line').toBe(false)
    expect(blindOn(workingWarn()), 'Edit Schedule, nothing waiting: no red line either').toBe(false)
    /* the same day judged by the new values says it — so the two lines above are the kept values at work */
    VCONF.debrief = 120; validate(); runOilPass()
    ;(DAYS[SAT] as any).oild = { blanket: false }; VCONF.debrief = 0; validate()
    expect(blindOn(workingWarn()), 'a change waiting: the working copy previews the next amendment').toBe(true)
  })
})
