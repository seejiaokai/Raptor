// @vitest-environment jsdom
/* [OIL-WORK-START] ON SCREEN (owner, D591, D592 — 5 Oct 26): what the scheduler SEES when a Logic value changes under
   a published weekend, and that the published face goes on showing the OIL it went out with.
     · OWS7 — the change reads "1 pending" on every count the screens show (the week, the board, the ⓘ panel, the To go
       out list), the list names the value that changed and each man whose OIL would move, the four sign-offs fall, and
       putting the value back clears all of it (D45, D98, D103);
     · OWS6 — the issued face's OIL figures (the green edge, the OIL Earn mode's FO / HO) stay as published while the
       working copy shows what would go out.
   Through the production doors: setDayApproved / setSign, the real string builders, the real pending list. The engine
   halves: src/engine/oilworkstart.test.ts, src/leavewar/oilworkstart-published.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { ALPanel } from './ALPanel'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { SCHED, signOf, setSign, setDayApproved, dayDelta, dayShownPendCount, dayCurVer, daySigned, dayPendingItems } from '../engine/publish'
import { validate } from '../engine/validate'
import { VCONF } from '../engine/rules'
import { ensureRowIds } from '../engine/rowids'
import { rowItemKey } from '../engine/oil'
import { PEOPLE } from '../engine/people'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, DPREV, VWORK, setUnpubArm, setRestArm } from '../state/view'
import { dayHTML, dayInfoHTML, withDaySnap } from './html'
import { boardSignHTML } from './board'
import { pendListHTML } from './pendlist'
import { oilDayFigures, oilEligible } from './oilmode'

const PEND_CHIP = '.dpend:not(.dnew):not(.dchg)'
const SAT = 5
const RULES0 = { reportLead: VCONF.reportLead, debrief: VCONF.debrief, oilFullMin: VCONF.oilFullMin }
const hooks0 = { earn: HOOKS.oilEarningDay, iso: HOOKS.oilDayISO, sent: HOOKS.oilSentinel }
let pristine: any[], inputs0: string
const FOUR: Array<[string, string]> = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]
const sign = (di: number) => { const g = signOf(di); for (const [r, w] of FOUR) (g as any)[r] = w }
const publishDay = (di: number) => { sign(di); setDayApproved(di, true); validate() }
const signBound = (di: number) => { for (const [r, w] of FOUR) setSign(di, r, w) }
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const num = (t: string | null | undefined) => { const m = String(t || '').match(/\d+/); return m ? +m[0] : 0 }
const counts = (di: number) => {
  setPage('editsched')
  return {
    engine: dayShownPendCount(di),
    week: num(el(dayHTML(di, true, true)).querySelector(PEND_CHIP)?.textContent),
    board: num(el(boardSignHTML(di)).querySelector(PEND_CHIP)?.textContent),
    info: num(el(dayInfoHTML(di)).querySelector('.dip-pend')?.textContent),
    list: el(pendListHTML(di)).querySelectorAll('.pl-item').length,
    delta: dayDelta(di).length,
    items: dayPendingItems(di).length,
  }
}
const ALL = (n: number) => ({ engine: n, week: n, board: n, info: n, list: n, delta: n, items: n })
const listText = (di: number) => el(pendListHTML(di)).querySelector('.pl-list')!.textContent || ''
const alPanelText = () => {
  const host = document.createElement('div'); document.body.appendChild(host)
  const root = createRoot(host)
  act(() => { root.render(<ALPanel />) })
  const t = host.textContent || ''
  act(() => { root.unmount() }); host.remove()
  return t
}
const jet = (p: string) => ({ p, w: '', area: '', rmks: '', opts: {} })
/* the two men by the callsigns the screen prints (the ids are the roster's own keys; `bane` is the demo's Ranger) */
const FLYER = String((PEOPLE as any).bane.cs), DESK = String((PEOPLE as any).stiff.cs)
/* a man's line as the list prints it: his callsign, then what his OIL would go from and to */
const moves = (who: string, from: string, to: string) => `${who} · OIL as published, under today's values${from} → ${to}`
/* Saturday holding exactly this: the flyer on a flying line, the desk man on a six-hour desk */
const build = (to: string, ld: string, intimes: string[] = []) => {
  Object.assign(DAYS[SAT], {
    waves: [{ label: 'WAVE 1', intimes, formations: [{ cs: 'VL', msn: 'X', to, ld, br: '', aircraft: [jet('bane')] }] }],
    dutywaves: [{ label: 'Duty', rows: [{ role: 'SDO', id: 'stiff', str: '0800', end: '1400' }] }],
    sims: { amt: [], oft: [] }, ground: [], allhands: [],
  })
  ensureRowIds(DAYS)
}
const issuedFigures = (di: number) => withDaySnap(di, dayCurVer(di), () => oilDayFigures(di))

beforeAll(() => {
  initStore()
  setSession({ user: 'ad', role: 'admin' } as any)
  pristine = JSON.parse(JSON.stringify(DAYS))
  inputs0 = JSON.stringify(INPUTS)
})
afterAll(() => {
  Object.assign(VCONF, RULES0)
  HOOKS.oilEarningDay = hooks0.earn; HOOKS.oilDayISO = hooks0.iso; HOOKS.oilSentinel = hooks0.sent
})
beforeEach(() => {
  Object.assign(VCONF, RULES0)
  DAYS.length = 0; JSON.parse(JSON.stringify(pristine)).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  DPREV.clear(); VWORK.clear()
  setUnpubArm(null); setRestArm(null, null)
  setPage('editsched')
  /* the Leave War's three answers, as its sync wire gives them on a built site: Saturday is a day that earns */
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => `2026-07-${13 + di}`
  HOOKS.oilSentinel = () => []
  validate()
})

describe('OWS7 — a Logic change that would move a published day\'s OIL is one pending change, everywhere (D45, D103)', () => {
  it('"Nominal report before T/O" 3h → 2h30: 1 pending on every count, the list says what and who, the four fall; put back, all clear', () => {
    build('10:00', '11:15')
    publishDay(SAT); signBound(SAT)
    expect(counts(SAT)).toEqual(ALL(0))
    expect(daySigned(SAT)).toBe(true)

    VCONF.reportLead = 150; validate()
    expect(counts(SAT)).toEqual(ALL(1))
    const t = listText(SAT)
    expect(t, 'it is about OIL and the Logic page').toMatch(/OIL/)
    expect(t).toMatch(/Logic/)
    expect(t, 'the value that changed, old and new').toContain('Nominal report before T/O')
    expect(t).toContain('3h'); expect(t).toContain('2h30')
    expect(t, 'the man whose OIL would move, and how').toContain(moves(FLYER, 'full day · 07:00–13:15', 'half day · 07:30–13:15'))
    expect(t, 'never the long label of the Logic box').not.toContain('button fills in')
    expect(t, 'a man whose OIL does not move is not named').not.toContain(DESK)
    /* the walk (walker D, S38): the man's line says what it compares — his PUBLISHED OIL against today's values — so it
       is not read as what the amendment will give him when another change is also waiting */
    expect(t).toContain(`${FLYER} · OIL as published, under today's values`)
    expect(daySigned(SAT), 'something waiting means sign again').toBe(false)
    expect(alPanelText()).toMatch(/Sat · 1 change/)

    VCONF.reportLead = 180; validate()
    expect(counts(SAT)).toEqual(ALL(0))
    expect(daySigned(SAT), 'back to what was published — the four stand again').toBe(true)
  })
  it('the debrief and the full-day line are named the same way', () => {
    build('10:00', '11:00')
    publishDay(SAT)
    VCONF.debrief = 150; validate()
    expect(listText(SAT)).toContain('Flight debrief after land')
    expect(listText(SAT)).toContain(moves(FLYER, 'half day · 07:00–13:00', 'full day · 07:00–13:30'))
    VCONF.debrief = 120; VCONF.oilFullMin = 300; validate()
    const t = listText(SAT)
    expect(t).toContain('Full-day OIL threshold')
    /* a full-day line of five hours: both men's six hours would become a full day */
    expect(t).toContain(moves(FLYER, 'half day · 07:00–13:00', 'full day · 07:00–13:00'))
    expect(t).toContain(moves(DESK, 'half day · 08:00–14:00', 'full day · 08:00–14:00'))
    expect(counts(SAT), 'two men, two values — still one change').toEqual(ALL(1))
  })
  it('a man who would lose the day altogether reads "full day → nothing"', () => {
    build('10:00', '10:00')                                    // a nought-minute sortie: all of it report and debrief (D49)
    VCONF.reportLead = 200; VCONF.debrief = 200
    publishDay(SAT)
    VCONF.reportLead = 0; VCONF.debrief = 0; validate()
    expect(listText(SAT)).toContain(moves(FLYER, 'full day · 06:40–13:20', 'nothing'))
  })
  it('a change to the OIL decisions AND a Logic change on one day are two changes, both listed', () => {
    build('10:00', '11:15')
    publishDay(SAT)
    const item = rowItemKey((DAYS[SAT] as any).dutywaves[0].rows[0].rid)
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${item}`]: 'deny' } }
    VCONF.reportLead = 150; validate()
    expect(counts(SAT)).toEqual(ALL(2))
    expect(listText(SAT)).toContain('What this day earns')
    expect(listText(SAT)).toContain('Nominal report before T/O')
  })
  /* Astra's plan challenge, finding 3: a request edited after publishing folds the day's OIL line into its own line
     ("what the day earns changes with it") — and that fold must not swallow the separate Logic line: its own act, its own
     item, in the list and in every count */
  it('a request edited after publishing AND a Logic change: the request\'s line folds its own OIL change, the Logic line stands beside it', () => {
    build('10:00', '11:15')
    INPUTS.push({ iid: 'ows-req', person: 'plasma', date: (DAYS[SAT] as any).dt, type: 'Training', allday: false, s: 480, e: 720, remarks: 'OWS COURSE', mod: '', oil: { '2026-07-18': 0.5 } } as any)
    publishDay(SAT)
    const req: any = INPUTS.find((r: any) => r.iid === 'ows-req')
    req.e = 900; validate()                                    // the member stretches it: four hours → seven
    /* (`delta` is the comparison's raw entries — the request's and the OIL block's — which the count folds into one line) */
    expect({ ...counts(SAT), delta: 0 }, 'the edit alone: one line, the OIL change folded into it').toEqual({ ...ALL(1), delta: 0 })
    expect(listText(SAT)).toContain('what the day earns changes with it')
    VCONF.oilFullMin = 200; validate()                         // …and a full-day line the published four hours would clear
    const n = counts(SAT)
    expect({ ...n, delta: 0 }, 'two lines on every count the screens show').toEqual({ ...ALL(2), delta: 0 })
    expect(listText(SAT)).toContain('what the day earns changes with it')
    expect(listText(SAT)).toContain('Logic · Full-day OIL threshold')
    expect(listText(SAT)).toContain(moves(String((PEOPLE as any).plasma.cs), 'half day · 08:00–12:00', 'full day · 08:00–12:00'))
    /* each goes back on its own (Sol's finding 3): the Logic value restored leaves the request's line; the request
       restored leaves the Logic line; both restored, nothing is waiting */
    VCONF.oilFullMin = 361; validate()
    expect({ ...counts(SAT), delta: 0 }).toEqual({ ...ALL(1), delta: 0 })
    expect(listText(SAT)).not.toContain('Logic ·')
    req.e = 720; VCONF.oilFullMin = 200; validate()
    expect(counts(SAT)).toEqual(ALL(1))
    expect(listText(SAT)).toContain('Logic · Full-day OIL threshold')
    expect(listText(SAT)).not.toContain('what the day earns changes with it')
    VCONF.oilFullMin = 361; validate()
    expect(counts(SAT)).toEqual(ALL(0))
  })
  it('a change that moves only a man\'s worked times: still one pending change, and the line says his day is unchanged but for the times', () => {
    build('10:00', '11:15')
    publishDay(SAT); signBound(SAT)
    VCONF.reportLead = 170; validate()
    expect(counts(SAT)).toEqual(ALL(1))
    expect(listText(SAT)).toContain(moves(FLYER, 'full day · 07:00–13:15', 'full day · 07:10–13:15'))
    expect(daySigned(SAT)).toBe(false)
  })
  it('a change that would write no OIL record on this day differently: nothing pending anywhere, the four stand', () => {
    build('10:00', '11:15', ['IN TIME 0700'])                  // an entered in-time: the nominal lead is not read
    publishDay(SAT); signBound(SAT)
    VCONF.reportLead = 150; validate()
    expect(counts(SAT)).toEqual(ALL(0))
    expect(daySigned(SAT)).toBe(true)
  })
})

describe('OWS6 — the published face keeps the OIL figures it went out with; the working copy shows what would go out', () => {
  it('the nominal report: full day on the face, half on the working copy', () => {
    build('10:00', '11:15')
    publishDay(SAT)
    expect(issuedFigures(SAT)).toEqual({ bane: 'FO', stiff: 'HO' })
    VCONF.reportLead = 150; validate()
    expect(issuedFigures(SAT), 'as published').toEqual({ bane: 'FO', stiff: 'HO' })
    expect(oilDayFigures(SAT), 'the working copy, under today\'s values').toEqual({ bane: 'HO', stiff: 'HO' })
  })
  it('the full-day line: the face reads its own', () => {
    build('10:00', '11:15')
    publishDay(SAT)
    VCONF.oilFullMin = 300; validate()
    expect(issuedFigures(SAT)).toEqual({ bane: 'FO', stiff: 'HO' })
    expect(oilDayFigures(SAT)).toEqual({ bane: 'FO', stiff: 'FO' })
    VCONF.oilFullMin = 480; validate()
    expect(issuedFigures(SAT)).toEqual({ bane: 'FO', stiff: 'HO' })
    expect(oilDayFigures(SAT)).toEqual({ bane: 'HO', stiff: 'HO' })
  })
  it('"could he earn here" answers for the face being shown, not for today', () => {
    /* a nought-minute sortie published under a long report and debrief earns; with both set to zero today the same
       line measures nothing — the published face must go on saying he could earn there */
    VCONF.reportLead = 200; VCONF.debrief = 200
    build('10:00', '10:00')
    publishDay(SAT)
    const item = rowItemKey((DAYS[SAT] as any).waves[0].formations[0].rid)
    VCONF.reportLead = 0; VCONF.debrief = 0; validate()
    expect(oilEligible(SAT, 'bane', item), 'the working copy, today: nothing to earn from').toBe(false)
    const face = withDaySnap(SAT, dayCurVer(SAT), () => ({
      eligible: oilEligible(SAT, 'bane', item),
      figures: oilDayFigures(SAT),
    }))
    expect(face.eligible, 'the published face: he could, and did').toBe(true)
    expect(face.figures.bane).toBe('FO')
  })
  it('an entered in-time shows on both: the day starts where it was typed (OWS1)', () => {
    build('12:00', '13:00', ['IN TIME 0830'])
    expect(oilDayFigures(SAT)).toEqual({ bane: 'FO', stiff: 'HO' })       // 08:30 → 15:00
    ;(DAYS[SAT] as any).waves[0].intimes = []
    expect(oilDayFigures(SAT)).toEqual({ bane: 'HO', stiff: 'HO' })       // nominal 09:00 → 15:00
  })
})
